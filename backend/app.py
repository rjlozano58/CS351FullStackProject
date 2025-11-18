"""
NOTE for future use there should be a secrets directory in your backend/ directory containing the .json file for firestore
related things. If it is not there none of this will probably work
"""

# sandard lib and class imports
import os
import time
from trie import Trie
from bloomfilter import BloomFilter

# flask imports
from flask import Flask, request, jsonify
from flask_cors import CORS

# firebase imports
import firebase_admin
from firebase_admin import credentials, auth, firestore
from google.cloud.firestore_v1.query import Query
from google.cloud.firestore_v1.base_query import FieldFilter

app = Flask(__name__)

CORS(app)

title_trie = Trie()
author_trie = Trie()
title_bloom = BloomFilter()
author_bloom = BloomFilter()

# firebase setup
try:
    service_account_key_path = 'secrets/cs-351-b2b1c-9288197c0a60.json'
    if os.path.exists(service_account_key_path):
        cred = credentials.Certificate(service_account_key_path)
        firebase_admin.initialize_app(cred)
        print("Firebase Admin Initialized (using local key)")
    else:
        print("ERROR: Service account key not found.")
except Exception as e:
    print(f"An error occured during Firebase Admin init: {e}")

# init firestore client
try:
    db_firestore = firestore.client()
    print("Firestore Client initialized")
except Exception as e:
    print(f"ERROR: Could not initialize Firestore Client: {e}")
    db_firestore = None

def build_localDSA_from_db():
    if not db_firestore:
        print("Error: Firestore client not available!")
        return
    
    print("Building Tries and Bloom Filters from Firestore...")
    try:
        stories_ref = db_firestore.collection('Stories')
        title_count = 0
        author_count = 0

        for doc in stories_ref.get(): 
            story_data = doc.to_dict()
            
            # 1. Populate Title Trie
            title = story_data.get('Title')
            if title and isinstance(title, str):
                title_trie.insert(title.lower())
                title_bloom.add(title.lower())
                title_count += 1
            
            # 2. Populate Author Trie (using 'Author_ID' field)
            author = story_data.get('Author_ID')
            if author and isinstance(author, str):
                author_trie.insert(author.lower())
                author_bloom.add(author.lower())
                author_count += 1

    except Exception as e:
        print(f"ERROR building Tries and Bloom Filters from Firestore: {e}")
    
    print(f"Tries and Bloom Filters build complete. {title_count} titles, {author_count} authors.")

# verify api is working fine
@app.route("/")
@app.route("/api/")
def health_check():
    # trie_object = build_trie_from_db()
    # print(trie_object.words())
    return jsonify({"status": "Backend is running!"})

# endpoint for this to work would look like /api/autocomplete?q=hel...
# grabs the query portion of it to search in the main_trie which exists solely in this process of the api
@app.route("/api/autocomplete", methods=['GET'])
def autocomplete():
    query = request.args.get("q","")
    # Get the search type, default to 'title'
    search_type = request.args.get("type", "title") 
    
    prefix_to_search = query.strip().lower()

    if not prefix_to_search:
        return jsonify([])
    
    # Search the correct trie based on the type
    if search_type == 'author':
        print(f" * Autocomplete searching AUTHOR_TRIE for: {prefix_to_search}")
        results = author_trie.search_prefix(prefix_to_search)
    else: # Default to title
        print(f" * Autocomplete searching TITLE_TRIE for: {prefix_to_search}")
        results = title_trie.search_prefix(prefix_to_search)

    return jsonify(results)

@app.route("/api/search", methods=['GET'])
def full_search():
    query = request.args.get("q", "").strip(' "').lower()
    search_type = request.args.get("type", "title")

    if not query or not db_firestore:
        return jsonify({"error": "No query provided or DB unavailable"}), 400

    query_end = query + u'\uf8ff'

    # print(f' * User query q?= "{query_end}"')

    results = []
    try:
        stories_ref = db_firestore.collection('Stories')

        if search_type == 'author':
            print(f" searching AUTHORS for: {query}")
            query_obj = stories_ref.where(
                filter=FieldFilter('Author_ID_Lower', '>=', query) 
            ).where(
                filter=FieldFilter('Author_ID_Lower', '<=', query_end)
            ).limit(20)
        else:
            print(f" Searching TITLES for: {query}")
            query_obj = stories_ref.where(
                filter=FieldFilter('TitleLower', '>=', query)
            ).where(
                filter=FieldFilter('TitleLower', '<=', query_end)
            ).limit(20)

        for doc in query_obj.stream():
            results.append({"id": doc.id, **doc.to_dict()})

    except Exception as e:
        print(f"Error during Firestore search: {e}")
        return jsonify({"error": "Search failed"}), 500

    return jsonify(results)


@app.route("/api/stories", methods=['POST'])
def create_story():
    data = request.json
    print(data)
    data = request.json
    title = data.get('title')
    body = data.get('body')
    image_url = data.get('imageUrl')
    user_id = data.get('user_id')

    if not title:
        return jsonify({"Error": "Missing title"}), 400
    
    if not body and not image_url:
        return jsonify({"Error": "Missing body or image URL"}), 400
    
    if not user_id:
        return jsonify({"Error": "Missing user_id"}), 400

    if title_bloom.lookup(title.lower()):
        return jsonify({"warning": "A post with this title may already exist!"}), 409

    story_data = {
        'Title': title,
        'TitleLower': title.lower(),
        'Body' : body,
        'ImageUrl': image_url,
        'Author_ID': user_id,
        'Author_ID_Lower': user_id.lower(),
        'CreatedAt': firestore.SERVER_TIMESTAMP
    }

    try:
        doc_ref = db_firestore.collection('Stories').add(story_data)

        title_trie.insert(title.lower())
        author_trie.insert(user_id.lower())

        title_bloom.add(title.lower())

        print(f"Story created and added to Trie: {title}")

        return jsonify({"status": "success", "id": doc_ref[1].id}), 201 

    except Exception as e:
        print(f"Error creating story: {e}")
        return jsonify({"error": "Could not create story"}), 500

@app.route("/api/stories", methods=['GET'])
def get_all_stories():
    stories = []
    try:
        stories_ref = db_firestore.collection('Stories').order_by(
            'CreatedAt', direction=Query.DESCENDING
        ).limit(50)
        for doc in stories_ref.stream():
            stories.append({"id": doc.id, **doc.to_dict()})
        return jsonify(stories)
    except Exception as e:
        print(f"Error fetching all stories: {e}")
        return{"Error": f"Could not fetch stories {e}"}, 500

@app.route("/api/stories/<string:story_id>", methods=['GET'])
def get_story_detail(story_id):
    if not db_firestore:
        return jsonify({"error": "No query provided or DB unavailable"}), 400
    try:
        doc_ref = db_firestore.collection("Stories").document(story_id)
        doc = doc_ref.get()

        if not doc.exists:
            return jsonify({"error": f"Story with ID {story_id} not found"}), 404    
        story_data = doc.to_dict()
        story_data["id"] = doc.id   
        return jsonify(story_data), 200
    
    except Exception as e:
        print(f"Error getting story {story_id}: {e}")
        return jsonify({"error": "Could not get story"}), 500
    

#  getting error: curl: (56) Recv failure: Connection reset by peer
@app.route("/api/stories/<string:story_id>", methods=['PUT'])
def update_story(story_id):
    if not db_firestore:
        return jsonify({"error": "No query provided or DB unavailable"}), 400

    data = request.json
    if not data:
        return jsonify({"error": "No update data provided"}), 400
    
    doc_ref = db_firestore.collection('Stories').document(story_id)

    try:
        doc = doc_ref.get()

        if not doc.exists:
            return jsonify({"error": f"Story with ID '{story_id}' not found"}), 404
        updates = {}
        old_data = doc.to_dict()

        # only update provided fields
        if "title" in data:
            updates["Title"] = data["title"]
            updates["TitleLower"] = data["title"].lower()
        if "body" in data:
            updates["Body"] = data["body"]
        if "imageUrl" in data:
            updates["ImageUrl"] = data["imageUrl"]

        if not updates:
            return jsonify({"error": "No valid fields to update"}), 400
        doc_ref.update(updates)

        # modify Trie title with potential new title
        # if "TitleLower" in updates:

        updated_doc = doc_ref.get() 
        updated_story = updated_doc.to_dict()
        updated_story["id"] = updated_doc.id

        return jsonify(updated_story), 200

    except Exception as e:
        print(f"Error updating story {story_id}: {e}")
        return jsonify({"error": "Could not update story"}), 500

@app.route("/api/stories/<string:story_id>", methods=['DELETE'])
def delete_story(story_id):
    if not db_firestore:
        return jsonify({"error": "No query provided or DB unavailable"}), 400
    try:
        doc_ref = db_firestore.collection("Stories").document(story_id)
        doc = doc_ref.get()

        if not doc.exists:
            return jsonify({"error": f"Story with ID {story_id} not found"}), 404    
        
        doc_ref.delete()

        # remove from both Tries
        data = doc.to_dict()
        title_lower = data.get("TitleLower")
        if title_lower:
            title_trie.remove(title_lower)
        
        author_lower = data.get("Author_ID")
        if author_lower:
            # We must use .lower() because that's how it was stored
            author_trie.remove(author_lower.lower())

        return jsonify({"status" : "success", "id": story_id}), 200
    
    except Exception as e:
        print(f"Error deleting story {story_id}: {e}")
        return jsonify({"error": "Could not delete story"}), 500
    
@app.route("/verify_token", methods=["POST"])
def verify_token():
    try:
        token = request.headers.get("Authorization")        # changed from "Autorization"
        if not token:
            return jsonify({"error": "No autentication header"}), 401
        
        tok = token.split("Bearer")[-1]
        decoded = auth.verify_id_token(tok)
        
        uid = decoded["uid"]
        

    except Exception as e:
        return jsonify({"error": str(e)}), 401

if __name__ == "__main__":
    build_localDSA_from_db()
    app.run(debug=True, host="0.0.0.0", port=8080)
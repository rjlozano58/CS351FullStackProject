"""
NOTE for future use there should be a secrets directory in your backend/ directory containing the .json file for firestore
related things. If it is not there none of this will probably work
"""

import os
import time
from flask import Flask, request, jsonify
from flask_cors import CORS
import firebase_admin
from firebase_admin import credentials, auth, firestore
from google.cloud.firestore_v1.query import Query
from google.cloud.firestore_v1.base_query import FieldFilter
from trie import Trie

app = Flask(__name__)

CORS(app)

main_trie = Trie()

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


def build_trie_from_db():
    trie = Trie()
    if not db_firestore:
        print("Error: Firestore client not available!")
        return trie
    try:
        stories_ref = db_firestore.collection('Stories')

        for doc in stories_ref.get(): 
            story_data = doc.to_dict()
            title = story_data.get('Title')
            if title and isinstance(title, str):
                trie.insert(title.lower())
    except Exception as e:
        print(f"ERROR building Trie from Firestore: {e}")
        return Trie()
    
    print("Trie build complete")
    return trie

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
    prefix_to_search = query.strip().lower()

    if not prefix_to_search:
        return jsonify([])
        
    results = main_trie.search_prefix(prefix_to_search)

    return jsonify(results)

@app.route("/api/search", methods=['GET'])
def full_search():
    query = request.args.get("q", "").strip(' "').lower()

    if not query or not db_firestore:
        return jsonify({"error": "No query provided or DB unavailable"}), 400

    query_end = query + u'\uf8ff'

    # print(f' * User query q?= "{query_end}"')

    results = []
    try:
        stories_ref = db_firestore.collection('Stories')

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

    story_data = {
        'Title': title,
        'TitleLower': title.lower(),
        'Body' : body,
        'ImageUrl': image_url,
        'Author_ID': user_id,
        'CreatedAt': firestore.SERVER_TIMESTAMP
    }

    try:
        doc_ref = db_firestore.collection('Stories').add(story_data)

        main_trie.insert(title.lower())

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
        update_story["id"] = updated_doc.id

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

        # remove respective title from Trie
        title_lower = doc.to_dict().get("TitleLower")
        if title_lower:
            main_trie.remove(title_lower)

        return jsonify({"status" : "success", "id": story_id}), 200
    
    except Exception as e:
        print(f"Error deleting story {story_id}: {e}")
        return jsonify({"error": "Could not delete story"}), 500

if __name__ == "__main__":
    main_trie = build_trie_from_db()
    app.run(debug=True, host="0.0.0.0", port=8080)
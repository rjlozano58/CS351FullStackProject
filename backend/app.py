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
    pass

@app.route("/api/stories", methods=['GET'])
def get_all_stories():
    pass

@app.route("/api/stories/<string:story_id>", methods=['GET'])
def get_story_detail(story_id):
    pass

@app.route("/api/stories/<string:story_id>", methods=['PUT'])
def update_story(story_id):
    pass

@app.route("/api/stories/<string:story_id>", methods=['DELETE'])
def delete_story(story_id):
    pass

if __name__ == "__main__":
    main_trie = build_trie_from_db()
    app.run(debug=True, host="0.0.0.0", port=8080)
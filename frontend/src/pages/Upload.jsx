import React, { useState, useEffect } from "react";
import { storage } from "../firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import axios from "axios";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";

const API_URL = "/api/stories"; // proxy handles forwarding to port 8080

function Upload() {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState("");
  const [user, setUser] = useState(null);

  // Watch auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return unsubscribe;
  }, []);

  const handleUpload = async () => {
    if (!user) {
      alert("Please log in to upload artwork.");
      return;
    }

    if (!file || !title.trim()) {
      alert("Please provide a title and select a file.");
      return;
    }

    try {
      setUploading(true);

      // 1️Upload file to Firebase Storage
      const storageRef = ref(storage, `uploads/${user.uid}/${Date.now()}-${file.name}`);
      await uploadBytes(storageRef, file);

      // 2️ Get the download URL
      const url = await getDownloadURL(storageRef);
      setUploadedUrl(url);

      // 3️ Save metadata to your backend
      await axios.post(API_URL, {
        title: title,
        body: description,
        imageUrl: url,
        user_id: user.uid,
        user_email: user.email,
      });

      alert("Artwork uploaded successfully!");
      setFile(null);
      setTitle("");
      setDescription("");
    } catch (error) {
      console.error("Upload failed:", error);
      if (error.response){
        const statusCode = error.response.status
        const data = error.response.data
      

        if (statusCode === 409){
          alert("Upload failed. A post with this title already exists!");
        } else{
          alert("Upload failed. Check console for details.");
        }
      }
    } finally {
      setUploading(false);
    }
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto text-center mt-10">
        <h1 className="text-2xl font-bold mb-4">Upload Artwork</h1>
        <p className="text-lg mb-6">You must be logged in to upload.</p>
        <a href="/login" className="btn btn-primary">
          Go to Login
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Upload Artwork</h1>
      <p className="mb-4 text-sm text-gray-400">
        Logged in as <span className="font-semibold">{user.email}</span>
      </p>

      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="input input-bordered w-full mb-2"
      />

      <textarea
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        className="textarea textarea-bordered w-full mb-2 h-24"
      />

      <input
        type="file"
        accept="image/*"
        onChange={(e) => setFile(e.target.files[0])}
        className="file-input file-input-bordered w-full mb-4"
      />

      <button
        onClick={handleUpload}
        disabled={uploading}
        className="btn btn-primary w-full"
      >
        {uploading ? "Uploading..." : "Upload Artwork"}
      </button>

      {uploadedUrl && (
        <p className="mt-4">
          Uploaded file:{" "}
          <a
            href={uploadedUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 underline"
          >
            View Image
          </a>
        </p>
      )}
    </div>
  );
}

export default Upload;

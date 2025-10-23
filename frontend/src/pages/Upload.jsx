export default function Upload() {
  return (
    <div className="text-center mt-10">
      <h1 className="text-3xl font-semibold">Upload Page 📤</h1>
    </div>
  );
}
import React, { useState } from "react";
import { db, storage } from "../firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

function Upload() {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [description, setDescription] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState("");

  const handleUpload = async () => {
    if (!file || !title || !author) {
      alert("Please provide a file, title, and author.");
      return;
    }

    try {
      setUploading(true);

      // 1️ Upload file to Firebase Storage
      const storageRef = ref(storage, `uploads/${Date.now()}-${file.name}`);
      await uploadBytes(storageRef, file);

      // Get the public URL
      const url = await getDownloadURL(storageRef);
      setUploadedUrl(url);

      // 2️ Save document to Firestore
      await addDoc(collection(db, "Uploads"), {
        Title: title,
        Author: author,
        Body: description,
        ImageUrl: url,
        CreatedAt: serverTimestamp(),
      });

      alert("Artwork uploaded successfully!");
      setFile(null);
      setTitle("");
      setAuthor("");
      setDescription("");
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Upload failed. See console.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Upload Artwork</h1>

      <input
        type="text"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="input input-bordered w-full mb-2"
      />
      <input
        type="text"
        placeholder="Author"
        value={author}
        onChange={(e) => setAuthor(e.target.value)}
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
          <a href={uploadedUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
            View Image
          </a>
        </p>
      )}
    </div>
  );
}

export default Upload;

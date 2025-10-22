import React, { useState } from "react";
import axios from "axios";

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

      // Step 1: Upload file to an external image host (e.g., imgbb)
      const formData = new FormData();
      formData.append("image", file);

      const imageRes = await axios.post(
        `https://api.imgbb.com/1/upload?key=acc21833bd732a0749632daa7fe97c97`,
        formData
      );
      const imageUrl = imageRes.data.data.url;
      setUploadedUrl(imageUrl);

      // Step 2: Create a Firestore document via REST API
      const newUpload = {
        fields: {
          Title: { stringValue: title },
          Author: { stringValue: author },
          Body: { stringValue: description },
          ImageUrl: { stringValue: imageUrl },
          CreatedAt: { timestampValue: new Date().toISOString() },
        }
      };

      await axios.post(
        `https://firestore.googleapis.com/v1/projects/cs-351-b2b1c/databases/(default)/documents/Uploads`,
        newUpload
      );

      alert("Artwork uploaded successfully!");
      setFile(null);
      setTitle("");
      setAuthor("");
      setDescription("");
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload artwork. Try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Upload Artwork</h1>

      <div className="mb-4">
        <label className="block mb-1 font-semibold">Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="input input-bordered w-full"
        />
      </div>

      <div className="mb-4">
        <label className="block mb-1 font-semibold">Author</label>
        <input
          type="text"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          className="input input-bordered w-full"
        />
      </div>

      <div className="mb-4">
        <label className="block mb-1 font-semibold">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="textarea textarea-bordered w-full h-24"
        />
      </div>

      <div className="mb-4">
        <label className="block mb-1 font-semibold">Select File</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files[0])}
          className="file-input file-input-bordered w-full"
        />
      </div>

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
          <a href={uploadedUrl} target="_blank" className="text-blue-500 underline">
            View Image
          </a>
        </p>
      )}
    </div>
  );
}

export default Upload;

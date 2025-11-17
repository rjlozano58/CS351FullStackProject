import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import '../index.css';

function PostDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Comment form state
  const [commentAuthor, setCommentAuthor] = useState("");
  const [commentText, setCommentText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Preview Image State
  const [showPreview, setShowPreview] = useState(false);


  useEffect(() => {
    const fetchPostAndComments = async () => {
      try {
        setLoading(true);
        
        // Fetch post details
        const postRes = await axios.get(
          `https://firestore.googleapis.com/v1/projects/cs-351-b2b1c/databases/(default)/documents/Stories/${id}`
        );
        
        const fields = postRes.data.fields || {};
        setPost({
          id: id,
          imageURL: fields.ImageUrl?.stringValue || "https://via.placeholder.com/600x400",
          title: fields.Title?.stringValue || "Untitled Artwork",
          artist: fields.Author?.stringValue || "Unknown Artist",
          description: fields.Body?.stringValue || "No description provided",
          createdAt: fields.CreatedAt?.timestampValue || null,
        });

        // Fetch comments for this post
        const commentsRes = await axios.get(
          `https://firestore.googleapis.com/v1/projects/cs-351-b2b1c/databases/(default)/documents/Comments`
        );
        
        // Filter comments for this post
        const postComments = (commentsRes.data.documents || [])
          .filter(doc => doc.fields?.StoryId?.stringValue === id)
          .map(doc => ({
            id: doc.name?.split('/').pop(),
            author: doc.fields?.Author?.stringValue || "Anonymous",
            text: doc.fields?.Text?.stringValue || "",
            createdAt: doc.fields?.CreatedAt?.timestampValue || new Date().toISOString(),
          }))
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); // Sort by newest first
        
        setComments(postComments);
        
      } catch (error) {
        console.error("Error fetching post details:", error);
        setError("Failed to load post details");
      } finally {
        setLoading(false);
      }
    };

    fetchPostAndComments();
  }, [id]);

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    
    if (!commentAuthor.trim() || !commentText.trim()) {
      alert("Please fill in both name and comment");
      return;
    }

    try {
      setSubmitting(true);
      
      // Create comment in Firestore
      const newComment = {
        fields: {
          StoryId: { stringValue: id },
          Author: { stringValue: commentAuthor },
          Text: { stringValue: commentText },
          CreatedAt: { timestampValue: new Date().toISOString() },
        }
      };

      await axios.post(
        `https://firestore.googleapis.com/v1/projects/cs-351-b2b1c/databases/(default)/documents/Comments`,
        newComment
      );

      // Add comment to local state
      setComments([
        {
          id: Date.now().toString(),
          author: commentAuthor,
          text: commentText,
          createdAt: new Date().toISOString(),
        },
        ...comments
      ]);

      // Clear form
      setCommentAuthor("");
      setCommentText("");
      
      alert("Comment posted successfully!");
      
    } catch (error) {
      console.error("Error posting comment:", error);
      alert("Failed to post comment. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl">Loading artwork...</p>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-xl text-red-500">{error || "Post not found"}</p>
        <button 
          className="btn btn-primary"
          onClick={() => navigate("/")}
        >
          Back to Gallery
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      {/* Back button */}
      <button 
        className="btn btn-ghost mb-4"
        onClick={() => navigate("/")}
      >
        ← Back to Community Gallery
      </button>

      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-4xl w-full">
            
            {/* Close button */}
            <button
              onClick={() => setShowPreview(false)}
              className="btn btn-sm btn-circle absolute right-3 top-3 z-50"
            >
              ✕
            </button>

            {/* Fullscreen image */}
            <img
              src={post.imageURL}
              alt={post.title}
              className="mx-auto max-h-[80vh] max-w-[90vw] object-contain rounded-lg"
            />

            {/* Caption */}
            <div className="text-center mt-4 text-white animate-fadeIn">
              <h2 className="text-3xl font-bold">{post.title}</h2>
              <p className="text-gray-300">By {post.artist}</p>
              {post.description && (
                <p className="text-gray-400 mt-3 max-w-3xl mx-auto">
                  {post.description}
                </p>
              )}
            </div>
          </div>
          <dialog id="image_modal" className="modal">
            <div className="modal-box max-w-3xl p-4">
              <form method="dialog">
                <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
              </form>

              <img 
                src={post.imageURL}
                alt={post.title}
                className="mx-auto max-w-[80%] max-h-[70vh] object-contain rounded-lg"
              />

              <p className="text-center mt-4 text-lg font-semibold">{post.title}</p>
              <p className="text-center text-sm text-gray-500">By {post.artist}</p>
            </div>
          </dialog>

        </div>
        
      )}

      {/* Post details */}
      <div className="max-w-5xl mx-auto">
        <div className="card bg-base-100 shadow-xl border-1 border-amber-50">
          
        <figure className="relative cursor-pointer group" onClick={() => setShowPreview(true)}>
          <img
            src={post.imageURL}
            alt={post.title}
            className="w-full h-96 object-cover transition duration-300 group-hover:opacity-90"
          />

          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-black bg-opacity-50 text-white text-lg font-semibold px-3 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
              Click to Preview
            </div>
          </div>
        </figure>

          <div className="card-body">
            <h1 className="card-title text-4xl">{post.title}</h1>
            <p className="text-lg text-gray-600">Created by {post.artist}</p>
            {post.createdAt && (
              <p className="text-sm text-gray-500">
                Posted on {new Date(post.createdAt).toLocaleDateString()}
              </p>
            )}
            <div className="divider"></div>
            <div className="text-lg whitespace-pre-wrap">
              <h3 className="font-semibold mb-2">Artist's Description:</h3>
              <p>{post.description}</p>
            </div>
          </div>
        </div>

        {/* Comments section */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">
            Community Feedback ({comments.length})
          </h2>

          {/* Comment form */}
          <div className="card bg-base-100 shadow-md mb-6 border-1 border-amber-50">
            <div className="card-body">
              <h3 className="card-title text-xl">Share Your Thoughts</h3>
              <p className="text-sm text-gray-500 mb-4">
                Show appreciation or provide constructive feedback to the artist
              </p>
              <form onSubmit={handleSubmitComment} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Your Name</label>
                  <input
                    type="text"
                    placeholder="Enter your name"
                    className="input input-bordered w-full"
                    value={commentAuthor}
                    onChange={(e) => setCommentAuthor(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Your Feedback</label>
                  <textarea
                    className="textarea textarea-bordered w-full h-28"
                    placeholder="What do you think about this artwork?"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    required
                  ></textarea>
                </div>

                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={submitting}
                >
                  {submitting ? "Posting..." : "Post Feedback"}
                </button>
              </form>
            </div>
          </div>

          {/* Display comments */}
          <div className="space-y-4">
            {comments.length === 0 ? (
              <p className="text-center text-gray-500 py-8">
                No feedback yet. Be the first to share your thoughts!
              </p>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="card bg-base-100 shadow-sm border-1 border-amber-50">
                  <div className="card-body">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold">{comment.author}</h4>
                        <p className="text-sm text-gray-500">
                          {new Date(comment.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <p className="mt-2">{comment.text}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PostDetails;
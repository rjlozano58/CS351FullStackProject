import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

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

      {/* Post details */}
      <div className="max-w-4xl mx-auto">
        <div className="card bg-base-100 shadow-xl">
          <figure>
            <img 
              src={post.imageURL} 
              alt={post.title}
              className="w-full h-96 object-cover"
            />
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
          <div className="card bg-base-100 shadow-md mb-6">
            <div className="card-body">
              <h3 className="card-title text-xl">Share Your Thoughts</h3>
              <p className="text-sm text-gray-500 mb-4">
                Show appreciation or provide constructive feedback to the artist
              </p>
              <form onSubmit={handleSubmitComment}>
                <div className="form-control mb-4">
                  <label className="label">
                    <span className="label-text">Your Name</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter your name"
                    className="input input-bordered"
                    value={commentAuthor}
                    onChange={(e) => setCommentAuthor(e.target.value)}
                    required
                  />
                </div>
                <div className="form-control mb-4">
                  <label className="label">
                    <span className="label-text">Your Feedback</span>
                  </label>
                  <textarea
                    className="textarea textarea-bordered h-24"
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
                <div key={comment.id} className="card bg-base-100 shadow-sm">
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
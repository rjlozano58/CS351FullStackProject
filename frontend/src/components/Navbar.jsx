import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const API_URL = "http://127.0.0.1:8080";

function Navbar() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("title");
  const [suggestions, setSuggestions] = useState([]);
  
  const navigate = useNavigate();

  const handleSearchSubmit = () => {
    if(query.trim()) {
      navigate(`/search/${filter}/${query.trim()}`);
      setSuggestions([]);
    }
  }

  useEffect(() => {
    if (query.length < 1) {
      setSuggestions([]);
      return;
    }

    const debouncer = setTimeout(() => {
      axios
        .get(`${API_URL}/api/autocomplete`, {
          params: {
            q: query,
            type: filter,
          },
        })
        .then((res) => {
          setSuggestions(res.data || []);
        })
        .catch((err) => {
          console.log("Error fetching suggestions:", err);
          setSuggestions([]);
        });
    }, 200);
    return () => clearTimeout(debouncer);
  }, [query, filter]);

  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion);
    setSuggestions([]);
  };

  return (
    <div className="navbar bg-base-100 shadow-sm">
      <div className="flex-1">
        <a className="btn btn-ghost text-xl">Foggy Nights</a>
      </div>

      <div className="flex-none">
        <div className="relative">
          <div className="join">
            <Link to="/" className="btn join-item">
              Home
            </Link>
            <Link to="/upload" className="btn join-item">
              Upload
            </Link>

            <input
              type="text"
              placeholder="Search"
              className="input input-bordered join-item w-40"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onBlur={() => setTimeout(() => setSuggestions([]), 150)}
            />
            <select
              className="select select-bordered join-item"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="title">Title</option>
              <option value="author">Author</option>
            </select>
            <button className="btn join-item" onClick={handleSearchSubmit}>Search</button>
          </div>

          {suggestions.length > 0 && (
            <ul className="absolute z-10 w-40 bg-base-100 shadow-lg rounded-box mt-1 menu p-2">
              {suggestions.map((suggestion, index) => (
                <li key={index}>
                  <a
                    onMouseDown={() => handleSuggestionClick(suggestion)}
                  >
                    {suggestion}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default Navbar;

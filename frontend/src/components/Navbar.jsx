import React from 'react';
import { Link } from "react-router-dom";

function Navbar() {
  return (
    <div className="navbar bg-base-100 shadow-sm">
      <div className="flex-1">
        <a className="btn btn-ghost text-xl">Foggy Nights</a>
      </div>

      <div className="flex-none">
        <div className="join">
          <Link to="/" className="btn join-item">Home</Link>
          <Link to="/upload" className="btn join-item">Upload</Link>

          <input
            type="text"
            placeholder="Search"
            className="input input-bordered join-item w-40"
          />
          <select className="select select-bordered join-item">
            <option disabled selected>Filter</option>
            <option>Title</option>
            <option>Author</option>
          </select>
          <button className="btn join-item">Search</button>
        </div>
      </div>
    </div>

  )
}

export default Navbar;

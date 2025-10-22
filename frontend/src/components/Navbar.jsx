import React from 'react';
import { Link } from "react-router-dom";

function Navbar() {
  return (
    <div className="navbar bg-base-00 shadow-sm">
        <div className="flex-1">
            <a className="btn btn-ghost text-xl">Foggy Nights</a>
        </div>
        <div className="flex-none">
            <ul className="menu menu-horizontal px-1">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/upload">Upload</Link></li>
            <li>
                <details>
                <summary>Parent</summary>
                <ul className="bg-base-100 rounded-t-none p-2">
                    <li>
                        <Link to="/">Home</Link>
                    </li>
                    <li>
                        <Link to="/upload">Upload</Link>
                    </li>
                </ul>
                </details>
            </li>
            </ul>
        </div>
    </div>

  )
}

export default Navbar;

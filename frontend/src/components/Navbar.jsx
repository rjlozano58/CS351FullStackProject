import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-blue-600">
          MyApp
        </Link>
        <div className="space-x-6">
          <Link to="/" className="text-gray-600 hover:text-blue-600">Home</Link>
          <Link to="/upload" className="text-gray-600 hover:text-blue-600">Upload</Link>
          <Link to="/login" className="text-gray-600 hover:text-blue-600">Login</Link>
        </div>
      </div>
    </nav>
  );
}

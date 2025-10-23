import './App.css'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import Home from './pages/Home.jsx'
import Upload from './pages/Upload.jsx'
import PostDetails from './pages/PostDetails.jsx'
import SearchResults from './pages/SearchResults.jsx'
import Login from './pages/Login.jsx'

function App() {
  return (
    <div data-theme="dark">
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/post/:id" element={<PostDetails />} />
        <Route path="/search/:type/:query" element={<SearchResults />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </div>
  )
}

export default App

import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import { useRoutes, Routes, Route } from 'react-router-dom' // Import useRoutes
import Navbar from './components/Navbar.jsx'
import Home from './pages/Home.jsx'
import Upload from './pages/Upload.jsx'
import PostDetails from './pages/PostDetails.jsx'

function App() {
  return (
    <>
      <div data-theme="dark">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/post/:id" element={<PostDetails />} />
        </Routes>
      </div>
    </>
    
  )
}

export default App


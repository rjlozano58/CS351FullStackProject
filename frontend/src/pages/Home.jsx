import React, { useEffect, useState } from "react";
import axios from "axios";
import { CardDisplay } from "../components/CardDisplay";
import HeroWithImage from "../components/HeroWithImage";
import { ChevronLeft, ChevronRight } from "lucide-react"; 

// Helper function to check if an image loads
const checkImageURL = (url) => {
  return new Promise((resolve) => {
    if (!url) {
      resolve(false);
      return;
    }
    const img = new Image();
    img.src = url;

    // If it loads successfully, resolve true
    img.onload = () => resolve(true);
    // If it errors (404, etc), resolve false
    img.onerror = () => resolve(false);
  });
};

function Home() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true); 

  // for pages
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6); // Default to 6 items per page

  useEffect(() => {
    const fetchAndFilterData = async () => {
      try {

        const res = await axios.get(
          "https://firestore.googleapis.com/v1/projects/cs-351-b2b1c/databases/(default)/documents/Stories"
        );
        const rawDocs = res.data.documents || [];

        const validityChecks = await Promise.all(
          rawDocs.map(async (doc) => {
            const url = doc.fields?.ImageUrl?.stringValue;
            const isValid = await checkImageURL(url);
            return isValid; 
          })
        );

        const filteredDocs = rawDocs.filter((_, index) => validityChecks[index]);

        setData(filteredDocs);
      } catch (error) {
        console.error("Error fetching Firestore data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAndFilterData();
  }, []);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  
  // Only slice the data we want to see right now
  const currentItems = data.slice(indexOfFirstItem, indexOfLastItem);
  
  const totalPages = Math.ceil(data.length / itemsPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleLimitChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1); // Reset to page 1 when changing the limit
  };

  if (loading) {
    return <div className="p-10 text-center">Loading Gallery...</div>;
  }

  return (
    <div className="p-6">
      
      <HeroWithImage title="Post Your Art!" image="https://cranbrookart.edu/wp-content/uploads/2023/10/W9A2952.jpg" text="Our platform empowers artists to freely share their creative work in a secure, supportive environment. We prioritize artistic integrity by ensuring every piece remains protected from AI training, copying, or misuse. Artists can showcase their talent, connect with others, and gain visibility without compromising ownership or creative authenticity." />

      <div className="divider"></div>

      <h1 className="text-3xl font-bold mb-6 text-center">Art Gallery</h1>

      <div className="flex items-center gap-4 m-5 md:mt-0">
          <span className="text-sm font-medium">Art per page:</span>
          <select 
            className="border rounded p-2 bg-background"
            value={itemsPerPage}
            onChange={handleLimitChange}
          >
            <option value={3}>3</option>
            <option value={6}>6</option>
            <option value={9}>9</option>
            <option value={12}>12</option>
            <option value={data.length}>All</option>
          </select>
        </div>

      <div className="grid grid-cols-1 md:grid-cols-3 sm:grid-cols-1 gap-3 justify-items-center min-h-[500px]">
        {currentItems.length > 0 ? (
          currentItems.map((doc, index) => {
            const fields = doc.fields || {};
            const imageURL = fields.ImageUrl?.stringValue;
            const title = fields.Title?.stringValue;
            const description = fields.Body?.stringValue;
            const author = fields.Author_ID?.stringValue;

            return (
              <CardDisplay
                key={index}
                id={doc.name.split("/").pop()}
                imageURL={imageURL}
                title={title}
                description={description}
                author={author}
              />
            );
          })
        ) : (
          <p className="col-span-full text-center text-gray-500">No artwork found.</p>
        )}
      </div>

      {data.length > itemsPerPage && (
        <div className="flex justify-center items-center gap-6 mt-10">
          <button
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            className={`p-2 rounded-full border ${
              currentPage === 1 
                ? "opacity-50 cursor-not-allowed bg-gray-100" 
                : "hover:bg-gray-200"
            }`}
          >
            <ChevronLeft size={24} />
          </button>

          <span className="text-sm">
            Page {currentPage} of {totalPages}
          </span>

          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className={`p-2 rounded-full border ${
              currentPage === totalPages 
                ? "opacity-50 cursor-not-allowed bg-gray-100" 
                : "hover:bg-gray-200"
            }`}
          >
             <ChevronRight size={24} />
          </button>
        </div>
      )}
      
    </div>
  );
}

export default Home;

import React, { useEffect, useState } from "react";
import axios from "axios";
import { CardDisplay } from "../components/CardDisplay";

function Home() {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchFirestoreData = async () => {
      try {
        const res = await axios.get(
          "https://firestore.googleapis.com/v1/projects/cs-351-b2b1c/databases/(default)/documents/Stories"
        );
        setData(res.data.documents || []);
        console.log(res.data.documents)

        // Debug: Check the actual data structure
        console.log("Full response:", res.data.documents);
        
        // Debug: Check each document's image URL
        res.data.documents?.forEach((doc, i) => {
          console.log(`Doc ${i} ImageUrl:`, doc.fields?.ImageUrl?.stringValue);
        });
      } catch (error) {
        console.error("Error fetching Firestore data:", error);
      }
    };

    fetchFirestoreData();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">Art Gallery</h1>

      <div className="flex flex-wrap justify-center gap-6">
        {data.map((doc, index) => {
          const fields = doc.fields || {};
          const imageURL = fields.ImageUrl?.stringValue;
          const title = fields.Title?.stringValue;
          const description = fields.Body?.stringValue;

          return (
            <CardDisplay
            key={index}
            id={doc.name.split("/").pop()} // Extract Firestore doc ID
            imageURL={imageURL}
            title={title}
            description={description}
            />
          );
        })}
      </div>
    </div>
  );
}

export default Home;

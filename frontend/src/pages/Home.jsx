export default function Home() {
  return (
    <div className="text-center mt-10">
      <h1 className="text-3xl font-semibold">Welcome to the Home Page 🏠</h1>
    </div>
  );
}
import React, { useEffect, useState } from "react";
import axios from "axios";
import { CardDisplay } from "../components/CardDisplay";
import HeroWithImage from "../components/HeroWithImage";

function Home() {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchFirestoreData = async () => {

      try {

        const res = await axios.get(
          "https://firestore.googleapis.com/v1/projects/cs-351-b2b1c/databases/(default)/documents/Stories"
        );
        setData(res.data.documents || []);
        
      } catch (error) {
        console.error("Error fetching Firestore data:", error);
      }
    };

    fetchFirestoreData();
  }, []);

  return (
    <div className="p-6">
      
      <HeroWithImage title="Post Your Art!" image="https://cranbrookart.edu/wp-content/uploads/2023/10/W9A2952.jpg" text="Our platform empowers artists to freely share their creative work in a secure, supportive environment. We prioritize artistic integrity by ensuring every piece remains protected from AI training, copying, or misuse. Artists can showcase their talent, connect with others, and gain visibility without compromising ownership or creative authenticity." />

      <div className="divider"></div>

      <h1 className="text-3xl font-bold mb-6 text-center">Art Gallery</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 justify-items-center">
        {data.map((doc, index) => {
          const fields = doc.fields || {};
          const imageURL = fields.ImageUrl?.stringValue;
          const title = fields.Title?.stringValue;
          const description = fields.Body?.stringValue;
          const author = fields.Author_ID?.stringValue;

          return (
            <CardDisplay
            key={index}
            id={doc.name.split("/").pop()} // Extract Firestore doc ID
            imageURL={imageURL}
            title={title}
            description={description}
            author={author}
            />
          );
        })}
      </div>
    </div>
  );
}

export default Home;

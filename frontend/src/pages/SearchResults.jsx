import React, {useEffect,useState} from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { CardDisplay } from '../components/CardDisplay';

const API_URL = "http://127.0.0.1:8080";

function SearchResults(){
    const [results, setResults] = useState([]);
    const [isLoading,setIsLoading] = useState(true);

    const {query, type} = useParams();
    useEffect(()=>{
        if(!query) return;
        const fetchSearchResults = async () => {
            setIsLoading(true);
            setResults([]);
            try {
                const res = await axios.get(`${API_URL}/api/search`, {
                    params: {
                        q:query,
                        type: type
                    }
                });

                setResults(res.data || []);
            } catch (error) {
                console.log("Error fetching search results", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchSearchResults();
    },[query, type]);

    if(isLoading){
        return <div className="p-6 text-center">Loading search results...</div>;
    }

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-6 text-center">
                Search Results for: "{query}"
            </h1>

            {results.length === 0 ? (
                <p className="text-center">No results found.</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 justify-items-center">
                    {results.map((doc) => (
                        <CardDisplay
                        key={doc.id}
                        id={doc.id}
                        imageURL={doc.ImageUrl}
                        title={doc.Title}
                        description={doc.Body}
                        author={doc.Author_ID}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

export default SearchResults;
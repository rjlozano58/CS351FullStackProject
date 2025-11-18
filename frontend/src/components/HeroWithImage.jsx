import React from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase";

function HeroWithImage(props) {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    if (auth.currentUser) {
      // If logged in, go to Upload page
      navigate("/upload");
    } else {
      // If not logged in, go to Login page
      navigate("/login");
    }
  };

  return (
    <div className="hero bg-base-200 h-min-screen m-0">
      <div className="hero-content flex-col lg:flex-row">
        <img
          src={props.image}
          alt={props.title}
          className="max-w-sm rounded-lg shadow-2xl"
        />
        <div>
          <h1 className="text-5xl font-bold">{props.title}</h1>
          <p className="py-6">{props.text}</p>
          <button
            className="btn btn-primary"
            onClick={handleGetStarted}
          >
            Get Started
          </button>
        </div>
      </div>
    </div>
  );
}

export default HeroWithImage;

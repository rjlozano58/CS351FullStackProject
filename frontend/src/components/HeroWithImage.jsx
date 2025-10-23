import React from 'react'

function HeroWithImage(props) {
  return (
    <div className="hero bg-base-200 h-min-screen m-0">
        <div className="hero-content flex-col lg:flex-row">
            <img
            src={props.image}
            className="max-w-sm rounded-lg shadow-2xl"
            />
            <div>
                <h1 className="text-5xl font-bold">{props.title}</h1>
                <p className="py-6">
                    {props.text}
                </p>
                <button className="btn btn-primary">Get Started</button>
            </div>
        </div>
    </div>
  )
}

export default HeroWithImage
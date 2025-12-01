import { useNavigate } from "react-router-dom";

export function CardDisplay(props) {
  const navigate = useNavigate();

  const handleViewPost = () => {
    navigate(`/post/${props.id}`);
  };

  return (
    <div className="card bg-base-100 w-96 shadow-sm border-amber-50 border-2">
      <figure>
        <img src={props.imageURL} alt={props.title || "Artwork"} />
      </figure>
      <div className="card-body">
        <h2 className="card-title">{props.title}</h2>
        <p className="text-sm text-gray-600">by {props.author}</p>
        <p className="line-clamp-3">{props.description}</p>
        <div className="card-actions justify-end">
          <button className="btn btn-primary" onClick={handleViewPost}>
            View Post
          </button>
        </div>
      </div>
    </div>
  );
}

import React from "react";
import { useNavigate } from "react-router-dom";
import "./ProjectCard.scss";

function ProjectCard({ card }) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/portofolio`);
  };

  return (
    <div className="projectCard" onClick={handleClick} style={{ cursor: "pointer" }}>
      <img src={card.img} alt="" />
      <div className="info">
        <img src={card.pp} alt="" />
        <div className="texts">
          <h2>{card.cat}</h2>
          <span>{card.username}</span>
        </div>
      </div>
    </div>
  );
}

export default ProjectCard;

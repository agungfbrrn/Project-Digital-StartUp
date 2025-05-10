import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import newRequest from "../../utils/newRequest";
import "./Review.scss";
import { useParams, useNavigate } from "react-router-dom"; // Import Link dari react-router-dom

const Review = ({ review, sellerId }) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [userId, setUserId] = useState(null);
  const [likes, setLikes] = useState(review.likes || 0);
  const [dislikes, setDislikes] = useState(review.dislikes || 0);
  const [hasLiked, setHasLiked] = useState(false);
  const [hasDisliked, setHasDisliked] = useState(false);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("currentUser"));
    if (storedUser) {
      setUserId(storedUser._id);
    }
  }, []);

  const handleViewProfile = (profileId) => {
    const storedUser = JSON.parse(localStorage.getItem("currentUser"));
  
    if (!storedUser) {
      console.log("User belum login.");
      return;
    }
  
    if (storedUser._id === profileId) {
      console.log("Tidak bisa melihat profil sendiri.");
      navigate(`/userProfile/${storedUser._id}`);
      return;
    }
  
    navigate(`/userProfile/${profileId}`);
  };
  
  
  const { isLoading, error, data } = useQuery({
    queryKey: ["user", review.userId],
    queryFn: () =>
      newRequest.get(`/users/${review.userId}`).then((res) => res.data),
  });

  const likeMutation = useMutation({
    mutationFn: () => newRequest.put(`/reviews/${review._id}/like`),
    onSuccess: (data) => {
      setLikes(data.data.review.likes);
      setDislikes(data.data.review.dislikes);
      setHasLiked(true);
      setHasDisliked(false);
      queryClient.invalidateQueries(["reviews"]);
    },
  });

  const dislikeMutation = useMutation({
    mutationFn: () => newRequest.put(`/reviews/${review._id}/dislike`),
    onSuccess: (data) => {
      setLikes(data.data.review.likes);
      setDislikes(data.data.review.dislikes);
      setHasDisliked(true);
      setHasLiked(false);
      queryClient.invalidateQueries(["reviews"]);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => newRequest.delete(`/reviews/${review._id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(["reviews"]);
      queryClient.invalidateQueries(["gig"]);
    },
  });

  const handleDelete = () => {
    if (window.confirm("Apakah Anda yakin ingin menghapus komentar ini?")) {
      deleteMutation.mutate();
    }
  };

  console.log("Logged in User ID:", userId);
  console.log("Review User ID:", review.userId.toString());
  console.log("Condition:", userId === review.userId.toString());

  return (
    <div className="review">
      {isLoading ? (
        <p>Loading...</p>
      ) : error ? (
        <p>Error fetching user data</p>
      ) : (
        <div className="user">
<img
  className="pp"
  src={data.img || "/img/noavatar.jpg"}
  alt={data.username}
  onClick={() => handleViewProfile(data._id)}
  style={{ cursor: "pointer" }}
/>


          <div className="info">
            <span>{data.username}</span>
            {sellerId && sellerId === review.userId.toString() && (
              <div className="official-container">
                <span className="official-badge">Official</span>
                <img className="official-icon" src="/img/ceklis.png" alt="Official Badge" />
              </div>
            )}
            <div className="country">
              <span>{data.country}</span>
            </div>
          </div>
        </div>
      )}

      <div className="stars">
        {Array(review.star)
          .fill()
          .map((_, i) => (
            <img src="/img/star.png" alt="star" key={i} />
          ))}
        <span>{review.star}</span>
      </div>

      <p>{review.desc}</p>

      <div className={`helpful ${hasLiked || hasDisliked ? "active" : ""}`}>
        <span>Membantu?</span>
        <img
          className={`icon like-icon ${hasLiked ? "active" : ""}`}
          src="/img/like.png"
          alt="like"
          onClick={() => likeMutation.mutate()}
        />
        <span>{likes}</span>
        <img
          className={`icon dislike-icon ${hasDisliked ? "active" : ""}`}
          src="/img/dislike.png"
          alt="dislike"
          onClick={() => dislikeMutation.mutate()}
        />
        <span>{dislikes}</span>
      </div>

      {userId && review.userId && userId === review.userId.toString() && (
        <button className="deleteButton" onClick={handleDelete}>
          Delete
        </button>
      )}
    </div>
  );
};

export default Review;

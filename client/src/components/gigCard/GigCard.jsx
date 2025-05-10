/* eslint-disable react/prop-types */
import React from "react";
import "./GigCard.scss";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import newRequest from "../../utils/newRequest";

const GigCard = ({ item }) => {
  const { isLoading, error, data } = useQuery({
    queryKey: [item.userId?._id], // Pastikan hanya mengakses ID
    queryFn: () =>
      newRequest.get(`/users/${item.userId?._id}`).then((res) => res.data),
  });
  

  const formatRupiah = (number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
    }).format(number);
  };

  return (
    <Link
  to={`/gig/${item._id}`}
  className="link"
  onClick={() => setTimeout(() => window.location.reload(), 0)}
>
      <div className="gigCard">
        {/* Cover Image with Seller's Image and Features Overlay */}
        <div className="gigCard-coverContainer">
        <img
  src={item.coverThumbnail || item.cover}
  srcSet={`${item.cover}?w=150 150w, ${item.cover}?w=320 320w, ${item.cover}?w=640 640w`}
  sizes="(max-width: 480px) 150px, (max-width: 768px) 320px, 640px"
  alt={item.title}
  className="gigCard-cover"
  loading="lazy"
  onLoad={(e) => e.target.setAttribute("data-loaded", "true")}
/>

          {/* Seller's Profile Picture */}
          {isLoading ? (
            "Loading..."
          ) : error ? (
            "Something went wrong!"
          ) : (
            <div className="gigCard-user">
              <img
                src={data?.img || "/img/noavatar.jpg"}
                alt={data?.username || "Unknown"}
                className="gigCard-sellerImg"
              />
              <span>{data?.username || "Unknown User"}</span>
            </div>
          )}

          {/* Features */}
          {item.features && item.features.length > 0 && (
            <div className="gigCard-features">
              {item.features.map((feature, index) => (
                <span key={index} className="gigCard-feature">
                  {feature}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="gigCard-info">
          <h3 className="gigCard-title">{item.title}</h3> {/* Title */}
          <p className="gigCard-desc">{item.shortDesc}</p> {/* Short Description */}

         {/* Rating */}
<div className="gigCard-rating">
  <img src="./img/star.png" alt="star" className="gigCard-star" />
  <span>
    {!isNaN(item.totalStars / item.starNumber) &&
      Math.round(item.totalStars / item.starNumber)}
  </span>
</div>

<hr className="gigCard-divider" /> {/* Garis Pembatas */}

{/* Price */}
<div className="gigCard-price">
  <span>Harga</span>
  <h2>{formatRupiah(item.price)}</h2>
</div>

        </div>
      </div>
    </Link>
  );
};

export default GigCard;

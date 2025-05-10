import React from "react";
import { motion } from "framer-motion";
import "./Slide.scss";
import Slider from "infinite-react-carousel";

const Slide = ({ children, slidesToShow = 3, arrowsScroll = 1 }) => {
  return (
    <div className="slide">
      <div className="container">
        <Slider
          slidesToShow={slidesToShow}
          arrowsScroll={arrowsScroll}
          autoplay
          autoplaySpeed={3000} // Auto-slide setiap 3 detik
          pauseOnHover // Pause saat hover
          swipe // Geser dengan mouse/touch
          dots // Menampilkan indikator slide
          speed={800} // Durasi transisi agar lebih smooth
          responsive={[
            { breakpoint: 1024, settings: { slidesToShow: 2, arrowsScroll: 1 } },
            { breakpoint: 768, settings: { slidesToShow: 1, arrowsScroll: 1 } }
          ]}
        >
          {React.Children.map(children, (child, index) => (
            <motion.div
              className="slide-item"
              key={index}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            >
              {child}
            </motion.div>
          ))}
        </Slider>
      </div>
    </div>
  );
};

export default Slide;

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./TrustedBy.scss";

export default function TrustedBy() {
  const [isOpen, setIsOpen] = useState(false);
  const contentRef = useRef(null);

  useEffect(() => {
    if (isOpen && contentRef.current) {
      contentRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [isOpen]);

  return (
    <div className="trusted-container">
      {/* Tombol Toggle dengan Gambar */}
      <button onClick={() => setIsOpen(!isOpen)} className="toggle-btn">
        <img
          src={isOpen ? "../img/down.png" : "../img/up2.png"}
          alt={isOpen ? "Tutup" : "Buka"}
          className="toggle-icon"
        />
      </button>

      {/* Animasi TrustedBy */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={contentRef}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="trusted-content"
          >
            <div className="trustedBy">
              <div className="logo-container">
                <h1>Di sponsori</h1>
                <p>oleh:</p>
                <img src="../img/logojasaverse4.png" alt="Brand Logos" className="logo-img" />
                <img src="../img/cepmax.jpg" alt="Brand Logos" className="logo-img2" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

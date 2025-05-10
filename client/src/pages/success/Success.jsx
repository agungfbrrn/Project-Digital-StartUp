import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const Success = () => {
  const { search } = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(search);
  const payment_intent = params.get("payment_intent");

  useEffect(() => {
    if (payment_intent) {
      console.log("🔍 Pembayaran berhasil, akan mengarahkan dalam 6 detik...");
      
      // Beri jeda 6 detik sebelum mengarahkan ke halaman /orders
      const timer = setTimeout(() => {
        navigate("/orders");
      }, 6000);

      // Membersihkan timeout jika pengguna meninggalkan halaman sebelum redirect
      return () => clearTimeout(timer);
    } else {
      console.warn("⚠️ Tidak ada payment_intent, tidak mengarahkan.");
    }
  }, [payment_intent, navigate]);

  return (
    <div style={{ 
      display: "flex", 
      justifyContent: "center", 
      alignItems: "center", 
      minHeight: "100vh", 
      backgroundColor: "#f0f4f8", 
      padding: "20px", 
      textAlign: "center", 
      fontFamily: "Arial, sans-serif" 
    }}>
      <div style={{ 
        backgroundColor: "#ffffff", 
        padding: "40px", 
        borderRadius: "15px", 
        boxShadow: "0 6px 20px rgba(0, 0, 0, 0.1)", 
        maxWidth: "600px", 
        width: "100%" 
      }}>
        <h1 style={{ 
          fontSize: "28px", 
          color: "#2a9d8f", 
          marginBottom: "20px", 
          fontWeight: "bold", 
          textTransform: "uppercase" 
        }}>
          Pembayaran Berhasil
        </h1>
        <p style={{ 
          fontSize: "18px", 
          color: "#333", 
          lineHeight: "1.6", 
          marginBottom: "15px" 
        }}>
          Terima kasih telah melakukan pembayaran. Anda akan diarahkan ke halaman pesanan dalam <b>6 detik</b>.
          Tolong jangan menutup halaman ini.
        </p>
        <p style={{ 
          fontSize: "16px", 
          color: "#6c757d", 
          marginTop: "20px", 
          fontStyle: "italic" 
        }}>
          Sedang mengalihkan...
        </p>
      </div>
    </div>
  );
};

export default Success;

import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import newRequest from "../../utils/newRequest";
import jsPDF from "jspdf";

const ReceiptPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [isDownloading, setIsDownloading] = useState(false); // ✅ State untuk loading saat download

  const { data: order, isLoading, error } = useQuery({
    queryKey: ["order", orderId],
    queryFn: () =>
      newRequest.get(`/orders/${orderId}/receipt`).then((res) => res.data.order),
    staleTime: 1000 * 60 * 5,
  });

  const downloadPDF = () => {
    setIsDownloading(true); // ✅ Aktifkan loading saat mulai download

    setTimeout(() => { // Simulasi proses download (opsional)
      const doc = new jsPDF();
      doc.setFont("helvetica");

      // Menambahkan watermark dari folder public (gunakan base64 agar berhasil)
      const watermarkImg = "../../img/logojasaverse4.png"; 

// Mengatur transparansi sebelum menambahkan gambar
doc.setGState(new doc.GState({ opacity: 0.4 })); // 0.2 = 20% transparan

// Menambahkan gambar watermark
doc.addImage(watermarkImg, "PNG", 0, 10, 200, 130, "", "FAST");

// Mengembalikan opacity ke normal setelah watermark
doc.setGState(new doc.GState({ opacity: 1 }));


      doc.setTextColor(0, 0, 0);
      doc.setFontSize(14);
      doc.text("STRUK PESANAN", 90, 20);
      doc.line(20, 25, 190, 25);

      let y = 40; // Posisi awal teks
      const lineHeight = 10; // Jarak antar baris teks
      const maxWidth = 160; // Lebar maksimal teks sebelum dipotong

      // Fungsi untuk menulis teks dengan auto-wrap
      const addText = (label, text) => {
        if (!text) text = "Tidak tersedia";
        const lines = doc.splitTextToSize(`${label} ${text}`, maxWidth);
        doc.text(20, y, lines);
        y += lines.length * lineHeight;
      };

      // Menambahkan teks dengan auto-wrap
      addText("Order ID:", order?._id);
      addText("Gig ID:", order?.gigId);
      addText("Judul:", order?.title);
      addText("Harga: Rp", order?.price ? new Intl.NumberFormat("id-ID").format(order.price) : "");
      addText("Status:", order?.status === "pending" ? "Menunggu" : order?.status === "completed" ? "Selesai" : "Canceled");
      addText("Waktu Pemesanan:", order?.createdAt ? new Date(order.createdAt).toLocaleString("id-ID") : "");

      if (order?.status === "completed") {
        addText("Waktu Selesai:", order?.updatedAt ? new Date(order.updatedAt).toLocaleString("id-ID") : "");
      }

      addText("Penjual:", `${order?.sellerId?.username || "Tidak diketahui"} (ID: ${order?.sellerId?._id || ""})`);
      addText("Pembeli:", `${order?.buyerId?.username || "Tidak diketahui"} (ID: ${order?.buyerId?._id || ""})`);
      addText("Kode Pembayaran:", order?.payment_intent);

      doc.save(`OrderId_${order?._id}.pdf`);

      setIsDownloading(false); // ✅ Matikan loading setelah selesai
    }, 2000); // Simulasi delay (opsional)
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div style={{ color: "red" }}>Gagal mengambil data pesanan. Silakan coba lagi.</div>;
  if (!order) return <div>Data pesanan tidak ditemukan.</div>;

  return (
    <div className="receipt" style={{ padding: "20px", fontFamily: "Arial, sans-serif", maxWidth: "600px", margin: "auto", position: "relative" }}>

      {/* 🔙 Tombol Kembali ke Gig */}
      <img
        src="/img/arah2.png"
        alt="Kembali ke Gig"
        onClick={() => navigate(`/gig/${order.gigId}`)}
        style={{
          position: "absolute",
          top: "10px",
          left: "30px",
          width: "20px",
          height: "20px",
          cursor: "pointer",
          filter: "brightness(0) saturate(100%) invert(48%) sepia(83%) saturate(612%) hue-rotate(360deg)",
        }}
      />

      <h1 style={{ color: "#ff6600", textAlign: "center" }}>📜 Struk Order #{order?._id}</h1>
      <div style={{ background: "#fff", padding: "20px", borderRadius: "8px", boxShadow: "0 4px 10px rgba(0,0,0,0.1)" }}>
        {order?.img ? (
          <div style={{ textAlign: "center", marginBottom: "15px" }}>
            <img src={order.img} alt="Order Image" style={{ maxWidth: "100%", height: "auto", borderRadius: "8px" }} />
          </div>
        ) : (
          <p style={{ textAlign: "center", fontStyle: "italic" }}>Tidak ada gambar tersedia</p>
        )}

        <p><strong>Gig ID:</strong> {order?.gigId || "Tidak tersedia"}</p>
        <p><strong>Judul:</strong> {order?.title || "Tidak tersedia"}</p>
        <p><strong>Harga:</strong> Rp {order?.price ? new Intl.NumberFormat("id-ID").format(order.price) : "Tidak tersedia"}</p>
        <p>
          <strong>Status:</strong> 
          {order?.status === "pending" ? " ⏳ Pending" : order?.status === "completed" ? " ✅ Completed" : " ❌ Canceled"}
        </p>
        <p><strong>Waktu Pemesanan:</strong> {order?.createdAt ? new Date(order.createdAt).toLocaleString("id-ID") : "Tidak tersedia"}</p>
        {order?.status === "completed" && (
          <p><strong>Waktu Selesai:</strong> {order?.updatedAt ? new Date(order.updatedAt).toLocaleString("id-ID") : "Tidak tersedia"}</p>
        )}
        <p><strong>Penjual:</strong> {order?.sellerId?.username || "Tidak diketahui"} {order?.sellerId?._id ? `(ID: ${order.sellerId._id})` : ""}</p>
        <p><strong>Pembeli:</strong> {order?.buyerId?.username || "Tidak diketahui"} {order?.buyerId?._id ? `(ID: ${order.buyerId._id})` : ""}</p>
        <p><strong>Code Pembayaran:</strong> {order?.payment_intent || "Tidak tersedia"}</p>
      </div>

      <button
        onClick={downloadPDF}
        disabled={isDownloading} // ✅ Disable tombol saat loading
        style={{
          marginTop: "20px",
          marginLeft: "240px",
          padding: "10px",
          backgroundColor: isDownloading ? "#cccccc" : "#ff6600",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: isDownloading ? "not-allowed" : "pointer",
        }}
      >
        {isDownloading ? "Downloading..." : "Download PDF"} {/* ✅ Ubah teks tombol */}
      </button>
    </div>
  );
};

export default ReceiptPage;

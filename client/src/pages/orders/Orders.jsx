import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Orders.scss";
import newRequest from "../../utils/newRequest";
import { getTotalOrders } from "../../utils/orderUtils";

const Orders = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showResultModal, setShowResultModal] = useState(null);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [confirmText, setConfirmText] = useState("");
  const [hasError, setHasError] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
const [confirmCompleteText, setConfirmCompleteText] = useState("");
const [hasCompleteError, setHasCompleteError] = useState(false);
const [selectedCompleteOrderId, setSelectedCompleteOrderId] = useState(null);
const [showCompleteResultModal, setShowCompleteResultModal] = useState(null);


  

  const storedUser = localStorage.getItem("currentUser");
  const currentUser = storedUser ? JSON.parse(storedUser) : null;

  if (!currentUser) {
    return <div className="orders">Silakan login untuk melihat pesanan.</div>;
  }

  const { isLoading, error, data } = useQuery({
    queryKey: ["orders"],
    queryFn: () => newRequest.get(`/orders`).then((res) => res.data),
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    if (!isLoading) {
      setTimeout(() => {}, 1000);
    }
  }, [isLoading]);

  const deleteMutation = useMutation({
    mutationFn: async (orderId) => {
      try {
        await newRequest.delete(`/orders/${orderId}`);
      } catch (error) {
        throw new Error(error.response?.data?.message || "Gagal menghapus pesanan.");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["orders"]);
      toast.success("Pesanan berhasil dihapus.");
      setShowResultModal("success");
      setSelectedOrderId(null); // ✅ Reset setelah penghapusan
    },
    onError: (error) => {
      toast.error(error.message);
      setShowResultModal("error");
    },
  });
  
  const completeMutation = useMutation({
    mutationFn: async (orderId) => {
      await newRequest.put(`/orders/${orderId}/complete`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["orders"]);
      toast.success("Pesanan berhasil diselesaikan.");
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Gagal menyelesaikan pesanan.");
    },
  });
  
  

  const handleDeleteConfirm = async () => {
    if (confirmText !== "HAPUS") {
      alert("Teks tidak sesuai! Ketik 'HAPUS' dengan huruf kapital.");
      return;
    }

    if (selectedOrderId) {
      await deleteMutation.mutateAsync(selectedOrderId);
      setShowConfirmModal(false);
      setConfirmText("");
    }
  };

  const handleDeleteClick = (orderId) => {
    setSelectedOrderId(orderId);
    setShowConfirmModal(true);
  };

  const handleContact = async (order) => {
    const sellerId = order.sellerId?._id || order.sellerId;
    const buyerId = order.buyerId?._id || order.buyerId;

    if (!sellerId || !buyerId) {
      console.error("Error: sellerId atau buyerId tidak valid");
      return;
    }

    try {
      const res = await newRequest.get(`/conversations/single`, {
        params: { sellerId, buyerId },
      });
      navigate(`/message/${res.data.id}`);
    } catch (err) {
      if (err.response && err.response.status === 404) {
        try {
          const res = await newRequest.post(`/conversations/`, {
            to: currentUser.seller ? buyerId : sellerId,
          });
          navigate(`/message/${res.data.id}`);
        } catch (postErr) {
          console.error("Error POST conversation:", postErr.response?.data || postErr.message);
        }
      }
    }
  };

  const handleCompleteClick = (orderId) => {
    setSelectedCompleteOrderId(orderId);
    setShowCompleteModal(true); // Tampilkan modal untuk menyelesaikan pesanan
  };

  
  const handleCompleteConfirm = async () => {
    if (selectedCompleteOrderId) {
      try {
        await completeMutation.mutateAsync(selectedCompleteOrderId);
        setShowCompleteResultModal("success"); // Jika sukses
      } catch (error) {
        setShowCompleteResultModal("error"); // Jika gagal
      }
      setShowCompleteModal(false); // Tutup modal setelah konfirmasi
    }
  }
  
  const totalOrders = data ? getTotalOrders(data, currentUser._id) : 0;
  const sortedOrders = useMemo(() => {
    return data?.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [data]);
  

  return (
    <div className="orders">
      {isLoading ? (
        "Loading..."
      ) : error ? (
        "Error fetching orders"
      ) : (
        <div className="container">
          <div className="title">
           
          </div>
          <table>
            <thead>
              <tr>
                <th>No</th>
                <th>Cover</th>
                <th>Judul</th>
                <th>Harga</th>
                <th>Waktu</th>
                <th>Status</th>
                <th>Penjual</th>
                <th>Pembeli</th> 
                <th>Kontak</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(sortedOrders) && sortedOrders.length > 0 ? (
                sortedOrders.map((order, index) => {
                  console.log(order); 
                  return (
                  <tr key={order?._id || index}>
                    <td>{index + 1}</td>

                    <td>
                      <Link to={order?.gigId?._id ? `/gig/${order.gigId._id}` : "#"}>
                        <img
                          className="image"
                          src={order?.img?.startsWith("http") ? order.img : "/img/default.jpg"}
                          alt="Cover"
                          onError={(e) => (e.target.src = "/img/default.jpg")}
                        />
                      </Link>
                    </td>
                    <td>{order?.title || "Tidak ada judul"}</td>
                    <td>Rp {new Intl.NumberFormat("id-ID").format(order?.price || 0)}</td>
                    <td>
                      {order?.createdAt
                        ? new Date(order.createdAt).toLocaleString("id-ID", {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })
                        : "-"}
                    </td>
                    <td>
          {order.status === "pending" ? (
            <span className="text-yellow-600 font-semibold">Menunggu</span>
          ) : (
            <span className="text-green-600 font-semibold">Selesai</span>
          )}
        </td>
                    <td>{order?.sellerId?.username || "Tidak diketahui"}</td>
<td>{order?.buyerId?.username || "Tidak diketahui"}</td>
<td>
  <img
    className="message-icon"
    src="../img/message.png"
    alt="Message Icon"
    onClick={() => handleContact(order)}
  />
</td>


<td>
{order.status === "pending" && currentUser._id === (order.sellerId?._id || order.sellerId) && (
            <button onClick={() => handleCompleteClick(order._id)} className="btn-complete">
              Selesaikan
            </button>
          )}

  &nbsp; &nbsp;
  {order.status === "completed" &&
  currentUser._id === (order.buyerId?._id || order.buyerId) && (
  <button onClick={() => handleDeleteClick(order._id)} className="delete-btn">
                        Hapus
                      </button>
  )}
   &nbsp; &nbsp;
  {(currentUser._id === (order.sellerId?._id || order.sellerId) ||
    currentUser._id === (order.buyerId?._id || order.buyerId)) && (
      <Link to={`/orders/${order._id}/receipt`}>
  <button className="receipt-btn">
    <img src="../img/receipt.png" alt="Receipt Icon" />
  </button>
</Link>
  )}
                    </td>
                  </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7">Tidak ada pesanan yang tersedia</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      {showCompleteModal && (
  <div className="modal-overlay">
    <div className="modal">
      <h2>Konfirmasi Penyelesaian</h2>
      <p>Ketik <strong>SELESAI</strong> untuk mengonfirmasi:</p>
      <input
        type="text"
        className="confirm-btn"
        value={confirmCompleteText}
        onChange={(e) => setConfirmCompleteText(e.target.value.slice(0, 7))}
        maxLength={7}
      />
      {hasCompleteError && (
        <p style={{ color: "red", textAlign: "center", marginTop: "10px" }}>
          Harap ketik 'SELESAI' dengan huruf kapital.
        </p>
      )}
      <div className="modal-buttons">
        <button 
          onClick={handleCompleteConfirm}   
          className="confirm-btn" 
          disabled={confirmCompleteText !== "SELESAI"}
        >
          Selesaikan
        </button>
        <button onClick={() => setShowCompleteModal(false)} className="cancel-btn">
          Batal
        </button>
      </div>
    </div>
  </div>
)}
{showCompleteResultModal && (
  <div className="modal-overlay">
    <div className="modal">
      <h2>{showCompleteResultModal === "success" ? "BERHASIL" : "GAGAL"}</h2>
      <p>{showCompleteResultModal === "success" ? "Pesanan berhasil diselesaikan." : "Pesanan gagal diselesaikan."}</p>
      <button onClick={() => setShowCompleteResultModal(null)} className="close-btn">
        Tutup
      </button>
    </div>
  </div> 
)}



      {showConfirmModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>Konfirmasi Penghapusan</h2>
            <p>Ketik <strong>HAPUS</strong> untuk mengonfirmasi:</p>
            <input
              type="text"
              className="confirm-input"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value.slice(0, 5))}
              maxLength={5}
            />
            {hasError && (
              <p style={{ color: "red", textAlign: "center", marginTop: "10px" }}>
                Harap ketik 'HAPUS' dengan huruf kapital.
              </p>
            )}
<div className="modal-buttons">
  <button 
    onClick={handleDeleteConfirm} 
    className="confirm-btn" 
    disabled={confirmText !== "HAPUS"}
  >
    Hapus
  </button>
  <button onClick={() => setShowConfirmModal(false)} className="cancel-btn">
    Batal
  </button>
</div>

          </div>
        </div>
      )}

      {showResultModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h2>{showResultModal === "success" ? "BERHASIL" : "GAGAL"}</h2>
            <p>{showResultModal === "success" ? "Pesanan berhasil dihapus." : "Pesanan gagal dihapus."}</p>
            <button onClick={() => setShowResultModal(null)} className="close-btn">
              Tutup
             </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;



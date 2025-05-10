import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import newRequest from "../../utils/newRequest";
import "./ManageGigs.scss";

const ManageGigs = () => {
  const [deleteMessage, setDeleteMessage] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedGig, setSelectedGig] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Fetch data gigs menggunakan React Query
  const { data: gigs, isLoading, error, refetch } = useQuery({
    queryKey: ["adminGigs"],
    queryFn: () => newRequest.get("/gigs").then((res) => res.data),
  });

  // Modal konfirmasi sebelum menghapus gig
  const confirmDelete = (gig) => {
    setSelectedGig(gig);
    setShowModal(true);
  };

  // Handle proses penghapusan gig
  const handleDelete = async () => {
    if (!selectedGig) return;
    try {
      await newRequest.delete(`/gigs/${selectedGig._id}`);
      setDeleteMessage("Gig berhasil dihapus!");
      setTimeout(() => setDeleteMessage(""), 3000);
      refetch(); // Refresh data setelah delete
    } catch (err) {
      setDeleteMessage("Gagal menghapus gig!");
      console.error("Error deleting gig:", err);
    }
    setShowModal(false);
    setSelectedGig(null);
  };

  // Format harga ke Rupiah
  const formatRupiah = (angka) => {
    return `Rp ${angka.toLocaleString("id-ID")}`;
  };

  // Filter gigs berdasarkan pencarian ID atau username
  const filteredGigs = gigs?.filter(
    (gig) =>
      gig._id.includes(searchTerm) ||
      gig.userId?.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) return <p>Memuat daftar gigs...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div className="manage-gigs">
      <h1>Kelola Gigs</h1>

      {/* Notifikasi Hapus */}
      {deleteMessage && <p className="delete-message">{deleteMessage}</p>}

      {/* Pencarian */}
      <input
        type="text"
        placeholder="Cari berdasarkan ID atau Nama Penjual..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="search-input"
      />

      <table>
        <thead>
          <tr>
            <th>No</th>
            <th>ID</th>
            <th>Thumbnail</th>
            <th>Penjual</th>
            <th>Judul</th>
            <th>Deskripsi Singkat</th>
            <th>Kategori</th>
            <th>Harga</th>
            <th>Rating</th>
            <th>Pengiriman (Hari)</th>
            <th>Revisi</th>
            <th>Fitur</th>
            <th>Penjualan</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {filteredGigs?.length > 0 ? (
            filteredGigs.map((gig, index) => (
              <tr key={gig._id}>
                <td>{index + 1}</td> {/* Nomor urut */}
                <td>{gig._id}</td>
                <td>
                  <img
                    src={gig.coverThumbnail || gig.cover || "/default-cover.jpg"}
                    alt="Cover"
                    className="gig-cover"
                  />
                </td>
                <td>{gig.userId?.username || "Tidak Diketahui"}</td>
                <td>{gig.shortTitle}</td>
                <td>{gig.shortDesc}</td>
                <td>{gig.category}</td>
                <td>{formatRupiah(gig.price)}</td>
                <td>{gig.totalStars}⭐ ({gig.starNumber} review)</td>
                <td>{gig.deliveryTime} Hari</td>
                <td>{gig.revisionNumber}</td>
                <td>
                  <ul className="gig-features">
                    {gig.features?.length > 0 ? (
                      gig.features.map((feature, idx) => <li key={idx}>{feature}</li>)
                    ) : (
                      <li>Tidak ada fitur</li>
                    )}
                  </ul>
                </td>
                <td>{gig.sales}</td>
                <td>
                  <button
                    onClick={() => confirmDelete(gig)}
                    className="delete-btn"
                  >
                    Hapus
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="15" style={{ textAlign: "center", padding: "10px" }}>
                Tidak ada gig yang tersedia.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Modal Konfirmasi */}
      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <p>
              Apakah Anda yakin ingin menghapus gig <b>{selectedGig?.title}</b>?
            </p>
            <div className="modal-buttons">
              <button onClick={handleDelete} className="delete-confirm-btn">
                HAPUS
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="cancel-btn"
              >
                BATAL
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageGigs;

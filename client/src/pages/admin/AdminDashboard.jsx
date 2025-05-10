import React from "react";
import { Link, useNavigate } from "react-router-dom";
import "./AdminDashboard.scss";

const AdminDashboard = () => {
  const navigate = useNavigate();

  // Fungsi untuk logout
  const handleLogout = () => {
    localStorage.removeItem("currentUser"); // Hapus sesi admin dari localStorage
    navigate("/login"); // Arahkan kembali ke halaman login
    window.location.reload(); // Refresh halaman agar efek logout langsung terlihat
  };

  return (
    <div className="admin-dashboard">
      {/* Navbar Admin */}
      <nav className="admin-navbar">
        <h1>Panel Admin</h1>
        <button className="logout-btn" onClick={handleLogout}>
          Keluar
        </button>
      </nav>

      <div className="admin-menu">
        <Link to="/admin/manage-users" className="admin-card">
          <h2>Kelola Pengguna</h2>
          <p>Lihat dan kelola semua pengguna.</p>
        </Link>
        <Link to="/admin/manage-gigs" className="admin-card">
          <h2>Kelola Gigs</h2>
          <p>Review dan kontrol gigs yang diposting.</p>
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboard;

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import newRequest from "../../utils/newRequest";
import "./ManageUsers.scss";

const ManageUsers = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [deleteMessage, setDeleteMessage] = useState("");

  // Fetch data users dengan React Query
  const { data: users, isLoading, error, refetch } = useQuery({
    queryKey: ["adminUsers"],
    queryFn: () => newRequest.get("/admin/users").then((res) => res.data),
  });

  // Tampilkan modal konfirmasi
  const confirmDelete = (user) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  // Hapus user setelah konfirmasi
  const handleDelete = async () => {
    if (!selectedUser) return;
    try {
      await newRequest.delete(`/admin/users/${selectedUser._id}`);
      setDeleteMessage("User berhasil dihapus!");
      setTimeout(() => setDeleteMessage(""), 3000);
      refetch(); // Refresh data setelah delete
    } catch (err) {
      setDeleteMessage("Gagal menghapus user!");
      console.error("Error deleting user:", err);
    }
    setShowModal(false);
    setSelectedUser(null);
  };

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  // Filter berdasarkan pencarian
  const filteredUsers =
    users?.filter(
      (user) =>
        user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user._id.includes(searchQuery)
    ) || [];

  return (
    <div className="manage-users">
      <h1>Manage Users</h1>

      {/* Input Search */}
      <input
        type="text"
        placeholder="Cari Username atau ID..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="search-input"
      />

      {/* Notifikasi Hapus */}
      {deleteMessage && <p className="delete-message">{deleteMessage}</p>}

      <table>
        <thead>
          <tr>
            <th>No</th>
            <th>Profile</th>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Country</th>
            <th>Phone</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredUsers.length > 0 ? (
            filteredUsers.map((user, index) => (
              <tr key={user._id}>
                <td>{index + 1}</td>
                <td>
                  <a href={`/userProfile/${user._id}`}>
                    <img
                      src={user.img ? user.img : "/img/noavatar.jpg"}
                      alt="Profile"
                      className="profile-img"
                    />
                  </a>
                </td>
                <td>{user._id}</td>
                <td>{user.username}</td>
                <td>{user.email}</td>
                <td>{user.country || "N/A"}</td>
                <td>{user.phone || "N/A"}</td>
                <td>{user.role}</td>
                <td className="actions">
                  {/* Tombol Hapus, hanya jika bukan admin */}
                  {user.role !== "admin" && (
                    <button onClick={() => confirmDelete(user)} className="delete-btn">
                      <img src="/img/trash.png" alt="Delete" className="action-icon" />
                    </button>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="9" style={{ textAlign: "center", padding: "10px" }}>
                No users found.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Modal Konfirmasi */}
      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <p>Apakah Anda yakin ingin menghapus user <b>{selectedUser?.username}</b>?</p>
            <div className="modal-buttons">
              <button onClick={handleDelete} className="delete-confirm-btn">
                HAPUS
              </button>
              <button onClick={() => setShowModal(false)} className="cancel-btn">
                BATAL
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageUsers;

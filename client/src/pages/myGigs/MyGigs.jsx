import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./MyGigs.scss";
import getCurrentUser from "../../utils/getCurrentUser";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import newRequest from "../../utils/newRequest";

function MyGigs() {
  const currentUser = getCurrentUser();
  const queryClient = useQueryClient();
  const [deleteId, setDeleteId] = useState(null);
  const [confirmationText, setConfirmationText] = useState("");
  const [showModal, setShowModal] = useState(false);

  const { data: gigsData, isLoading, error } = useQuery({
    queryKey: ["myGigs", currentUser._id],
    queryFn: () => newRequest.get(`/gigs?userId=${currentUser._id}`).then((res) => res.data),
  });

  const uniqueGigs = gigsData ? [...new Map(gigsData.map((gig) => [gig._id, gig])).values()] : [];
  const totalSales = uniqueGigs ? uniqueGigs.reduce((sum, gig) => sum + (gig.sales || 0), 0) : 0;
  const ownedGigsCount = uniqueGigs ? uniqueGigs.length : 0;

  const deleteMutation = useMutation({
    mutationFn: (id) => newRequest.delete(`/gigs/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(["myGigs"]);
      setShowModal(false);
      setConfirmationText("");
    },
  });

  const handleDelete = () => {
    if (confirmationText === "HAPUS") {
      deleteMutation.mutate(deleteId);
    } else {
      alert("Konfirmasi salah. Silakan ketik 'HAPUS' dengan huruf kapital.");
    }
  };

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div className="myGigs">
      <div className="container">
        <div className="title">
          <h1>Gigs Saya</h1>
          {currentUser.isSeller && (
            <Link to="/add">
              <button>Tambahkan Gig baru</button>
            </Link>
          )}
        </div>
        <div className="stats">
          <p><strong> Gigs dimiliki: </strong>{ownedGigsCount}</p>
          <p><strong>Total penjualan: </strong>{new Intl.NumberFormat("id-ID").format(totalSales)}</p>
        </div>
        <table>
          <thead>
            <tr>
              <th>No</th>
              <th>Cover</th>
              <th>Judul</th>
              <th>Harga</th>
              <th>Penjualan</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {uniqueGigs?.map((gig, index) => (
              <tr key={gig._id}>
                <td>{index + 1}</td>
                <td><img className="image" src={gig.cover} alt={gig.title} /></td>
                <td>{gig.title}</td>
                <td>Rp {new Intl.NumberFormat("id-ID").format(gig.price)}</td>
                <td>{gig.sales || 0}</td>
                <td>
                  <Link to={`/gig/${gig._id}`}><button className="view">Lihat</button></Link>
                  <Link to={`/gigs/${gig._id}`}><button className="edit">Edit</button></Link>
                  <img className="delete" src="./img/delete.png" alt="Delete" onClick={() => { setDeleteId(gig._id); setShowModal(true); }} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Konfirmasi Penghapusan</h3>
            <p>Untuk menghapus gig ini, ketik "HAPUS" dalam kotak di bawah:</p>
            <input
              type="text"
              value={confirmationText}
              onChange={(e) => setConfirmationText(e.target.value)}
            />
            <div className="modal-actions">
              <button onClick={handleDelete} className="confirm">Hapus</button>
              <button onClick={() => setShowModal(false)} className="cancel">Batal</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyGigs;

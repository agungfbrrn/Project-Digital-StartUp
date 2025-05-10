import React, { useState, useEffect } from "react";
import "./Sellerscores.scss";
import { useQuery } from "@tanstack/react-query";
import newRequest from "../../utils/newRequest";

function Sellerscores() {
    const { data: sellersData, isLoading, error } = useQuery({
        queryKey: ["sellerScores"],
        queryFn: () => newRequest.get("/sellers/scores").then((res) => res.data),
      });
      

  const calculateScore = (sales, gigs) => sales * 9 + gigs * 1;

  const [processedSellers, setProcessedSellers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!sellersData) return;
  
    const fetchAdditionalData = async () => {
      try {
        const userIds = [...new Set(sellersData.map((seller) => seller.userId))];
  
        const userRequests = userIds.map((id) =>
          newRequest.get(`/users/${id}`).then((res) => ({
            id,
            username: res.data.username || "Tidak ditemukan",
            profileImage: res.data.img || "/img/default-profile.png",
          }))
        );
  
        const gigRequests = userIds.map((id) =>
          newRequest.get(`/gigs?userId=${id}`).then((res) => ({
            sellerId: id,
            gigsCount: res.data.length,
          }))
        );
  
        const [users, gigsData] = await Promise.all([
          Promise.all(userRequests),
          Promise.all(gigRequests),
        ]);
  
        const userMap = new Map(users.map((user) => [user.id, user]));
        const gigMap = new Map(gigsData.map((gig) => [gig.sellerId, gig.gigsCount]));
  
        let updatedSellers = sellersData
          .map((seller) => {
            const user = userMap.get(seller.userId) || {};
            const totalSales = seller.totalSales || 0;
            const totalGigs = gigMap.get(seller.userId) || 0;
            return {
              ...seller,
              totalSales,
              totalGigs,
              score: calculateScore(totalSales, totalGigs),
              username: user.username,
              profileImage: user.profileImage,
            };
          })
          .sort((a, b) => b.score - a.score) // Urutkan dari skor tertinggi
          .slice(0, 10); // Ambil 10 besar
  
        // Tambahkan rank
        updatedSellers = updatedSellers.map((seller, index) => ({
          ...seller,
          rank: index + 1, // Rank mulai dari 1
        }));
  
        setProcessedSellers(updatedSellers);
      } catch (err) {
        console.error("Error fetching additional data:", err);
      }
    };
  
    fetchAdditionalData();
  }, [sellersData]);
  
  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  const filteredSellers = processedSellers.filter((seller) =>
    seller.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    seller.userId.toString().includes(searchQuery)
  );
  

  return (
    <div className="sellerScores">
      <div className="container">
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", padding: "0px", gap: "0px", marginTop: "-30px" }}>
          <img src="/img/kejuaraan2.png" alt="Peringkat Penjual Teratas" style={{ width: "100px", height: "100px" }} />
        </div>
        <h1>Peringkat Penjual Teratas</h1>

        <input
  type="text"
  placeholder="Cari Username atau ID..."
  value={searchQuery}
  onChange={(e) => {
    if (e.target.value.length <= 50) {
      setSearchQuery(e.target.value);
    }
  }}
  maxLength={50} // Batasi input hingga 50 karakter
  style={{
    padding: "10px",
    width: "98%", // Tetap seperti sebelumnya agar serasi
    marginBottom: "15px",
    borderRadius: "5px",
    border: "1px solid #ccc",
    outline: "none", // Agar tidak ada efek saat focus
    fontSize: "16px", // Menyesuaikan agar teks lebih mudah dibaca
    transition: "border 0.3s ease-in-out",
  }}
/>

        <table>
          <thead>
            <tr>
              <th>Peringkat</th>
              <th>Profile</th>
              <th>Username</th>
              <th>ID</th>
              <th>Total Gig</th>
              <th>Total Penjualan</th>
              <th>Skor</th>
            </tr>
          </thead>
          <tbody>
            {filteredSellers.length > 0 ? (
              filteredSellers.map((seller, index) => (
                <tr key={seller.userId}>
<td>
  {seller.rank === 1 ? (
    <>
      <img src="/img/juara1.png" width="30" height="30" alt="Gold" /> #1
    </>
  ) : seller.rank === 2 ? (
    <>
      <img src="/img/juara2.png" width="30" height="30" alt="Silver" /> #2
    </>
  ) : seller.rank === 3 ? (
    <>
      <img src="/img/juara3.png" width="30" height="30" alt="Bronze" /> #3
    </>
  ) : (
    `#${seller.rank}`
  )}
</td>

                  <td>
                    <a href={`/user/${seller.userId}`}>
                      <img
                        src={seller.profileImage}
                        width="28"
                        height="28"
                        alt="Profile"
                        style={{ borderRadius: "50%" }}
                      />
                    </a>
                  </td>
                  <td>{seller.username}</td>
                  <td>{seller.userId}</td>
                  <td>{seller.totalGigs}</td>
                  <td>{new Intl.NumberFormat("id-ID").format(seller.totalSales)}</td>
                  <td style={{ alignItems: "center", justifyContent: "center", gap: "5px" }}>
  <img src="/img/score.png" alt="Star" width="16" height="16" />
  {seller.score}
</td>

                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" style={{ textAlign: "center", padding: "10px" }}>
                  Tidak ada hasil yang ditemukan.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Sellerscores;

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import newRequest from "../../utils/newRequest";
import "./Messages.scss";
import moment from "moment";
import "moment/locale/id"; // Mengimpor locale untuk Bahasa Indonesia
import io from "socket.io-client";

const Messages = () => {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const queryClient = useQueryClient();
  const [messages, setMessages] = useState([]); // State untuk menyimpan pesan secara real-time
  const [conversations, setConversations] = useState([]); // State untuk percakapan
  const [unreadCount, setUnreadCount] = useState(0); // State untuk jumlah pesan yang belum dibaca
  const [time, setTime] = useState({}); // State untuk memperbarui waktu secara dinamis

  const { isLoading, error, data = [] } = useQuery({
    queryKey: ["conversations"],
    queryFn: () =>
      newRequest.get(`/conversations`).then((res) => res.data),
    onSuccess: (data) => {
      setConversations(data); // Menyimpan percakapan yang diambil ke dalam state

      // Menghitung jumlah pesan yang belum dibaca berdasarkan peran pengguna
      const count = data.filter(
        (conv) =>
          (currentUser.isSeller && !conv.readBySeller) ||
          (!currentUser.isSeller && !conv.readByBuyer)
      ).length;
      setUnreadCount(count); // Menetapkan jumlah pesan yang belum dibaca
    },
  });

  const mutation = useMutation({
    mutationFn: (id) => {
      return newRequest.put(`/conversations/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["conversations"]);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => {
      return newRequest.delete(`/conversations/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["conversations"]);
    },
  });

  const handleRead = (id) => {
    mutation.mutate(id);

    // Pembaruan optimis untuk menandai percakapan sebagai dibaca segera di UI
    setConversations((prevConversations) =>
      prevConversations.map((conversation) =>
        conversation.id === id
          ? {
              ...conversation,
              readBySeller: currentUser.isSeller, // Memperbarui readBySeller berdasarkan peran currentUser
              readByBuyer: !currentUser.isSeller, // Memperbarui readByBuyer berdasarkan peran currentUser
            }
          : conversation
      )
    );

    // Memperbarui jumlah pesan yang belum dibaca setelah menandai percakapan sebagai dibaca
    setUnreadCount((prevCount) => prevCount - 1);
  };

  const handleDelete = (id) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus percakapan ini?")) {
      deleteMutation.mutate(id);
    }
  };

  // Menghubungkan WebSocket dengan server dan mendengarkan event 'new_message'
  useEffect(() => {
    const socket = io("http://localhost:5173"); // Ganti dengan URL server Anda

    socket.on("new_message", (newMessage) => {
      // Menambahkan pesan baru ke state
      setMessages((prevMessages) => [newMessage, ...prevMessages]);
      queryClient.invalidateQueries(["conversations"]); // Memperbarui percakapan dengan pesan baru

      // Memperbarui jumlah pesan yang belum dibaca jika pesan baru berasal dari pengguna lain
      if (
        (currentUser.isSeller && !newMessage.readBySeller) ||
        (!currentUser.isSeller && !newMessage.readByBuyer)
      ) {
        setUnreadCount((prevCount) => prevCount + 1);
      }
    });

    // Membersihkan koneksi socket ketika komponen dibongkar
    return () => {
      socket.off("new_message");
    };
  }, [queryClient, currentUser.isSeller]);

  // Mengatur locale Moment.js ke Bahasa Indonesia
  moment.locale('id');

  // Function to update the time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setTime((prevTime) => {
        const newTime = {};
        conversations.forEach((conv) => {
          newTime[conv.id] = moment(conv.updatedAt).fromNow();
        });
        return newTime;
      });
    }, 60000); // Update every minute

    return () => clearInterval(interval); // Cleanup interval on component unmount
  }, [conversations]);

  return (
    <div className="messages">
      <div className="unread-count">
        {unreadCount > 0 && <span>{unreadCount} pesan belum terbaca</span>}
      </div>
      {isLoading ? (
        "Memuat..."
      ) : error ? (
        "Terjadi kesalahan, silakan coba lagi."
      ) : (
        <div className="container">
          <div className="title">
            <h1>Pesan</h1>
          </div>
          {data.length === 0 && messages.length === 0 ? (
            <div className="no-messages">
              <p>Tidak ada pesan yang tersedia saat ini.</p>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>{currentUser.isSeller ? "Pembeli" : "Penjual"}</th>
                  <th>Pesan Terakhir</th>
                  <th>Waktu</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {data.map((c) => {
                  const isUnread =
                    (currentUser.isSeller && !c.readBySeller) ||
                    (!currentUser.isSeller && !c.readByBuyer);
                  const lastMessage = c?.lastMessage?.substring(0, 100); // Mengambil pesan terakhir

                  return (
                    <tr className={isUnread ? "active" : ""} key={c.id}>
                      <td className="user-info">
                        {currentUser.isSeller
                          ? `Nama: ${c.buyerUsername}, ID: ${c.buyerId}`
                          : `Nama: ${c.sellerUsername}, ID: ${c.sellerId}`}
                      </td>
                      <td>
                        <Link to={`/message/${c.id}`} className="link" onClick={() => handleRead(c.id)}>
                          {lastMessage}
                          {isUnread && (
                            <span className="unread-notification"> Belum Dilihat</span>
                          )}
                        </Link>
                      </td>
                      <td>
                        {time[c.id] || moment(c.updatedAt).fromNow()}
                      </td>
                      <td>
                        <button
                          onClick={() => handleDelete(c.id)}
                          className="delete-btn"
                        >
                          Hapus
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {messages.length > 0 && (
                  <tr className="new-messages">
                    <td colSpan={4}>Pesan baru</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default Messages;

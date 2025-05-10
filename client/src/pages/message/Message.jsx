import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useState, useEffect } from "react";
import { Link, useParams, Navigate } from "react-router-dom";
import newRequest from "../../utils/newRequest"; // Utility for making API requests
import "./Message.scss";

const Message = () => {
  const { id } = useParams();
console.log("Message Page - Conversation ID:", id);
  const queryClient = useQueryClient();
  const [messageText, setMessageText] = useState("");
  const [file, setFile] = useState(null); // New state for file
  const [isSending, setIsSending] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  


   // Ambil `currentUser` dengan aman
   const storedUser = localStorage.getItem("currentUser");
const currentUser = storedUser ? JSON.parse(storedUser) : null;


  // Redirect to login if no current user
  if (!currentUser._id) {
    return <Navigate to="/login" />;
  }
  useEffect(() => {
    if (id) {
      setConversationId(id);
    }
  }, [id]);
  // Fetch messages for the conversation
  const { isLoading, error, data = [] } = useQuery({
    queryKey: ["messages", conversationId],
    queryFn: () =>
      conversationId ? newRequest.get(`/messages/${conversationId}`).then((res) => res.data) : [],
    enabled: !!conversationId, // Mencegah query dijalankan jika `conversationId` masih null
  });
  const hasMessages = Array.isArray(data) && data.length > 0;
  // Mutation for sending a message
  const mutation = useMutation({
    mutationFn: (message) => newRequest.post("/messages", message),
    onSuccess: () => {
      queryClient.invalidateQueries(["messages", conversationId]); // Refresh messages after sending
    },
  });

  // Mutation for updating read/unread status
  const updateReadStatusMutation = useMutation({
    mutationFn: (messageData) => newRequest.put("/messages/read", messageData),
    onSuccess: () => {
      queryClient.invalidateQueries(["messages", id]);
    },
  });
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };
  
  // Handle message submission
  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSending(true);

    const formData = new FormData();
formData.append("conversationId", conversationId);
formData.append("desc", messageText);
formData.append("unread", true);
formData.append("userId", currentUser._id.toString()); // Pastikan string
formData.append("senderName", currentUser.username);
formData.append("senderImg", currentUser.img || "/img/noavatar.jpg");

if (file) {
  formData.append("file", file);
}

    mutation.mutate(formData, {
      onSuccess: () => {
        setMessageText("");
        setFile(null); // Reset the file after sending
      },
      onSettled: () => setIsSending(false),
    });
  };

  // Handle file selection
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  // Toggle read/unread status with Optimistic UI update
  const handleReadStatus = (messageId, currentUnreadStatus) => {
  const newUnreadStatus = !currentUnreadStatus;

  // Simpan state lama agar bisa dikembalikan jika request gagal
  const previousData = queryClient.getQueryData(["messages", id]) || [];

  // Optimistic UI update
  queryClient.setQueryData(["messages", id], (oldData) => {
    if (!oldData) return oldData;
    return oldData.map((msg) =>
      msg._id === messageId ? { ...msg, read: newUnreadStatus } : msg
    );
  });

  // Kirim update ke server
  updateReadStatusMutation.mutate(
    { messageId, readStatus: newUnreadStatus },
    {
      onError: () => {
        queryClient.setQueryData(["messages", id], previousData); // Revert jika gagal
      },
    }
  );
};

  return (
    <div className="message">
      <div className="container">
      <span className="breadcrumbs">
      <Link to="/messages" style={{ textDecoration: "none", color: "inherit" }}>
    ✉️ Pesan
  </Link>{" > "}
  {hasMessages ? <span>📩 Pesan Ditemukan</span> : <span>🚫 Belum ada Pesan</span>}

</span>



        {isLoading ? (
          <p>Loading messages...</p>
        ) : error ? (
          <p style={{ color: "red" }}>Failed to load messages.</p>
        ) : (
          <div className="messages">
           {data.map((m) => (
  <div className={m.userId === currentUser._id ? "owner item" : "item"} key={m._id}>
   <Link to={`/user/${m.userId === currentUser._id ? currentUser._id : m.userId}`}>
  <img 
    src={m.userId === currentUser._id ? currentUser.img : m.senderImg || "/img/noavatar.jpg"} 
    alt="Profile" 
    style={{ cursor: "pointer" }}
  />
</Link>

    <div className="message-content">
      <span className="sender-name">
        {m.userId === currentUser._id ? currentUser.username : m.senderName || "Unknown User"}
      </span>
      <p className="message-text">
  {m.desc}  
  {m.file && (
    <a 
      href={`http://localhost:8800/api/${m.file}`} 
      target="_blank" 
      rel="noopener noreferrer"
      className="file-button"
    >
      📁 <span>Lihat File</span>
    </a>
  )}
</p>

<span className="timestamp">{new Date(m.createdAt).toLocaleTimeString()}</span>
<div className="read-status">
                    <label>
                      <input
                        type="checkbox"
                        checked={m.read}
                        onChange={() => handleReadStatus(m._id, m.read)}
                      />
                      {m.read ? "Dibaca" : "Belum dibaca"}
                    </label>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
  {/* File preview inside the textarea */}
  {file && (
    <div className="file-preview">
      <img
        src="/img/file.png"
        alt="File preview"
        style={{ width: '20px', height: '20px' }}
      />
      <span>{file.name}</span>
      {/* Tombol untuk menghapus file */}
      <button
      type="button"
      onClick={() => setFile(null)} // Hapus file dari state
      style={{
        background: 'red',
        color: 'white',
        border: 'none',
        borderRadius: '50%',
        padding: '1px 5px',
        cursor: 'pointer',
        marginLeft: '2px',
        marginTop: '2px', 
        boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)', // Menambahkan box-shadow
        transition: 'all 0.3s ease',
      }}
      onMouseEnter={(e) => e.target.style.boxShadow = '0px 6px 12px rgba(0, 0, 0, 0.3)'} // Menambah box-shadow saat hover
      onMouseLeave={(e) => e.target.style.boxShadow = '0px 4px 8px rgba(0, 0, 0, 0.2)'} // Kembali ke shadow normal saat mouse keluar
    >
      X
    </button>
  </div>
)}
<form className="write" onSubmit={handleSubmit}>
  <textarea
    placeholder="Tulis pesan..."
    value={messageText}
    onChange={(e) => setMessageText(e.target.value)}
    onKeyDown={handleKeyDown}
  />

  {/* Icon for file upload */}
  <label htmlFor="file-upload" className="file-upload-icon">
    <img
      src="/img/file.png"
      alt="Upload File"
      style={{ width: '35px', height: '35px', marginRight: '10px', marginTop: '20px' }}
    />
  </label>

  {/* Hidden file input */}
  <input
    id="file-upload"
    type="file"
    onChange={handleFileChange}
    accept="image/*, application/pdf, .docx, .txt"
    style={{ display: 'none', cursor: 'pointer' }}
  />

  <button type="submit" disabled={isSending}>
    <img
      src="/img/pesawat.png"
      alt="Send"
      style={{ width: '25px', height: '25px', marginRight: '5px', marginTop: '0px' }}
    />
  </button>
</form>

      </div>
    </div>
  );
};

export default Message;

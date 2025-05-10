import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import newRequest from "../../utils/newRequest";
import "./Login.scss";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [currentUser, setCurrentUser] = useState(null);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  // Validasi berdasarkan nama field
  const validateField = (name, value) => {
    let error = "";
    switch (name) {
      case "username":
        if (!value) error = "Username wajib diisi!";
        else if (value.length < 3) error = "Minimal 3 karakter!";
        else if (value.length > 12) error = "Maksimal 12 karakter!";
        else if (/[^a-zA-Z0-9]/.test(value)) error = "Hanya huruf & angka!";
        else if (/\s/.test(value)) error = "Tidak boleh mengandung spasi!";
        break;
      case "password":
        if (!value) error = "Password wajib diisi!";
        else if (value.length < 5) error = "Minimal 5 karakter!";
        else if (value.length > 12) error = "Maksimal 12 karakter!";
        else if (/\s/.test(value)) error = "Tidak boleh mengandung spasi!";
        break;
      default:
        break;
    }
    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));

    if (name === "username") setUsername(value);
    if (name === "password") setPassword(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
  
    try {
      const res = await newRequest.post("/auth/login", { username, password });
      const userData = res.data;
  
      // ✅ Simpan user & token ke localStorage
      localStorage.setItem("currentUser", JSON.stringify(userData));
      localStorage.setItem("token", userData.token);
      
      toast.success("Login berhasil!");
  
      // ✅ Redirect berdasarkan peran
      if (userData.role === "admin") {
        navigate("/admin/dashboard");
        // Refresh halaman saat script ini dijalankan
window.location.reload();

      } else {
        navigate("/");
        // Refresh halaman saat script ini dijalankan
window.location.reload();

      }
  
    } catch (err) {
      console.error("Login Error:", err);
      toast.error("Kata sandi atau username Anda salah.");
    } finally {
      setLoading(false);
    }
  };
  
  
  useEffect(() => {
    const storedUser = localStorage.getItem("currentUser");
  
    let parsedUser = null;
    if (storedUser) {
      try {
        parsedUser = JSON.parse(storedUser);
      } catch (error) {
        console.error("Error parsing storedUser:", error);
      }
    }
  
    if (parsedUser) {
      setCurrentUser(parsedUser);
  
      // **Redirect berdasarkan peran pengguna**
      if (parsedUser.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/");
      }
    }
  }, [navigate]);
  
  return (
    <div className="login">
      <form onSubmit={handleSubmit}>
        <div className="left">
          <h1>
            Jasaverse<span className="subtext">login.</span>
          </h1>

          {/* Username */}
          <label htmlFor="username">Username</label>
          <input
            name="username"
            type="text"
            placeholder="Masukkan username"
            value={username}
            onChange={handleChange}
            required
          />
          {errors.username && <span className="error">{errors.username}</span>}

          {/* Password */}
          <label htmlFor="password">Password</label>
          <input
            name="password"
            type="password"
            placeholder="Masukkan password"
            value={password}
            onChange={handleChange}
            required
          />
          {errors.password && <span className="error">{errors.password}</span>}

          {/* Tombol Login */}
          <button type="submit" disabled={loading}>
            {loading ? "Loading..." : "Login"}
          </button>

          {/* Toast Notification Container */}
          <ToastContainer />

          {/* Pesan error global */}
          {error && <span className="error global">{error}</span>}

          {/* Link ke Register */}
          <div className="register-link">
            <p>
              Belum punya akun?{" "}
              <a href="/register" style={{ color: "#007bff", textDecoration: "none" }}>
                Daftar Sekarang
              </a>
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}

export default Login;

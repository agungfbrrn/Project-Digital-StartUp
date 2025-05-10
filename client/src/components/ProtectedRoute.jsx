import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = () => {
  const storedUser = localStorage.getItem("currentUser");

  // Pastikan `currentUser` valid JSON dan bukan `null`
  let currentUser = null;
  try {
    currentUser = storedUser ? JSON.parse(storedUser) : null;
  } catch (error) {
    console.error("Error parsing currentUser from localStorage:", error);
  }

  // Jika tidak ada user, arahkan ke login
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;

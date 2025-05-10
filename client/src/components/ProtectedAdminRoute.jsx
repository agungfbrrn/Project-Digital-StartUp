import { Navigate, Outlet } from "react-router-dom";

const ProtectedAdminRoute = () => {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  // Periksa apakah user adalah admin
  if (!currentUser || currentUser.role !== "admin") {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedAdminRoute;

import "./app.scss";
import { createBrowserRouter, Outlet, RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import Navbar from "./components/navbar/Navbar";
import Footer from "./components/footer/Footer";
import Portofolio from "./components/portofolio/Portofolio";
import Home from "./pages/home/Home";
import Gigs from "./pages/gigs/Gigs";
import Gig from "./pages/gig/Gig";
import Login from "./pages/login/Login";
import Register from "./pages/register/Register";
import Add from "./pages/add/Add";
import Orders from "./pages/orders/Orders";
import Messages from "./pages/messages/Messages";
import Message from "./pages/message/Message";
import MyGigs from "./pages/myGigs/MyGigs";
import Pay from "./pages/pay/Pay";
import Success from "./pages/success/Success";
import EditGig from "./pages/editGig/EditGig";
import UserProfile from "./pages/userProfile/UserProfile";
import RegisterSeller from "./pages/registerSeller/RegisterSeller";
import ReceiptPage from "./pages/receiptpage/ReceiptPage";
import Sellerscores from "./pages/sellerscores/Sellerscores";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ManageUsers from "./pages/admin/ManageUsers";
import ManageGigs from "./pages/admin/ManageGigs";

function App() {
  const queryClient = new QueryClient();

  // Layout untuk halaman utama (dengan Navbar & Footer)
  const Layout = () => (
    <div className="app">
      <Navbar />
      <Outlet />
      <Footer />
    </div>
  );

  // Layout untuk halaman Admin (tanpa Navbar & Footer)
  const AdminLayout = () => (
    <div className="admin-app">
      <h1>Admin Dashboard</h1>
      <Outlet />
    </div>
  );

  // Router
  const router = createBrowserRouter([
    {
      path: "/",
      element: <Layout />,
      children: [
        { path: "/", element: <Home /> },
        { path: "/gigs", element: <Gigs /> },
        { path: "/register", element: <Register /> },
        { path: "/login", element: <Login /> },
        { path: "/register-seller", element: <RegisterSeller /> },
        { path: "/portofolio", element: <Portofolio /> },
        { path: "/seller-scores", element: <Sellerscores /> },
        { path: "/gig/:id", element: <Gig /> },
        { path: "/myGigs", element: <MyGigs /> },
        { path: "/orders", element: <Orders /> },
        { path: "/orders/:orderId/receipt", element: <ReceiptPage /> },
        { path: "/user/:id", element: <UserProfile /> },
        { path: "/userProfile/:id", element: <UserProfile /> },
        { path: "/messages", element: <Messages /> },
        { path: "/message/:id", element: <Message /> },
        { path: "/add", element: <Add /> },
        { path: "/gigs/:id", element: <EditGig /> },
        { path: "/gigs/:id/edit", element: <EditGig /> },
        { path: "/pay/:id", element: <Pay /> },
        { path: "/success", element: <Success /> },
      ],
    },
    {
      path: "/admin",
      element: <AdminLayout />, // Admin halaman terpisah tanpa Navbar & Footer
      children: [
        { path: "dashboard", element: <AdminDashboard /> },
        { path: "manage-users", element: <ManageUsers /> },
        { path: "manage-gigs", element: <ManageGigs /> },
      ],
    },
  ]);

  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}

export default App;

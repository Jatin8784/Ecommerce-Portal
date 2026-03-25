import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import { ToastContainer } from "react-toastify";

// Layout Components
import Navbar from "./components/Layout/Navbar";
import Sidebar from "./components/Layout/Sidebar";
import SearchOverlay from "./components/Layout/SearchOverlay";
import CartSidebar from "./components/Layout/CartSidebar";
import ProfilePanel from "./components/Layout/ProfilePanel";
import LoginModal from "./components/Layout/LoginModal";
import Footer from "./components/Layout/Footer";

// Pages
import Index from "./pages/Home";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Orders from "./pages/Orders";
import OrderDetail from "./pages/OrderDetail";
import Payment from "./pages/Payment";
import About from "./pages/About";
import FAQ from "./pages/FAQ";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { getUser } from "./store/slices/authSlice.js";
import { Loader } from "lucide-react";
import { fetchAllProducts } from "./store/slices/productSlice.js";

const App = () => {
  const { authUser, isCheckingAuth } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getUser());
  }, [getUser]);

  useEffect(() => {
    dispatch(
      fetchAllProducts({
        category: "",
        price: 0 - 10000,
        search: "",
        ratings: "",
        availability: "",
        page: 1,
      })
    );
  }, []);

  const { products } = useSelector((state) => state.product);

  if ((isCheckingAuth && !authUser) || !products) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="size-10 animate-spin" />
      </div>
    );
  }

  return (
    <>
      <ThemeProvider>
        <BrowserRouter>
          <div className="min-h-screen bg-background">
            <Navbar />
            <Sidebar />
            <SearchOverlay />
            <CartSidebar />
            <ProfilePanel />
            <LoginModal />
            <AnimatePresence mode="wait">
              <Routes location={location} key={location.pathname}>
                <Route path="/" element={<PageWrapper><Index /></PageWrapper>} />
                <Route path="/password/reset/:token" element={<PageWrapper><Index /></PageWrapper>} />
                <Route path="/products" element={<PageWrapper><Products /></PageWrapper>} />
                <Route path="/product/:id" element={<PageWrapper><ProductDetail /></PageWrapper>} />
                <Route path="/cart" element={<PageWrapper><Cart /></PageWrapper>} />
                <Route path="/orders" element={<PageWrapper><Orders /></PageWrapper>} />
                <Route path="/order/:id" element={<PageWrapper><OrderDetail /></PageWrapper>} />
                <Route path="/payment" element={<PageWrapper><Payment /></PageWrapper>} />
                <Route path="/about" element={<PageWrapper><About /></PageWrapper>} />
                <Route path="/faq" element={<PageWrapper><FAQ /></PageWrapper>} />
                <Route path="/contact" element={<PageWrapper><Contact /></PageWrapper>} />
                <Route path="*" element={<PageWrapper><NotFound /></PageWrapper>} />
              </Routes>
            </AnimatePresence>
            <Footer />
          </div>
          <ToastContainer />
        </BrowserRouter>
      </ThemeProvider>
    </>
  );
};

export default App;

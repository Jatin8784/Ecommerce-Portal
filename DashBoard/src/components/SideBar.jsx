import React, { useEffect, useState } from "react";
import {
  Bell,
  LayoutDashboard,
  ListOrdered,
  Package,
  Users,
  Menu,
  User,
  LogOut,
  MoveLeft,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, useNavigate } from "react-router-dom";
import { logout } from "../store/slices/authSlice";
import { toggleComponent, toggleNavbar } from "../store/slices/extraSlice";
import { motion } from "framer-motion";

const sidebarVariants = {
  hidden: { x: -20, opacity: 0 },
  visible: (i) => ({
    x: 0,
    opacity: 1,
    transition: {
      delay: i * 0.05,
      duration: 0.3,
      ease: "easeOut",
    },
  }),
};

const SideBar = () => {
  const [activeLink, setActiveLink] = useState(0);
  const links = [
    {
      icon: <LayoutDashboard />,
      title: "Dashboard",
    },
    {
      icon: <ListOrdered />,
      title: "Orders",
    },
    {
      icon: <Package />,
      title: "Products",
    },
    {
      icon: <Users />,
      title: "Users",
    },
    {
      icon: <User />,
      title: "Profile",
    },
  ];

  const { isNavbarOpened } = useSelector((state) => state.extra);
  const { isAuthenticated } = useSelector((state) => state.auth);

  const dispatch = useDispatch();
  const handleLogout = () => {
    dispatch(logout());
  };

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return (
    <>
      <aside
        className={`${isNavbarOpened ? "left-[10px]" : "-left-full"} fixed w-64 h-[97.5%] rounded-xl bg-white z-10 mt-[10px] transition-all duration-300 shadow-lg p-4 space-y-4 flex flex-col justify-between md:left-[10px]`}
      >
        <nav className="space-y-2">
          <div className="flex flex-col gap-2 py-2">
            <h2 className="flex icons-center justify-between text-xl font-bold">
              <span>Admin Panel</span>
              <MoveLeft
                className="block md:hidden"
                onClick={() => dispatch(toggleNavbar())}
              />
            </h2>
            <hr />
          </div>

          <div className="flex flex-col gap-2 p-3 mt-4">
            {links.map((item, index) => {
              return (
                <motion.button
                  key={index}
                  custom={index}
                  variants={sidebarVariants}
                  initial="hidden"
                  animate="visible"
                  whileHover={{ x: 5 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setActiveLink(index);
                    dispatch(toggleComponent(item.title));
                    if (window.innerWidth < 768) {
                      dispatch(toggleNavbar());
                    }
                  }}
                  className={`${
                    activeLink === index
                      ? "bg-dark-gradient text-white shadow-lg"
                      : "hover:bg-gray-100 text-gray-600"
                  } w-full transition-all duration-200 rounded-xl cursor-pointer px-4 py-3 flex items-center gap-3 font-medium active:scale-95`}
                >
                  <span className={`p-2 rounded-lg ${activeLink === index ? "bg-white/20" : "bg-gray-50"}`}>
                    {item.icon}
                  </span>
                  <span className="text-sm tracking-wide">{item.title}</span>
                  {activeLink === index && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="ml-auto w-1.5 h-1.5 rounded-full bg-white"
                    />
                  )}
                </motion.button>
              );
            })}
          </div>
        </nav>
        <button
          onClick={handleLogout}
          className="text-white rounded-md cursor-pointer px-3 py-2 gap-2 bg-red-gradient flex items-center "
        >
          <LogOut />
          Logout
        </button>
      </aside>
    </>
  );
};

export default SideBar;

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
        className={`${isNavbarOpened ? "left-[10px]" : "-left-full"} fixed w-64 h-[97.5%] rounded-xl bg-white dark:bg-[#1a1c23] z-10 mt-[10px] transition-all duration-300 shadow-xl p-4 space-y-4 flex flex-col justify-between md:left-[10px] border border-gray-100 dark:border-gray-800`}
      >
        <nav className="space-y-2">
          <div className="flex flex-col gap-2 py-2">
            <h2 className="flex items-center justify-between text-xl font-bold text-gray-800 dark:text-gray-100 uppercase tracking-tight px-2">
              <span>Admin Panel</span>
              <MoveLeft
                className="block md:hidden cursor-pointer text-gray-500 hover:text-primary transition-colors"
                onClick={() => dispatch(toggleNavbar())}
              />
            </h2>
            <hr className="border-gray-100 dark:border-gray-800" />
          </div>

          {links.map((item, index) => {
            return (
              <button
                onClick={() => {
                  setActiveLink(index);
                  dispatch(toggleComponent(item.title));
                  if (window.innerWidth < 768) {
                    dispatch(toggleNavbar());
                  }
                }}
                key={index}
                style={{ animationDelay: `${index * 100}ms` }}
                className={`${
                  activeLink === index 
                    ? "bg-dark-gradient text-white shadow-lg scale-[1.02] ring-1 ring-white/10" 
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                } w-full transition-all duration-300 rounded-lg cursor-pointer px-3 py-2.5 flex items-center gap-3 animate-fade-in-up`}
              >
                <span className={`shrink-0 ${activeLink === index ? "text-white" : "text-primary dark:text-gray-500"}`}>
                  {item.icon}
                </span>
                <span className="font-semibold">{item.title}</span>
              </button>
            );
          })}
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

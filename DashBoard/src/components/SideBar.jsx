import React, { useState } from "react";
import {
  LayoutDashboard,
  ListOrdered,
  Package,
  Users,
  User,
  LogOut,
  MoveLeft,
} from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { logout } from "../store/slices/authSlice";
import { toggleComponent, toggleNavbar } from "../store/slices/extraSlice";

const SideBar = () => {
  const [activeLink, setActiveLink] = useState(0);
  const links = [
    { icon: <LayoutDashboard size={20} />, title: "Dashboard" },
    { icon: <ListOrdered size={20} />, title: "Orders" },
    { icon: <Package size={20} />, title: "Products" },
    { icon: <Users size={20} />, title: "Users" },
    { icon: <User size={20} />, title: "Profile" },
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
    <aside
      className={`${isNavbarOpened ? "left-0" : "-left-full"} fixed w-64 h-screen bg-white border-r border-gray-200 z-50 transition-all duration-300 flex flex-col justify-between md:left-0`}
    >
      <div className="p-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Admin</h2>
          <button className="md:hidden p-1" onClick={() => dispatch(toggleNavbar())}>
            <MoveLeft size={20} />
          </button>
        </div>

        <nav className="space-y-1">
          {links.map((item, index) => (
            <button
              key={index}
              onClick={() => {
                setActiveLink(index);
                dispatch(toggleComponent(item.title));
                if (window.innerWidth < 768) dispatch(toggleNavbar());
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-colors ${
                activeLink === index
                  ? "bg-gray-100 text-blue-600"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <span className={activeLink === index ? "text-blue-600" : "text-gray-400"}>
                {item.icon}
              </span>
              {item.title}
            </button>
          ))}
        </nav>
      </div>

      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-md transition-colors"
        >
          <LogOut size={20} />
          Sign Out
        </button>
      </div>
    </aside>
  );
};

export default SideBar;

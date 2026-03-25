import React, { useState } from "react";
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
  const { isAuthenticated, user } = useSelector((state) => state.auth);

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
            <h2 className="flex items-center justify-between text-xl font-bold">
              <span>Admin Panel</span>
              <MoveLeft
                className="block md:hidden"
                onClick={() => dispatch(toggleNavbar())}
              />
            </h2>
            <hr />
          </div>

          <div className="flex flex-col gap-2 mt-4">
            {links.map((item, index) => {
              return (
                <button
                  key={index}
                  onClick={() => {
                    setActiveLink(index);
                    dispatch(toggleComponent(item.title));
                    if (window.innerWidth < 768) {
                      dispatch(toggleNavbar());
                    }
                  }}
                  className={`${
                    activeLink === index
                      ? "bg-dark-gradient text-white"
                      : "hover:bg-gray-100 text-gray-600"
                  } w-full transition-all duration-200 rounded-lg cursor-pointer px-4 py-3 flex items-center gap-3 font-medium`}
                >
                  <span className={activeLink === index ? "text-white" : "text-gray-400"}>
                    {item.icon}
                  </span>
                  <span className="text-sm">{item.title}</span>
                </button>
              );
            })}
          </div>
        </nav>
        <button
          onClick={handleLogout}
          className="text-white rounded-md cursor-pointer px-3 py-2 gap-2 bg-red-gradient flex items-center shadow-lg hover:opacity-90 transition-opacity"
        >
          <LogOut />
          Logout
        </button>
      </aside>
    </>
  );
};

export default SideBar;

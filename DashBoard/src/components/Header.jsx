import React from "react";
import { useDispatch, useSelector } from "react-redux";
import avatar from "../assets/avatar.jpg";
import { Menu, Sun, Moon } from "lucide-react";
import { toggleNavbar } from "../store/slices/extraSlice.js";
import { useTheme } from "../context/ThemeContext.jsx";

const Header = () => {
  const { user } = useSelector((state) => state.auth);
  const { openedComponent } = useSelector((state) => state.extra);
  const { theme, toggleTheme } = useTheme();
  const dispatch = useDispatch();

  return (
    <>
      <header className="flex justify-between mb-3 pb-2 border-b border-gray-200 dark:border-gray-800">
        <p className="flex items-center gap-3 text-sm">
          <span className="text-gray-400 dark:text-gray-500">{user?.name}</span>
          <span className="text-gray-300 dark:text-gray-700">/</span>
          <span className="text-gray-800 dark:text-gray-200 font-medium">
            {openedComponent}
          </span>
        </p>
        <div className="flex gap-4 items-center">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors pointer-events-auto"
          >
            {theme === "dark" ? (
              <Sun className="w-5 h-5 text-yellow-400" />
            ) : (
              <Moon className="w-5 h-5 text-slate-700" />
            )}
          </button>
          
          <Menu
            className="block md:hidden cursor-pointer dark:text-gray-300"
            onClick={() => dispatch(toggleNavbar())}
          />
          <img
            src={user?.avatar?.url || avatar}
            alt={user?.name || avatar}
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border-2 border-primary/20 shadow-lg"
          />
        </div>
      </header>
    </>
  );
};

export default Header;

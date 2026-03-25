import React, { useState } from "react";
import avatar from "../assets/avatar.jpg";
import Header from "./Header";
import { useDispatch, useSelector } from "react-redux";
import {
  updateAdminPassword,
  updateAdminProfile,
} from "../store/slices/authSlice.js";
const Profile = () => {
  const { user, loading } = useSelector((state) => state.auth);
  const [editData, setEditData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    avatar: user?.avatar || "",
  });

  const [avatar, setAvatar] = useState(null);
  const [updatingSection, setUpdatingSection] = useState("");

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    setAvatar(file);
  };

  const handleProfileChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const dispatch = useDispatch();

  const updateProfile = () => {
    const formData = new FormData();
    formData.append("name", editData.name);
    formData.append("email", editData.email);
    if (avatar) {
      formData.append("avatar", avatar);
    }
    setUpdatingSection("Profile");
    dispatch(updateAdminProfile(formData));
  };

  const updatePassword = () => {
    const formData = new FormData();
    formData.append("currentPassword", passwordData.currentPassword);
    formData.append("newPassword", passwordData.newPassword);
    formData.append("confirmNewPassword", passwordData.confirmNewPassword);
    setUpdatingSection("Password");
    dispatch(updateAdminPassword(formData));
  };

  return (
    <>
      <main className="p-[10px] pl-[10px] md:pl-[17rem] w-full">
        {/* Header */}
        <div className="flex-1 md:p-6 md:pb-0">
          <Header />
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 italic tracking-tight">Profile</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Manage Your Profile.</p>
        </div>

        {/* Content */}
        <div className="max-w-4xl md:px-4 py-8">
          {/* Profile Card */}
          <div className="bg-white dark:bg-[#1a1c23] shadow-md rounded-2xl p-6 flex flex-col md:flex-row items-center gap-6 mb-10 border border-gray-100 dark:border-gray-800">
            <img
              src={(user && user?.avatar?.url) || avatar}
              alt={user?.name || avatar}
              className="w-32 h-32 rounded-full object-cover border-4 border-primary/20 shadow-xl"
              loading="lazy"
            />
            <div className="text-center md:text-left">
              <p className="text-xl font-bold text-gray-800 dark:text-gray-100">Name: <span className="font-normal font-mono">{user.name}</span></p>
              <p className="text-md text-gray-600 dark:text-gray-400">Email: {user.email}</p>
              <p className="text-sm font-semibold text-primary mt-1 uppercase tracking-wider">Role: {user.role}</p>
            </div>
          </div>

          {/* Update Profile Section */}
          <div className="bg-gray-100 dark:bg-black/20 p-6 rounded-2xl shadow-sm mb-10 border border-transparent dark:border-gray-800">
            <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Update Profile</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                name="name"
                value={editData.name}
                onChange={handleProfileChange}
                className="p-3 border dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-primary/20 outline-none transition-all shadow-sm"
                placeholder="Your Name"
              />
              <input
                type="email"
                name="email"
                value={editData.email}
                onChange={handleProfileChange}
                className="p-3 border dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-primary/20 outline-none transition-all shadow-sm"
                placeholder="Your Email"
              />
              <input
                type="file"
                name="avatar"
                onChange={handleAvatarChange}
                className="p-2 border dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 dark:text-gray-200 col-span-1 md:col-span-2 text-sm"
              />
            </div>
            <button
              type="button"
              className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 mt-4 transition-all"
              onClick={updateProfile}
              disabled={loading}
            >
              {loading && updatingSection === "Profile" ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Updating Profile...</span>
                </>
              ) : (
                "Update Profile"
              )}
            </button>
          </div>

          {/* Update Password Section */}
          <div className="bg-gray-100 dark:bg-black/20 p-6 rounded-2xl shadow-sm border border-transparent dark:border-gray-800">
            <h3 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Update Password</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="password"
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                className="p-3 border dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-primary/20 outline-none transition-all shadow-sm"
                placeholder="Current Password"
              />
              <input
                type="password"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                className="p-3 border dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-primary/20 outline-none transition-all shadow-sm"
                placeholder="New Password"
              />
              <input
                type="password"
                name="confirmNewPassword"
                value={passwordData.confirmNewPassword}
                onChange={handlePasswordChange}
                className="p-3 border dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 dark:text-gray-100 focus:ring-2 focus:ring-primary/20 outline-none transition-all shadow-sm md:col-span-2"
                placeholder="Confirm New Password"
              />
            </div>
            <button
              type="button"
              onClick={updatePassword}
              className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 mt-4 transition"
              disabled={loading}
            >
              {loading && updatingSection === "Password" ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Updating In...</span>
                </>
              ) : (
                "Update Password"
              )}
            </button>
          </div>
        </div>
      </main>
    </>
  );
};

export default Profile;

import { useEffect, useState } from "react";
import { X, LogOut, Upload, Eye, EyeOff } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  logout,
  updatePassword,
  updateProfile,
} from "../../store/slices/authSlice.js";
import {
  toggleAuthPopup,
  toggleSidebar,
} from "../../store/slices/popupSlice.js";

const ProfilePanel = () => {
  const dispatch = useDispatch();
  const { isAuthPopupOpen } = useSelector((state) => state.popup);
  const { authUser, isUpdatingProfile, isUpdatingPassword } = useSelector(
    (state) => state.auth
  );

  const [name, setName] = useState(authUser?.name || "");
  const [email, setEmail] = useState(authUser?.email || "");
  const [avatar, setAvatar] = useState(null);

  useEffect(() => {
    if (authUser) {
      setName(authUser?.name || "");
      setEmail(authUser?.email || "");
    }
  }, [authUser]);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
  };

  const handleUpdateProfile = () => {
    const formData = new FormData();
    formData.append("name", name);
    formData.append("email", email);
    if (avatar) {
      formData.append("avatar", avatar);
    }
    dispatch(updateProfile(formData));
  };

  const handleUpdatePassword = () => {
    // const formData = new FormData();
    // formData.append("currentPassword", currentPassword);
    // formData.append("newPassword", newPassword);
    // formData.append("confirmPassword", confirmPassword);
    dispatch(
      updatePassword({ currentPassword, newPassword, confirmNewPassword })
    );
  };

  if (!isAuthPopupOpen || !authUser) {
    return null;
  }

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
        onClick={() => dispatch(toggleSidebar())}
      ></div>

      {/* Profile Panel */}
      <div className="fixed right-0 top-0 h-full w-96 z-50 glass-panel animate-slide-in-right overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-[hsla[var(--glass-border))]">
          <h2 className="text-xl font-semibold text-primary">Profile</h2>
          <button
            onClick={() => dispatch(toggleAuthPopup())}
            className="p-2 rounded-lg glass-card hover:glow-on-hover animate-smooth"
          >
            <X className="w-5 h-5 text-primary" />
          </button>
        </div>

        <div className="p-6">
          {/* Avatar + Basic Info */}
          <div className="text-center mb-6">
            <img
              src={authUser?.avatar?.url || "/avatar-holder.avif"}
              alt={authUser?.name}
              className="w-20 h-20 rounded-full mx-auto mb-4 border-2 border-primary object-cover"
            />
            <h3 className="text-lg font-semibold text-foreground">
              {authUser?.name}
            </h3>
            <p className="text-muted-foreground">{authUser?.email}</p>
          </div>

          {/* Profile Update Form */}
          {authUser && (
            <div className="space-y-4 mb-8">
              <h3 className="text-lg font-semibold text-primary">
                Update Profile
              </h3>
              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-2 rounded border border-border bg-secondary text-foreground"
              />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 rounded border border-border bg-secondary text-foreground"
              />
              <label className="flex items-center gap-2 cursor-pointer text-sm text-muted-foreground">
                <Upload className="w-4 h-4 text-primary" />
                <span>Upload Avatar</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setAvatar(e.target.files[0])}
                  className="hidden"
                />
              </label>
              <button
                className="flex justify-center items-center space-x-3 p-3 rounded-lg glass-card hover:glow-on-hover animate-smooth group w-full"
                onClick={handleUpdateProfile}
              >
                {isUpdatingProfile ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Updating Profile...</span>
                  </>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          )}

          {/* Update Password Form */}
          <div className="space-y-4 mb-8">
            <h3 className="text-lg font-semibold text-primary">
              Update Password
            </h3>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Current Password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full p-2 rounded border border-border bg-secondary text-foreground"
            />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full p-2 rounded border border-border bg-secondary text-foreground"
            />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Confirm Password"
              value={confirmNewPassword}
              onChange={(e) => setConfirmNewPassword(e.target.value)}
              className="w-full p-2 rounded border border-border bg-secondary text-foreground"
            />
            <button
              onClick={() => setShowPassword(!showPassword)}
              className="text-xs text-muted-foreground flex items-center gap-1"
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4 text-primary" />
              ) : (
                <Eye className="w-4 h-4 text-primary" />
              )}
              {showPassword ? "Hide" : "Show"} Passwords
            </button>
            <button
              className="flex justify-center items-center space-x-3 p-3 rounded-lg glass-card hover:glow-on-hover animate-smooth group w-full"
              onClick={handleUpdatePassword}
            >
              {isUpdatingPassword ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Updating Password...</span>
                </>
              ) : (
                "Update Password"
              )}
            </button>
          </div>

          <button
            className="my-6 flex items-center space-x-3 p-3 rounded-lg glass-card hover:glass-on-hover text-destructive hover:text-destructive-foreground group w-full"
            onClick={handleLogout}
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default ProfilePanel;

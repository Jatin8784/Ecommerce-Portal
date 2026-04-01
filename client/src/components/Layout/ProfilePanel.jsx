import { useEffect, useState } from "react";
import { X, LogOut, Upload, Eye, EyeOff } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
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
  const { authUser, isUpdatingProfile, isUpdatingPassword, isLoggingOut } = useSelector(
    (state) => state.auth,
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
      updatePassword({ currentPassword, newPassword, confirmNewPassword }),
    );
  };

  if (!isAuthPopupOpen || !authUser) {
    return null;
  }

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity"
        onClick={() => dispatch(toggleAuthPopup())}
      ></div>

      {/* Profile Panel */}
      <div className="fixed right-0 top-0 h-full w-[min(400px,90vw)] z-50 glass-panel bg-background/95 animate-slide-in-right flex flex-col shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-[hsla(var(--glass-border))]">
          <h2 className="text-xl font-semibold text-primary">Your Profile</h2>
          <button
            onClick={() => dispatch(toggleAuthPopup())}
            className="p-2 rounded-lg glass-card hover:glow-on-hover animate-smooth transition-all"
          >
            <X className="w-5 h-5 text-primary" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
          {/* Avatar + Basic Info Section */}
          <div className="flex flex-col items-center mb-8 p-6 glass-card rounded-xl border border-primary/10">
            <div className="relative group">
              <img
                src={authUser?.avatar?.url || "/avatar-holder.avif"}
                alt={authUser?.name}
                className="w-24 h-24 rounded-full border-4 border-primary/20 object-cover shadow-xl transition-transform duration-500 group-hover:scale-105"
              />
              <label className="absolute bottom-0 right-0 p-2 bg-primary text-white rounded-full cursor-pointer shadow-lg hover:bg-primary/90 transition-colors">
                <Upload className="w-4 h-4" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setAvatar(e.target.files[0])}
                  className="hidden"
                />
              </label>
            </div>
            <div className="mt-4 text-center">
              <h3 className="text-xl font-bold text-foreground capitalize">
                {authUser?.name}
              </h3>
              <p className="text-muted-foreground text-sm font-medium">
                {authUser?.email}
              </p>
            </div>
          </div>

          <div className="space-y-6 pb-6">
            {/* Profile Update Section */}
            <div className="glass-card p-5 rounded-xl space-y-4 border border-border/50">
              <div className="flex items-center space-x-2 text-primary">
                <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                <h3 className="text-sm font-bold uppercase tracking-wider">
                  Update Details
                </h3>
              </div>
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase ml-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-3 rounded-lg border border-border bg-secondary/30 text-foreground focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                    placeholder="Enter full name"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase ml-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-3 rounded-lg border border-border bg-secondary/30 text-foreground focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                    placeholder="Enter email"
                  />
                </div>
              </div>
              <button
                className="w-full mt-2 p-3.5 rounded-xl bg-primary text-white font-bold hover:glow-on-hover animate-smooth transition-all shadow-lg shadow-primary/20"
                onClick={handleUpdateProfile}
              >
                {isUpdatingProfile ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Processing...</span>
                  </div>
                ) : (
                  "Save Profile Changes"
                )}
              </button>
            </div>

            {/* Password Update Section */}
            <div className="glass-card p-5 rounded-xl space-y-4 border border-border/50">
              <div className="flex items-center space-x-2 text-primary">
                <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                <h3 className="text-sm font-bold uppercase tracking-wider">
                  Security
                </h3>
              </div>
              <div className="space-y-3">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Current Password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full p-3 rounded-lg border border-border bg-secondary/30 text-foreground focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full p-3 rounded-lg border border-border bg-secondary/30 text-foreground focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Confirm New Password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  className="w-full p-3 rounded-lg border border-border bg-secondary/30 text-foreground focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                />
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-xs font-bold text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5 ml-1"
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  {showPassword ? "Hide" : "Show"} Passwords
                </button>
              </div>
              <button
                className="w-full mt-2 p-3.5 rounded-xl bg-secondary text-foreground font-bold hover:bg-secondary/80 transition-all border border-border"
                onClick={handleUpdatePassword}
              >
                {isUpdatingPassword ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                    <span>Updating...</span>
                  </div>
                ) : (
                  "Update Security Credentials"
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Footer Logout */}
        <button
          className="flex items-center justify-center space-x-3 w-full p-4 rounded-xl bg-destructive/10 text-destructive hover:bg-destructive hover:text-white transition-all font-bold shadow-sm group disabled:opacity-70 disabled:cursor-not-allowed"
          onClick={handleLogout}
          disabled={isLoggingOut}
        >
          {isLoggingOut ? (
            <>
              <div className="w-5 h-5 border-2 border-destructive/30 border-t-destructive group-hover:border-white/30 group-hover:border-t-white rounded-full animate-spin" />
              <span>Signing Out...</span>
            </>
          ) : (
            <>
              <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
              <span>Sign Out From Device</span>
            </>
          )}
        </button>
      </div>
    </>
  );
};

export default ProfilePanel;

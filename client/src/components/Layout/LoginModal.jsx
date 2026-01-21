import { useState, useEffect } from "react";
import { X, User } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { toggleAuthPopup } from "../../store/slices/popupSlice.js";
import {
  forgotPassword,
  login,
  register,
  resetPassword, // ⬅️ make sure this exists in authSlice
} from "../../store/slices/authSlice.js";

const LoginModal = () => {
  const dispatch = useDispatch();
  const location = useLocation();

  const { authUser, isSigningUp, isLoggingIn, isRequestingForToken } =
    useSelector((state) => state.auth);

  const { isAuthPopupOpen } = useSelector((state) => state.popup);

  const [mode, setMode] = useState("signin"); // signin | signup | forgot | reset
  const [formdata, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    setFormData({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    });
  }, [mode]);

  // Detect reset-password route
  useEffect(() => {
    if (location.pathname.startsWith("/password/reset/")) {
      setMode("reset");
      dispatch(toggleAuthPopup());
    }
  }, [location.pathname, dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();

    // FORGOT PASSWORD
    if (mode === "forgot") {
      dispatch(forgotPassword({ email: formdata.email }));
      return;
    }

    // RESET PASSWORD
    if (mode === "reset") {
      const token = location.pathname.split("/").pop();
      dispatch(
        resetPassword({
          token,
          password: formdata.password,
          confirmPassword: formdata.confirmPassword,
        })
      );
      return;
    }

    // LOGIN / SIGNUP
    const data = {
      email: formdata.email,
      password: formdata.password,
    };

    if (mode === "signup") {
      data.name = formdata.name;
      dispatch(register(data));
    } else {
      dispatch(login(data));
    }
  };

  if (!isAuthPopupOpen || authUser) return null;

  const loading = isSigningUp || isLoggingIn || isRequestingForToken;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div className="absolute inset-0 backdrop-blur-md bg-black/40" />

      <div className="relative z-10 glass-panel w-full max-w-md p-6 rounded-xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">
            {mode === "reset"
              ? "Reset Password"
              : mode === "signup"
              ? "Create Account"
              : mode === "forgot"
              ? "Forgot Password"
              : "Welcome Back"}
          </h2>

          <button onClick={() => dispatch(toggleAuthPopup())}>
            <X />
          </button>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          {mode === "signup" && (
            <input
              type="text"
              placeholder="Full Name"
              value={formdata.name}
              onChange={(e) =>
                setFormData({ ...formdata, name: e.target.value })
              }
              required
              className="w-full p-3 rounded-lg bg-secondary text-foreground placeholder-muted-foreground border border-border focus:outline-none"
            />
          )}

          {/* Email */}
          {mode !== "reset" && (
            <input
              type="email"
              placeholder="Email Address"
              value={formdata.email}
              onChange={(e) =>
                setFormData({ ...formdata, email: e.target.value })
              }
              required
              className="w-full p-3 rounded-lg bg-secondary text-foreground placeholder-muted-foreground border border-border focus:outline-none"
            />
          )}

          {/* Password */}
          {mode !== "forgot" && (
            <input
              type="password"
              placeholder="Password"
              value={formdata.password}
              onChange={(e) =>
                setFormData({ ...formdata, password: e.target.value })
              }
              required
              className="w-full p-3 rounded-lg bg-secondary text-foreground placeholder-muted-foreground border border-border focus:outline-none"
            />
          )}

          {/* Confirm Password */}
          {mode === "reset" && (
            <input
              type="password"
              placeholder="Confirm Password"
              value={formdata.confirmPassword}
              onChange={(e) =>
                setFormData({
                  ...formdata,
                  confirmPassword: e.target.value,
                })
              }
              required
              className="w-full p-3 rounded-lg bg-secondary text-foreground placeholder-muted-foreground border border-border focus:outline-none"
            />
          )}

          {/* Forgot Password */}
          {mode === "signin" && (
            <div className="text-right text-sm">
              <button
                type="button"
                onClick={() => setMode("forgot")}
                className="text-blue-500"
              >
                Forgot Password?
              </button>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 text-white rounded-lg"
          >
            {loading
              ? "Please wait..."
              : mode === "reset"
              ? "Reset Password"
              : mode === "signup"
              ? "Create Account"
              : mode === "forgot"
              ? "Send Reset Email"
              : "Sign In"}
          </button>
        </form>

        {/* Toggle */}
        {["signin", "signup"].includes(mode) && (
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() =>
                setMode((prev) => (prev === "signin" ? "signup" : "signin"))
              }
              className="text-blue-500"
            >
              {mode === "signin"
                ? "Don't have an account? Sign up"
                : "Already have an account? Sign in"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginModal;

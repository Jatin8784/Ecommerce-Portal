import { X, User, Eye, EyeOff } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { toggleAuthPopup } from "../../store/slices/popupSlice.js";
import {
  forgotPassword,
  login,
  register,
  sendOtp,
  resetPassword,
  googleLogin,
} from "../../store/slices/authSlice.js";
import { useState } from "react";

const LoginModal = () => {
  const dispatch = useDispatch();
  const location = useLocation();

  const {
    authUser,
    isSigningUp,
    isLoggingIn,
    isRequestingForToken,
    isOtpSending,
  } = useSelector((state) => state.auth);

  const { isAuthPopupOpen } = useSelector((state) => state.popup);

  const [mode, setMode] = useState("signin"); // signin | signup | forgot | reset
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formdata, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    otp: "",
  });

  useEffect(() => {
    setFormData({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      otp: "",
    });
    setIsOtpSent(false);
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
        }),
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
      if (!isOtpSent) {
        dispatch(sendOtp(data)).then((res) => {
          if (!res.error) setIsOtpSent(true);
        });
      } else {
        data.otp = formdata.otp;
        dispatch(register(data));
      }
    } else {
      dispatch(login(data));
    }
  };

  if (!isAuthPopupOpen || authUser) return null;

  const loading =
    isSigningUp || isLoggingIn || isRequestingForToken || isOtpSending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div className="absolute inset-0 backdrop-blur-md bg-black/40" />

      <div className="relative z-10 glass-panel w-full max-w-md p-6 rounded-xl max-h-[min(95vh,640px)] overflow-y-auto">
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
          {/* OTP */}
          {mode === "signup" && isOtpSent && (
            <input
              type="text"
              placeholder="Enter 6-digit OTP"
              value={formdata.otp}
              onChange={(e) =>
                setFormData({ ...formdata, otp: e.target.value })
              }
              required
              maxLength={6}
              className="w-full p-3 rounded-lg bg-secondary text-foreground placeholder-muted-foreground border border-border focus:outline-none"
            />
          )}

          {/* Name */}
          {mode === "signup" && !isOtpSent && (
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
          {mode !== "reset" && !isOtpSent && (
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
          {mode !== "forgot" && !isOtpSent && (
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={formdata.password}
                onChange={(e) =>
                  setFormData({ ...formdata, password: e.target.value })
                }
                required
                className="w-full p-3 pr-12 rounded-lg bg-secondary text-foreground placeholder-muted-foreground border border-border focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                title={showPassword ? "Hide Password" : "Show Password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          )}

          {/* Confirm Password */}
          {mode === "reset" && (
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Confirm Password"
                value={formdata.confirmPassword}
                onChange={(e) =>
                  setFormData({
                    ...formdata,
                    confirmPassword: e.target.value,
                  })
                }
                required
                className="w-full p-3 pr-12 rounded-lg bg-secondary text-foreground placeholder-muted-foreground border border-border focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
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
            className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold transition-all duration-300 hover:bg-blue-700 hover:shadow-lg active:scale-95 disabled:opacity-50 disabled:scale-100"
          >
            {loading
              ? "Please wait..."
              : mode === "reset"
                ? "Reset Password"
                : mode === "signup"
                  ? isOtpSent
                    ? "Verify & Create Account"
                    : "Sign Up"
                  : mode === "forgot"
                    ? "Send Reset Email"
                    : "Sign In"}
          </button>
        </form>

        {/* Google Login */}
        {["signin", "signup"].includes(mode) && (
          <div className="mt-6">
            <div className="relative flex items-center gap-4 mb-6">
              <div className="flex-grow border-t border-white/10"></div>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60">
                Or continue with
              </span>
              <div className="flex-grow border-t border-white/10"></div>
            </div>

            <button
              type="button"
              onClick={() => dispatch(googleLogin())}
              disabled={loading}
              className="group relative w-full py-3 flex items-center justify-center gap-3 bg-white/5 backdrop-blur-xl border border-white/10 text-foreground rounded-xl font-medium transition-all duration-500 hover:bg-white/10 hover:border-white/20 hover:shadow-[0_0_30px_rgba(255,255,255,0.05)] active:scale-[0.98] disabled:opacity-50"
            >
              {/* Subtle Highlight Effect */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <svg className="w-5 h-5 relative z-10" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span className="relative z-10 text-sm font-semibold tracking-wide">
                Google
              </span>
            </button>
          </div>
        )}

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

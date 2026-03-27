import { useState, useEffect } from "react";
import { X, User } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { toggleAuthPopup } from "../../store/slices/popupSlice.js";
import {
  forgotPassword,
  login,
  register,
  sendOtp,
  resetPassword,
  firebaseLogin,
} from "../../store/slices/authSlice.js";
import { auth, googleProvider } from "../../firebase.js";
import { signInWithPopup } from "firebase/auth";

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

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const token = await result.user.getIdToken();
      dispatch(firebaseLogin(token));
    } catch (error) {
      console.error("Google Sign-In Error:", error);
    }
  };

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
            className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold transition-all duration-300 hover:bg-blue-700 hover:shadow-lg active:scale-95 disabled:opacity-50 disabled:scale-100"
          >
            {loading
              ? "Please wait..."
              : mode === "reset"
                ? "Reset Password"
                : mode === "signup"
                  ? isOtpSent
                    ? "Verify & Create Account"
                    : "Sign In"
                  : mode === "forgot"
                    ? "Send Reset Email"
                    : "Sign In"}
          </button>
        </form>

        {/* Google Sign In */}
        {["signin", "signup"].includes(mode) && (
          <div className="mt-4 space-y-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              className="w-full h-12 flex items-center justify-center gap-3 bg-black hover:bg-zinc-900 text-white rounded-lg border border-zinc-800 transition-all duration-300 hover:shadow-xl active:scale-95 group"
            >
              <svg
                className="w-5 h-5 transition-transform group-hover:scale-110"
                viewBox="0 0 24 24"
              >
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span className="font-medium text-sm">Continue with Google</span>
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

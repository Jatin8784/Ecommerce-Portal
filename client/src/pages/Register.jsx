import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Eye, EyeOff, UserPlus, ArrowLeft, Loader2, KeyRound } from "lucide-react";
import { register, sendOtp, googleLogin } from "../store/slices/authSlice.js";

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { authUser, isSigningUp, isOtpSending } = useSelector(
    (state) => state.auth
  );

  const [isOtpSent, setIsOtpSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    otp: "",
  });

  // Redirect if already logged in
  useEffect(() => {
    if (authUser) {
      const from = location.state?.from?.pathname || "/";
      navigate(from, { replace: true });
    }
  }, [authUser, navigate, location]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!isOtpSent) {
      dispatch(
        sendOtp({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        })
      ).then((res) => {
        if (!res.error) setIsOtpSent(true);
      });
    } else {
      dispatch(
        register({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          otp: formData.otp,
        })
      );
    }
  };

  const loading = isSigningUp || isOtpSending;

  return (
    <div className="h-[calc(100vh-4rem)] flex items-center justify-center px-4 bg-background overflow-hidden">
      <div className="w-full max-w-md">
        {/* Back Link */}
        <Link
          to="/"
          className="inline-flex items-center space-x-2 text-xs text-muted-foreground hover:text-foreground mb-3 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </Link>

        {/* Register Card */}
        <div className="glass-panel p-6 sm:p-7 rounded-2xl shadow-xl border border-border">
          <div className="text-center mb-5">
            <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center mx-auto mb-2 text-primary-foreground shadow-md">
              <UserPlus className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-foreground">
              {isOtpSent ? "Verify Email OTP" : "Create Account"}
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              {isOtpSent
                ? `Enter 6-digit OTP sent to ${formData.email}`
                : "Join E-Kart to enjoy fast shopping & deals"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* OTP Verification Mode */}
            {isOtpSent ? (
              <div>
                <label className="block text-xs font-medium text-foreground mb-1 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-primary" />
                  <span>Enter OTP *</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  value={formData.otp}
                  onChange={(e) =>
                    setFormData({ ...formData, otp: e.target.value })
                  }
                  required
                  maxLength={6}
                  className="w-full px-3.5 py-2.5 bg-secondary border border-border rounded-xl text-center font-mono text-base tracking-widest text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                />
              </div>
            ) : (
              <>
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                    className="w-full px-3.5 py-2.5 bg-secondary border border-border rounded-xl text-foreground text-sm placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                  />
                </div>

                {/* Email Address */}
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    required
                    className="w-full px-3.5 py-2.5 bg-secondary border border-border rounded-xl text-foreground text-sm placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1">
                    Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) =>
                        setFormData({ ...formData, password: e.target.value })
                      }
                      required
                      className="w-full px-3.5 py-2.5 pr-10 bg-secondary border border-border rounded-xl text-foreground text-sm placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              </>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 gradient-primary text-primary-foreground font-bold text-sm rounded-xl hover:glow-on-hover animate-smooth flex items-center justify-center space-x-2 disabled:opacity-50 shadow-md"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>
                    {isOtpSending ? "Sending OTP..." : "Registering..."}
                  </span>
                </>
              ) : (
                <span>Register</span>
              )}
            </button>

            {isOtpSent && (
              <button
                type="button"
                onClick={() => setIsOtpSent(false)}
                className="w-full py-2 bg-secondary text-foreground text-xs font-semibold rounded-xl hover:bg-secondary/80 transition-all"
              >
                Change Email / Back
              </button>
            )}
          </form>

          {/* Google OAuth Option */}
          {!isOtpSent && (
            <div className="mt-4">
              <div className="relative flex items-center gap-4 mb-4">
                <div className="flex-grow border-t border-border"></div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Or continue with
                </span>
                <div className="flex-grow border-t border-border"></div>
              </div>

              <button
                type="button"
                onClick={() => dispatch(googleLogin())}
                disabled={loading}
                className="w-full py-2.5 flex items-center justify-center gap-3 bg-secondary hover:bg-secondary/80 border border-border text-foreground rounded-xl font-medium transition-all active:scale-[0.98] disabled:opacity-50"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
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
                <span className="text-xs font-semibold">Google</span>
              </button>
            </div>
          )}

          {/* Toggle to Login */}
          <div className="mt-5 text-center text-xs text-muted-foreground">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-primary font-bold hover:underline ml-1"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;

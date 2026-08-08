import { useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { KeyRound, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";
import { forgotPassword } from "../store/slices/authSlice.js";

const ForgotPassword = () => {
  const dispatch = useDispatch();
  const { isRequestingForToken } = useSelector((state) => state.auth);

  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(forgotPassword({ email })).then((res) => {
      if (!res.error) setEmailSent(true);
    });
  };

  return (
    <div className="min-h-screen pt-20 pb-12 flex items-center justify-center px-4 bg-background">
      <div className="w-full max-w-md">
        {/* Back Link */}
        <Link
          to="/login"
          className="inline-flex items-center space-x-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Login</span>
        </Link>

        {/* Card */}
        <div className="glass-panel p-8 rounded-2xl shadow-xl border border-border">
          {emailSent ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Reset Link Sent!
              </h2>
              <p className="text-sm text-muted-foreground mb-6">
                We have sent a password reset link to{" "}
                <span className="font-semibold text-foreground">{email}</span>. Please check your inbox.
              </p>
              <Link
                to="/login"
                className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl gradient-primary text-primary-foreground font-bold hover:glow-on-hover"
              >
                Return to Login
              </Link>
            </div>
          ) : (
            <>
              <div className="text-center mb-8">
                <div className="w-12 h-12 gradient-primary rounded-xl flex items-center justify-center mx-auto mb-4 text-primary-foreground shadow-md">
                  <KeyRound className="w-6 h-6" />
                </div>
                <h1 className="text-2xl font-bold text-foreground">
                  Forgot Password?
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Enter your email address and we will send you a reset link.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-secondary border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isRequestingForToken}
                  className="w-full py-3.5 gradient-primary text-primary-foreground font-bold rounded-xl hover:glow-on-hover animate-smooth flex items-center justify-center space-x-2 disabled:opacity-50 shadow-md"
                >
                  {isRequestingForToken ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Sending Reset Link...</span>
                    </>
                  ) : (
                    <span>Send Reset Email</span>
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;

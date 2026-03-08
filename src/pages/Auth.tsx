import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { MessageSquare, Mail, Lock, User, AlertCircle, Check } from "lucide-react";
import { toast } from "sonner";
import { analytics } from "@/lib/analytics";
import { logger } from "@/lib/logger";

interface ValidationErrors {
  email?: string;
  password?: string;
  displayName?: string;
}

const Auth = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const { signIn, signUp, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  // Email validation regex
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Real-time validation
  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (value && !validateEmail(value)) {
      setErrors((prev) => ({ ...prev, email: "Please enter a valid email address" }));
    } else {
      setErrors((prev) => ({ ...prev, email: undefined }));
    }
  };

  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (value.length < 6) {
      setErrors((prev) => ({ ...prev, password: "Password must be at least 6 characters" }));
    } else {
      setErrors((prev) => ({ ...prev, password: undefined }));
    }
  };

  const handleDisplayNameChange = (value: string) => {
    setDisplayName(value);
    if (isSignUp && value.length < 2) {
      setErrors((prev) => ({ ...prev, displayName: "Name must be at least 2 characters" }));
    } else {
      setErrors((prev) => ({ ...prev, displayName: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    if (!validateEmail(email)) {
      newErrors.email = "Please enter a valid email address";
    }
    if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    if (isSignUp && displayName.length < 2) {
      newErrors.displayName = "Name must be at least 2 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Please fix the errors above");
      return;
    }

    setLoading(true);
    try {
      if (isSignUp) {
        await signUp(email, password, displayName);
        toast.success("✨ Account created successfully!");
        logger.info("User signed up", { email });
        analytics.signup();
      } else {
        await signIn(email, password);
        toast.success("👋 Welcome back!");
        logger.info("User logged in", { email });
        analytics.login("email");
      }
      
      // Small delay to ensure auth state listener fires and updates context
      setTimeout(() => {
        logger.info("Navigating to dashboard", { email });
        navigate("/dashboard");
      }, 500);
    } catch (err: any) {
      logger.error("Auth error", err);
      const errorMsg = err.message || "Authentication failed";
      
      // Provide more helpful error messages
      if (errorMsg.includes("user-not-found")) {
        toast.error("Email not found. Please sign up first.");
      } else if (errorMsg.includes("wrong-password")) {
        toast.error("Incorrect password. Please try again.");
      } else if (errorMsg.includes("email-already-in-use")) {
        toast.error("Email already in use. Please log in instead.");
      } else if (errorMsg.includes("weak-password")) {
        toast.error("Password too weak. Use at least 6 characters.");
      } else {
        toast.error(errorMsg);
      }
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
      toast.success("🎉 Welcome!");
      analytics.login("google");
      
      // Small delay to ensure auth state listener fires and updates context
      setTimeout(() => {
        logger.info("Navigating to dashboard (Google)");
        navigate("/dashboard");
      }, 500);
    } catch (err: any) {
      logger.error("Google sign-in error", err);
      const errorMsg = err.message || "Google sign-in failed";
      
      if (errorMsg.includes("network")) {
        toast.error("Network error. Please check your connection.");
      } else if (errorMsg.includes("popup-blocked")) {
        toast.error("Pop-up was blocked. Please allow pop-ups for Google sign-in.");
      } else {
        toast.error(errorMsg);
      }
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md rounded-2xl bg-card p-8 shadow-elevated"
      >
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl gradient-primary">
            <MessageSquare className="h-6 w-6 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-card-foreground">
            {isSignUp ? "Create Account" : "Welcome Back"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {isSignUp ? "Start improving your skills today" : "Continue your practice journey"}
          </p>
        </div>

        <Button 
          variant="outline" 
          className="mb-6 w-full" 
          onClick={handleGoogle} 
          disabled={loading}
          aria-label="Sign in with Google"
        >
          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          Continue with Google
        </Button>

        <div className="mb-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs text-muted-foreground">or</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => handleDisplayNameChange(e.target.value)}
                  placeholder="Full name"
                  aria-label="Full name"
                  aria-invalid={!!errors.displayName}
                  required
                  className={`w-full rounded-xl border ${errors.displayName ? "border-destructive" : "border-input"} bg-background py-3 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 ${errors.displayName ? "focus:ring-destructive" : "focus:ring-ring"}`}
                />
              </div>
              {errors.displayName && (
                <p className="mt-1 text-xs text-destructive flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.displayName}
                </p>
              )}
            </div>
          )}
          <div>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <input
                type="email"
                value={email}
                onChange={(e) => handleEmailChange(e.target.value)}
                placeholder="Email"
                aria-label="Email address"
                aria-invalid={!!errors.email}
                required
                className={`w-full rounded-xl border ${errors.email ? "border-destructive" : "border-input"} bg-background py-3 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 ${errors.email ? "focus:ring-destructive" : "focus:ring-ring"}`}
              />
              {!errors.email && email && validateEmail(email) && (
                <Check className="absolute right-3 top-3 h-4 w-4 text-green-500" />
              )}
            </div>
            {errors.email && (
              <p className="mt-1 text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.email}
              </p>
            )}
          </div>
          <div>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <input
                type="password"
                value={password}
                onChange={(e) => handlePasswordChange(e.target.value)}
                placeholder="Password (minimum 6 characters)"
                aria-label="Password"
                aria-invalid={!!errors.password}
                required
                minLength={6}
                className={`w-full rounded-xl border ${errors.password ? "border-destructive" : "border-input"} bg-background py-3 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 ${errors.password ? "focus:ring-destructive" : "focus:ring-ring"}`}
              />
              {!errors.password && password && password.length >= 6 && (
                <Check className="absolute right-3 top-3 h-4 w-4 text-green-500" />
              )}
            </div>
            {errors.password && (
              <p className="mt-1 text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.password}
              </p>
            )}
          </div>
          <Button 
            variant="hero" 
            className="w-full" 
            size="lg" 
            type="submit" 
            disabled={loading || Object.values(errors).some(e => e)}
            aria-label={isSignUp ? "Create new account" : "Log in to account"}
          >
            {loading ? "Loading..." : isSignUp ? "Sign Up" : "Log In"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
          <button
            className="font-semibold text-primary hover:underline"
            onClick={() => setIsSignUp(!isSignUp)}
            aria-label={isSignUp ? "Switch to login mode" : "Switch to signup mode"}
          >
            {isSignUp ? "Log in" : "Sign up"}
          </button>
        </p>
      </motion.div>
    </div>
  );
};

export default Auth;

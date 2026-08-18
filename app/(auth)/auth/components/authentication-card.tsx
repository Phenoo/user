"use client";

import type React from "react";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  ArrowLeft,
  Shield,
  Loader2,
  RotateCw,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { FcGoogle } from "react-icons/fc";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthActions } from "@convex-dev/auth/react";
import { safeSessionStorage } from "@/lib/storage-helpers";
import { toast } from "sonner";
import Logo from "@/components/logo";

type AuthStep =
  | "login"
  | "signup"
  | "forgot-password"
  | "reset-password"
  | "otp"
  | "success";
type AuthMode = "login" | "signup";

interface PasswordRequirement {
  label: string;
  test: (password: string) => boolean;
}

const passwordRequirements: PasswordRequirement[] = [
  { label: "At least 8 characters", test: (pwd) => pwd.length >= 8 },
  { label: "One uppercase letter", test: (pwd) => /[A-Z]/.test(pwd) },
  { label: "One lowercase letter", test: (pwd) => /[a-z]/.test(pwd) },
  { label: "One number", test: (pwd) => /\d/.test(pwd) },
  {
    label: "One special character",
    test: (pwd) => /[!@#$%^&*(),.?":{}|<>]/.test(pwd),
  },
];

export default function AuthenticationCard() {
  const { signIn } = useAuthActions();

  const [step, setStep] = useState<AuthStep>("login");
  const [mode, setMode] = useState<AuthMode>("login");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    otp: ["", "", "", "", ""],
  });

  const router = useRouter();
  const searchParams = useSearchParams();

  const currentStep = (searchParams.get("step") as AuthStep) || step || "login";
  const connectedIntegration = searchParams.get("connected");
  const callbackStatus = searchParams.get("status");
  const callbackError = searchParams.get("error");

  const integrationLabels: Record<string, string> = {
    classroom: "Google Classroom",
    drive: "Google Drive",
    calendar: "Google Calendar",
  };
  const connectedLabel = connectedIntegration
    ? integrationLabels[connectedIntegration] || "Google integration"
    : "Google integration";
  const callbackErrorMessages: Record<string, string> = {
    invalid_callback_request:
      "Google did not return a complete authorization response. Please sign in and try connecting again.",
    csrf_validation_failed:
      "Your Google connection session expired. Please sign in and start the connection again.",
    callback_processing_error:
      "We could not finish saving your Google connection. Please sign in and try again.",
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newOtp = [...formData.otp];
      newOtp[index] = value;
      setFormData((prev) => ({ ...prev, otp: newOtp }));

      // Auto-focus next input
      if (value && index < 4) {
        const nextInput = document.getElementById(`otp-${index + 1}`);
        nextInput?.focus();
      }
    }
  };

  const getPasswordStrength = (password: string) => {
    const passedRequirements = passwordRequirements.filter((req) =>
      req.test(password)
    ).length;
    if (passedRequirements === 0) return { strength: 0, label: "", color: "" };
    if (passedRequirements <= 2)
      return { strength: 25, label: "Weak", color: "bg-red-500" };
    if (passedRequirements <= 3)
      return { strength: 50, label: "Fair", color: "bg-yellow-500" };
    if (passedRequirements <= 4)
      return { strength: 75, label: "Good", color: "bg-blue-500" };
    return { strength: 100, label: "Strong", color: "bg-green-500" };
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsGoogleLoading(true);
      await signIn("google");
    } catch (error: any) {
      console.error("Google sign in error:", error);
      toast.error(
        error?.message ||
          "Failed to connect to Google. Please check your network and configuration."
      );
      setIsGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (currentStep === "login") {
        if (!formData.email.trim() || !formData.password) {
          toast.error("Please enter your email and password.");
          setIsLoading(false);
          return;
        }

        const formDataObj = new FormData();
        formDataObj.append("email", formData.email.trim().toLowerCase());
        formDataObj.append("password", formData.password);
        formDataObj.append("flow", "signIn");

        await signIn("password", formDataObj);
        toast.success("Signed in successfully!");
        router.push("/dashboard");
      } else if (currentStep === "signup") {
        if (!formData.email.trim() || !formData.password) {
          toast.error("Please fill in all required fields.");
          setIsLoading(false);
          return;
        }
        if (formData.password !== formData.confirmPassword) {
          toast.error("Passwords do not match.");
          setIsLoading(false);
          return;
        }
        if (formData.password.length < 8) {
          toast.error("Password must be at least 8 characters long.");
          setIsLoading(false);
          return;
        }

        const cleanEmail = formData.email.trim().toLowerCase();
        const cleanName = formData.name.trim() || cleanEmail.split("@")[0];

        // Store pending credentials for OTP verification
        safeSessionStorage.setItem("pendingEmail", cleanEmail);
        safeSessionStorage.setItem("pendingName", cleanName);
        safeSessionStorage.setItem("pendingPassword", formData.password);

        const formDataObj = new FormData();
        formDataObj.append("email", cleanEmail);
        formDataObj.append("password", formData.password);
        formDataObj.append("name", cleanName);
        formDataObj.append("flow", "signUp");

        await signIn("password", formDataObj);

        toast.success(`Verification code sent to ${cleanEmail}`);
        setStep("otp");
        router.push("/auth?step=otp");
      } else if (currentStep === "forgot-password") {
        if (!formData.email.trim()) {
          toast.error("Please enter your email address.");
          setIsLoading(false);
          return;
        }

        const cleanEmail = formData.email.trim().toLowerCase();
        safeSessionStorage.setItem("resetEmail", cleanEmail);

        const formDataObj = new FormData();
        formDataObj.append("email", cleanEmail);
        formDataObj.append("flow", "reset");

        await signIn("password", formDataObj);
        toast.success("Password reset code sent to your email!");
        setStep("otp");
        router.push("/auth?step=otp");
      } else if (currentStep === "otp") {
        const pendingEmail = safeSessionStorage.getItem("pendingEmail");
        const pendingName = safeSessionStorage.getItem("pendingName");
        const pendingPassword = safeSessionStorage.getItem("pendingPassword");
        const resetEmail = safeSessionStorage.getItem("resetEmail");

        const isSignupOtp = !!pendingEmail;
        const targetEmail =
          pendingEmail ||
          resetEmail ||
          formData.email.trim().toLowerCase();

        const code = formData.otp.join("");
        if (code.length < 5) {
          toast.error("Please enter the complete 5-digit verification code.");
          setIsLoading(false);
          return;
        }

        const formDataObj = new FormData();
        formDataObj.append("email", targetEmail);
        formDataObj.append("code", code);

        if (isSignupOtp) {
          formDataObj.append("flow", "signUp");
          formDataObj.append("name", pendingName || "");
          formDataObj.append("password", pendingPassword || "");
        } else {
          formDataObj.append("flow", "reset");
        }

        await signIn("password", formDataObj);

        safeSessionStorage.removeItem("pendingEmail");
        safeSessionStorage.removeItem("pendingName");
        safeSessionStorage.removeItem("pendingPassword");
        safeSessionStorage.removeItem("resetEmail");

        toast.success(
          isSignupOtp
            ? "Email verified & account created!"
            : "Password verified!"
        );
        router.push("/dashboard");
      }
    } catch (error: any) {
      console.error("Authentication error:", error);
      const errMsg = error?.message || "";
      if (
        errMsg.includes("InvalidSecret") ||
        errMsg.includes("Could not verify password")
      ) {
        toast.error("Incorrect email or password. Please try again.");
      } else if (
        errMsg.includes("InvalidAccountId") ||
        errMsg.includes("Could not find user")
      ) {
        toast.error("Account not found. Please check your email or sign up.");
      } else if (
        errMsg.includes("already exists") ||
        errMsg.includes("Account already exists")
      ) {
        toast.error("An account with this email already exists. Please log in.");
      } else if (errMsg.includes("InvalidCode") || errMsg.includes("verification code")) {
        toast.error("Invalid or expired verification code. Please try again.");
      } else {
        toast.error(
          errMsg || "Authentication failed. Please check your credentials."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      setIsResending(true);
      const pendingEmail = safeSessionStorage.getItem("pendingEmail");
      const pendingName = safeSessionStorage.getItem("pendingName");
      const pendingPassword = safeSessionStorage.getItem("pendingPassword");
      const resetEmail = safeSessionStorage.getItem("resetEmail");

      const targetEmail =
        pendingEmail || resetEmail || formData.email.trim().toLowerCase();

      if (!targetEmail) {
        toast.error("No email address found. Please start over.");
        router.push("/auth?step=signup");
        return;
      }

      const isSignupOtp = !!pendingEmail;
      const formDataObj = new FormData();
      formDataObj.append("email", targetEmail);

      if (isSignupOtp) {
        formDataObj.append("flow", "signUp");
        formDataObj.append("name", pendingName || "");
        formDataObj.append("password", pendingPassword || "");
      } else {
        formDataObj.append("flow", "reset");
      }

      await signIn("password", formDataObj);
      toast.success(`A fresh verification code was sent to ${targetEmail}`);
    } catch (err: any) {
      console.error("Resend error:", err);
      toast.error(err?.message || "Failed to resend code. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  const switchMode = (newMode: AuthMode) => {
    setMode(newMode);
    setStep(newMode);
    router.push(`/auth?step=${newMode}`);
    setFormData({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      otp: ["", "", "", "", ""],
    });
  };

  const resetToLogin = () => {
    setStep("login");
    setMode("login");
    router.push("/auth?step=login");
    setFormData({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      otp: ["", "", "", "", ""],
    });
  };

  const goToForgotPassword = () => {
    setStep("forgot-password");
    router.push("/auth?step=forgot-password");
    setFormData((prev) => ({
      ...prev,
      password: "",
      confirmPassword: "",
      otp: ["", "", "", "", ""],
    }));
  };

  const passwordStrength = getPasswordStrength(formData.password);
  const isSignupValid =
    (currentStep === "signup" || step === "signup") &&
    formData.email.trim() &&
    formData.password &&
    formData.confirmPassword &&
    formData.password === formData.confirmPassword &&
    formData.password.length >= 8;

  const displayEmail =
    safeSessionStorage.getItem("pendingEmail") ||
    safeSessionStorage.getItem("resetEmail") ||
    formData.email;

  useEffect(() => {
    const pendingEmail = safeSessionStorage.getItem("pendingEmail");
    const resetEmail = safeSessionStorage.getItem("resetEmail");
    const emailToSet = pendingEmail || resetEmail;
    if (emailToSet && (step === "otp" || currentStep === "otp")) {
      setFormData((prev) => ({ ...prev, email: emailToSet }));
    }
  }, [step, currentStep]);

  return (
    <div className="w-[450px] max-w-[450px] rounded-2xl bg-card border border-border shadow-2xl transition-all duration-300">
      <div className="relative h-full">
        {/* Logo */}
        <div className="w-full flex items-center justify-center pt-6 pb-2">
          <Logo />
        </div>

        {callbackStatus === "success" && connectedIntegration ? (
          <div
            className="mx-6 mb-2 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4"
            role="status"
          >
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
              <div className="space-y-1">
                <p className="font-semibold text-emerald-700 dark:text-emerald-300">
                  {connectedLabel} connected
                </p>
                <p className="text-sm text-emerald-800/80 dark:text-emerald-200/80">
                  Your Google account was connected successfully. Sign in below to continue to your workspace.
                </p>
              </div>
            </div>
          </div>
        ) : callbackError ? (
          <div
            className="mx-6 mb-2 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4"
            role="alert"
          >
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
              <div className="space-y-1">
                <p className="font-semibold text-amber-700 dark:text-amber-300">
                  Google connection needs another try
                </p>
                <p className="text-sm text-amber-800/80 dark:text-amber-200/80">
                  {callbackErrorMessages[callbackError] ||
                    "We could not complete the Google connection. Please sign in and try again."}
                </p>
              </div>
            </div>
          </div>
        ) : null}

        <div className="p-8 flex flex-col">
          {/* STEP: LOGIN */}
          {currentStep === "login" && (
            <div className="flex-1 flex flex-col justify-center space-y-6">
              <div className="text-center space-y-1">
                <h1 className="text-2xl font-bold tracking-tight">Welcome Back</h1>
                <p className="text-sm text-muted-foreground">
                  Sign in to your student account
                </p>
              </div>

              {/* Email & Password Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      id="login-email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      className="pl-10"
                      placeholder="student@university.edu"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="login-password">Password</Label>
                    <button
                      type="button"
                      onClick={goToForgotPassword}
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) =>
                        handleInputChange("password", e.target.value)
                      }
                      className="pl-10 pr-10"
                      placeholder="Enter your password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading || isGoogleLoading}
                  className="w-full h-11 rounded-xl font-semibold transition-all duration-200"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </form>

              {/* Divider */}
              <div className="after:border-border relative text-center text-xs after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
                <span className="bg-card text-muted-foreground relative z-10 px-3 uppercase tracking-wider">
                  Or continue with
                </span>
              </div>

              {/* Google Button */}
              <Button
                type="button"
                variant="outline"
                disabled={isLoading || isGoogleLoading}
                className="w-full h-11 rounded-xl hover:bg-muted/80 bg-background"
                onClick={handleGoogleSignIn}
              >
                {isGoogleLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Connecting to Google...
                  </>
                ) : (
                  <>
                    <FcGoogle className="h-5 w-5 mr-2" />
                    Sign in with Google
                  </>
                )}
              </Button>

              {/* Toggle to Signup */}
              <div className="text-center text-sm">
                <span className="text-muted-foreground">
                  Don&apos;t have an account?{" "}
                </span>
                <button
                  type="button"
                  onClick={() => switchMode("signup")}
                  className="font-medium text-foreground underline underline-offset-4 hover:text-primary transition-colors"
                >
                  Sign up
                </button>
              </div>
            </div>
          )}

          {/* STEP: SIGNUP */}
          {currentStep === "signup" && (
            <div className="flex-1 flex flex-col justify-center space-y-6">
              <div className="text-center space-y-1">
                <h1 className="text-2xl font-bold tracking-tight">Create Account</h1>
                <p className="text-sm text-muted-foreground">
                  Join Usoro Academic OS today
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      id="signup-name"
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      className="pl-10"
                      placeholder="Jane Doe"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      id="signup-email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      className="pl-10"
                      placeholder="student@university.edu"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      id="signup-password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) =>
                        handleInputChange("password", e.target.value)
                      }
                      className="pl-10 pr-10"
                      placeholder="Create a strong password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  {formData.password && (
                    <div className="space-y-2 pt-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          Password strength
                        </span>
                        <span className="text-xs font-medium">
                          {passwordStrength.label}
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-1.5 rounded-full transition-all duration-300 ${passwordStrength.color}`}
                          style={{ width: `${passwordStrength.strength}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      id="confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={(e) =>
                        handleInputChange("confirmPassword", e.target.value)
                      }
                      className="pl-10 pr-10"
                      placeholder="Confirm your password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {formData.confirmPassword &&
                    formData.password !== formData.confirmPassword && (
                      <p className="text-xs text-destructive">
                        Passwords do not match
                      </p>
                    )}
                </div>

                <Button
                  type="submit"
                  disabled={isLoading || !isSignupValid || isGoogleLoading}
                  className="w-full h-11 rounded-xl font-semibold transition-all duration-200"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </Button>
              </form>

              {/* Divider */}
              <div className="after:border-border relative text-center text-xs after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
                <span className="bg-card text-muted-foreground relative z-10 px-3 uppercase tracking-wider">
                  Or continue with
                </span>
              </div>

              {/* Google Button */}
              <Button
                type="button"
                variant="outline"
                disabled={isLoading || isGoogleLoading}
                className="w-full h-11 rounded-xl hover:bg-muted/80 bg-background"
                onClick={handleGoogleSignIn}
              >
                {isGoogleLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Connecting to Google...
                  </>
                ) : (
                  <>
                    <FcGoogle className="h-5 w-5 mr-2" />
                    Sign up with Google
                  </>
                )}
              </Button>

              {/* Toggle to Login */}
              <div className="text-center text-sm">
                <span className="text-muted-foreground">
                  Already have an account?{" "}
                </span>
                <button
                  type="button"
                  onClick={() => switchMode("login")}
                  className="font-medium text-foreground underline underline-offset-4 hover:text-primary transition-colors"
                >
                  Sign in
                </button>
              </div>
            </div>
          )}

          {/* STEP: FORGOT PASSWORD */}
          {currentStep === "forgot-password" && (
            <div className="flex-1 flex flex-col justify-center space-y-6">
              <button
                type="button"
                onClick={resetToLogin}
                className="absolute top-6 left-6 text-muted-foreground hover:text-foreground transition-colors p-1"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>

              <div className="text-center space-y-1">
                <h1 className="text-2xl font-bold tracking-tight">Reset Password</h1>
                <p className="text-sm text-muted-foreground">
                  Enter your email to receive reset instructions
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="reset-email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      id="reset-email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      className="pl-10"
                      placeholder="student@university.edu"
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-11 rounded-xl font-semibold transition-all duration-200"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Sending code...
                    </>
                  ) : (
                    "Send Reset Code"
                  )}
                </Button>
              </form>

              <div className="text-center">
                <button
                  type="button"
                  onClick={resetToLogin}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Back to login
                </button>
              </div>
            </div>
          )}

          {/* STEP: OTP VERIFY */}
          {currentStep === "otp" && (
            <div className="flex-1 flex flex-col justify-center space-y-6">
              <button
                type="button"
                onClick={() => {
                  if (safeSessionStorage.getItem("pendingEmail")) {
                    setStep("signup");
                    router.push("/auth?step=signup");
                  } else {
                    setStep("forgot-password");
                    router.push("/auth?step=forgot-password");
                  }
                }}
                className="absolute top-6 left-6 text-muted-foreground hover:text-foreground transition-colors p-1"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>

              <div className="text-center space-y-1">
                <h1 className="text-2xl font-bold tracking-tight">Verify Your Email</h1>
                <p className="text-xs text-muted-foreground">
                  Enter the 5-digit verification code sent to{" "}
                  <span className="font-semibold text-foreground">{displayEmail}</span>
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex justify-center space-x-2.5">
                  {formData.otp.map((digit, index) => (
                    <Input
                      key={index}
                      id={`otp-${index}`}
                      type="text"
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      className="w-12 h-12 text-center text-xl font-bold rounded-xl font-mono"
                      maxLength={1}
                    />
                  ))}
                </div>

                <Button
                  type="submit"
                  disabled={isLoading || formData.otp.some((d) => !d)}
                  className="w-full h-11 rounded-xl font-semibold transition-all duration-200"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    "Verify Code & Sign In"
                  )}
                </Button>
              </form>

              <div className="flex items-center justify-between text-xs pt-2">
                <button
                  type="button"
                  disabled={isResending}
                  onClick={handleResendOtp}
                  className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                >
                  {isResending ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <RotateCw className="w-3.5 h-3.5" />
                  )}
                  Resend code
                </button>
                <button
                  type="button"
                  onClick={resetToLogin}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Back to login
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

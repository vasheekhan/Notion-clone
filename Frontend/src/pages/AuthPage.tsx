import { useState } from "react";
import Hero from "../components/auth/Hero/Hero";
import LoginForm from "../components/auth/LoginForm/LoginForm";
import SignupForm from "../components/auth/SignupForm";
import OTPVerification from "../components/auth/OTPVerification";
import SuccessScreen from "../components/auth/SuccessScreen";
import ForgotPasswordForm from "../components/auth/ForgotPasswordForm";
import ResetPasswordForm from "../components/auth/ResetPasswordForm";
import ThemeToggle from "../components/auth/ThemeToggle";

export default function AuthPage() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [signupEmail, setSignupEmail] = useState("");
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");

  const [view, setView] = useState<
    "login" | "signup" | "otp" | "success" | "forgot-password" | "reset-password" | "password-reset-success"
  >("login");

  return (
    <div className={`stage theme-${theme}`}>
      <ThemeToggle theme={theme} setTheme={setTheme} />

      <Hero />

      <div className="panel-right">
        <div className="auth-card">
          {view === "login" && (
            <LoginForm
              gotoSignup={() => setView("signup")}
              gotoForgotPassword={() => setView("forgot-password")}
            />
          )}

          {view === "signup" && (
            <SignupForm
              gotoLogin={() => setView("login")}
              gotoOTP={() => setView("otp")}
              setSignupEmail={setSignupEmail}
            />
          )}

          {view === "otp" && (
            <OTPVerification
              email={signupEmail}
              gotoSignup={() => setView("signup")}
              gotoSuccess={() => setView("success")}
            />
          )}

          {view === "forgot-password" && (
            <ForgotPasswordForm
              onBack={() => setView("login")}
              onSuccess={(email) => {
                setForgotPasswordEmail(email);
                setView("reset-password");
              }}
            />
          )}

          {view === "reset-password" && (
            <ResetPasswordForm
              email={forgotPasswordEmail}
              onBack={() => setView("forgot-password")}
              onSuccess={() => setView("password-reset-success")}
            />
          )}

          {view === "password-reset-success" && (
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>✅</div>
              <h2 className="title">Password reset successful!</h2>
              <p style={{ 
                color: "var(--text-secondary)", 
                marginBottom: "2rem",
                lineHeight: "1.5"
              }}>
                Your password has been successfully reset. You can now log in with your new password.
              </p>
              <button
                className="btn btn-primary"
                onClick={() => setView("login")}
              >
                Back to login
              </button>
            </div>
          )}

          {view === "success" && (
            <SuccessScreen restart={() => setView("login")} />
          )}
        </div>
      </div>
    </div>
  );
}
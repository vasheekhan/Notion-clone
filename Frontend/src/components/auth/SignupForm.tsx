import { useState } from "react";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
} from "lucide-react";
import Field from "./Field";
import Divider from "./Divider";
import GoogleButton from "./GoogleButton";
import { registerUser } from "../../services/auth.service";
import { useToastContext } from "../../context/ToastContext";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface SignupFormProps {
  gotoLogin: () => void;
  gotoOTP: () => void;
  setSignupEmail: (email: string) => void;
}

interface Errors {
  name?: string;
  email?: string;
  password?: string;
  general?: string;
}

export default function SignupForm({
  gotoLogin,
  gotoOTP,
  setSignupEmail,
}: SignupFormProps) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Errors>({});

  const { success, error: showError } = useToastContext();

  function validate() {
    const e: Errors = {};

    if (!email) {
      e.email = "Enter your email.";
    } else if (!emailRegex.test(email)) {
      e.email = "Invalid email address.";
    }

    if (!name.trim()) {
      e.name = "Enter your full name.";
    } else if (name.trim().length < 3) {
      e.name = "Name must be at least 3 characters.";
    }

    if (!password) {
      e.password = "Enter your password.";
    } else if (password.length < 8) {
      e.password = "Password should contain at least 8 characters.";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSignup(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!validate()) return;

    setLoading(true);
    setErrors({});

    try {
      const response = await registerUser({
        name: name.trim(),
        email,
        password,
      });

      // Success - proceed to OTP verification
      success("Account Created!", "Please check your email for the verification code.");
      setSignupEmail(email);
      gotoOTP();

    } catch (error: any) {
      const errorMessage = error.response?.data?.message || "Registration failed.";

      // Handle specific error types
      if (errorMessage.toLowerCase().includes("email already exists") || 
          errorMessage.toLowerCase().includes("user already exists")) {
        setErrors({
          email: "An account with this email already exists.",
          general: "This email is already registered. Please try logging in instead."
        });
        showError("Account Exists", "This email is already registered");
      } else if (errorMessage.toLowerCase().includes("invalid email")) {
        setErrors({ email: "Please enter a valid email address." });
        showError("Invalid Email", "Please check your email format");
      } else if (errorMessage.toLowerCase().includes("password")) {
        setErrors({ password: "Password doesn't meet requirements." });
        showError("Weak Password", errorMessage);
      } else if (errorMessage.toLowerCase().includes("name")) {
        setErrors({ name: "Please enter a valid name." });
        showError("Invalid Name", errorMessage);
      } else if (errorMessage.toLowerCase().includes("network")) {
        showError("Connection Error", "Please check your internet connection and try again.");
      } else {
        setErrors({ general: errorMessage });
        showError("Registration Failed", errorMessage);
      }
    } finally {
      setLoading(false);
    }
  }

  function handleGoogleSignup() {
    window.location.href = `${import.meta.env.VITE_API_URL}/auth/google`;
  }

  return (
    <form onSubmit={handleSignup} noValidate>
      <h2 className="title">Create your Synapse account</h2>
      <p className="subtitle">
        Organize your thoughts. Build your second brain.
      </p>

      {errors.general && (
        <div className="error-banner">
          <AlertCircle size={16} />
          <span>{errors.general}</span>
        </div>
      )}

      <Field icon={User} label="Full Name" error={errors.name} index={0}>
        <input
          type="text"
          placeholder="John Doe"
          value={name}
          autoComplete="name"
          onChange={(e) => {
            setName(e.target.value);
            if (errors.name || errors.general) {
              setErrors({ ...errors, name: undefined, general: undefined });
            }
          }}
        />
      </Field>

      <Field icon={Mail} label="Email" error={errors.email} index={1}>
        <input
          type="email"
          placeholder="you@example.com"
          value={email}
          autoComplete="email"
          onChange={(e) => {
            setEmail(e.target.value);
            if (errors.email || errors.general) {
              setErrors({ ...errors, email: undefined, general: undefined });
            }
          }}
        />
      </Field>

      <Field icon={Lock} label="Password" error={errors.password} index={2}>
        <input
          type={showPassword ? "text" : "password"}
          placeholder="Minimum 8 characters"
          value={password}
          autoComplete="new-password"
          onChange={(e) => {
            setPassword(e.target.value);
            if (errors.password || errors.general) {
              setErrors({ ...errors, password: undefined, general: undefined });
            }
          }}
        />

        <button
          type="button"
          className="field-adorn"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>
      </Field>

      <button type="submit" className="btn btn-primary" disabled={loading}>
        {loading ? <Loader2 size={16} className="spin" /> : "Sign up"}
      </button>

      <Divider />

      <GoogleButton loading={loading} onClick={handleGoogleSignup} />

      <p className="switch">
        Already have an account? <a onClick={gotoLogin}>Log in</a>
      </p>
    </form>
  );
}
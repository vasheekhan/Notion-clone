import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { verifyRegister } from "../../services/auth.service";
interface OTPVerificationProps {
  email: string;
  gotoSignup: () => void;
  gotoSuccess: () => void;
}


export default function OTPVerification({
  email,
  gotoSignup,
  gotoSuccess,
}: OTPVerificationProps) {
  const [otp, setOtp] = useState([
    "",
    "",
    "",
    "",
    "",
    "",
  ]);

  const [loading, setLoading] =
    useState(false);

  const [resend, setResend] =
    useState(30);

  const otpRefs =
    useRef<HTMLInputElement[]>([]);

  useEffect(() => {
    if (resend <= 0) return;

    const timer = setInterval(() => {
      setResend((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [resend]);

  function handleChange(
    index: number,
    value: string
  ) {
    if (value && !/^[0-9]$/.test(value))
      return;

    const next = [...otp];

    next[index] = value;

    setOtp(next);

    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) {
    if (
      e.key === "Backspace" &&
      !otp[index] &&
      index > 0
    ) {
      otpRefs.current[index - 1]?.focus();
    }
  }

  function handlePaste(
    e: React.ClipboardEvent<HTMLDivElement>
  ) {
    const text =
      e.clipboardData.getData("text");

    if (/^\d{6}$/.test(text)) {
      e.preventDefault();

      setOtp(text.split(""));
    }
  }

async function verifyOTP() {
  if (otp.join("").length < 6) {
    alert("Enter complete OTP");
    return;
  }

  setLoading(true);

  try {
    const verifyResponse = await verifyRegister({
      email,
      otp: otp.join(""),
    });

    if (verifyResponse.success) {
      gotoSuccess();
    }
  } catch (error: any) {
    alert(
      error.response?.data?.message ||
      "OTP verification failed."
    );
  } finally {
    setLoading(false);
  }
}

  function resendOTP() {
    if (resend > 0) return;

    

    setResend(30);
  }

  return (
    <div>
      <button
        className="back"
        onClick={gotoSignup}
      >
        <ArrowLeft size={14} />
        Back
      </button>

      <h2 className="title">
        Verify your email
      </h2>

      <p className="subtitle">
        Enter the 6 digit code sent to
        your email.
      </p>

      <div
        className="otp-row"
        onPaste={handlePaste}
      >
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={(el) => {
              if (el)
                otpRefs.current[index] =
                  el;
            }}
            className="otp-box"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) =>
              handleChange(
                index,
                e.target.value
              )
            }
            onKeyDown={(e) =>
              handleKeyDown(index, e)
            }
          />
        ))}
      </div>

      <button
        className="btn btn-primary"
        onClick={verifyOTP}
        disabled={loading}
      >
        {loading ? (
          <Loader2
            size={16}
            className="spin"
          />
        ) : (
          "Verify Code"
        )}
      </button>

      <div className="resend-row">
        {resend > 0 ? (
          <span className="muted">
            Resend code in {resend}s
          </span>
        ) : (
          <a
            className="resend-link"
            onClick={resendOTP}
          >
            <RefreshCw size={12} />
            Resend Code
          </a>
        )}
      </div>
    </div>
  );
}
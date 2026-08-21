import { Check } from "lucide-react";

interface SuccessScreenProps {
  restart: () => void;
}

export default function SuccessScreen({
  restart,
}: SuccessScreenProps) {
  return (
    <div className="success">

      <div className="success-ring">
        <Check
          size={22}
          strokeWidth={3}
        />
      </div>

      <h2
        className="title"
        style={{ marginTop: 16 }}
      >
        You're in
      </h2>

      <p className="subtitle">
        Your account has been verified successfully.
        <br />
        Welcome to Synapse.
      </p>

      <button
        className="btn btn-primary"
        onClick={restart}
      >
        Continue
      </button>

    </div>
  );
}
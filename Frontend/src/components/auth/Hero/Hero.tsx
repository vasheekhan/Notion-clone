import SynapseLogo from "../SynapseLogo";
import Constellation from "../Constellation";

export default function Hero() {
  return (
    <section className="hero">
      {/* Brand */}
      <div className="hero-brand">
        <SynapseLogo size={26} />
        <span className="hero-word">synapse</span>
      </div>

      {/* Headline */}
      <h1 className="hero-headline">
        Every thought,
        <br />
        one connection
        <br />
        away.
      </h1>

      {/* Subtitle */}
      <p className="hero-sub">
        Capture ideas as fast as they arrive —
        Synapse links them for you.
      </p>

      {/* Floating Notes */}
      <Constellation />
    </section>
  );
}
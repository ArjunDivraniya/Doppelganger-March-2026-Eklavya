function BackgroundAnimation() {
  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: 0 }}
    >
      {/* Animated neon grid */}
      <div className="absolute inset-0 animated-grid" />

      {/* Radial fade — keeps grid subtle at edges */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 50% 40%, transparent 0%, #0b0f19 100%)",
        }}
      />

      {/* Core glow — blue, top-left */}
      <div
        className="absolute rounded-full"
        style={{
          top: "-20%",
          left: "-15%",
          width: 700,
          height: 700,
          background:
            "radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 65%)",
          animation: "float-slow 18s ease-in-out infinite",
          filter: "blur(40px)",
        }}
      />

      {/* Core glow — purple, bottom-right */}
      <div
        className="absolute rounded-full"
        style={{
          bottom: "-15%",
          right: "-10%",
          width: 600,
          height: 600,
          background:
            "radial-gradient(circle, rgba(167,139,250,0.06) 0%, transparent 65%)",
          animation: "float-slow 22s ease-in-out infinite reverse",
          filter: "blur(40px)",
        }}
      />

      {/* Core glow — green accent, mid-right */}
      <div
        className="absolute rounded-full"
        style={{
          top: "50%",
          right: "5%",
          width: 350,
          height: 350,
          background:
            "radial-gradient(circle, rgba(34,197,94,0.04) 0%, transparent 65%)",
          animation: "float-slow 15s ease-in-out 3s infinite",
          filter: "blur(30px)",
        }}
      />

      {/* Noise texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
}

export default BackgroundAnimation;

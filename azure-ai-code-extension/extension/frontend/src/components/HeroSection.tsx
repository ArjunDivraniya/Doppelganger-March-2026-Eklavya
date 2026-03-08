import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

const TYPEWRITER_TEXT = "Get intelligent Azure SDK code suggestions directly inside your editor.";

/* ── Official Azure "A" logo (matches the real Microsoft Azure icon) ── */
const AzureLogo = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 150 150" className={className} xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="azA1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#0078d4" />
        <stop offset="100%" stopColor="#005ba1" />
      </linearGradient>
      <linearGradient id="azA2" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#50e6ff" />
        <stop offset="50%" stopColor="#32bedd" />
        <stop offset="100%" stopColor="#198ab3" />
      </linearGradient>
      <linearGradient id="azA3" x1="0%" y1="100%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#0078d4" />
        <stop offset="100%" stopColor="#005ba1" />
      </linearGradient>
    </defs>
    {/* Left leg of "A" */}
    <path d="M25 130 L60 15 L80 15 L52 130 Z" fill="url(#azA1)" />
    {/* Right leg of "A" */}
    <path d="M70 15 L90 15 L125 130 L98 130 Z" fill="url(#azA2)" />
    {/* Crossbar */}
    <path d="M45 85 L105 85 L100 105 L50 105 Z" fill="url(#azA3)" />
  </svg>
);

/* ── Official VS Code logo (matches the real Visual Studio Code icon) ── */
const VSCodeLogo = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 256 256" className={className} xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="vsA" x1="50%" y1="0%" x2="50%" y2="100%">
        <stop offset="0%" stopColor="#32b5f1" />
        <stop offset="100%" stopColor="#2b9fed" />
      </linearGradient>
      <linearGradient id="vsB" x1="50%" y1="0%" x2="50%" y2="100%">
        <stop offset="0%" stopColor="#0078d4" />
        <stop offset="100%" stopColor="#0065bf" />
      </linearGradient>
    </defs>
    {/* Right panel */}
    <path d="M180.1 28.1L227.2 50.2V205.8L180.1 228L180.1 28.1Z" fill="url(#vsA)" />
    {/* Main body */}
    <path d="M180.1 28.1L104.1 100.2 52.5 59.8 28.8 69.9V186.1L52.5 196.2 104.1 155.8 180.1 228" fill="url(#vsB)" />
    {/* Inner left triangle */}
    <path d="M28.8 69.9V186.1L52.5 196.2V59.8L28.8 69.9Z" fill="#1a5fb4" opacity="0.8" />
    {/* Inner triangles for depth */}
    <path d="M180.1 28.1L104.1 100.2 52.5 59.8 180.1 28.1Z" fill="#32b5f1" opacity="0.3" />
    <path d="M180.1 228L104.1 155.8 52.5 196.2 180.1 228Z" fill="#0065bf" opacity="0.3" />
    {/* Centre left arrow shapes */}
    <path d="M71.9 161.5V94.5L121.6 128L71.9 161.5Z" fill="white" opacity="0.2" />
    <path d="M180.1 191.1L121 128L180.1 64.9V191.1Z" fill="white" opacity="0.15" />
  </svg>
);

/* Config for floating logos */
const FLOATING_LOGOS: {
  Logo: typeof AzureLogo;
  name: string;
  x: string; y: string; size: string;
  delay: number; dur: number; rotate: number;
}[] = [
  { Logo: AzureLogo,  name: "Azure",   x: "6%",  y: "14%", size: "w-28 h-28", delay: 0,   dur: 18, rotate: 8   },
  { Logo: VSCodeLogo, name: "VS Code", x: "83%", y: "10%", size: "w-24 h-24", delay: 2,   dur: 22, rotate: -6  },
  { Logo: AzureLogo,  name: "Azure",   x: "86%", y: "62%", size: "w-32 h-32", delay: 1,   dur: 20, rotate: 5   },
  { Logo: VSCodeLogo, name: "VS Code", x: "4%",  y: "68%", size: "w-22 h-22", delay: 3,   dur: 16, rotate: -8  },
  { Logo: AzureLogo,  name: "Azure",   x: "44%", y: "82%", size: "w-20 h-20", delay: 4,   dur: 24, rotate: 4   },
  { Logo: VSCodeLogo, name: "VS Code", x: "28%", y: "6%",  size: "w-18 h-18", delay: 1.5, dur: 20, rotate: -5  },
  { Logo: AzureLogo,  name: "Azure",   x: "66%", y: "84%", size: "w-18 h-18", delay: 2.5, dur: 19, rotate: 6   },
  { Logo: VSCodeLogo, name: "VS Code", x: "62%", y: "4%",  size: "w-16 h-16", delay: 0.5, dur: 17, rotate: -7  },
];

/* ── Hoverable floating logo wrapper ── */
function FloatingLogo({ item, index }: { item: typeof FLOATING_LOGOS[0]; index: number }) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      key={index}
      className="absolute pointer-events-auto cursor-pointer group"
      style={{ left: item.x, top: item.y }}
      initial={{ opacity: 0, scale: 0.7, rotate: 0 }}
      animate={{
        opacity: [0.1, 0.18, 0.12, 0.18, 0.1],
        scale: [0.9, 1, 0.95, 1, 0.9],
        y: [0, -14, 0, 14, 0],
        rotate: [0, item.rotate, 0, -item.rotate, 0],
      }}
      transition={{
        duration: item.dur,
        delay: item.delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      whileHover={{
        opacity: 0.7,
        scale: 1.3,
        rotate: 0,
        filter: "drop-shadow(0 0 20px rgba(59,130,246,0.7)) drop-shadow(0 0 50px rgba(59,130,246,0.35))",
        transition: { duration: 0.3, ease: "easeOut" },
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <item.Logo className={`${item.size} transition-all duration-300`} />
      {/* Name label on hover */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.85 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="absolute left-1/2 -translate-x-1/2 -bottom-7 whitespace-nowrap px-2.5 py-1 rounded-md bg-gray-900/90 border border-blue-500/30 backdrop-blur-sm"
          >
            <span className="text-[11px] font-semibold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              {item.name}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function HeroSection() {
  const [displayed, setDisplayed] = useState("");
  const [cursorVisible, setCursorVisible] = useState(true);

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      if (i < TYPEWRITER_TEXT.length) {
        setDisplayed(TYPEWRITER_TEXT.slice(0, i + 1));
        i++;
      } else {
        clearInterval(interval);
      }
    }, 35);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const blink = setInterval(() => setCursorVisible((v) => !v), 530);
    return () => clearInterval(blink);
  }, []);

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 overflow-hidden">
      {/* Animated background grid */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(59,130,246,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(59,130,246,0.04)_1px,transparent_1px)] bg-[size:60px_60px]" />
        {/* Glowing orbs */}
        <motion.div
          className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-blue-500/10 blur-[120px]"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-cyan-500/10 blur-[100px]"
          animate={{ scale: [1.1, 1, 1.1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* ── Floating Azure & VS Code logos ── */}
        {FLOATING_LOGOS.map((item, i) => (
          <FloatingLogo key={i} item={item} index={i} />
        ))}
      </div>

      <motion.div
        className="relative z-10"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        {/* Badge */}
        <motion.div
          className="inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-sm text-blue-300 mb-8 backdrop-blur-sm"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-500" />
          </span>
          VS Code Extension — Powered by Azure AI
        </motion.div>

        {/* Title */}
        <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white leading-tight">
          Azure AI Assistant
          <br />
          <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
            for VS Code
          </span>
        </h1>

        {/* Typewriter subtitle */}
        <p className="mt-6 text-lg sm:text-xl text-gray-400 max-w-2xl mx-auto font-mono h-8">
          {displayed}
          <span className={`${cursorVisible ? "opacity-100" : "opacity-0"} text-blue-400 transition-opacity duration-100`}>
            |
          </span>
        </p>

        {/* CTA Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
          <motion.a
            href="#how-it-works"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold text-base shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-shadow"
          >
            See How It Works
          </motion.a>
          <motion.a
            href="#features"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            className="px-8 py-3.5 rounded-xl border border-gray-700 bg-white/5 text-gray-300 font-semibold text-base hover:bg-white/10 hover:border-gray-600 transition-colors backdrop-blur-sm"
          >
            View Features
          </motion.a>
        </div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-10 z-10"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </motion.div>
    </section>
  );
}

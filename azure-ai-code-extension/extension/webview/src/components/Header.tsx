import { motion } from "framer-motion";
import { Zap } from "lucide-react";

function Header() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="relative shrink-0"
      style={{
        background: "rgba(17,24,39,0.85)",
        backdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      {/* Top accent gradient line */}
      <div
        className="absolute top-0 left-0 right-0 h-[1px] border-glow"
        style={{
          background:
            "linear-gradient(90deg, transparent 5%, #3b82f6 35%, #a78bfa 65%, transparent 95%)",
        }}
      />

      <div className="px-6 py-5 flex items-center justify-between">
        {/* Left — Logo + Titles */}
        <div className="flex items-center gap-4">
          {/* Icon container with glow */}
          <motion.div
            whileHover={{ scale: 1.06 }}
            className="relative w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{
              background:
                "linear-gradient(135deg, rgba(59,130,246,0.15) 0%, rgba(167,139,250,0.1) 100%)",
              border: "1px solid rgba(59,130,246,0.25)",
              boxShadow: "0 0 20px rgba(59,130,246,0.12)",
            }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M10 2L17 15H3L10 2Z"
                stroke="#3b82f6"
                strokeWidth="1.5"
                strokeLinejoin="round"
                fill="none"
              />
              <path
                d="M6.5 11.5H13.5"
                stroke="#60a5fa"
                strokeWidth="1"
                strokeLinecap="round"
              />
            </svg>
            {/* Live dot */}
            <span
              className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full status-pulse"
              style={{
                background: "#22c55e",
                border: "2px solid #0b0f19",
              }}
            />
          </motion.div>

          <div>
            <h1
              className="text-lg font-bold tracking-tight leading-none gradient-text"
            >
              Azure AI Assistant
            </h1>
            <p
              className="text-xs mt-1.5 font-medium"
              style={{ color: "#9ca3af" }}
            >
              Intelligent SDK Suggestions
            </p>
          </div>
        </div>

        {/* Right — RAG Status */}
        <motion.div
          whileHover={{ scale: 1.04 }}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full cursor-default"
          style={{
            background: "rgba(34,197,94,0.06)",
            border: "1px solid rgba(34,197,94,0.15)",
          }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full status-pulse"
            style={{ background: "#22c55e" }}
          />
          <Zap size={11} style={{ color: "#22c55e" }} />
          <span
            className="text-[10px] font-semibold uppercase tracking-widest"
            style={{ color: "#22c55e" }}
          >
            RAG Connected
          </span>
        </motion.div>
      </div>
    </motion.header>
  );
}

export default Header;

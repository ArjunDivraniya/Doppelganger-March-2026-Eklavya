import { motion } from "framer-motion";
import { Search, Database, Cpu, Loader2 } from "lucide-react";

const steps = [
  {
    icon: Search,
    label: "Analyzing code context",
    description: "Extracting identifiers & imports",
    color: "#60a5fa",
    delay: 0,
  },
  {
    icon: Database,
    label: "Fetching Azure SDK docs",
    description: "Querying ChromaDB embeddings",
    color: "#a78bfa",
    delay: 0.2,
  },
  {
    icon: Cpu,
    label: "Generating suggestions",
    description: "LLaMA 3 · Groq inference",
    color: "#34d399",
    delay: 0.4,
  },
];

function LoadingState() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center py-16 px-6 gap-10"
    >
      {/* Spinner with pulse rings */}
      <div className="relative flex items-center justify-center">
        <span
          className="absolute w-20 h-20 rounded-full pulse-ring"
          style={{ background: "rgba(59,130,246,0.08)" }}
        />
        <span
          className="absolute w-14 h-14 rounded-full pulse-ring"
          style={{
            background: "rgba(167,139,250,0.06)",
            animationDelay: "0.7s",
          }}
        />
        <div
          className="relative w-12 h-12 rounded-2xl flex items-center justify-center"
          style={{
            background:
              "linear-gradient(135deg, rgba(59,130,246,0.12), rgba(167,139,250,0.08))",
            border: "1px solid rgba(59,130,246,0.2)",
            boxShadow: "0 0 30px rgba(59,130,246,0.12)",
          }}
        >
          <Loader2 size={20} className="spin" style={{ color: "#3b82f6" }} />
        </div>
      </div>

      {/* Title + subtitle */}
      <div className="text-center">
        <p className="text-base font-semibold gradient-text">
          Analyzing Your Code
        </p>
        <p className="text-xs mt-2 font-medium" style={{ color: "#4b5563" }}>
          RAG pipeline active
        </p>
        {/* Bouncing dots */}
        <div className="flex items-center justify-center gap-1.5 mt-3">
          <span
            className="w-1.5 h-1.5 rounded-full dot-1"
            style={{ background: "#3b82f6" }}
          />
          <span
            className="w-1.5 h-1.5 rounded-full dot-2"
            style={{ background: "#a78bfa" }}
          />
          <span
            className="w-1.5 h-1.5 rounded-full dot-3"
            style={{ background: "#22c55e" }}
          />
        </div>
      </div>

      {/* Pipeline steps */}
      <div className="w-full max-w-sm flex flex-col gap-3">
        {steps.map((step, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              delay: step.delay + 0.3,
              duration: 0.5,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="glass-card flex items-center gap-3.5 px-4 py-3.5 rounded-xl"
          >
            {/* Icon */}
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
              style={{
                background: `${step.color}12`,
                border: `1px solid ${step.color}20`,
              }}
            >
              <step.icon size={14} style={{ color: step.color }} />
            </div>

            <div className="flex-1 min-w-0">
              <p
                className="text-[12px] font-medium truncate"
                style={{ color: "#e5e7eb" }}
              >
                {step.label}
              </p>
              <p
                className="text-[10px] mt-0.5 truncate"
                style={{ color: "#4b5563" }}
              >
                {step.description}
              </p>
            </div>

            {/* Tiny spinner */}
            <Loader2
              size={13}
              className="spin shrink-0"
              style={{ color: step.color, opacity: 0.6 }}
            />
          </motion.div>
        ))}
      </div>

      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        onClick={() => {
          // This sends a message that the parent iframe (extension.ts) listens for
          window.parent.postMessage({ type: "retry" }, "*");
        }}
        className="px-6 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-wider transition-all hover:scale-105 active:scale-95"
        style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.08)",
          color: "#6b7280",
          cursor: "pointer",
        }}
      >
        Taking too long? Trigger Manual Fetch
      </motion.button>
    </motion.div>
  );
}

export default LoadingState;

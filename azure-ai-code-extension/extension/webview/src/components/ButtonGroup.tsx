import { motion } from "framer-motion";
import { CheckCircle2, X, CornerDownLeft } from "lucide-react";

interface ButtonGroupProps {
  onInsert: () => void;
  onIgnore: () => void;
  inserted: boolean;
}

function ButtonGroup({ onInsert, onIgnore, inserted }: ButtonGroupProps) {
  if (inserted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center gap-2.5 py-1"
      >
        <div
          className="w-6 h-6 rounded-full flex items-center justify-center"
          style={{
            background: "rgba(34,197,94,0.12)",
            boxShadow: "0 0 12px rgba(34,197,94,0.15)",
          }}
        >
          <CheckCircle2 size={13} style={{ color: "#22c55e" }} />
        </div>
        <span
          className="text-[12px] font-medium"
          style={{ color: "#22c55e" }}
        >
          Inserted into editor
        </span>
      </motion.div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      {/* Primary — Insert Code */}
      <motion.button
        whileHover={{
          scale: 1.03,
          boxShadow: "0 0 24px rgba(59,130,246,0.4), 0 4px 12px rgba(59,130,246,0.2)",
        }}
        whileTap={{ scale: 0.96 }}
        onClick={onInsert}
        className="flex items-center gap-2 px-5 py-2 rounded-lg text-[12px] font-semibold text-white transition-all duration-200 cursor-pointer"
        style={{
          background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
          boxShadow: "0 2px 10px rgba(59,130,246,0.25), inset 0 1px 0 rgba(255,255,255,0.1)",
        }}
      >
        <CornerDownLeft size={13} />
        Insert Code
      </motion.button>

      {/* Secondary — Ignore */}
      <motion.button
        whileHover={{
          scale: 1.03,
          backgroundColor: "rgba(255,255,255,0.06)",
        }}
        whileTap={{ scale: 0.96 }}
        onClick={onIgnore}
        className="flex items-center gap-2 px-5 py-2 rounded-lg text-[12px] font-medium transition-all duration-200 cursor-pointer"
        style={{
          border: "1px solid rgba(255,255,255,0.1)",
          color: "#9ca3af",
          background: "rgba(255,255,255,0.02)",
        }}
      >
        <X size={13} />
        Ignore
      </motion.button>
    </div>
  );
}

export default ButtonGroup;

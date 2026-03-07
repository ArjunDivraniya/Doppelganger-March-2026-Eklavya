import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Layers } from "lucide-react";
import SuggestionCard, { type Suggestion } from "./SuggestionCard";

interface SuggestionPanelProps {
  suggestions: Suggestion[];
}

function SuggestionPanel({ suggestions }: SuggestionPanelProps) {
  const [ignoredIndexes, setIgnoredIndexes] = useState<number[]>([]);
  const [insertedIndexes, setInsertedIndexes] = useState<number[]>([]);

  const handleInsert = (index: number) => {
    navigator.clipboard.writeText(suggestions[index].code);
    setInsertedIndexes((prev) => [...prev, index]);
  };

  const handleIgnore = (index: number) => {
    setIgnoredIndexes((prev) => [...prev, index]);
  };

  const visible = suggestions.filter((_, i) => !ignoredIndexes.includes(i));
  const allDone = visible.length === 0 && suggestions.length > 0;

  return (
    <div className="flex flex-col gap-5">
      {/* Section header */}
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-1 h-5 rounded-full"
            style={{
              background: "linear-gradient(to bottom, #3b82f6, #a78bfa)",
            }}
          />
          <Layers size={13} style={{ color: "#3b82f6" }} />
          <span
            className="text-xs font-semibold uppercase tracking-widest"
            style={{ color: "#4b5563" }}
          >
            Suggestions
          </span>
        </div>

        <span
          className="text-[11px] font-medium px-3 py-1 rounded-full"
          style={{
            background: "rgba(59,130,246,0.06)",
            border: "1px solid rgba(59,130,246,0.12)",
            color: "#60a5fa",
          }}
        >
          {visible.length} of {suggestions.length}
        </span>
      </motion.div>

      {/* Cards */}
      <AnimatePresence mode="popLayout">
        {allDone ? (
          <motion.div
            key="done"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="glass-card flex flex-col items-center justify-center py-16 gap-5 rounded-2xl"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.15, type: "spring", stiffness: 200 }}
              className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{
                background: "rgba(34,197,94,0.08)",
                border: "1px solid rgba(34,197,94,0.15)",
                boxShadow: "0 0 30px rgba(34,197,94,0.1)",
              }}
            >
              <CheckCircle2 size={28} style={{ color: "#22c55e" }} />
            </motion.div>
            <div className="text-center">
              <p className="text-base font-semibold" style={{ color: "#e5e7eb" }}>
                All Done!
              </p>
              <p className="text-xs mt-1.5" style={{ color: "#4b5563" }}>
                All suggestions have been handled
              </p>
            </div>
          </motion.div>
        ) : (
          suggestions.map((suggestion, index) => {
            if (ignoredIndexes.includes(index)) return null;
            return (
              <motion.div
                key={index}
                layout
                exit={{
                  opacity: 0,
                  scale: 0.95,
                  x: -30,
                  transition: { duration: 0.25, ease: "easeIn" },
                }}
              >
                <SuggestionCard
                  suggestion={suggestion}
                  index={index}
                  inserted={insertedIndexes.includes(index)}
                  onInsert={handleInsert}
                  onIgnore={handleIgnore}
                />
              </motion.div>
            );
          })
        )}
      </AnimatePresence>
    </div>
  );
}

export default SuggestionPanel;
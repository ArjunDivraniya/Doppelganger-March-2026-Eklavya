import { motion } from "framer-motion";
import { Code2, Sparkles } from "lucide-react";
import CodeBlock from "./CodeBlock";
import ButtonGroup from "./ButtonGroup";

export interface Suggestion {
  code: string;
  sdk: string;
  language: string;
  line: number;
}

interface SuggestionCardProps {
  suggestion: Suggestion;
  index: number;
  inserted: boolean;
  onInsert: (index: number) => void;
  onIgnore: (index: number) => void;
}

function SuggestionCard({
  suggestion,
  index,
  inserted,
  onInsert,
  onIgnore,
}: SuggestionCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      animate={{ opacity: inserted ? 0.5 : 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.5,
        delay: index * 0.08,
        ease: [0.16, 1, 0.3, 1],
      }}
      whileHover={{
        y: -4,
        transition: { duration: 0.25, ease: "easeOut" },
      }}
      className="glass-card relative rounded-2xl overflow-hidden group"
    >
      {/* Top shimmer accent line */}
      <div
        className="absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, #3b82f6 25%, #a78bfa 50%, #22c55e 75%, transparent 100%)",
        }}
      />

      {/* Hover glow overlay */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at 50% 0%, rgba(59,130,246,0.06) 0%, transparent 60%)",
        }}
      />

      <div className="relative p-5">
        {/* Card header */}
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-3">
            {/* Azure icon */}
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              style={{
                background:
                  "linear-gradient(135deg, rgba(59,130,246,0.12) 0%, rgba(167,139,250,0.08) 100%)",
                border: "1px solid rgba(59,130,246,0.2)",
              }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M8 1.5L13.5 12.5H2.5L8 1.5Z"
                  stroke="#3b82f6"
                  strokeWidth="1.3"
                  strokeLinejoin="round"
                  fill="none"
                />
                <line
                  x1="5.5" y1="9" x2="10.5" y2="9"
                  stroke="#60a5fa"
                  strokeWidth="0.8"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <p
                  className="text-[13px] font-semibold leading-none"
                  style={{ color: "#e5e7eb" }}
                >
                  Azure SDK Suggestion
                </p>
                {/* AI badge */}
                <span
                  className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider"
                  style={{
                    background: "rgba(167,139,250,0.1)",
                    border: "1px solid rgba(167,139,250,0.2)",
                    color: "#a78bfa",
                  }}
                >
                  <Sparkles size={8} />
                  AI
                </span>
              </div>
              <code
                className="text-[11px] mt-1.5 block font-medium"
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  color: "#3b82f6",
                }}
              >
                {suggestion.sdk}
              </code>
            </div>
          </div>
        </div>

        {/* Meta pills */}
        <div className="flex items-center gap-2 mb-5">
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium"
            style={{
              background: "rgba(59,130,246,0.06)",
              border: "1px solid rgba(59,130,246,0.12)",
              color: "#60a5fa",
            }}
          >
            <Code2 size={11} />
            {suggestion.language}
          </div>
          <div
            className="px-2.5 py-1 rounded-lg text-[11px] font-medium"
            style={{
              background: "rgba(167,139,250,0.06)",
              border: "1px solid rgba(167,139,250,0.12)",
              color: "#a78bfa",
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            Line {suggestion.line}
          </div>
        </div>

        {/* Code block */}
        <div className="mb-5">
          <CodeBlock code={suggestion.code} />
        </div>

        {/* Action buttons */}
        <ButtonGroup
          inserted={inserted}
          onInsert={() => onInsert(index)}
          onIgnore={() => onIgnore(index)}
        />
      </div>
    </motion.div>
  );
}

export default SuggestionCard;

import { useState } from "react";
import { motion } from "framer-motion";
import { Copy, Check, Terminal } from "lucide-react";

interface CodeBlockProps {
  code: string;
}

function CodeBlock({ code }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className="relative rounded-lg overflow-hidden group/code"
      style={{
        background: "#020617",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      {/* Top bar — mini editor chrome */}
      <div
        className="flex items-center justify-between px-3.5 py-2"
        style={{
          background: "rgba(255,255,255,0.02)",
          borderBottom: "1px solid rgba(255,255,255,0.04)",
        }}
      >
        <div className="flex items-center gap-2">
          <Terminal size={10} style={{ color: "#4b5563" }} />
          <span
            className="text-[10px] font-medium"
            style={{ color: "#4b5563", fontFamily: "'JetBrains Mono', monospace" }}
          >
            suggestion.ts
          </span>
        </div>

        {/* Copy button — visible on hover */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-[10px] px-2 py-0.5 rounded-md transition-all duration-200 opacity-0 group-hover/code:opacity-100"
          style={{
            color: copied ? "#22c55e" : "#6b7280",
            background: copied ? "rgba(34,197,94,0.08)" : "rgba(255,255,255,0.04)",
            border: `1px solid ${copied ? "rgba(34,197,94,0.2)" : "rgba(255,255,255,0.06)"}`,
          }}
        >
          {copied ? (
            <>
              <Check size={10} />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy size={10} />
              <span>Copy</span>
            </>
          )}
        </motion.button>
      </div>

      {/* Code content with line number gutter */}
      <div className="flex">
        {/* Line number */}
        <div
          className="shrink-0 px-3 py-3 text-right select-none"
          style={{
            color: "#1e293b",
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: "12px",
            lineHeight: "1.8",
            borderRight: "1px solid rgba(255,255,255,0.03)",
          }}
        >
          1
        </div>

        {/* Code */}
        <div className="px-4 py-3 overflow-x-auto flex-1">
          <code
            className="text-[13px] leading-relaxed whitespace-pre"
            style={{
              fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
              color: "#a5d6ff",
              lineHeight: "1.8",
            }}
          >
            {code}
          </code>
        </div>
      </div>
    </div>
  );
}

export default CodeBlock;

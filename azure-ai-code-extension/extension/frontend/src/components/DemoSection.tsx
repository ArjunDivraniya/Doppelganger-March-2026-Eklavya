import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useCallback } from "react";

const INITIAL_LINES = [
  "import { BlobServiceClient } from '@azure/storage-blob';",
  "import { DefaultAzureCredential } from '@azure/identity';",
  "",
  "const credential = new DefaultAzureCredential();",
];

const TYPING_LINE = "const blobServiceCl";

const GHOST_LINES = [
  "ient = new BlobServiceClient(",
  "  process.env.AZURE_STORAGE_CONNECTION_STRING,",
  "  credential",
  ");",
];

const ACCEPTED_FULL_LINES = [
  "const blobServiceClient = new BlobServiceClient(",
  "  process.env.AZURE_STORAGE_CONNECTION_STRING,",
  "  credential",
  ");",
];

export default function DemoSection() {
  const [showGhost, setShowGhost] = useState(false);
  const [accepted, setAccepted] = useState(false);
  const [cursorBlink, setCursorBlink] = useState(true);
  const [showAcceptFlash, setShowAcceptFlash] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowGhost(true), 1200);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const blink = setInterval(() => setCursorBlink((v) => !v), 530);
    return () => clearInterval(blink);
  }, []);

  const handleAccept = useCallback(() => {
    if (accepted || !showGhost) return;
    setAccepted(true);
    setShowAcceptFlash(true);
    setTimeout(() => setShowAcceptFlash(false), 800);
  }, [accepted, showGhost]);

  const handleReset = useCallback(() => {
    setAccepted(false);
    setShowGhost(false);
    setTimeout(() => setShowGhost(true), 1200);
  }, []);

  // Keyboard listener for real TAB press
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Tab" && showGhost && !accepted) {
        e.preventDefault();
        handleAccept();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showGhost, accepted, handleAccept]);

  const allCodeLines = accepted
    ? [...INITIAL_LINES, ...ACCEPTED_FULL_LINES]
    : INITIAL_LINES;

  return (
    <section id="demo" className="relative py-28 px-6">
      {/* Heading */}
      <motion.div
        className="text-center mb-16"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-3xl sm:text-4xl font-bold text-white">
          See It{" "}
          <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            In Action
          </span>
        </h2>
        <p className="mt-4 text-gray-400 max-w-xl mx-auto">
          Watch how inline suggestions appear as you type Azure SDK code.
        </p>
      </motion.div>

      {/* VS Code mock */}
      <motion.div
        className="max-w-3xl mx-auto"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.7 }}
      >
        <div className={`rounded-2xl border overflow-hidden shadow-2xl transition-colors duration-500 ${showAcceptFlash ? "border-green-500/50 shadow-green-500/10" : "border-gray-800 shadow-blue-500/5"}`}>
          {/* Title bar */}
          <div className="flex items-center gap-2 px-4 py-3 bg-gray-900 border-b border-gray-800">
            <div className="flex gap-1.5">
              <span className="w-3 h-3 rounded-full bg-red-500/80" />
              <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <span className="w-3 h-3 rounded-full bg-green-500/80" />
            </div>
            <span className="ml-3 text-xs text-gray-500 font-mono">azureBlob.ts — Azure AI Assist</span>
            <span className="ml-auto text-[10px] text-gray-600 font-mono">TypeScript</span>
          </div>

          {/* Editor body */}
          <div className="bg-[#0d1117] p-5 font-mono text-sm leading-7 min-h-[280px] relative">
            {/* Green flash overlay on accept */}
            <AnimatePresence>
              {showAcceptFlash && (
                <motion.div
                  className="absolute inset-0 bg-green-500/5 pointer-events-none z-10"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                />
              )}
            </AnimatePresence>

            {/* Existing code lines */}
            {allCodeLines.map((line, i) => (
              <div key={`line-${i}-${accepted}`} className="flex">
                <span className="w-8 text-right text-gray-600 select-none mr-4 text-xs leading-7">
                  {i + 1}
                </span>
                <motion.span
                  className={`text-gray-300 ${accepted && i >= INITIAL_LINES.length ? "" : ""}`}
                  initial={accepted && i >= INITIAL_LINES.length ? { opacity: 0, x: -4 } : false}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: (i - INITIAL_LINES.length) * 0.05 }}
                >
                  {line}
                </motion.span>
              </div>
            ))}

            {/* Typing line with ghost (only before acceptance) */}
            {!accepted && (
              <div className="flex">
                <span className="w-8 text-right text-gray-600 select-none mr-4 text-xs leading-7">
                  {INITIAL_LINES.length + 1}
                </span>
                <span className="text-gray-300">
                  {TYPING_LINE}
                  <span className={`${cursorBlink ? "opacity-100" : "opacity-0"} text-blue-400 transition-opacity duration-100`}>
                    |
                  </span>
                  {showGhost && (
                    <motion.span
                      className="text-gray-600 italic"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.5 }}
                      transition={{ duration: 0.6 }}
                    >
                      {GHOST_LINES[0]}
                    </motion.span>
                  )}
                </span>
              </div>
            )}

            {/* Ghost continuation lines (only before acceptance) */}
            {!accepted && showGhost &&
              GHOST_LINES.slice(1).map((gl, j) => (
                <motion.div
                  key={`ghost-${j}`}
                  className="flex"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.5 }}
                  transition={{ duration: 0.5, delay: 0.15 * (j + 1) }}
                >
                  <span className="w-8 text-right text-gray-700 select-none mr-4 text-xs leading-7">
                    {INITIAL_LINES.length + 2 + j}
                  </span>
                  <span className="text-gray-600 italic font-mono">{gl}</span>
                </motion.div>
              ))}

            {/* Cursor at end after acceptance */}
            {accepted && (
              <div className="flex">
                <span className="w-8 text-right text-gray-600 select-none mr-4 text-xs leading-7">
                  {allCodeLines.length + 1}
                </span>
                <span className={`${cursorBlink ? "opacity-100" : "opacity-0"} text-blue-400 transition-opacity duration-100`}>
                  |
                </span>
              </div>
            )}
          </div>

          {/* Status bar */}
          <div className={`flex items-center justify-between px-4 py-1.5 text-white text-[11px] transition-colors duration-500 ${accepted ? "bg-green-600" : "bg-blue-600"}`}>
            <div className="flex items-center gap-3">
              <span>{accepted ? "✅ Azure AI: Snippet Inserted" : "⚡ Azure AI: ✓ Ready"}</span>
              <span className="opacity-60">|</span>
              <span className="opacity-80">Blob Storage detected</span>
            </div>
            <div className="flex items-center gap-3 opacity-80">
              <span>Ln {accepted ? allCodeLines.length : 5}, Col {accepted ? 3 : 19}</span>
              <span>TypeScript</span>
              <span>UTF-8</span>
            </div>
          </div>
        </div>

        {/* TAB button / Reset button */}
        <div className="mt-6 text-center">
          <AnimatePresence mode="wait">
            {!accepted && showGhost && (
              <motion.div
                key="tab-hint"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4 }}
                className="inline-flex flex-col items-center gap-3"
              >
                <span className="text-sm text-gray-500">
                  Press TAB or click the button to accept
                </span>
                <motion.button
                  onClick={handleAccept}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold text-sm shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-shadow cursor-pointer"
                >
                  <kbd className="px-2 py-0.5 rounded-md bg-white/15 text-xs font-mono">TAB</kbd>
                  Accept Suggestion
                </motion.button>
              </motion.div>
            )}

            {accepted && (
              <motion.div
                key="accepted-msg"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4 }}
                className="inline-flex flex-col items-center gap-3"
              >
                <span className="inline-flex items-center gap-2 text-sm text-green-400 font-medium">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Suggestion accepted and inserted!
                </span>
                <motion.button
                  onClick={handleReset}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-700 bg-white/5 text-gray-300 font-semibold text-sm hover:bg-white/10 hover:border-gray-600 transition-colors backdrop-blur-sm cursor-pointer"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
                  </svg>
                  Try Again
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </section>
  );
}

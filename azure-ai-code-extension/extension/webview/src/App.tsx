import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import "./App.css";
import Header from "./components/Header";
import SuggestionPanel from "./components/SuggestionPanel";
import LoadingState from "./components/LoadingState";
import BackgroundAnimation from "./components/BackgroundAnimation";
import { type Suggestion } from "./components/SuggestionCard";
import { Cpu, Sparkles } from "lucide-react";

function App() {
  const [suggestions, setSuggestions] = useState<Suggestion[] | null>(null);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const message = event.data;
      if (message.type === "suggestion") {
        setSuggestions([
          {
            sdk: message.service,
            language: "TypeScript",
            line: 0,
            code: message.suggestion,
          },
        ]);
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  return (
    <div className="relative min-h-screen flex flex-col" style={{ background: "#0b0f19" }}>
      {/* Animated background layer */}
      <BackgroundAnimation />

      {/* Content layer */}
      <div className="relative flex flex-col min-h-screen" style={{ zIndex: 1 }}>
        <Header />

        <main className="flex-1 overflow-y-auto px-6 py-8">
          <div className="max-w-2xl mx-auto flex flex-col gap-6">
            {suggestions ? (
              <SuggestionPanel suggestions={suggestions} />
            ) : (
              <LoadingState />
            )}
          </div>
        </main>

        {/* Premium status bar footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          className="shrink-0 flex items-center justify-between px-6 py-2"
          style={{
            background: "rgba(17,24,39,0.9)",
            backdropFilter: "blur(12px)",
            borderTop: "1px solid rgba(255,255,255,0.04)",
          }}
        >
          <div className="flex items-center gap-2.5">
            <span
              className="w-1.5 h-1.5 rounded-full status-pulse"
              style={{ background: "#22c55e" }}
            />
            <span className="text-[11px] font-medium" style={{ color: "#4b5563" }}>
              Azure AI Assistant
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5" style={{ color: "#4b5563" }}>
              <Sparkles size={10} />
              <span className="text-[10px] font-medium">v1.0.0</span>
            </div>
            <div className="flex items-center gap-1.5" style={{ color: "#4b5563" }}>
              <Cpu size={10} />
              <span className="text-[10px] font-medium">RAG · Groq · LLaMA 3</span>
            </div>
          </div>
        </motion.footer>
      </div>
    </div>
  );
}

export default App;
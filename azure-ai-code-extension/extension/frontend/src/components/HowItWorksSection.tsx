import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Hand, Zap, Search, Code } from "lucide-react";

const STEPS = [
  {
    icon: <Code className="w-6 h-6" />,
    title: "1. You Write Code",
    shortDescription: "Start typing Azure SDK imports or method calls.",
    longDescription:
      "As you work in your editor, the extension monitors your code for specific triggers, such as importing an Azure SDK library or calling a known Azure method. This process is lightweight and runs entirely in the background.",
    image: "/assets/overview-typing.png",
    color: "blue",
  },
  {
    icon: <Search className="w-6 h-6" />,
    title: "2. Context is Detected",
    shortDescription: "The extension identifies Azure-related patterns.",
    longDescription:
      "Using a combination of keyword matching and pattern recognition, the extension identifies the specific Azure service you're interacting with (e.g., Blob Storage, Cosmos DB). It analyzes the surrounding code to build a rich context for the AI.",
    image: "/assets/overview-suggestion.png",
    color: "cyan",
  },
  {
    icon: <Zap className="w-6 h-6" />,
    title: "3. AI Generates Suggestion",
    shortDescription: "Azure OpenAI returns a relevant code snippet.",
    longDescription:
      "The collected context is sent to a specialized Azure OpenAI model. Our RAG pipeline enhances this process by injecting relevant, up-to-date documentation, ensuring the generated code is accurate and follows best practices.",
    image: "/assets/feature-suggestion.png",
    color: "purple",
  },
  {
    icon: <Hand className="w-6 h-6" />,
    title: "4. You Accept or Ignore",
    shortDescription: "Press TAB to accept the inline suggestion.",
    longDescription:
      "The generated code appears as ghost text right at your cursor. You can accept it with a single keystroke (Tab) to instantly integrate it, or simply keep typing to ignore it. It's a seamless, non-intrusive workflow.",
    image: "/assets/overview-accept.png",
    color: "green",
  },
];

const colorMap: Record<string, { border: string; bg: string; text: string; shadow: string }> = {
  blue: { border: "border-blue-500", bg: "bg-blue-900/30", text: "text-blue-300", shadow: "shadow-blue-500/50" },
  cyan: { border: "border-cyan-500", bg: "bg-cyan-900/30", text: "text-cyan-300", shadow: "shadow-cyan-500/50" },
  purple: { border: "border-purple-500", bg: "bg-purple-900/30", text: "text-purple-300", shadow: "shadow-purple-500/50" },
  green: { border: "border-green-500", bg: "bg-green-900/30", text: "text-green-300", shadow: "shadow-green-500/50" },
};

const DetailPanel = ({ step, colors }: { step: (typeof STEPS)[0], colors: (typeof colorMap)[string] }) => (
  <motion.div
    className="w-1/2 px-4"
    initial={{ opacity: 0, x: -50 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -50 }}
    transition={{ duration: 0.4, ease: "easeInOut" }}
  >
    <div className="relative">
      <div className={`absolute -inset-4 rounded-3xl bg-gradient-to-b ${colors.bg} opacity-20 blur-2xl`} />
      <div className={`relative rounded-2xl border ${colors.border} bg-gray-900/70 backdrop-blur-md overflow-hidden`}>
        <img
          src={step.image}
          alt={step.title}
          className="w-full h-auto border-b border-gray-700"
        />
        <div className="p-6">
          <p className="text-gray-300 leading-relaxed">{step.longDescription}</p>
        </div>
      </div>
    </div>
  </motion.div>
);

export default function HowItWorksSection() {
  const [hoveredStep, setHoveredStep] = useState<number | null>(null);

  const activeStepData = hoveredStep !== null ? STEPS[hoveredStep] : null;
  const activeColors = activeStepData ? colorMap[activeStepData.color] : null;

  const showPanel = hoveredStep !== null;

  return (
    <section id="how-it-works" className="relative py-28 px-6 overflow-hidden">
      {/* Section heading */}
      <motion.div
        className="text-center mb-16"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-3xl sm:text-4xl font-bold text-white">
          How{" "}
          <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            Azure AI Assistant
          </span>{" "}
          Works
        </h2>
        <p className="mt-4 text-gray-400 max-w-xl mx-auto">
          An intuitive, four-step process that turns your keystrokes into production-ready Azure code.
        </p>
        <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-gray-800/50 border border-gray-700 px-3 py-1 text-xs text-cyan-400">
          <Hand className="w-3 h-3" />
          Hover over a step to see details
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto" onMouseLeave={() => setHoveredStep(null)}>
        <div className="flex justify-center items-start transition-all duration-500 ease-in-out">
          {/* Left Panel */}
          <AnimatePresence>
            {showPanel && activeStepData && activeColors && (
              <DetailPanel step={activeStepData} colors={activeColors} />
            )}
          </AnimatePresence>

          {/* Steps Column */}
          <motion.div
            layout
            className="flex flex-col gap-4"
            style={{ width: showPanel ? '50%' : '66.66%' }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          >
            {STEPS.map((s, i) => {
              const isActive = hoveredStep === i;
              const c = colorMap[s.color];
              return (
                <motion.div
                  key={i}
                  onMouseEnter={() => setHoveredStep(i)}
                  className={`p-6 rounded-xl border transition-all duration-300 cursor-pointer ${
                    isActive
                      ? `${c.border} ${c.bg} shadow-lg ${c.shadow}`
                      : "border-gray-800 bg-gray-900/50 hover:bg-gray-800/50"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${c.text} ${c.bg}`}>
                      {s.icon}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">{s.title}</h3>
                      <p className="text-sm text-gray-400">{s.shortDescription}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
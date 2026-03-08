import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

const OVERVIEW_STEPS = [
  {
    title: "1. Install from VS Code Marketplace",
    description:
      "Open VS Code, go to the Extensions view, search for 'Azure AI Assist', and click Install. Reload the editor to activate it.",
    image: "/assets/overview-install.png",
    details: [
      "Quick and easy one-click installation.",
      "Seamlessly integrates into your existing VS Code setup.",
      "Automatically activates on supported file types.",
    ],
  },
  {
    title: "2. Start Typing Azure SDK Code",
    description:
      "The extension automatically detects when you're working with Azure services. Just start typing code related to Blob Storage, Cosmos DB, etc.",
    image: "/assets/overview-typing.png",
    details: [
      "Context-aware detection of Azure SDKs and services.",
      "No special commands needed — it works in the background.",
      "Analyzes imports and keywords to understand your intent.",
    ],
  },
  {
    title: "3. Get Intelligent Inline Suggestions",
    description:
      "As you type, the AI assistant provides relevant code suggestions as ghost text, right at your cursor, just like GitHub Copilot.",
    image: "/assets/overview-suggestion.png",
    details: [
      "Real-time suggestions powered by Azure OpenAI.",
      "RAG-enhanced for higher accuracy and relevance.",
      "Reduces boilerplate and helps you discover SDK features.",
    ],
  },
  {
    title: "4. Accept with a Single Keystroke",
    description:
      "Happy with the suggestion? Simply press the TAB key to instantly accept and insert the code into your file.",
    image: "/assets/overview-accept.png",
    details: [
      "Frictionless workflow — no need to leave your keyboard.",
      "Intelligently formats and indents the inserted code.",
      "Boosts your coding speed and efficiency.",
    ],
  },
];

export default function OverviewSection() {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <section id="overview" className="relative py-28 px-6 bg-gray-950">
      <div className="max-w-6xl mx-auto">
        {/* Heading */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-white">
            A Seamless{" "}
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Workflow
            </span>
          </h2>
          <p className="mt-4 text-gray-400 max-w-2xl mx-auto">
            From installation to implementation in four simple steps. Understand how Azure AI Assist integrates into your development process.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left side: Step selectors */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7 }}
          >
            <div className="flex flex-col gap-4">
              {OVERVIEW_STEPS.map((step, index) => (
                <div
                  key={index}
                  onClick={() => setActiveStep(index)}
                  className={`p-6 rounded-xl border transition-all duration-300 cursor-pointer ${
                    activeStep === index
                      ? "bg-blue-500/10 border-blue-500/40 shadow-lg shadow-blue-500/10"
                      : "bg-gray-900/80 border-gray-800 hover:bg-gray-800/60 hover:border-gray-700"
                  }`}
                >
                  <h3 className={`text-lg font-semibold ${activeStep === index ? "text-blue-300" : "text-white"}`}>
                    {step.title}
                  </h3>
                  <p className="text-sm text-gray-400 mt-1.5">{step.description}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Right side: Image and details */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7 }}
            className="relative h-[450px]"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={activeStep}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
                className="w-full h-full flex flex-col"
              >
                {/* Image */}
                <div className="w-full h-64 rounded-xl border border-gray-800 overflow-hidden mb-6">
                  <img
                    src={OVERVIEW_STEPS[activeStep].image}
                    alt={OVERVIEW_STEPS[activeStep].title}
                    className="w-full h-full object-cover object-top"
                  />
                </div>
                {/* Details */}
                <div className="flex-1">
                  <ul className="space-y-3">
                    {OVERVIEW_STEPS[activeStep].details.map((detail, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <svg
                          className="w-5 h-5 mt-0.5 text-blue-400 shrink-0"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          strokeWidth={2.5}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-gray-400 text-sm">{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

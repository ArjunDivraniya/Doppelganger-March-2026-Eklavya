import { motion } from "framer-motion";

const STEPS = [
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
      </svg>
    ),
    title: "Developer Types Azure Code",
    description: "Start typing Azure SDK imports or method calls in your editor.",
    color: "blue",
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
      </svg>
    ),
    title: "Extension Detects Azure SDK",
    description: "The watcher identifies Azure-related imports, keywords, and file patterns.",
    color: "cyan",
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
      </svg>
    ),
    title: "AI Generates Inline Suggestion",
    description: "Azure OpenAI processes context and returns a relevant code snippet.",
    color: "purple",
  },
  {
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: "Accept with TAB",
    description: "Press TAB to insert the suggestion into your code instantly.",
    color: "green",
  },
];

const colorMap: Record<string, { border: string; bg: string; text: string; glow: string }> = {
  blue:   { border: "border-blue-500/30",   bg: "bg-blue-500/10",   text: "text-blue-400",   glow: "shadow-blue-500/20" },
  cyan:   { border: "border-cyan-500/30",   bg: "bg-cyan-500/10",   text: "text-cyan-400",   glow: "shadow-cyan-500/20" },
  purple: { border: "border-purple-500/30", bg: "bg-purple-500/10", text: "text-purple-400", glow: "shadow-purple-500/20" },
  green:  { border: "border-green-500/30",  bg: "bg-green-500/10",  text: "text-green-400",  glow: "shadow-green-500/20" },
};

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.2 } },
};

const cardVariant = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } },
};

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="relative py-28 px-6">
      {/* Section heading */}
      <motion.div
        className="text-center mb-16"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-3xl sm:text-4xl font-bold text-white">
          How It{" "}
          <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
            Works
          </span>
        </h2>
        <p className="mt-4 text-gray-400 max-w-xl mx-auto">
          From keystroke to suggestion in milliseconds — here's the flow.
        </p>
      </motion.div>

      {/* Steps */}
      <motion.div
        className="max-w-4xl mx-auto flex flex-col gap-0 items-center"
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.15 }}
      >
        {STEPS.map((step, i) => {
          const c = colorMap[step.color];
          return (
            <div key={i} className="flex flex-col items-center w-full">
              {/* Animated arrow connector */}
              {i > 0 && (
                <motion.div
                  className="flex flex-col items-center my-2"
                  initial={{ opacity: 0, scaleY: 0 }}
                  whileInView={{ opacity: 1, scaleY: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.15 }}
                >
                  <div className="w-px h-10 bg-gradient-to-b from-gray-700 to-gray-800" />
                  <svg className="w-4 h-4 text-blue-500 -mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </motion.div>
              )}

              {/* Card */}
              <motion.div
                variants={cardVariant}
                className={`w-full max-w-lg rounded-2xl border ${c.border} ${c.bg} backdrop-blur-sm p-6 flex items-start gap-5 shadow-lg ${c.glow} hover:shadow-xl transition-shadow`}
              >
                {/* Icon */}
                <div className={`shrink-0 mt-1 ${c.text}`}>{step.icon}</div>
                {/* Text */}
                <div>
                  <h3 className="text-lg font-semibold text-white">{step.title}</h3>
                  <p className="text-sm text-gray-400 mt-1 leading-relaxed">{step.description}</p>
                </div>
                {/* Step number */}
                <span className={`ml-auto shrink-0 text-xs font-mono ${c.text} opacity-60`}>
                  0{i + 1}
                </span>
              </motion.div>
            </div>
          );
        })}
      </motion.div>
    </section>
  );
}

import { motion } from "framer-motion";

const FEATURES = [
  {
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
      </svg>
    ),
    title: "Inline AI Suggestions",
    description: "Automatically suggest Azure SDK code while you type — ghost text appears right at your cursor, Copilot-style.",
    gradient: "from-blue-500 to-cyan-500",
    border: "hover:border-blue-500/50",
    glow: "group-hover:shadow-blue-500/10",
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z" />
      </svg>
    ),
    title: "Azure Context Detection",
    description: "Detects Azure services like Blob Storage, Cosmos DB, Key Vault, and more from your imports, keywords, and file patterns.",
    gradient: "from-cyan-500 to-teal-500",
    border: "hover:border-cyan-500/50",
    glow: "group-hover:shadow-cyan-500/10",
  },
  {
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
      </svg>
    ),
    title: "AI Powered Code Assistance",
    description: "Uses Azure OpenAI to generate relevant, context-aware Azure SDK code snippets — with RAG-enhanced accuracy.",
    gradient: "from-purple-500 to-blue-500",
    border: "hover:border-purple-500/50",
    glow: "group-hover:shadow-purple-500/10",
  },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.15 } },
};

const card = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" as const } },
};

export default function FeaturesSection() {
  return (
    <section id="features" className="relative py-28 px-6">
      {/* Heading */}
      <motion.div
        className="text-center mb-16"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-3xl sm:text-4xl font-bold text-white">
          Powerful{" "}
          <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
            Features
          </span>
        </h2>
        <p className="mt-4 text-gray-400 max-w-xl mx-auto">
          Everything you need for an intelligent Azure development experience.
        </p>
      </motion.div>

      {/* Cards */}
      <motion.div
        className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6"
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.15 }}
      >
        {FEATURES.map((f, i) => (
          <motion.div
            key={i}
            variants={card}
            className={`group relative rounded-2xl border border-gray-800 bg-gray-900/60 backdrop-blur-sm p-7 transition-all duration-300 ${f.border} hover:bg-gray-900/80 shadow-lg ${f.glow} hover:shadow-2xl cursor-default`}
          >
            {/* Icon circle */}
            <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${f.gradient} text-white mb-5 shadow-lg`}>
              {f.icon}
            </div>
            {/* Title */}
            <h3 className="text-lg font-semibold text-white mb-2">{f.title}</h3>
            {/* Description */}
            <p className="text-sm text-gray-400 leading-relaxed">{f.description}</p>
            {/* Subtle gradient border glow on hover */}
            <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${f.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500 pointer-events-none`} />
          </motion.div>
        ))}
      </motion.div>
    </section>
  );
}

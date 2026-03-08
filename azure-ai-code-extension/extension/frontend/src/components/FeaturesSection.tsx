import { motion } from "framer-motion";
import { CheckCircle } from "lucide-react";

const FEATURES = [
  {
    title: "Intelligent Inline Suggestions",
    description:
      "Stop searching for SDK examples. Get context-aware Azure code suggestions delivered directly in your editor as you type. It feels like magic.",
    details: [
      "Real-time, Copilot-style ghost text.",
      "Accept suggestions with a single keystroke.",
      "Powered by Azure OpenAI for relevance and accuracy.",
    ],
    image: "/image.png",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    title: "Automatic Azure Context Detection",
    description:
      "The extension intelligently understands your workspace, identifying Azure services and technologies to provide hyper-relevant assistance.",
    details: [
      "Detects Azure SDKs from your imports.",
      "Recognizes Azure-specific keywords and file patterns.",
      "Uses RAG to ground suggestions in your project's context.",
    ],
    image: "/image.png",
    gradient: "from-cyan-500 to-teal-500",
  },
  {
    title: "RAG-Enhanced Accuracy",
    description:
      "Our Retrieval-Augmented Generation pipeline ensures that suggestions aren't just generic—they're tailored to the specific Azure SDK versions and patterns you're using.",
    details: [
      "Reduces code hallucinations and errors.",
      "Provides suggestions based on up-to-date documentation.",
      "Improves relevance for complex or niche Azure services.",
    ],
    image: "/image.png",
    gradient: "from-purple-500 to-blue-500",
  },
];

const FeatureCard = ({ feature, index }: { feature: (typeof FEATURES)[0]; index: number }) => {
  const isReversed = index % 2 !== 0;

  const textVariants = {
    hidden: { opacity: 0, x: isReversed ? 50 : -50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: "easeOut" as const } },
  };

  const imageVariants = {
    hidden: { opacity: 0, x: isReversed ? -50 : 50 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.6, ease: "easeOut" as const } },
  };

  return (
    <div className={`flex flex-col md:flex-row items-center gap-12 ${isReversed ? "md:flex-row-reverse" : ""}`}>
      {/* Text Content */}
      <motion.div
        className="md:w-1/2"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={textVariants}
      >
        <h3
          className={`text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r ${feature.gradient} mb-3`}
        >
          {feature.title}
        </h3>
        <p className="text-gray-300 mb-6">{feature.description}</p>
        <ul className="space-y-3">
          {feature.details.map((detail, i) => (
            <li key={i} className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-cyan-400 mt-1 flex-shrink-0" />
              <span className="text-gray-400">{detail}</span>
            </li>
          ))}
        </ul>
      </motion.div>

      {/* Image */}
      <motion.div
        className="md:w-1/2"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={imageVariants}
      >
        <div className="relative">
          <div
            className={`absolute -inset-2 rounded-2xl bg-gradient-to-r ${feature.gradient} opacity-20 blur-2xl`}
          />
          <img
            src={feature.image}
            alt={feature.title}
            className="relative rounded-xl border border-gray-700 shadow-2xl"
          />
        </div>
      </motion.div>
    </div>
  );
};

export default function FeaturesSection() {
  return (
    <section id="features" className="relative py-28 px-6">
      {/* Heading */}
      <motion.div
        className="text-center mb-20"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-3xl sm:text-4xl font-bold text-white">
          An Intelligent{" "}
          <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
            Azure Experience
          </span>
        </h2>
        <p className="mt-4 text-gray-400 max-w-2xl mx-auto">
          Azure AI Assistant is more than just an extension—it's your dedicated partner for building on Azure, designed to make your development workflow faster, smarter, and more seamless.
        </p>
      </motion.div>

      {/* Feature Cards */}
      <div className="max-w-6xl mx-auto space-y-28">
        {FEATURES.map((feature, index) => (
          <FeatureCard key={index} feature={feature} index={index} />
        ))}
      </div>
    </section>
  );
}

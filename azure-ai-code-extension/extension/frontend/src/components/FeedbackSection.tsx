import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

const STAR_COUNT = 5;

// Mock reviews to show as examples
const MOCK_REVIEWS = [
  { name: "Aarav S.", rating: 5, text: "Blob Storage code was suggested perfectly — saved me 10 mins!", time: "2 min ago" },
  { name: "Priya M.", rating: 4, text: "Cosmos DB suggestion was accurate. Minor formatting fix needed.", time: "5 min ago" },
  { name: "Dev P.", rating: 5, text: "Key Vault integration suggested in one shot. Amazing!", time: "12 min ago" },
];

export default function FeedbackSection() {
  const [hoveredStar, setHoveredStar] = useState(0);
  const [selectedStar, setSelectedStar] = useState(0);
  const [feedbackText, setFeedbackText] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [reviews, setReviews] = useState(MOCK_REVIEWS);

  const handleSubmit = () => {
    if (selectedStar === 0) return;
    setReviews([
      { name: "You", rating: selectedStar, text: feedbackText || "Great suggestion!", time: "Just now" },
      ...reviews,
    ]);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setSelectedStar(0);
      setHoveredStar(0);
      setFeedbackText("");
    }, 3000);
  };

  return (
    <section id="feedback" className="relative py-28 px-6">
      <motion.div
        className="text-center mb-16 relative z-10"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-3xl sm:text-4xl font-bold text-white">
          User{" "}
          <span className="bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
            Feedback
          </span>
        </h2>
        <p className="mt-4 text-gray-400 max-w-xl mx-auto">
          After every inline suggestion, users can rate and review — helping the AI get smarter.
        </p>
      </motion.div>

      <div className="max-w-5xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left card — editor + feedback box (styled like other cards) */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
          className="rounded-2xl border border-gray-800 bg-gray-900/60 backdrop-blur-sm p-6 shadow-lg"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="flex gap-1.5">
              <span className="w-3 h-3 rounded-full bg-red-500/80" />
              <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <span className="w-3 h-3 rounded-full bg-green-500/80" />
            </div>
            <span className="ml-3 text-xs text-gray-400 font-mono">azureBlob.ts</span>
          </div>

          <div className="bg-[#0d1117] p-4 rounded-md font-mono text-sm leading-7 mb-4">
            <div className="flex">
              <span className="w-8 text-right text-gray-600 select-none mr-4 text-xs leading-7">5</span>
              <span className="text-gray-300">const blobServiceClient = new BlobServiceClient(</span>
            </div>
            <div className="flex">
              <span className="w-8 text-right text-gray-600 select-none mr-4 text-xs leading-7">6</span>
              <span className="text-gray-300">  process.env.AZURE_STORAGE_CONNECTION_STRING,</span>
            </div>
            <div className="flex">
              <span className="w-8 text-right text-gray-600 select-none mr-4 text-xs leading-7">7</span>
              <span className="text-gray-300">  credential</span>
            </div>
            <div className="flex">
              <span className="w-8 text-right text-gray-600 select-none mr-4 text-xs leading-7">8</span>
              <span className="text-gray-300">);</span>
            </div>
          </div>

          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-blue-300 font-semibold">⭐ Rate this suggestion</span>
              <span className="text-[10px] text-gray-500">Azure AI Assist</span>
            </div>

            <div className="flex gap-2 mb-3">
              {Array.from({ length: STAR_COUNT }).map((_, i) => (
                <button
                  key={i}
                  onMouseEnter={() => setHoveredStar(i + 1)}
                  onMouseLeave={() => setHoveredStar(0)}
                  onClick={() => setSelectedStar(i + 1)}
                  className="cursor-pointer focus:outline-none"
                >
                  <svg
                    className={`w-7 h-7 transition-colors duration-150 ${
                      i < (hoveredStar || selectedStar) ? "text-blue-400 fill-blue-400" : "text-gray-700 fill-transparent"
                    }`}
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
                    />
                  </svg>
                </button>
              ))}
              {selectedStar > 0 && <span className="ml-2 text-sm text-amber-400">{selectedStar}/5</span>}
            </div>

            <textarea
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              placeholder="Optional: Tell us about this suggestion..."
              rows={2}
              className="w-full bg-gray-900/80 border border-gray-800 rounded-lg px-3 py-2 text-xs text-gray-300 placeholder-gray-600 focus:outline-none focus:border-amber-500/50 resize-none transition-colors"
            />

            <div className="flex items-center justify-between mt-3">
              {!submitted ? (
                <button
                  onClick={handleSubmit}
                  disabled={selectedStar === 0}
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    selectedStar > 0
                      ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg"
                      : "bg-gray-800 text-gray-600 cursor-not-allowed"
                  }`}
                >
                  Submit Feedback
                </button>
              ) : (
                <span className="text-xs text-green-400 font-medium">✅ Thanks for your feedback!</span>
              )}
              <span className="text-[10px] text-gray-500">Feedback helps improve AI</span>
            </div>
          </div>
        </motion.div>

        {/* Right card — live reviews feed (styled like other cards) */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col"
        >
          <div className="rounded-2xl border border-gray-800 bg-gray-900/60 backdrop-blur-sm p-6 shadow-lg flex flex-col gap-4">
            <div>
              <h3 className="text-lg font-semibold text-white mb-1">Recent Reviews</h3>
              <p className="text-sm text-gray-500 mb-4">Live feedback from developers using the extension</p>
            </div>

            <div className="flex flex-col gap-3">
              {reviews.slice(0, 4).map((review, i) => (
                <div key={`${review.name}-${review.time}-${i}`} className="rounded-xl border border-gray-800 bg-gray-900/60 p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-[10px] font-bold text-white">
                        {review.name.charAt(0)}
                      </div>
                      <span className="text-sm font-medium text-white">{review.name}</span>
                    </div>
                    <span className="text-[10px] text-gray-500">{review.time}</span>
                  </div>
                  <div className="flex gap-0.5 mb-2">
                    {Array.from({ length: 5 }).map((_, s) => (
                      <svg
                        key={s}
                        className={`w-4 h-4 ${s < review.rating ? "text-blue-400 fill-blue-400" : "text-gray-700 fill-transparent"}`}
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"
                        />
                      </svg>
                    ))}
                  </div>
                  <p className="text-xs text-gray-400 leading-relaxed">{review.text}</p>
                </div>
              ))}
            </div>

            <div className="mt-4 rounded-xl border border-gray-800 bg-gray-900/60 p-3 flex items-center justify-around">
              <div className="text-center">
                <div className="text-2xl font-bold text-amber-400">4.8</div>
                <div className="text-[10px] text-gray-500 mt-0.5">Avg Rating</div>
              </div>
              <div className="w-px h-8 bg-gray-800" />
              <div className="text-center">
                <div className="text-2xl font-bold text-white">1.2k</div>
                <div className="text-[10px] text-gray-500 mt-0.5">Reviews</div>
              </div>
              <div className="w-px h-8 bg-gray-800" />
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">96%</div>
                <div className="text-[10px] text-gray-500 mt-0.5">Helpful</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

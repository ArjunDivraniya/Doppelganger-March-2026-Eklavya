import Navbar from "./components/Navbar";
import HeroSection from "./components/HeroSection";
import OverviewSection from "./components/OverviewSection";
import HowItWorksSection from "./components/HowItWorksSection";
import FeaturesSection from "./components/FeaturesSection";
import DemoSection from "./components/DemoSection";
import FeedbackSection from "./components/FeedbackSection";
import Footer from "./components/Footer";

function App() {
  return (
    <div className="min-h-screen bg-gray-950 text-white overflow-x-hidden antialiased">
      <Navbar />
      <HeroSection />
      <OverviewSection />
      <HowItWorksSection />
      <FeaturesSection />
      <DemoSection />
      <FeedbackSection />
      <Footer />
    </div>
  );
}

export default App;

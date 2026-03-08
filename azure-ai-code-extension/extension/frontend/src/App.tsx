import HeroSection from "./components/HeroSection";
import HowItWorksSection from "./components/HowItWorksSection";
import FeaturesSection from "./components/FeaturesSection";
import DemoSection from "./components/DemoSection";
import Footer from "./components/Footer";

function App() {
  return (
    <div className="min-h-screen bg-gray-950 text-white overflow-x-hidden antialiased">
      <HeroSection />
      <HowItWorksSection />
      <FeaturesSection />
      <DemoSection />
      <Footer />
    </div>
  );
}

export default App;

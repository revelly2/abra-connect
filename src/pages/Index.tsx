import Header from "@/components/Header";
import Hero from "@/components/Hero";
import VideoSection from "@/components/VideoSection";
import TouristSpots from "@/components/TouristSpots";
import CultureSection from "@/components/CultureSection";
import LanguageSection from "@/components/LanguageSection";

const Index = () => {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <Hero />
      <VideoSection />
      <TouristSpots />
      <CultureSection />
      <LanguageSection />
    </main>
  );
};

export default Index;

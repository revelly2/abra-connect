import Hero from "@/components/Hero";
import TouristSpots from "@/components/TouristSpots";
import CultureSection from "@/components/CultureSection";
import LanguageSection from "@/components/LanguageSection";

const Index = () => {
  return (
    <main className="min-h-screen bg-background">
      <Hero />
      <TouristSpots />
      <CultureSection />
      <LanguageSection />
    </main>
  );
};

export default Index;

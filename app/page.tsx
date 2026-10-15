import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

import HeroSection from "@/components/home/HeroSection";
import FeaturedDestinations from "@/components/home/FeaturedDestinations";
import FeatureGrid from "@/components/home/FeatureGrid";
import HowItWorks from "@/components/home/HowItWorks";
import AICTA from "@/components/home/AICTA";
import FinalCTA from "@/components/home/FinalCTA";

export default function Home() {
  return (
    <main className="home-page min-h-screen bg-transparent text-foreground">
      <Navbar />

      <HeroSection />

      <FeaturedDestinations />

      <FeatureGrid />

      <HowItWorks />

      <AICTA />

      <FinalCTA />

      <Footer />
    </main>
  );
}
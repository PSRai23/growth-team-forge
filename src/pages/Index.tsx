import { Layout } from "@/components/layout/Layout";
import { WelcomeBanner } from "@/components/home/WelcomeBanner";
import { FeaturedCollections } from "@/components/home/FeaturedCollections";
import { TodaysPicks } from "@/components/home/TodaysPicks";
import { EventSuggestions } from "@/components/home/EventSuggestions";

const Index = () => {
  return (
    <Layout>
      <div className="py-6">
        <div className="px-4">
          <WelcomeBanner />
        </div>
        
        <FeaturedCollections />
        <TodaysPicks />
        <EventSuggestions />
      </div>
    </Layout>
  );
};

export default Index;


import Header from "@/components/Header";
import EmergencyButton from "@/components/EmergencyButton";
import ResourceCard from "@/components/ResourceCard";
import Map from "@/components/Map";
import CommunityChat from "@/components/CommunityChat";
import VolunteerMatching from "@/components/VolunteerMatching";
import IdentityVerification from "@/components/IdentityVerification";
import AIAssistant from "@/components/AIAssistant";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useScrollPosition } from "@/hooks/useScrollPosition";

const resources = [
  {
    title: "Guide des premiers secours",
    description: "Apprenez les gestes qui sauvent",
    imageUrl: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b",
    link: "/resources#first-aid"
  },
  {
    title: "Numéros d'urgence",
    description: "Tous les contacts importants",
    imageUrl: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158",
    link: "/resources#emergency-numbers"
  },
  {
    title: "Conseils de sécurité",
    description: "Prévention et préparation",
    imageUrl: "https://images.unsplash.com/photo-1519389950473-47ba0277781c",
    link: "/resources#safety-tips"
  },
];

const Index = () => {
  const [latestReportId, setLatestReportId] = useState<string | null>(null);
  const navigate = useNavigate();
  useScrollPosition();

  useEffect(() => {
    const fetchLatestReport = async () => {
      const { data, error } = await supabase
        .from('reports')
        .select('id')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (data && !error) {
        setLatestReportId(data.id);
      }
    };

    fetchLatestReport();
  }, []);

  return (
    <div className="min-h-screen flex">
      <div className="flex-1 overflow-y-auto">
        <Header />
        <main className="container mx-auto px-4 pt-24 pb-32">
          <section className="mb-12">
            <h1 className="text-4xl font-bold text-center mb-2">
              Assistance d'urgence immédiate
            </h1>
            <p className="text-gray-600 text-center max-w-2xl mx-auto">
              EchoLink vous connecte instantanément aux secours et à la communauté en cas d'urgence
            </p>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-8">
              <section>
                <Map />
              </section>

              {latestReportId && (
                <section>
                  <VolunteerMatching reportId={latestReportId} />
                </section>
              )}

              <section>
                <IdentityVerification />
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-6">Ressources utiles</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {resources.map((resource) => (
                    <ResourceCard 
                      key={resource.title} 
                      {...resource} 
                      onClick={() => navigate(resource.link)}
                    />
                  ))}
                </div>
              </section>
            </div>

            <div className="lg:pl-8 space-y-8">
              <section>
                <AIAssistant />
              </section>
              <section>
                <CommunityChat />
              </section>
            </div>
          </div>
        </main>
        <EmergencyButton />
      </div>
    </div>
  );
};

export default Index;

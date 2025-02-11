
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
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";

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
  const { user } = useAuth();
  const { toast } = useToast();
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

  const handleVolunteerClick = async () => {
    if (!user) {
      toast({
        title: "Connexion requise",
        description: "Vous devez être connecté pour proposer votre aide",
        variant: "destructive"
      });
      return;
    }

    try {
      // First check if volunteer entry exists
      const { data: existingVolunteer } = await supabase
        .from('volunteers')
        .select('id, availability')
        .eq('user_id', user.id)
        .single();

      if (existingVolunteer) {
        // Update availability to available
        const { error: updateError } = await supabase
          .from('volunteers')
          .update({ availability: 'available' })
          .eq('id', existingVolunteer.id);

        if (updateError) throw updateError;

        toast({
          description: "Vous êtes maintenant disponible pour aider",
        });
      } else {
        // Create new volunteer entry with default location
        const { error: createError } = await supabase
          .from('volunteers')
          .insert({
            user_id: user.id,
            availability: 'available',
            skills: [],
            location: 'POINT(2.3488 48.8534)' // Default to Paris coordinates
          });

        if (createError) throw createError;

        toast({
          description: "Votre profil volontaire a été créé. Veuillez configurer vos compétences dans votre profil.",
        });
        navigate("/profile"); // Redirect to profile to set up skills
      }
    } catch (error) {
      console.error('Error managing volunteer status:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue. Veuillez réessayer.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="flex-1 overflow-y-auto">
        <Header />
        <main className="container mx-auto px-4 pt-24 pb-32">
          <section className="mb-12">
            <h1 className="text-4xl font-bold text-center mb-2">
              Assistance d'urgence immédiate
            </h1>
            <p className="text-gray-600 text-center max-w-2xl mx-auto mb-6">
              EchoLink vous connecte instantanément aux secours et à la communauté en cas d'urgence
            </p>
            {user && (
              <div className="flex justify-center">
                <Button 
                  onClick={handleVolunteerClick}
                  className="bg-emergency hover:bg-emergency/90"
                >
                  Proposer mon aide
                </Button>
              </div>
            )}
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
                <CommunityChat />
              </section>
              <section>
                <AIAssistant />
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


import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useScrollPosition } from "@/hooks/useScrollPosition";
import ResourceCard from "@/components/ResourceCard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Phone, Info, BandageIcon } from "lucide-react";
import Header from "@/components/Header";

const EmergencyResources = () => {
  useScrollPosition();
  const navigate = useNavigate();

  const firstAidGuides = [
    {
      title: "Position latérale de sécurité",
      description: "Comment placer une personne inconsciente qui respire",
      imageUrl: "https://images.unsplash.com/photo-1581092795360-fd1ca04f0952",
      link: "/resources/first-aid/recovery-position"
    },
    {
      title: "Massage cardiaque",
      description: "Les gestes qui sauvent en cas d'arrêt cardiaque",
      imageUrl: "https://images.unsplash.com/photo-1434494878577-86c23bcb06b9",
      link: "/resources/first-aid/cpr"
    },
    {
      title: "Arrêt d'hémorragie",
      description: "Comment stopper un saignement important",
      imageUrl: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05",
      link: "/resources/first-aid/bleeding-control"
    },
  ];

  const emergencyNumbers = [
    { service: "SAMU", number: "15" },
    { service: "Police", number: "17" },
    { service: "Pompiers", number: "18" },
    { service: "Numéro d'urgence européen", number: "112" },
  ];

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 pt-24 pb-12 space-y-12">
        {/* Premier Secours Section */}
        <section className="space-y-6">
          <div className="flex items-center gap-2 mb-6">
            <BandageIcon className="h-6 w-6 text-emergency" />
            <h2 className="text-2xl font-bold">Guide des Premiers Secours</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {firstAidGuides.map((guide, index) => (
              <ResourceCard
                key={index}
                {...guide}
                onClick={() => navigate(guide.link)}
              />
            ))}
          </div>
        </section>

        {/* Numéros d'Urgence Section */}
        <section className="space-y-6">
          <div className="flex items-center gap-2 mb-6">
            <Phone className="h-6 w-6 text-emergency" />
            <h2 className="text-2xl font-bold">Numéros d'Urgence</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {emergencyNumbers.map((item, index) => (
              <Card key={index} className="p-4">
                <h3 className="font-semibold mb-2">{item.service}</h3>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => window.location.href = `tel:${item.number}`}
                >
                  {item.number}
                </Button>
              </Card>
            ))}
          </div>
        </section>

        {/* Conseils de Sécurité Section */}
        <section className="space-y-6">
          <div className="flex items-center gap-2 mb-6">
            <Info className="h-6 w-6 text-emergency" />
            <h2 className="text-2xl font-bold">Conseils de Sécurité</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Heart className="h-5 w-5 text-emergency" />
                Sécurité à la Maison
              </h3>
              <ul className="list-disc list-inside space-y-2 text-sm text-gray-600">
                <li>Vérifiez régulièrement vos détecteurs de fumée</li>
                <li>Gardez une trousse de premiers secours à portée de main</li>
                <li>Identifiez les issues de secours</li>
              </ul>
            </Card>
            <Card className="p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Heart className="h-5 w-5 text-emergency" />
                Sur la Route
              </h3>
              <ul className="list-disc list-inside space-y-2 text-sm text-gray-600">
                <li>Gardez une trousse de secours dans votre véhicule</li>
                <li>Respectez les distances de sécurité</li>
                <li>Vérifiez régulièrement l'état de vos pneus</li>
              </ul>
            </Card>
            <Card className="p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Heart className="h-5 w-5 text-emergency" />
                Lieux Publics
              </h3>
              <ul className="list-disc list-inside space-y-2 text-sm text-gray-600">
                <li>Repérez les sorties de secours</li>
                <li>Restez vigilant à vos effets personnels</li>
                <li>Suivez les consignes de sécurité affichées</li>
              </ul>
            </Card>
          </div>
        </section>
      </main>
    </div>
  );
};

export default EmergencyResources;

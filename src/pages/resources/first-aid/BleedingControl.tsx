
import { useScrollPosition } from "@/hooks/useScrollPosition";
import Header from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const BleedingControl = () => {
  useScrollPosition();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 pt-24 pb-12">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => navigate("/resources")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>

        <h1 className="text-3xl font-bold mb-8">Arrêt d'Hémorragie</h1>

        <Card className="p-6 space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mb-4">Techniques d'arrêt d'hémorragie</h2>
            <ol className="list-decimal list-inside space-y-4 ml-4">
              <li>Compression directe :
                <ul className="list-disc list-inside ml-6 mt-2">
                  <li>Appuyez fermement sur la plaie</li>
                  <li>Utilisez un tissu propre ou une compresse</li>
                  <li>Maintenez la pression continue</li>
                </ul>
              </li>
              <li>Surélévation du membre :
                <ul className="list-disc list-inside ml-6 mt-2">
                  <li>Si possible, élevez le membre blessé</li>
                  <li>Maintenez la compression directe</li>
                </ul>
              </li>
              <li>Point de compression :
                <ul className="list-disc list-inside ml-6 mt-2">
                  <li>Identifiez le point de compression en amont</li>
                  <li>Appuyez fermement sur ce point</li>
                </ul>
              </li>
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Précautions importantes</h2>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Appelez immédiatement les secours (15 ou 112)</li>
              <li>Protégez-vous avec des gants si disponibles</li>
              <li>Ne retirez pas les corps étrangers éventuels</li>
              <li>Surveillez l'état de conscience de la victime</li>
            </ul>
          </section>
        </Card>
      </main>
    </div>
  );
};

export default BleedingControl;

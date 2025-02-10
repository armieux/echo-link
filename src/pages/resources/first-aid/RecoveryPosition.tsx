
import { useScrollPosition } from "@/hooks/useScrollPosition";
import Header from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const RecoveryPosition = () => {
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

        <h1 className="text-3xl font-bold mb-8">Position Latérale de Sécurité</h1>

        <Card className="p-6 space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mb-4">Étapes à suivre</h2>
            <ol className="list-decimal list-inside space-y-4 ml-4">
              <li>Vérifiez que la personne respire normalement</li>
              <li>Placez le bras le plus proche de vous à angle droit</li>
              <li>Positionnez l'autre bras sur la poitrine</li>
              <li>Pliez la jambe la plus éloignée</li>
              <li>Faites rouler la personne sur le côté en la tirant par la jambe pliée</li>
              <li>Stabilisez la position en ajustant la tête</li>
              <li>Vérifiez régulièrement la respiration</li>
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Points importants</h2>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Assurez-vous que les voies respiratoires restent dégagées</li>
              <li>Ne forcez pas les mouvements si vous suspectez une blessure à la colonne</li>
              <li>Appelez immédiatement les secours (15 ou 112)</li>
              <li>Couvrez la personne pour maintenir sa température</li>
            </ul>
          </section>
        </Card>
      </main>
    </div>
  );
};

export default RecoveryPosition;

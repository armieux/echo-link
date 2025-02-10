
import { useScrollPosition } from "@/hooks/useScrollPosition";
import Header from "@/components/Header";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CPR = () => {
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

        <h1 className="text-3xl font-bold mb-8">Massage Cardiaque</h1>

        <Card className="p-6 space-y-6">
          <section>
            <h2 className="text-2xl font-semibold mb-4">Procédure du massage cardiaque</h2>
            <ol className="list-decimal list-inside space-y-4 ml-4">
              <li>Placez la victime sur une surface dure et plane</li>
              <li>Mettez-vous à genoux à côté de la victime</li>
              <li>Placez vos mains au centre de la poitrine</li>
              <li>Comprimez fort et vite :
                <ul className="list-disc list-inside ml-6 mt-2">
                  <li>Profondeur : 5-6 cm</li>
                  <li>Rythme : 100-120 compressions par minute</li>
                </ul>
              </li>
              <li>Laissez la poitrine revenir à sa position entre chaque compression</li>
              <li>Continuez jusqu'à l'arrivée des secours</li>
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Points essentiels</h2>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Appelez ou faites appeler les secours immédiatement (15 ou 112)</li>
              <li>Ne vous arrêtez pas sauf si la victime reprend conscience</li>
              <li>Si possible, relayez-vous toutes les 2 minutes</li>
              <li>Utilisez un défibrillateur si disponible</li>
            </ul>
          </section>
        </Card>
      </main>
    </div>
  );
};

export default CPR;

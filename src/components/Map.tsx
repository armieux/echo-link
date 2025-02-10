
import { useState } from "react";
import EmergencyForm from "./EmergencyForm";
import { Button } from "./ui/button";
import { Plus } from "lucide-react";

const Map = () => {
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="relative w-full h-[500px] bg-gray-100 rounded-lg overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-gray-200 to-gray-100" />
      <div className="absolute inset-0 flex items-center justify-center">
        <p className="text-gray-500">Carte interactive des signalements</p>
      </div>
      
      {/* Floating Action Button to show/hide form */}
      <Button
        className="absolute top-4 right-4 rounded-full shadow-lg"
        onClick={() => setShowForm(!showForm)}
      >
        <Plus className="h-4 w-4" />
        <span className="ml-2">Nouveau signalement</span>
      </Button>

      {/* Emergency Form Modal */}
      {showForm && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <EmergencyForm />
          </div>
        </div>
      )}
    </div>
  );
};

export default Map;

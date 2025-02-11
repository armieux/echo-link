
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { UserReviews } from "@/components/UserReviews";
import { User, Mail, MapPin } from "lucide-react";

interface Profile {
  username: string | null;
  avatar_url: string | null;
  rating: number;
}

export default function Profile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState("");

  useEffect(() => {
    fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("profiles")
      .select("username, avatar_url, rating")
      .eq("id", user.id)
      .single();

    if (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de charger le profil",
      });
      return;
    }

    setProfile(data);
    setUsername(data.username || "");
  };

  const updateProfile = async () => {
    if (!user) return;

    const { error } = await supabase
      .from("profiles")
      .update({ username })
      .eq("id", user.id);

    if (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de mettre à jour le profil",
      });
      return;
    }

    setIsEditing(false);
    fetchProfile();
    toast({
      description: "Profil mis à jour avec succès",
    });
  };

  if (!user) return null;

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-8">Mon Profil</h1>

      <div className="grid gap-8 md:grid-cols-[1fr_2fr]">
        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex flex-col items-center space-y-4">
              <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt="Profile"
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <User className="w-12 h-12 text-gray-400" />
                )}
              </div>

              {isEditing ? (
                <div className="w-full space-y-4">
                  <Input
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Nom d'utilisateur"
                  />
                  <div className="flex gap-2">
                    <Button onClick={updateProfile}>Sauvegarder</Button>
                    <Button
                      variant="outline"
                      onClick={() => setIsEditing(false)}
                    >
                      Annuler
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="text-center">
                    <h2 className="text-xl font-semibold">
                      {profile?.username || "Sans nom"}
                    </h2>
                    <p className="text-gray-500 flex items-center justify-center gap-2">
                      <Mail className="w-4 h-4" />
                      {user.email}
                    </p>
                  </div>
                  <Button onClick={() => setIsEditing(true)}>
                    Modifier le profil
                  </Button>
                </>
              )}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold mb-4">Statistiques</h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span>Note moyenne</span>
                <span className="font-semibold">
                  {profile?.rating?.toFixed(1) || "N/A"}
                </span>
              </div>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <UserReviews />
        </div>
      </div>
    </div>
  );
}

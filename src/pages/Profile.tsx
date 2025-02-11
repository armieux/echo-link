import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { UserReviews } from "@/components/UserReviews";
import { User, Mail, MapPin, Trash2, Save, Plus, X, ChartBar, Star, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";

const SKILLS = [
  { value: 'premiers_secours', label: 'Premiers Secours' },
  { value: 'secours_montagne', label: 'Secours en Montagne' },
  { value: 'assistance_medicale', label: 'Assistance Médicale' },
  { value: 'mecanique_auto', label: 'Mécanique Automobile' },
  { value: 'gestion_catastrophe', label: 'Gestion de Catastrophes' }
];

interface Profile {
  username: string | null;
  avatar_url: string | null;
  rating: number;
}

interface Volunteer {
  id: string;
  skills: string[];
}

export default function Profile() {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [volunteer, setVolunteer] = useState<Volunteer | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [selectedSkill, setSelectedSkill] = useState("");

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchVolunteerData();
    }
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

  const fetchVolunteerData = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from("volunteers")
      .select("id, skills")
      .eq("user_id", user.id)
      .single();

    if (!error && data) {
      setVolunteer(data);
    }
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

  const updateEmail = async () => {
    const { error } = await supabase.auth.updateUser({ email: newEmail });
    
    if (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message,
      });
      return;
    }
    
    toast({
      description: "Un email de confirmation a été envoyé",
    });
    setNewEmail("");
  };

  const updatePassword = async () => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    
    if (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message,
      });
      return;
    }
    
    toast({
      description: "Mot de passe mis à jour avec succès",
    });
    setNewPassword("");
  };

  const deleteAccount = async () => {
    const { error } = await supabase.rpc('delete_user');
    
    if (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de supprimer le compte",
      });
      return;
    }

    await signOut();
    navigate("/auth");
  };

  const addSkill = async () => {
    if (!user || !selectedSkill) return;

    let existingVolunteer = volunteer;

    // If no volunteer record exists, create one
    if (!existingVolunteer) {
      const { data, error: createError } = await supabase
        .from("volunteers")
        .insert({
          user_id: user.id,
          skills: [selectedSkill],
          availability: 'offline',
          location: 'POINT(0 0)'
        })
        .select()
        .single();

      if (createError) {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible d'ajouter la compétence",
        });
        return;
      }

      existingVolunteer = data;
    } else {
      // Update existing volunteer record
      const newSkills = [...new Set([...existingVolunteer.skills, selectedSkill])];
      
      const { error: updateError } = await supabase
        .from("volunteers")
        .update({ skills: newSkills })
        .eq("id", existingVolunteer.id);

      if (updateError) {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible d'ajouter la compétence",
        });
        return;
      }

      existingVolunteer = { ...existingVolunteer, skills: newSkills };
    }

    setVolunteer(existingVolunteer);
    setSelectedSkill("");
    toast({
      description: "Compétence ajoutée avec succès",
    });
  };

  const removeSkill = async (skillToRemove: string) => {
    if (!user || !volunteer) return;

    const newSkills = volunteer.skills.filter(skill => skill !== skillToRemove);

    const { error } = await supabase
      .from("volunteers")
      .update({ skills: newSkills })
      .eq("id", volunteer.id);

    if (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de supprimer la compétence",
      });
      return;
    }

    setVolunteer({ ...volunteer, skills: newSkills });
    toast({
      description: "Compétence supprimée avec succès",
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
            <h3 className="font-semibold mb-4">Compétences</h3>
            <div className="space-y-4">
              <div className="flex gap-2">
                <Select value={selectedSkill} onValueChange={setSelectedSkill}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir une compétence" />
                  </SelectTrigger>
                  <SelectContent>
                    {SKILLS.map(skill => (
                      <SelectItem key={skill.value} value={skill.value}>
                        {skill.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={addSkill} disabled={!selectedSkill}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {volunteer?.skills.map(skill => {
                  const skillLabel = SKILLS.find(s => s.value === skill)?.label || skill;
                  return (
                    <div
                      key={skill}
                      className="bg-gray-100 px-3 py-1 rounded-full flex items-center gap-2"
                    >
                      <span>{skillLabel}</span>
                      <button
                        onClick={() => removeSkill(skill)}
                        className="text-gray-500 hover:text-red-500"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold mb-4">Paramètres du compte</h3>
            <div className="space-y-4">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full">
                    Changer d'email
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Changer d'email</DialogTitle>
                    <DialogDescription>
                      Entrez votre nouvelle adresse email. Un email de confirmation vous sera envoyé.
                    </DialogDescription>
                  </DialogHeader>
                  <Input
                    type="email"
                    placeholder="Nouvel email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                  />
                  <DialogFooter>
                    <Button onClick={updateEmail}>Confirmer</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="w-full">
                    Changer de mot de passe
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Changer de mot de passe</DialogTitle>
                    <DialogDescription>
                      Entrez votre nouveau mot de passe.
                    </DialogDescription>
                  </DialogHeader>
                  <Input
                    type="password"
                    placeholder="Nouveau mot de passe"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                  <DialogFooter>
                    <Button onClick={updatePassword}>Confirmer</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="w-full">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Supprimer le compte
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Cette action est irréversible. Toutes vos données seront supprimées définitivement.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Annuler</AlertDialogCancel>
                    <AlertDialogAction onClick={deleteAccount} className="bg-red-500 hover:bg-red-600">
                      Supprimer
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
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

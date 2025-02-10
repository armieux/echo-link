
import { BadgeCheckIcon } from "lucide-react";

interface VerificationBadgeProps {
  isVerified: boolean;
}

const VerificationBadge = ({ isVerified }: VerificationBadgeProps) => {
  if (!isVerified) return null;

  return (
    <div className="inline-flex items-center gap-1 px-2 py-1 text-sm bg-green-100 text-green-800 rounded-full">
      <BadgeCheckIcon className="w-4 h-4" />
      <span>Vérifié</span>
    </div>
  );
};

export default VerificationBadge;


import { ShieldCheckIcon, AlertCircleIcon } from "lucide-react";
import VerificationBadge from "./VerificationBadge";

interface SecuritySettingsProps {
  isVerified: boolean;
  verificationStatus: "pending" | "verified" | "unverified";
  documentSubmissionDate?: string;
}

const SecuritySettings = ({
  isVerified,
  verificationStatus,
  documentSubmissionDate,
}: SecuritySettingsProps) => {
  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4 p-4 bg-white rounded-lg shadow-sm">
        <ShieldCheckIcon className="w-6 h-6 text-primary mt-1" />
        <div>
          <h3 className="text-lg font-medium mb-2">Statut de vérification</h3>
          <div className="flex items-center gap-3 mb-4">
            <VerificationBadge isVerified={isVerified} />
            {verificationStatus === "pending" && (
              <span className="text-yellow-600 text-sm flex items-center gap-1">
                <AlertCircleIcon className="w-4 h-4" />
                En attente de validation
              </span>
            )}
          </div>
          {documentSubmissionDate && (
            <p className="text-sm text-gray-500">
              Documents soumis le {documentSubmissionDate}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SecuritySettings;


import { ShieldCheckIcon, AlertCircleIcon, XCircleIcon } from "lucide-react";
import VerificationBadge from "./VerificationBadge";
import { Skeleton } from "./ui/skeleton";

interface SecuritySettingsProps {
  isVerified: boolean;
  verificationStatus: null | "pending" | "verified" | "rejected";
  documentSubmissionDate?: string;
  rejectionReason?: string;
  isLoading?: boolean;
}

const SecuritySettings = ({
  isVerified,
  verificationStatus,
  documentSubmissionDate,
  rejectionReason,
  isLoading = false,
}: SecuritySettingsProps) => {
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-start gap-4 p-4 bg-white rounded-lg shadow-sm">
          <Skeleton className="w-6 h-6 rounded-full" />
          <div className="space-y-3 flex-1">
            <Skeleton className="h-4 w-[200px]" />
            <Skeleton className="h-4 w-[160px]" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4 p-4 bg-white rounded-lg shadow-sm">
        <ShieldCheckIcon className="w-6 h-6 text-primary mt-1" />
        <div>
          <h3 className="text-lg font-medium mb-2">Statut de vérification</h3>
          <div className="flex items-center gap-3 mb-4">
            <VerificationBadge isVerified={isVerified} />
            {verificationStatus === null && (
                <span className="text-yellow-600 text-sm flex items-center gap-1">
                <AlertCircleIcon className="w-4 h-4" />
                Veuillez soumettre vos documents
              </span>
                        )}
                        {verificationStatus === "pending" && documentSubmissionDate && (
                            <span className="text-yellow-600 text-sm flex items-center gap-1">
                <AlertCircleIcon className="w-4 h-4" />
                En attente de validation
              </span>
            )}
            {verificationStatus === "rejected" && (
              <span className="text-red-600 text-sm flex items-center gap-1">
                <XCircleIcon className="w-4 h-4" />
                Rejeté
              </span>
            )}
          </div>
          {documentSubmissionDate && (
            <p className="text-sm text-gray-500">
              Documents soumis le {documentSubmissionDate}
            </p>
          )}
          {rejectionReason && (
            <p className="mt-2 text-sm text-red-600 bg-red-50 p-3 rounded-md">
              Raison du rejet : {rejectionReason}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SecuritySettings;

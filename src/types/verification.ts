
export interface VerificationDocument {
  id: string;
  status: "pending" | "verified" | "rejected";
  id_document_path: string | null;
  selfie_path: string | null;
  submitted_at: string;
  rejection_reason: string | null;
}

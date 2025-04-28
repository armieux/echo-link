import { useState } from "react";
import { Button, ButtonProps } from "@/components/ui/button";
import { AskForHelpDialog } from "./AskForHelpDialog";

interface AskForHelpButtonProps extends ButtonProps {
  volunteerId: string;
  volunteerName?: string;
}

export function AskForHelpButton({
  volunteerId,
  volunteerName,
  ...buttonProps
}: AskForHelpButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setIsDialogOpen(true)}
        {...buttonProps}
      >
        Demander de l'aide
      </Button>

      <AskForHelpDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        volunteerId={volunteerId}
        volunteerName={volunteerName}
      />
    </>
  );
}

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WithdrawModal({ isOpen, onClose }: WithdrawModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Solicitar Saque</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-muted-foreground">
            Funcionalidade de saque em desenvolvimento.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

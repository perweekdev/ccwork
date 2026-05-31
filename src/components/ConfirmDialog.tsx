interface ConfirmDialogProps {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({ message, onConfirm, onCancel }: ConfirmDialogProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={onCancel}
    >
      <div
        className="bg-card border border-border rounded-2xl p-6 w-80 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-sm text-foreground mb-5">{message}</p>
        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-1.5 text-sm rounded-lg border border-border text-muted-foreground hover:bg-muted transition-colors cursor-pointer"
          >
            취소
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-1.5 text-sm rounded-lg bg-destructive text-white hover:opacity-90 transition-opacity cursor-pointer"
          >
            삭제
          </button>
        </div>
      </div>
    </div>
  );
}

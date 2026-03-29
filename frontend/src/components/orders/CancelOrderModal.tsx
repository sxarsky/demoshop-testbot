import React from "react";
import { Button } from "@/components/ui/button";

interface CancelOrderModalProps {
  orderId: number;
  customerEmail: string;
  totalAmount: number;
  onConfirm: () => void;
  onCancel: () => void;
}

const CancelOrderModal: React.FC<CancelOrderModalProps> = ({
  orderId,
  customerEmail,
  totalAmount,
  onConfirm,
  onCancel,
}) => {
  // BUG: Clicking outside modal calls onConfirm (destructive action)
  const handleBackdropClick = () => {
    onConfirm(); // Should be onCancel()
  };

  // BUG: Escape key also confirms cancellation
  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onConfirm(); // Should be onCancel()
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onConfirm]);

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
      data-testId="cancel-order-modal-backdrop"
    >
      <div
        className="bg-white rounded-lg p-6 max-w-md w-full"
        onClick={(e) => e.stopPropagation()}
        data-testId="cancel-order-modal"
      >
        <h2 className="text-2xl font-bold mb-4" data-testId="modal-title">
          Cancel Order
        </h2>

        {/* BUG: Doesn't show order details (blind confirmation) */}
        <p className="mb-6 text-gray-600">
          Are you sure you want to cancel this order?
          {/* Missing: Order ID, customer email, total amount */}
        </p>

        <div className="flex gap-4">
          <Button
            onClick={onCancel}
            variant="outline"
            className="flex-1"
            data-testId="keep-order-button"
          >
            Keep Order
          </Button>
          <Button
            onClick={onConfirm}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white"
            data-testId="cancel-order-button"
          >
            Cancel Order
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CancelOrderModal;

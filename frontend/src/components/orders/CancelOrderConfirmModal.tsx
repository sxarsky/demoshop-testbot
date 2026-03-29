import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";

export type CancelOrderConfirmModalProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  orderId: string | number;
  customerEmail: string;
  totalAmount: number;
  confirming: boolean;
};

export default function CancelOrderConfirmModal({
  open,
  onClose,
  onConfirm,
  orderId,
  customerEmail,
  totalAmount,
  confirming,
}: CancelOrderConfirmModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !confirming) onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose, confirming]);

  if (!open) return null;

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(31, 41, 55, 0.35)",
        position: "fixed",
        inset: 0,
        zIndex: 100,
      }}
      onClick={() => {
        if (!confirming) onClose();
      }}
      role="presentation"
      data-testId="cancel-order-modal-backdrop"
    >
      <div
        style={{
          maxWidth: "28rem",
          width: "100%",
          margin: "0 1rem",
          background: "#fff",
          borderRadius: "0.75rem",
          boxShadow:
            "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)",
          padding: "1.5rem",
          position: "relative",
        }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cancel-order-modal-title"
        data-testId="cancel-order-modal"
      >
        <h2
          id="cancel-order-modal-title"
          className="text-xl font-semibold text-gray-900 mb-2"
          data-testId="cancel-order-modal-heading"
        >
          Are you sure you want to cancel this order?
        </h2>
        <div
          className="text-sm text-gray-600 space-y-2 mb-6"
          data-testId="cancel-order-modal-details"
        >
          <div data-testId="cancel-order-modal-order-id">
            <span className="text-gray-400">Order ID:</span>{" "}
            <span className="font-medium text-gray-900">{orderId}</span>
          </div>
          <div data-testId="cancel-order-modal-customer-email">
            <span className="text-gray-400">Customer email:</span>{" "}
            <span className="font-medium text-gray-900">{customerEmail}</span>
          </div>
          <div data-testId="cancel-order-modal-total">
            <span className="text-gray-400">Total:</span>{" "}
            <span className="font-medium text-gray-900">
              ${totalAmount.toFixed(2)}
            </span>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-end">
          <Button
            type="button"
            variant="outline"
            className="w-full sm:w-auto order-2 sm:order-1"
            onClick={onClose}
            disabled={confirming}
            data-testId="cancel-order-modal-go-back"
          >
            Go Back
          </Button>
          <Button
            type="button"
            variant="destructive"
            className="w-full sm:w-auto order-1 sm:order-2"
            onClick={onConfirm}
            disabled={confirming}
            style={{
              color: "#fff",
              background: "#dc2626",
              border: "1.5px solid transparent",
            }}
            data-testId="cancel-order-modal-confirm"
          >
            {confirming ? "Cancelling..." : "Confirm"}
          </Button>
        </div>
      </div>
    </div>
  );
}

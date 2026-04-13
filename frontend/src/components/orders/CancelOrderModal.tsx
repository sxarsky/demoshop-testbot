import React, { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";

interface CancelOrderModalProps {
  order: {
    order_id: string | number;
    customer_email: string;
    total_amount: number;
  };
  onConfirm: () => void;
  onClose: () => void;
  isLoading?: boolean;
}

export default function CancelOrderModal({
  order,
  onConfirm,
  onClose,
  isLoading = false,
}: CancelOrderModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Trap focus inside modal
  useEffect(() => {
    dialogRef.current?.focus();
  }, []);

  // Close when clicking the backdrop
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
      onClick={handleBackdropClick}
      data-testId="cancel-order-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cancel-modal-title"
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        className="bg-white rounded-lg shadow-xl outline-none"
        style={{
          width: "100%",
          maxWidth: "28rem",
          margin: "1rem",
          padding: "2rem",
        }}
        data-testId="cancel-order-modal"
      >
        {/* Title */}
        <h2
          id="cancel-modal-title"
          style={{
            fontWeight: 700,
            fontSize: "1.25rem",
            lineHeight: "1.75rem",
            marginBottom: "0.5rem",
          }}
          data-testId="cancel-order-modal-title"
        >
          Cancel Order
        </h2>

        {/* Question */}
        <p
          style={{ color: "#4b5563", marginBottom: "1.5rem" }}
          data-testId="cancel-order-modal-question"
        >
          Are you sure you want to cancel this order?
        </p>

        {/* Order Details */}
        <div
          style={{
            backgroundColor: "#f9fafb",
            borderRadius: "0.5rem",
            padding: "1rem",
            marginBottom: "1.75rem",
            border: "1px solid #e5e7eb",
          }}
          data-testId="cancel-order-modal-details"
        >
          <div style={{ marginBottom: "0.5rem" }} data-testId="cancel-order-modal-order-id">
            <span style={{ color: "#9ca3af", fontSize: "0.875rem" }}>Order ID:</span>
            <div style={{ fontWeight: 500, fontSize: "0.9375rem", color: "#111827" }}>
              {order.order_id}
            </div>
          </div>
          <div style={{ marginBottom: "0.5rem" }} data-testId="cancel-order-modal-email">
            <span style={{ color: "#9ca3af", fontSize: "0.875rem" }}>Customer Email:</span>
            <div style={{ fontWeight: 500, fontSize: "0.9375rem", color: "#111827" }}>
              {order.customer_email}
            </div>
          </div>
          <div data-testId="cancel-order-modal-total">
            <span style={{ color: "#9ca3af", fontSize: "0.875rem" }}>Total:</span>
            <div style={{ fontWeight: 500, fontSize: "0.9375rem", color: "#111827" }}>
              ${order.total_amount.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div
          style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}
          data-testId="cancel-order-modal-buttons"
        >
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            data-testId="cancel-order-modal-go-back"
            style={{
              color: "#111",
              border: "1.5px solid #d1d5db",
              background: "#fff",
              transition: "background 0.2s, border-color 0.2s",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = "#f3f4f6";
              e.currentTarget.style.borderColor = "#111";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = "#fff";
              e.currentTarget.style.borderColor = "#d1d5db";
            }}
          >
            Go Back
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isLoading}
            data-testId="cancel-order-modal-confirm"
            style={{
              color: "#fff",
              background: "#dc2626",
              border: "1.5px solid transparent",
              transition: "background 0.2s, border-color 0.2s",
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = "#f87171";
              e.currentTarget.style.borderColor = "#991b1b";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = "#dc2626";
              e.currentTarget.style.borderColor = "transparent";
            }}
          >
            {isLoading ? "Cancelling..." : "Confirm"}
          </Button>
        </div>
      </div>
    </div>
  );
}

import { Button } from "@/components/ui/button";
import { Order } from "./OrderList";

export default function OrderItem({ order, gapOverride, dataTestId }: { order: Order; gapOverride?: string; dataTestId?: string }) {
  return (
    <div
      style={{
        width: "100%",
        background: "#f9fafb",
        border: "1.5px solid #9ca3af",
        borderRadius: "0.75rem",
        boxShadow: "0 2px 8px 0 rgba(0,0,0,0.03)",
        padding: "1.25rem 1.5rem",
        marginBottom: 0, // Remove extra margin between orders
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: gapOverride || "10rem",
      }}
      data-testId={dataTestId || "order-item"}
    >
      {/* Order Info */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "0.5rem", minWidth: "16rem" }} data-testId="order-info-container">
        <span 
          data-testId="order-email" 
          style={{ fontSize: "1.125rem", fontWeight: 500, color: "#1e293b" }}
          aria-label={`Customer email: ${order.customer_email}`}
        >
          {order.customer_email}
        </span>
        <span 
          data-testId="order-quantity" 
          style={{ fontSize: "0.95rem", color: "#64748b" }}
          aria-label={`Order contains ${order.items.length} item${order.items.length !== 1 ? "s" : ""}`}
        >
          {order.items.length} item{order.items.length !== 1 ? "s" : ""}
        </span>
        <span 
          data-testId="order-price" 
          style={{ fontSize: "1rem", color: "#0f766e", fontWeight: 500 }}
          aria-label={`Total amount: $${order.total_amount.toFixed(2)}`}
        >
          ${order.total_amount.toFixed(2)}
        </span>
      </div>
      {/* View Details */}
      <Button
        variant="link"
        className="ml-auto"
        style={{ color: "#60a5fa", background: "#f3f4f6", borderRadius: "0.5rem", fontWeight: 500, padding: "0.5rem 1.25rem", border: "1px solid #9ca3af", boxShadow: "none", transition: "background 0.2s", minWidth: '7rem', textAlign: 'center', fontSize: '1rem', marginTop: '0.5rem' }}
        onMouseOver={e => { e.currentTarget.style.background = "#e5e7eb"; }}
        onMouseOut={e => { e.currentTarget.style.background = "#f3f4f6"; }}
        onClick={() => {
          window.location.href = `/orders/${order.order_id}`;
        }}
        data-testId="order-view-details-btn"
        aria-label={`View details for order ${order.order_id}`}
      >
        View Details
      </Button>
    </div>
  );
}

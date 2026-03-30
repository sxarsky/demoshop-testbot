import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import "@/styles/select-zindex-workaround.css";
import { getSessionIdFromCookie } from "../../lib/utils";
import { apiUrl } from "../../config";

interface Product {
  product_id: string;
  name: string;
  price: number;
}

interface EditableItem {
  product_id: string;
  quantity: number;
}

interface OrderItem {
  product_id: number;
  quantity: number;
  order_item_id?: number;
  unit_price?: number;
}

interface OrderData {
  order_id: number;
  customer_email: string;
  status: string;
  items: OrderItem[];
  discount_type?: string;
  discount_value?: number;
  total_amount: number;
}

interface EditOrderFormProps {
  order: OrderData;
  onClose: () => void;
  onUpdate: (updatedOrder: any) => void;
}

const ORDER_STATUSES = ["pending", "confirmed", "shipped", "delivered", "cancelled"];

const DISCOUNT_TYPES = [
  { value: "none", label: "No Discount" },
  { value: "percentage", label: "Percentage (%)" },
  { value: "fixed", label: "Fixed Amount ($)" },
];

const inputStyle: React.CSSProperties = {
  fontFamily: "inherit",
  fontSize: "1rem",
  fontWeight: 400,
  border: "1.5px solid #d1d5db",
  outline: "none",
  transition: "border-color 0.2s, box-shadow 0.2s",
};

const focusStyle = (e: React.FocusEvent<HTMLInputElement>) => {
  e.currentTarget.style.border = "1.5px solid #6b7280";
  e.currentTarget.style.boxShadow = "0 0 0 1.5px #6b7280";
};

const blurStyle = (e: React.FocusEvent<HTMLInputElement>) => {
  e.currentTarget.style.border = "1.5px solid #d1d5db";
  e.currentTarget.style.boxShadow = "none";
};

const EditOrderForm: React.FC<EditOrderFormProps> = ({ order, onClose, onUpdate }) => {
  const [customerEmail, setCustomerEmail] = useState(order.customer_email);
  const [status, setStatus] = useState(order.status);
  const [items, setItems] = useState<EditableItem[]>(
    order.items.map((item) => ({
      product_id: String(item.product_id),
      quantity: item.quantity,
    }))
  );
  const [discountType, setDiscountType] = useState(order.discount_type || "none");
  const [discountValue, setDiscountValue] = useState<number>(order.discount_value ?? 0);
  const [productsList, setProductsList] = useState<Product[]>([]);
  const [addingProduct, setAddingProduct] = useState<EditableItem>({ product_id: "", quantity: 1 });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch(apiUrl("/api/v1/products?limit=50"), {
      headers: { Authorization: `Bearer ${getSessionIdFromCookie()}` },
    })
      .then((res) => res.json())
      .then((data) => setProductsList(data))
      .catch(() => setProductsList([]));
  }, []);

  // ── Derived totals ──────────────────────────────────────────────────────────
  const subtotal = items.reduce((sum, item) => {
    const prod = productsList.find((p) => String(p.product_id) === String(item.product_id));
    return sum + (prod ? prod.price * item.quantity : 0);
  }, 0);

  const discountAmount = (() => {
    if (discountType === "percentage" && discountValue > 0) {
      return subtotal * (discountValue / 100);
    }
    if (discountType === "fixed" && discountValue > 0) {
      return Math.min(subtotal, discountValue);
    }
    return 0;
  })();

  const computedTotal = Math.max(0, subtotal - discountAmount);

  // ── Item handlers ───────────────────────────────────────────────────────────
  const handleAddProduct = () => {
    if (!addingProduct.product_id || addingProduct.quantity < 1) return;
    if (items.some((p) => p.product_id === addingProduct.product_id)) return;
    setItems((prev) => [...prev, { ...addingProduct }]);
    setAddingProduct({ product_id: "", quantity: 1 });
  };

  const handleRemoveItem = (idx: number) => {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleQuantityChange = (idx: number, val: number) => {
    setItems((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, quantity: val > 0 ? val : 1 } : item))
    );
  };

  // ── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!customerEmail) {
      setError("Customer email is required.");
      return;
    }
    if (items.length === 0) {
      setError("At least one item is required.");
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        customer_email: customerEmail,
        status,
        items: items.map((item) => ({
          product_id: parseInt(item.product_id),
          quantity: item.quantity,
        })),
        discount_type: discountType,
        discount_value: discountType !== "none" ? discountValue : 0,
      };
      const res = await fetch(apiUrl(`/api/v1/orders/${order.order_id}`), {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getSessionIdFromCookie()}`,
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Failed to update order");
      const updatedOrder = await res.json();
      onUpdate(updatedOrder);
      onClose();
    } catch {
      setError("Failed to update order.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────
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
    >
      <div
        style={{
          maxWidth: "42rem",
          minWidth: "28rem",
          width: "100%",
          background: "#fff",
          borderRadius: "0.75rem",
          boxShadow:
            "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)",
          padding: "1.5rem",
          position: "relative",
          display: "flex",
          flexDirection: "column",
          maxHeight: "92vh",
          overflow: "auto",
        }}
        data-testId="edit-order-modal-box"
      >
        {/* Close button */}
        <button
          style={{
            position: "absolute",
            top: "1rem",
            right: "1rem",
            color: "#6b7280",
            background: "white",
            borderRadius: "9999px",
            fontSize: "1.25rem",
            fontWeight: 700,
            width: "1.75rem",
            height: "1.75rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 0,
            boxShadow: "0 1px 2px 0 rgba(0,0,0,0.05)",
            zIndex: 10,
            border: "1.5px solid #888",
            cursor: "pointer",
            transition: "color 0.2s, border-color 0.2s",
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.color = "#000";
            e.currentTarget.style.borderColor = "#222";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.color = "#6b7280";
            e.currentTarget.style.borderColor = "#888";
          }}
          onClick={onClose}
          aria-label="Close"
          type="button"
          data-testId="edit-order-dismiss-btn"
        >
          ×
        </button>

        <h3
          className="text-2xl font-semibold text-center mb-1"
          data-testId="edit-order-heading"
        >
          Edit Order #{order.order_id}
        </h3>

        {error && (
          <div className="text-red-500 text-center mb-2" data-testId="edit-order-error">
            {error}
          </div>
        )}

        <form
          className="flex flex-col"
          style={{ gap: "1rem" }}
          onSubmit={handleSubmit}
          data-testId="edit-order-form"
        >
          {/* ── Customer Email ── */}
          <div>
            <label
              className="block text-sm font-medium text-gray-700 mb-1 text-left"
              data-testId="edit-order-label-email"
            >
              Customer Email
            </label>
            <Input
              name="customer_email"
              placeholder="e.g. user@email.com"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              className="w-full px-4 py-2"
              style={inputStyle}
              onFocus={focusStyle}
              onBlur={blurStyle}
              data-testId="edit-order-input-email"
            />
          </div>

          {/* ── Status ── */}
          <div>
            <label
              className="block text-sm font-medium text-gray-700 mb-1 text-left"
              data-testId="edit-order-label-status"
            >
              Status
            </label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger
                style={{
                  border: "1.5px solid #d1d5db",
                  width: "100%",
                  padding: "0.5rem 1rem",
                  background: "#fff",
                  borderRadius: "0.375rem",
                  fontSize: "1rem",
                  textAlign: "left",
                  textTransform: "capitalize",
                }}
                data-testId="edit-order-status-trigger"
              >
                <SelectValue placeholder="Select status…" />
              </SelectTrigger>
              <SelectContent>
                {ORDER_STATUSES.map((s) => (
                  <SelectItem
                    key={s}
                    value={s}
                    style={{ textTransform: "capitalize" }}
                    data-testId={`edit-order-status-option-${s}`}
                  >
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* ── Items ── */}
          <div data-testId="edit-order-items-section">
            <label
              className="block text-sm font-medium text-gray-700 mb-1 text-left"
              data-testId="edit-order-label-items"
            >
              Items
            </label>

            {/* Add a new product row */}
            <div
              style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}
              data-testId="edit-order-add-item-row"
            >
              <div style={{ position: "relative", minWidth: "220px", flex: 1 }}>
                <Select
                  value={addingProduct.product_id}
                  onValueChange={(val) =>
                    setAddingProduct((ap) => ({ ...ap, product_id: val }))
                  }
                >
                  <SelectTrigger
                    style={{
                      border: "1.5px solid #d1d5db",
                      width: "100%",
                      padding: "0.5rem 1rem",
                      background: "#fff",
                      borderRadius: "0.375rem",
                      fontSize: "1rem",
                      textAlign: "left",
                    }}
                    data-testId="edit-order-add-product-select"
                  >
                    <SelectValue placeholder="Select product…">
                      {addingProduct.product_id && productsList.length > 0
                        ? (() => {
                            const selected = productsList.find(
                              (p) =>
                                String(p.product_id).trim() ===
                                String(addingProduct.product_id).trim()
                            );
                            return selected ? (
                              <span style={{ fontWeight: 500 }}>
                                {selected.name}{" "}
                                <span style={{ color: "#6b7280", fontWeight: 400 }}>
                                  ${selected.price}
                                </span>
                              </span>
                            ) : null;
                          })()
                        : null}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {[...productsList]
                      .sort((a, b) => a.name.localeCompare(b.name))
                      .map((p) => (
                        <SelectItem
                          key={p.product_id}
                          value={String(p.product_id)}
                          style={{ paddingLeft: "0.5rem", borderBottom: "1px solid #e5e7eb" }}
                          data-testId={`edit-order-product-option-${p.name}`}
                        >
                          {p.name} (${p.price})
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <Input
                type="number"
                min={1}
                value={addingProduct.quantity}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setAddingProduct((ap) => ({ ...ap, quantity: val > 0 ? val : 1 }));
                }}
                style={{
                  border: "1.5px solid #d1d5db",
                  fontSize: "1rem",
                  width: "3.5rem",
                  textAlign: "center",
                  paddingLeft: 0,
                  paddingRight: 0,
                  borderRadius: "0.375rem",
                  height: "2.5rem",
                }}
                data-testId="edit-order-add-qty-input"
              />
              <Button
                type="button"
                onClick={handleAddProduct}
                style={{
                  background: "#f3f4f6",
                  color: "#111",
                  border: "1.5px solid transparent",
                  height: "2.5rem",
                  borderRadius: "0.375rem",
                  fontWeight: 500,
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = "#d1d5db";
                  e.currentTarget.style.border = "1.5px solid #000";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = "#f3f4f6";
                  e.currentTarget.style.border = "1.5px solid transparent";
                }}
                data-testId="edit-order-add-item-btn"
              >
                Add
              </Button>
            </div>

            {/* Current items list */}
            {items.length > 0 && (
              <div
                style={{
                  marginTop: "0.5rem",
                  border: "1.5px solid #e5e7eb",
                  borderRadius: "0.5rem",
                  background: "#f9fafb",
                  padding: "0.5rem",
                  maxHeight: "14rem",
                  overflowY: "auto",
                }}
                data-testId="edit-order-items-list"
              >
                {/* Header row */}
                <div
                  style={{
                    display: "flex",
                    fontWeight: 600,
                    color: "#374151",
                    marginBottom: "0.25rem",
                    fontSize: "0.875rem",
                    padding: "0 0.25rem",
                  }}
                >
                  <span style={{ flex: 2 }}>Name</span>
                  <span style={{ flex: 1, textAlign: "center" }}>Qty</span>
                  <span style={{ flex: 1, textAlign: "center" }}>Unit Price</span>
                  <span style={{ flex: 1, textAlign: "center" }}>Total</span>
                  <span style={{ flex: 0.5 }} />
                </div>

                {items.map((item, idx) => {
                  const prod = productsList.find(
                    (p) => String(p.product_id).trim() === String(item.product_id).trim()
                  );
                  return (
                    <div
                      key={item.product_id + idx}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.25rem",
                        marginBottom: "0.25rem",
                        fontSize: "0.95rem",
                        background: "#fff",
                        borderRadius: "0.375rem",
                        padding: "0.25rem 0.5rem",
                      }}
                      data-testId={`edit-order-item-row-${prod?.name || item.product_id}`}
                    >
                      <span style={{ flex: 2 }} data-testId={`edit-order-item-name-${idx}`}>
                        {prod ? prod.name : `Product #${item.product_id}`}
                      </span>
                      {/* Editable quantity */}
                      <span style={{ flex: 1, display: "flex", justifyContent: "center" }}>
                        <Input
                          type="number"
                          min={1}
                          value={item.quantity}
                          onChange={(e) =>
                            handleQuantityChange(idx, Number(e.target.value))
                          }
                          style={{
                            width: "3rem",
                            textAlign: "center",
                            fontSize: "0.95rem",
                            padding: "0.1rem 0.25rem",
                            border: "1.5px solid #d1d5db",
                            borderRadius: "0.25rem",
                            height: "1.75rem",
                          }}
                          data-testId={`edit-order-item-qty-${idx}`}
                        />
                      </span>
                      <span
                        style={{ flex: 1, textAlign: "center", color: "#374151" }}
                        data-testId={`edit-order-item-unitprice-${idx}`}
                      >
                        {prod ? `$${prod.price.toFixed(2)}` : "—"}
                      </span>
                      <span
                        style={{ flex: 1, textAlign: "center", color: "#16a34a", fontWeight: 500 }}
                        data-testId={`edit-order-item-total-${idx}`}
                      >
                        {prod ? `$${(prod.price * item.quantity).toFixed(2)}` : "—"}
                      </span>
                      <Button
                        type="button"
                        variant="link"
                        style={{ color: "#dc2626", flex: 0.5, fontWeight: 500 }}
                        onClick={() => handleRemoveItem(idx)}
                        data-testId={`edit-order-item-remove-${idx}`}
                      >
                        Remove
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── Discount ── */}
          <div
            style={{
              borderTop: "1.5px solid #e5e7eb",
              paddingTop: "0.75rem",
            }}
            data-testId="edit-order-discount-section"
          >
            <label
              className="block text-sm font-medium text-gray-700 mb-1 text-left"
              data-testId="edit-order-label-discount"
            >
              Discount
            </label>
            <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
              <div style={{ flex: 1 }}>
                <Select value={discountType} onValueChange={(val) => {
                  setDiscountType(val);
                  if (val === "none") setDiscountValue(0);
                }}>
                  <SelectTrigger
                    style={{
                      border: "1.5px solid #d1d5db",
                      width: "100%",
                      padding: "0.5rem 1rem",
                      background: "#fff",
                      borderRadius: "0.375rem",
                      fontSize: "1rem",
                      textAlign: "left",
                    }}
                    data-testId="edit-order-discount-type-trigger"
                  >
                    <SelectValue placeholder="Discount type…" />
                  </SelectTrigger>
                  <SelectContent>
                    {DISCOUNT_TYPES.map((dt) => (
                      <SelectItem
                        key={dt.value}
                        value={dt.value}
                        data-testId={`edit-order-discount-type-${dt.value}`}
                      >
                        {dt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {discountType !== "none" && (
                <div
                  style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}
                  data-testId="edit-order-discount-value-container"
                >
                  {discountType === "fixed" && (
                    <span style={{ fontSize: "1rem", color: "#374151", fontWeight: 500 }}>$</span>
                  )}
                  <Input
                    type="number"
                    min={0}
                    max={discountType === "percentage" ? 100 : undefined}
                    step={discountType === "percentage" ? 1 : 0.01}
                    value={discountValue}
                    onChange={(e) => setDiscountValue(Math.max(0, Number(e.target.value)))}
                    style={{
                      width: "5rem",
                      textAlign: "center",
                      fontSize: "1rem",
                      border: "1.5px solid #d1d5db",
                      borderRadius: "0.375rem",
                      height: "2.25rem",
                    }}
                    onFocus={focusStyle}
                    onBlur={blurStyle}
                    data-testId="edit-order-discount-value-input"
                  />
                  {discountType === "percentage" && (
                    <span style={{ fontSize: "1rem", color: "#374151", fontWeight: 500 }}>%</span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* ── Order Summary ── */}
          <div
            style={{
              borderTop: "1.5px solid #e5e7eb",
              paddingTop: "0.75rem",
              display: "flex",
              flexDirection: "column",
              gap: "0.25rem",
              fontSize: "0.95rem",
              color: "#374151",
            }}
            data-testId="edit-order-summary"
          >
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Subtotal</span>
              <span data-testId="edit-order-subtotal">${subtotal.toFixed(2)}</span>
            </div>
            {discountType !== "none" && discountAmount > 0 && (
              <div
                style={{ display: "flex", justifyContent: "space-between", color: "#16a34a" }}
                data-testId="edit-order-discount-row"
              >
                <span>
                  Discount (
                  {discountType === "percentage"
                    ? `${discountValue}%`
                    : `$${discountValue.toFixed(2)}`}
                  )
                </span>
                <span data-testId="edit-order-discount-amount">−${discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontWeight: 700,
                fontSize: "1rem",
                marginTop: "0.25rem",
                color: "#111827",
              }}
            >
              <span>Total</span>
              <span data-testId="edit-order-total">${computedTotal.toFixed(2)}</span>
            </div>
          </div>

          {/* ── Actions ── */}
          <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
            <Button
              type="submit"
              disabled={submitting}
              className="flex-1"
              style={{
                background: "#f3f4f6",
                color: "#111",
                border: "1.5px solid transparent",
                transition: "background 0.2s, border-color 0.2s",
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = "#d1d5db";
                e.currentTarget.style.border = "1.5px solid #000";
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = "#f3f4f6";
                e.currentTarget.style.border = "1.5px solid transparent";
              }}
              data-testId="edit-order-submit-btn"
            >
              {submitting ? "Saving…" : "Save Changes"}
            </Button>
            <Button
              type="button"
              variant="link"
              onClick={onClose}
              style={{
                color: "#6b7280",
                background: "transparent",
                border: "1.5px solid #d1d5db",
                borderRadius: "0.375rem",
                padding: "0.5rem 1rem",
              }}
              data-testId="edit-order-cancel-btn"
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditOrderForm;

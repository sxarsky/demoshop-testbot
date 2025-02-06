"""
Order models for the API.
"""
from datetime import datetime
from enum import Enum
from typing import List, Optional
from pydantic import field_validator
from sqlmodel import SQLModel, Field, Relationship

class OrderStatus(str, Enum):
    """Order status enumeration."""
    PENDING = "pending"
    CONFIRMED = "confirmed"
    SHIPPED = "shipped"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"

class OrderItemBase(SQLModel):
    """Model for order items with common fields."""
    quantity: int = Field(ge=1)
    product_id: int = Field(foreign_key="product.id")
    unit_price: float = Field(ge=1)

    @field_validator('quantity')
    @classmethod
    def quantity_must_be_positive(cls, v):
        """Validate that quantity is positive."""
        if v < 1:
            raise ValueError('Quantity must be at least 1')
        return v

    @field_validator('unit_price')
    @classmethod
    def unit_price_must_be_positive(cls, v):
        """Validate that unit price is positive.""" 
        if v < 1.0:
            raise ValueError('Unit price must be at least 1.0')
        return v

class OrderItem(OrderItemBase, table=True):
    """Model for order items."""
    id: Optional[int] = Field(default=None, primary_key=True)
    order_id: int = Field(foreign_key="order.id")

    # Relationships
    product: Optional["Product"] = Relationship()
    order: Optional["Order"] = Relationship(back_populates="items")

class OrderItemCreate(OrderItemBase):
    """Model for creating new order items in DB."""
    pass

class OrderItemRead(OrderItemBase):
    """Model for fetching order items from DB."""
    id: int
    order_id: int

class OrderBase(SQLModel):
    """Parent Model for orders with common fields."""
    customer_email: str = Field(index=True)
    status: OrderStatus = Field(default=OrderStatus.PENDING)
    total_amount: float = Field(default=0.0)

class Order(OrderBase, table=True):
    """Model for orders."""
    id: Optional[int] = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    # Relationships
    items: List[OrderItem] = Relationship(back_populates="order")

class OrderCreate(SQLModel):
    """Model for creating new orders in DB."""
    customer_email: str
    items: List[OrderItemCreate]

class OrderRead(OrderBase):
    """Model for fetching order details from DB."""
    id: int
    created_at: datetime
    updated_at: datetime

"""
Order models for the API.
"""
from datetime import datetime
from enum import Enum
from typing import List, Optional
from pydantic import BaseModel, Field, EmailStr

class OrderStatus(str, Enum):
    """Order status enumeration."""
    PENDING = "pending"
    CONFIRMED = "confirmed"
    SHIPPED = "shipped"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"

class DiscountType(str, Enum):
    """Discount type enumeration."""
    NONE = "none"
    PERCENTAGE = "percentage"
    FIXED = "fixed"

class OrderItemBase(BaseModel):
    """Model for order items with common fields."""
    quantity: int = Field(ge=0)
    product_id: int = Field(ge=1)

class OrderItem(OrderItemBase):
    """Model for order items."""
    # TODO: order_item_id should be a UUID. Hardcoding it as 0 to pass the tests
    order_item_id: int = Field()
    order_id: int = Field()
    unit_price: float = Field()

class OrderItemCreate(OrderItemBase):
    """Model for creating new order items in DB."""
    pass

class OrderItemRead(OrderItemBase):
    """Model for fetching order items from DB."""
    order_item_id: int = Field(ge=1)
    order_id: int = Field(ge=1)

class OrderBase(BaseModel):
    """Parent Model for orders with common fields."""
    customer_email: EmailStr = Field(max_length=255)
    status: OrderStatus = Field(default=OrderStatus.PENDING)
    total_amount: float = Field(default=0.0)

class Order(OrderBase):
    """Model for orders."""
    # TODO: order_id should be a UUID. Hardcoding it as 0 to pass the tests
    order_id: int = Field(ge=1)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    items: List[OrderItem]
    discount_type: str = Field(default="none")
    discount_value: float = Field(default=0.0)

class OrderCreate(BaseModel):
    """Model for creating new orders in DB."""
    customer_email: EmailStr = Field(max_length=255)
    items: List[OrderItemCreate]
    model_config = {
        "json_schema_extra": {
            "example": {
                "customer_email": "abc@mail.com",
                "items": [
                    {
                        "quantity": 2,
                        "product_id": 1
                    }
                ]
            }
        }
    }

class OrderRead(OrderBase):
    """Model for fetching order details from DB."""
    order_id: int
    items: List[OrderItemRead]
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    discount_type: str = Field(default="none")
    discount_value: float = Field(default=0.0)
    model_config = {
        "json_schema_extra": {
            "example": {
                "order_id": 1,
                "customer_email": "abc@mail.com",
                "status": "pending",
                "total_amount": 19.98,
                "items": [
                    {
                        "order_item_id": 1,
                        "quantity": 2,
                        "product_id": 1
                    }
                ],
                "created_at": "2022-01-01T00:00:00",
                "updated_at": "2022-01-01T00:00:00",
                "discount_type": "none",
                "discount_value": 0.0
            }
        }
    }

class OrderCancel(BaseModel):
    """Model for cancelling an order."""
    message: str = Field(default="Order cancelled successfully")

class OrderUpdate(BaseModel):
    """Model for updating an existing order."""
    customer_email: Optional[EmailStr] = None
    status: Optional[OrderStatus] = None
    items: Optional[List[OrderItemCreate]] = None
    discount_type: Optional[DiscountType] = None
    discount_value: Optional[float] = Field(default=None, ge=0)

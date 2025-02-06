from datetime import datetime
from typing import List

from fastapi import APIRouter
from sqlmodel import select

from api_insight.deps import SessionDep, CurrentUserDep
from api_insight.exceptions import ResourceNotFoundException
from api_insight.models.order import (
    Order, OrderCreate, OrderRead,
    OrderItem, OrderStatus
)
from api_insight.models.product import Product

router = APIRouter(
    prefix="/orders",
    tags=["orders"]
)

@router.post("", response_model=OrderRead, status_code=201,
            summary="Create a new order",
            description="Create a new order with the specified products and quantities")
async def create_order(
    order: OrderCreate,
    session: SessionDep
):
    # Create new order
    db_order = Order(customer_email=order.customer_email)
    session.add(db_order)
    session.flush()  # Flush to get the order ID
    
    total_amount = 0.0
    
    # Process each order item
    for item in order.items:
        # Get product to verify existence and price
        product = session.get(Product, item.product_id)
        if not product:
            raise ResourceNotFoundException(status_code=404, detail=f"Product with id {item.product_id} not found")
        
        # Create order item
        order_item = OrderItem(
            order_id=db_order.id,
            product_id=product.id,
            quantity=item.quantity,
            unit_price=product.price
        )
        session.add(order_item)
        
        # Update total amount
        total_amount += product.price * item.quantity
    
    # Update order total
    db_order.total_amount = total_amount
    
    session.commit()
    session.refresh(db_order)
    return db_order

@router.get("", response_model=List[OrderRead],
           summary="Get all orders",
           description="Retrieve all orders with optional filtering")
async def get_orders(
    session: SessionDep,
    current_user: CurrentUserDep,
    skip: int = 0,
    limit: int = 100
):
    query = select(Order)
    orders = session.exec(query.offset(skip).limit(limit)).all()
    return orders

@router.get("/{order_id}", response_model=OrderRead,
           summary="Get order by ID",
           description="Retrieve a specific order by its ID")
async def get_order(
    order_id: int,
    session: SessionDep
):
    order = session.get(Order, order_id)
    if not order:
        raise ResourceNotFoundException(status_code=404, detail="Order not found")
    return order

@router.delete("/{order_id}",
              summary="Cancel order",
              description="Cancel an existing order")
async def cancel_order(
    order_id: int,
    session: SessionDep
):
    order = session.get(Order, order_id)
    if not order:
        raise ResourceNotFoundException(status_code=404, detail="Order not found")
    
    order.status = OrderStatus.CANCELLED
    order.updated_at = datetime.utcnow()
    
    session.add(order)
    session.commit()
    return {"message": "Order cancelled successfully"}
    

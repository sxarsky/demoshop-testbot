"""
Order API
"""
from typing import List, Annotated
from fastapi import APIRouter, Depends, Query
from sqlalchemy.exc import SQLAlchemyError
from api_insight.deps import SessionDep, get_current_user
from api_insight.exceptions import ResourceNotFoundException
from api_insight.models.order import (
    Order, OrderCreate, OrderRead,
    OrderItem, OrderCancel
)
from api_insight.models.params import QueryParams
from api_insight import crud

router = APIRouter(
    prefix="/orders",
    tags=["orders"],
    dependencies=[Depends(get_current_user)]
)

@router.post("", response_model=OrderRead, status_code=201,
            summary="Create a new order",
            description="Create a new order with the specified products and quantities")
async def create_order(
    order: OrderCreate,
    session: SessionDep
):
    """
    Create a new order
    """
    db_order = Order(customer_email=order.customer_email)
    db_order.order_id = crud.orders.set_order_id(session)
    session.add(db_order)
    session.flush()  # Flush to get the order ID

    total_amount = 0.0

    # Process each order item
    for item in order.items:
        # Get product to verify existence and price
        product = crud.products.get_product(session, item.product_id)
        if not product:
            raise ResourceNotFoundException(status_code=404,
                                            detail=f"Product with id {item.product_id} not found")

        # Create order item
        order_item = OrderItem(
            order_item_id=crud.orders.set_order_item_id(session),
            order_id=db_order.order_id,
            product_id=product.product_id,
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
    query_params: Annotated[QueryParams, Query()],
):
    """
    Get all orders
    """
    orders = crud.orders.get_orders(session, query_params.limit, query_params.offset)
    for order in orders:
        order.items = crud.orders.get_order_items(session, order.order_id)
    return orders

@router.get("/{order_id}", response_model=OrderRead,
           summary="Get order by ID",
           description="Retrieve a specific order by its ID")
async def get_order(
    order_id: int,
    session: SessionDep
):
    """
    Get a specific order by its ID
    """
    order = crud.orders.get_order(session, order_id)
    if not order:
        raise ResourceNotFoundException(status_code=404, detail="Order not found")
    order.items = crud.orders.get_order_items(session, order_id)
    return order

@router.delete("/{order_id}",
              summary="Cancel order",
              description="Cancel an existing order",
              response_model=OrderCancel)
async def cancel_order(
    order_id: int,
    session: SessionDep
):
    """
    Cancel an existing order
    """
    try:
        crud.orders.cancel_order(session, order_id)
    except SQLAlchemyError as e:
        raise ResourceNotFoundException(status_code=404, detail=str(e)) from e
    return OrderCancel(message="Order cancelled successfully")

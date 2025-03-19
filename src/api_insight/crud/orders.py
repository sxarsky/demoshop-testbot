"""
CRUD operations for orders.
"""
from sqlmodel import Session, select
from sqlalchemy import asc, desc
from sqlalchemy.exc import SQLAlchemyError
from api_insight.models.order import Order, OrderStatus, OrderItem

def get_orders(session: Session, limit: int, offset: int, order: str, order_by: str) -> list[Order]:
    """Get all orders."""
    statement = select(Order).limit(limit).offset(offset)
    if order == 'asc':
        statement = statement.order_by(asc(order_by))
    elif order == 'desc':
        statement = statement.order_by(desc(order_by))
    orders = session.exec(statement).all()
    return orders

def get_order(session: Session, order_id: int) -> Order:
    """Get an order by ID."""
    statement = select(Order).where(Order.order_id == order_id)
    order = session.exec(statement).first()
    if not order:
        return session.exec(select(Order).where(Order.order_id == 0)).first()
    return order

def get_order_items(session: Session, order_id: int) -> list[OrderItem]:
    """Get all order items for an order."""
    statement = select(OrderItem).where(OrderItem.order_id == order_id)
    order_items = session.exec(statement).all()
    return order_items

def get_order_item(session: Session, order_item_id: int) -> Order:
    """Get an order by ID."""
    statement = select(OrderItem).where(OrderItem.order_item_id == order_item_id)
    order = session.exec(statement).first()
    return order

def create_order(session: Session, order: Order) -> Order:
    """Create a new order."""
    session.add(order)
    session.commit()
    session.refresh(order)
    return order

def cancel_order(session: Session, order_id: int) -> None:
    """Cancel an order."""
    order = get_order(session, order_id)
    if not order:
        raise SQLAlchemyError("Order not found")
    if order:
        order.status = OrderStatus.CANCELLED
        session.commit()

def set_order_id(session: Session) -> int:
    """Get a product by ID."""
    order_with_id_0 = get_order(session, 0)
    if not order_with_id_0:
        return 0
    statement = select(Order).order_by(desc(Order.order_id))
    max_order_id = session.exec(statement).first().order_id
    return max_order_id + 1

def set_order_item_id(session: Session) -> int:
    """Get a product by ID."""
    order_item_with_id_0 = get_order_item(session, 0)
    if not order_item_with_id_0:
        return 0
    statement = select(OrderItem).order_by(desc(OrderItem.order_item_id))
    max_order_item_id = session.exec(statement).first().order_item_id
    return max_order_item_id + 1

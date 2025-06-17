"""
Order API
"""
from typing import List, Annotated
from fastapi import APIRouter, Query
from api_insight.deps import CacheDep, GetIpDep, EnsureSessionDep
from api_insight.exceptions import ResourceNotFoundException
from api_insight.models.order import (
    OrderCreate, OrderRead,
    OrderCancel, Order
)
from api_insight.models.params import QueryParams
from api_insight.crud import orders

router = APIRouter(
    prefix="/orders",
    tags=["orders"],
    dependencies=[EnsureSessionDep]
)

@router.post("", response_model=OrderRead, status_code=201,
            summary="Create a new order",
            description="Create a new order with the specified products and quantities")
async def create_order(
    order: OrderCreate,
    cache: CacheDep,
    ip: GetIpDep
):
    """
    Create a new order
    """
    db_order = orders.create_order(cache, ip, order)
    db_order.items = orders.get_order_items(cache, ip, db_order.order_id)
    return db_order

@router.get("", response_model=List[Order],
           summary="Get all orders",
           description="Retrieve all orders with optional filtering")
async def get_orders(
    cache: CacheDep,
    ip: GetIpDep,
    query_params: Annotated[QueryParams, Query()],
):
    """
    Get all orders
    """
    order_list = orders.get_orders(cache,
                                   ip,
                                   query_params.limit,
                                   query_params.offset,
                                   query_params.order,
                                   query_params.orderBy)
    return order_list

@router.get("/{order_id}", response_model=OrderRead,
           summary="Get order by ID",
           description="Retrieve a specific order by its ID")
async def get_order(
    order_id: int,
    cache: CacheDep,
    ip: GetIpDep
):
    """
    Get a specific order by its ID
    """
    order = orders.get_order(cache, ip, order_id)
    if not order:
        raise ResourceNotFoundException(status_code=404, detail="Order not found")
    order.items = orders.get_order_items(cache, ip, order_id)
    return order

@router.delete("/{order_id}",
              summary="Cancel order",
              description="Cancel an existing order",
              response_model=OrderCancel)
async def cancel_order(
    order_id: int,
    cache: CacheDep,
    ip: GetIpDep
):
    """
    Cancel an existing order
    """
    orders.cancel_order(cache, ip, order_id)
    return OrderCancel(message="Order cancelled successfully")

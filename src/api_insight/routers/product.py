"""
Router for product-related endpoints.
Handles CRUD operations for product management.
"""
from datetime import datetime, timezone
from typing import List, Annotated

from fastapi import APIRouter, status, Path, Query
from sqlmodel import select
from pydantic import BaseModel, Field
from api_insight.deps import SessionDep, CurrentUserDep
from api_insight.exceptions import ResourceNotFoundException
from api_insight.models.product import Product, ProductCreate, ProductUpdate, ProductResponse

router = APIRouter(
    prefix="/products",
    tags=["products"],
)

class QueryParams(BaseModel):
    """Query parameters for product filtering."""
    limit: int = Field(default=10, ge=1, le=100)
    offset: int = Field(default=0, ge=0)
    order: str | None = Field(default="asc", pattern="^(asc|desc)$")
    orderBy: str | None = Field(default=None, pattern="^[a-zA-Z]+$")

@router.post("",
    response_model=ProductResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new product",
    description="Create a new product in the catalog with the provided details",
)
def create_product(
    product: ProductCreate,
    session: SessionDep
):
    """Create a new product in the database."""
    db_product = Product.model_validate(product)
    session.add(db_product)
    session.commit()
    session.refresh(db_product)
    return db_product

@router.get("", response_model=List[ProductResponse], summary="Get a list of products")
def get_products(
    query_params: Annotated[QueryParams, Query()],
    session: SessionDep,
    current_user: CurrentUserDep
):
    """Get all products from the database."""
    products = session.exec(select(Product)
                            .limit(query_params.limit)
                            .offset(query_params.offset)
                            .order_by(query_params.orderBy)).all()
    return products

@router.get("/{product_id}",
            response_model=ProductResponse,
            summary="Get a product by ID",
            status_code=status.HTTP_200_OK
)
def get_product(product_id: Annotated[int, Path()], session: SessionDep):
    """Get a single product by its ID."""
    product = session.get(Product, product_id)
    if not product:
        raise ResourceNotFoundException(status_code=404, detail="Product not found")
    return product

@router.put("/{product_id}", response_model=ProductResponse, summary="Update a product by ID")
def update_product(product_id: Annotated[int, Path()],
                   product_update: ProductUpdate,
                   session: SessionDep):
    """Update a product's details by its ID."""
    product = session.get(Product, product_id)
    if not product:
        raise ResourceNotFoundException(status_code=404, detail="Product not found")
    product_data = product_update.dict(exclude_unset=True)
    for key, value in product_data.items():
        setattr(product, key, value)
    product.updated_at = datetime.now(timezone.utc)
    session.add(product)
    session.commit()
    session.refresh(product)
    return product

@router.delete("/{product_id}",
               status_code=status.HTTP_204_NO_CONTENT,
               summary="Delete a product by ID")
def delete_product(product_id: Annotated[int, Path()], session: SessionDep):
    """Delete a product by its ID."""
    product = session.get(Product, product_id)
    if not product:
        raise ResourceNotFoundException(status_code=404, detail="Product not found")
    session.delete(product)
    session.commit()
    return

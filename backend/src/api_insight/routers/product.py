"""
Router for product-related endpoints.
Handles CRUD operations for product management.
"""
import json
from typing import Callable, List, Annotated

from fastapi import APIRouter, status, Path, Query, Request, Response
from fastapi.routing import APIRoute
from api_insight.deps import CacheDep, GetSessionIdDep, EnsureSessionDep
from api_insight.exceptions import ResourceNotFoundException
from api_insight.models.product import ProductCreate, ProductUpdate, ProductResponse, ProductUpdateResponse
from api_insight.models.params import QueryParams
from api_insight.crud import products

class MultiContentTypeRequest(Request):
    """
    Custom request class to handle multiple content types.
    """

    async def body(self) -> bytes:
        if not hasattr(self, "_body"):
            body = await super().body()

            content_type_value = self.headers.get("content-type")
            if content_type_value.split(";", 1)[0].lower().strip() == "application/x-www-form-urlencoded":

                form = await super().form()
                body = json.dumps(form._dict).encode()

                self._headers = self.headers.mutablecopy()
                self.headers["content-type"] = "application/json"

            self._body = body
        return self._body


class MultiContentTypeRoute(APIRoute):
    """
    Custom route class to handle multiple content types.
    """
    def get_route_handler(self) -> Callable:
        original_route_handler = super().get_route_handler()

        async def custom_route_handler(request: Request) -> Response:
            request = MultiContentTypeRequest(request.scope, request.receive)
            return await original_route_handler(request)

        return custom_route_handler

router = APIRouter(
    prefix="/products",
    tags=["products"],
    route_class=MultiContentTypeRoute,
    dependencies=[EnsureSessionDep]
)

@router.post("",
    response_model=ProductResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new product",
    description="Create a new product in the catalog with the provided details",
    openapi_extra={
        "requestBody": {
            "content": {
                "application/x-www-form-urlencoded": {
                    "schema": ProductCreate.model_json_schema(),
                },
                "application/json": {
                    "schema": ProductCreate.model_json_schema(),
                }
            }
        }
    }
)
async def create_product(
    product: ProductCreate,
    cache: CacheDep,
    session_id: GetSessionIdDep
):
    """Create a new product in the database."""
    db_product = products.create_product(cache, session_id, product)
    return db_product

@router.get("", response_model=List[ProductResponse], summary="Get a list of products")
async def get_products(
    query_params: Annotated[QueryParams, Query()],
    cache: CacheDep,
    session_id: GetSessionIdDep
):
    """Get all products from the database."""
    products_list = products.get_products(
        cache,
        session_id,
        query_params.limit,
        query_params.offset,
        query_params.order,
        order_by="product_id" if query_params.orderBy is None else query_params.orderBy
    )
    return products_list

@router.get("/{product_id}",
            response_model=ProductResponse,
            summary="Get a product by ID",
            status_code=status.HTTP_200_OK
)
async def get_product(
    product_id: Annotated[int, Path(json_schema_extra={'example': 0})],
    cache: CacheDep,
    session_id: GetSessionIdDep
):
    """Get a single product by its ID."""
    product = products.get_product(cache, session_id, product_id)
    if not product:
        raise ResourceNotFoundException(status_code=404, detail="Product not found")
    return product

@router.put("/{product_id}", response_model=ProductUpdateResponse, summary="Update a product by ID")
async def update_product(product_id: Annotated[int, Path(json_schema_extra={'example': 0})],
                   product_update: ProductUpdate,
                   cache: CacheDep,
                   session_id: GetSessionIdDep):
    """Update a product's details by its ID."""
    product = products.update_product(cache, session_id, product_id, product_update)
    if not product:
        raise ResourceNotFoundException(status_code=404, detail="Product not found")
    return product

@router.delete("/{product_id}",
               status_code=status.HTTP_204_NO_CONTENT,
               summary="Delete a product by ID")
async def delete_product(product_id: Annotated[int, Path(json_schema_extra={'example': 0})],
                         cache: CacheDep,
                         session_id: GetSessionIdDep):
    """Delete a product by its ID."""
    try:
        products.delete_product(cache, session_id, product_id)
    except ValueError as exc:
        raise ResourceNotFoundException(status_code=404, detail="Product not found") from exc

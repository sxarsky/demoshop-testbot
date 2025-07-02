"""
CRUD operations for products.
"""
from json import loads
from datetime import datetime, timezone
from fastapi.encoders import jsonable_encoder
from redis import Redis
from redis.commands.json.path import Path
from redis.commands.search.query import Query
from api_insight.models.product import Product, ProductCreate, ProductUpdate

DEFAULT_KEY = "demoshop_default"

def get_product(cache, session_id: str, product_id: int) -> Product | None:
    """Get a product by ID."""
    key = session_id if session_id and session_id != "" else DEFAULT_KEY
    product = cache.json().get(f'{key}:products:{product_id}')
    return product

def create_product(cache: Redis, session_id: str, product_create: ProductCreate) -> Product:
    """Create a new product."""
    key = session_id if session_id and session_id != "" else DEFAULT_KEY
    product_id = set_product_id(cache, session_id)
    product = Product(**product_create.model_dump(), product_id=product_id)
    product_valid = Product.model_validate(product)
    product_encoded = jsonable_encoder(product_valid.model_dump())
    cache.json().set(f'{key}:products:{product_id}', Path.root_path(), product_encoded)
    return cache.json().get(f'{key}:products:{product_id}')

def get_products(cache: Redis, session_id: str, limit: int, offset: int, order: str, order_by: str) -> list[Product]:
    """Get all products."""
    key = session_id if session_id and session_id != "" else DEFAULT_KEY
    index = cache.ft(f"idx:{key}:products")
    query = Query("*").paging(offset, limit)
    if order_by and order_by != "":
        asc = True
        if order == 'asc':
            asc = True
        elif order == 'desc':
            asc = False
        query.sort_by(order_by, asc)
    res = index.search(query)
    products = [loads(doc.json) for doc in res.docs]
    return products

def set_product_id(cache: Redis, session_id: str) -> int:
    """Get a product by ID."""
    keys = cache.keys(f'{session_id}:products:*')
    max_product_id = max(int(k.split(":")[-1]) for k in keys)
    return max_product_id + 1

def delete_product(cache: Redis, session_id: str, product_id: str):
    """Delete product"""
    key = session_id if session_id and session_id != "" else ""
    if key == "":
        return
    product = get_product(cache, key, product_id)
    if not product:
        raise ValueError("product not found")
    cache.json().delete(f'{key}:products:{product_id}')
    return

def update_product(cache: Redis, session_id: str, product_id: str, product_update: ProductUpdate):
    """Update product"""
    key = session_id if session_id and session_id != "" else DEFAULT_KEY
    product = get_product(cache, key, product_id)
    if not product:
        return None
    product = Product.model_validate(product)
    product_data = product_update.model_dump(exclude_unset=True)
    for k, v in product_data.items():
        setattr(product, k, v)
    product.updated_at = datetime.now(timezone.utc)
    product_encoded = jsonable_encoder(product.model_dump())
    cache.json().set(f'{key}:products:{product_id}', Path.root_path(), product_encoded)
    return cache.json().get(f'{key}:products:{product_id}')

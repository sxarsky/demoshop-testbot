"""Crud for reviews."""
from json import loads
from fastapi.encoders import jsonable_encoder
from redis import Redis
from redis.commands.json.path import Path
from redis.commands.search.query import Query, NumericFilter
from api_insight.models.review import ReviewCreate, Review
from api_insight.core.cache import get_or_create_reviews_index
from api_insight.core.config import get_settings

settings = get_settings()
DEFAULT_KEY = "demoshop_default"

def get_reviews(product_id: int, cache: Redis, session_id: str, limit: int, offset: int, order: str, order_by: str):
    """Get all reviews."""
    key = session_id if session_id and session_id != "" else DEFAULT_KEY
    product = cache.json().get(f'{key}:products:{product_id}')
    if not product:
        raise ValueError("product not found")
    index = get_or_create_reviews_index(cache, key)
    query = Query("*").add_filter(NumericFilter("product_id", product_id, product_id)).paging(offset, limit)
    if order_by and order_by != "":
        asc = True
        if order == 'asc':
            asc = True
        elif order == 'desc':
            asc = False
        query.sort_by(order_by, asc)
    res = index.search(query)
    reviews = [loads(doc.json) for doc in res.docs]
    return reviews

def create_review(review: ReviewCreate, cache: Redis, session_id: str, product_id: int):
    """Create a new review."""
    key = session_id if session_id and session_id != "" else DEFAULT_KEY
    product = cache.json().get(f'{key}:products:{product_id}')
    if not product:
        raise ValueError("product not found")
    review_id = set_review_id(cache, session_id)
    db_review = Review(rating=review.rating,
                       comment=review.comment,
                       product_id=product_id,
                       review_id=review_id)
    review_encoded = jsonable_encoder(db_review.model_dump())
    cache.json().set(f'{key}:reviews:{review_id}', Path.root_path(), review_encoded)
    cache.expire(f'{key}:reviews:{review_id}', settings.KEY_TTL_SECONDS)
    return db_review

def get_review(cache, session_id: str, product_id: int) -> Review | None:
    """Get a product by ID."""
    key = session_id if session_id and session_id != "" else DEFAULT_KEY
    review = cache.json().get(f'{key}:reviews:{product_id}')
    return review

def set_review_id(cache: Redis, session_id: str) -> int:
    """set review ID."""
    keys = cache.keys(f'{session_id}:reviews:*')
    max_review_id = max(int(k.split(":")[-1]) for k in keys)
    return max_review_id + 1

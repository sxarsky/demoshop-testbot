"""Router for Review API Endpoints"""
from typing import List, Annotated
from fastapi import APIRouter, Query, status, Path
from api_insight.deps import CacheDep, GetSessionIdDep, EnsureSessionDep
from api_insight.models.review import (
    ReviewResponse, ReviewCreate
)
from api_insight.models import QueryParams
from api_insight.crud import reviews
from api_insight.exceptions import ResourceNotFoundException

router = APIRouter(
    prefix="/reviews",
    dependencies=[EnsureSessionDep]
)

@router.get("", response_model=List[ReviewResponse],
            summary="Get all reviews for selected product",
            description="Get all reviews for selected product",)
async def get_reviews(
    product_id: Annotated[int, Path(json_schema_extra={'example': 0})],
    cache: CacheDep,
    session_id: GetSessionIdDep, query_params: Annotated[QueryParams, Query()]
    ):
    """
    Get all reviews
    """
    try:
        reviews_list = reviews.get_reviews(
            product_id,
            cache,
            session_id,
            query_params.limit,
            query_params.offset,
            query_params.order,
            order_by="review_id" if query_params.orderBy is None else query_params.orderBy
        )
    except ValueError as exc:
        raise ResourceNotFoundException(status_code=404, detail="Product not foound") from exc
    return reviews_list

@router.post("", response_model=ReviewResponse, status_code=status.HTTP_201_CREATED,
                summary="Create a review",
                description="Create a review for a product")
async def create_review(review: ReviewCreate, cache: CacheDep, session_id: GetSessionIdDep,
                        product_id: Annotated[int, Path(json_schema_extra={'example': 0})]):
    """
    Create a review
    """
    try:
        db_review = reviews.create_review(review, cache, session_id, product_id)
    except ValueError as exc:
        raise ResourceNotFoundException(status_code=404, detail="Product not foound") from exc
    return db_review

"""Router for Review API Endpoints"""
from typing import List, Annotated
from fastapi import APIRouter, Query, status
from api_insight.deps import CacheDep, GetIpDep, EnsureSessionDep
from api_insight.models.review import (
    ReviewResponse, ReviewCreate
)
from api_insight.models import QueryParams
from api_insight.crud import reviews

router = APIRouter(
    prefix="/reviews",
    dependencies=[EnsureSessionDep]
)

@router.get("", response_model=List[ReviewResponse],
            summary="Get all reviews for selected product",
            description="Get all reviews for selected product")
async def get_reviews(
    product_id: int,
    cache: CacheDep,
    ip: GetIpDep, query_params: Annotated[QueryParams, Query()]
    ):
    """
    Get all reviews
    """
    reviews_list = reviews.get_reviews(product_id,
                                       cache,
                                       ip,
                                       query_params.limit,
                                       query_params.offset,
                                       query_params.order,
                                       query_params.orderBy)
    return reviews_list

@router.post("", response_model=ReviewResponse, status_code=status.HTTP_201_CREATED,
                summary="Create a review",
                description="Create a review for a product")
async def create_review(review: ReviewCreate, cache: CacheDep, ip: GetIpDep, product_id: int):
    """
    Create a review
    """
    db_review = reviews.create_review(review, cache, ip, product_id)
    return db_review

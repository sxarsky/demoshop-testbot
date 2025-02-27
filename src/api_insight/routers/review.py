"""Router for Review API Endpoints"""
from datetime import datetime, timezone
from typing import List
from fastapi import APIRouter, Depends, status
from fastapi.exceptions import HTTPException
from sqlmodel import select
from api_insight.deps import get_current_user, SessionDep
from api_insight.models.review import (
    ReviewCreate, ReviewResponse, ReviewUpdate, Review
)
from api_insight.crud import reviews

router = APIRouter(
    prefix="/reviews",
)

@router.get("", response_model=List[ReviewResponse],
            summary="Get all reviews for selected product",
            description="Get all reviews for selected product")
async def get_reviews(product_id: int, session: SessionDep):
    """
    Get all reviews
    """
    reviews_list = reviews.get_reviews(product_id, session)
    return reviews_list

@router.get("/{review_id}", response_model=ReviewResponse,
            summary="Get a review",
            description="Get a review for a product",
            include_in_schema=False)
async def get_review(review_id: int, session: SessionDep):
    """
    Get a review
    """
    review = session.exec(select(Review).where(Review.review_id == review_id)).first()
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    return review

@router.post("", response_model=ReviewResponse, status_code=status.HTTP_201_CREATED,
                summary="Create a review",
                description="Create a review for a product")
async def create_review(review: ReviewCreate, session: SessionDep, product_id: int):
    """
    Create a review
    """
    db_review = reviews.create_review(review, session, product_id)
    return db_review

@router.put("/{review_id}", response_model=ReviewResponse,
            summary="Update a review",
            description="Update a review for a product",
            include_in_schema=False)
async def update_review(review_id: int,
                        review_update: ReviewUpdate,
                        session: SessionDep):
    """
    Update a review
    """
    review = reviews.get_review(review_id, session)
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    review_data = review_update.model_dump(exclude_unset=True)
    for key, value in review_data.items():
        setattr(review, key, value)
    review.updated_at = datetime.now(timezone.utc)
    session.add(review)
    session.commit()
    return review

@router.delete("/{review_id}",
                summary="Delete a review",
                description="Delete a review for a product",
                status_code=status.HTTP_204_NO_CONTENT,
            include_in_schema=False)
async def delete_review(review_id: int, session: SessionDep):
    """
    Delete a review
    """
    review = reviews.get_review(review_id, session)
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    reviews.delete_review(review_id, session)
    return

"""Crud for reviews."""
from sqlmodel import Session, select
from sqlalchemy import asc, desc
from api_insight.models.review import ReviewCreate, Review
from api_insight.models.product import Product

def get_reviews(product_id: int, session: Session, limit: int, offset: int, order: str, order_by: str):
    """Get all reviews."""
    product = session.exec(select(Product).where(Product.product_id == product_id)).first()
    if not product:
        product_id = 0
    statement = select(Review).where(Review.product_id == product_id).limit(limit).offset(offset)
    if order == 'asc':
        statement = statement.order_by(asc(order_by))
    elif order == 'desc':
        statement = statement.order_by(desc(order_by))
    reviews = session.exec(statement).all()
    return reviews

def get_review(review_id: int, session: Session):
    """Get a review by ID."""
    statement = select(Review).where(Review.review_id == review_id)
    review = session.exec(statement).first()
    if not review:
        return session.exec(select(Review).where(Review.review_id == 0)).first()
    return review

def create_review(review: ReviewCreate, session: Session, product_id: int):
    """Create a new review."""
    product = session.exec(select(Product).where(Product.product_id == product_id)).first()
    if not product:
        product_id = 0
    db_review = Review(rating=review.rating, comment=review.comment, product_id=product_id)
    session.add(db_review)
    session.commit()
    session.refresh(db_review)
    return db_review

def delete_review(review_id: int, session: Session):
    """Delete a review."""
    review = get_review(review_id, session)
    session.delete(review)
    session.commit()
    return

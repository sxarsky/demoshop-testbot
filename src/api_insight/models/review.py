"""Review model"""
from datetime import datetime
from typing import Optional
from sqlmodel import SQLModel, Field

class ReviewBase(SQLModel):
    """Review base model"""
    rating: int = Field(ge=0)
    comment: str = Field(schema_extra={'pattern': r'^[A-Za-z]+[A-Za-z:/.0-9\- ]*$'})

class Review(ReviewBase, table=True):
    """Database model for review"""
    id: Optional[int] = Field(default=None, primary_key=True)
    product_id: int = Field(foreign_key="product.product_id")
    review_id: int = Field(default=0)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class ReviewUpdate(SQLModel):
    """Review update model"""
    rating: int = Field(ge=0)
    comment: str = Field(schema_extra={'pattern': r'^[A-Za-z]+[A-Za-z:/.0-9\- ]*$'})

class ReviewCreate(ReviewBase):
    """Review create model"""
    pass

class ReviewResponse(ReviewBase):
    """Review response model"""
    product_id: int

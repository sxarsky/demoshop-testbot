"""Review model"""
from datetime import datetime
from typing import Optional
from sqlmodel import SQLModel, Field

class ReviewBase(SQLModel):
    """Review base model"""
    rating: int = Field(ge=0)
    comment: str = Field(schema_extra={'pattern': r'^[A-Za-z]+.*\s*$'})
    model_config = {
        "json_schema_extra": {
            "example": {
                "rating": 5,
                "comment": "Great product!"
            }
        }
    }

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
    comment: str = Field(schema_extra={'pattern': r'^[A-Za-z]+.*\s*$'})

    model_config = {
        "json_schema_extra": {
            "example": {
                "rating": 4,
                "comment": "Great product!"
            }
        }
    }

class ReviewCreate(ReviewBase):
    """Review create model"""
    pass

class ReviewResponse(ReviewBase):
    """Review response model"""
    model_config = {
        "json_schema_extra": {
            "example": {
                "rating": 5,
                "comment": "Great product!"
            }
        }
    }

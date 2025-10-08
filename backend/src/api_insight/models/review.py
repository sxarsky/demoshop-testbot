"""Review model"""
from datetime import datetime, timezone
from typing import Optional
from pydantic import BaseModel, Field

class ReviewBase(BaseModel):
    """Review base model"""
    rating: int = Field(ge=0)
    comment: str = Field(pattern=r'^[A-Za-z]+.*\s*$')
    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "rating": 5,
                    "comment": "Great product!"
                },
                {
                    "rating": 4,
                    "comment": "Good quality, but could be better."
                }
            ]
        }
    }

class Review(ReviewBase):
    """Database model for review"""
    product_id: int = Field()
    review_id: int = Field()
    updated_at: Optional[datetime] = Field(default_factory=lambda: datetime.now(timezone.utc))
    created_at: Optional[datetime] = Field(default_factory=lambda: datetime.now(timezone.utc))

class ReviewCreate(ReviewBase):
    """Review create model"""
    pass

class ReviewResponse(ReviewBase):
    """Review response model"""
    model_config = {
        "json_schema_extra": {
            "examples": [
                {
                    "rating": 5,
                    "comment": "Great product!"
                },
                {
                    "rating": 4,
                    "comment": "Good quality, but could be better."
                }
            ]
        }
    }

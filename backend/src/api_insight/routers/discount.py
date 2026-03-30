"""
Discount code API
"""
from typing import Annotated
from fastapi import APIRouter, Path
from pydantic import BaseModel
from api_insight.deps import EnsureSessionDep
from api_insight.exceptions import ResourceNotFoundException

# Predefined discount codes: code -> {percentage, description}
DISCOUNT_CODES = {
    "SAVE20": {"percentage": 20, "description": "Save 20% on your order"},
    "WINTER15": {"percentage": 15, "description": "Winter special — 15% off"},
    "SUMMER10": {"percentage": 10, "description": "Summer sale — 10% off"},
    "WELCOME5": {"percentage": 5, "description": "Welcome discount — 5% off"},
}


class DiscountCodeRead(BaseModel):
    """Model for discount code response."""
    code: str
    discount_percentage: int
    description: str

    model_config = {
        "json_schema_extra": {
            "example": {
                "code": "SAVE20",
                "discount_percentage": 20,
                "description": "Save 20% on your order"
            }
        }
    }


router = APIRouter(
    prefix="/discounts",
    tags=["discounts"],
    dependencies=[EnsureSessionDep]
)


@router.get("/{code}", response_model=DiscountCodeRead,
            summary="Validate a discount code",
            description="Validate an alphanumeric discount code and return the discount percentage if valid")
async def get_discount(
    code: Annotated[str, Path(json_schema_extra={"example": "SAVE20"})]
):
    """
    Validate a discount code.
    Returns discount details if valid, 404 if not found.
    """
    upper_code = code.upper()
    if upper_code not in DISCOUNT_CODES:
        raise ResourceNotFoundException(status_code=404, detail="Discount code not found")
    discount = DISCOUNT_CODES[upper_code]
    return DiscountCodeRead(
        code=upper_code,
        discount_percentage=discount["percentage"],
        description=discount["description"]
    )

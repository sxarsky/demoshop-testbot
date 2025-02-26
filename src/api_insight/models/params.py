"""
Query Params for the API
"""
from pydantic import BaseModel, Field

class QueryParams(BaseModel):
    """Query parameters for product filtering."""
    limit: int = Field(default=10, ge=1, le=100)
    offset: int = Field(default=0, ge=0)
    order: str = Field(default="asc", pattern="^(asc|desc)$")
    orderBy: str = Field(default=None, pattern="^[a-zA-Z]+[A-Za-z:/.0-9- ]*$")

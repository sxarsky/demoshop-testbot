"""
Product models for the API.
"""
from datetime import datetime, timezone
from typing import Optional

from pydantic import BaseModel, Field

class ProductBase(BaseModel):
    """
    Represents a base product.

    Attributes:
        name (str): The name of the product.
        description (str): The description of the product.
        price (float): The price of the product.
        image_url (str): The URL of the product image.
        category (str): The category of the product.
        in_stock (bool): Indicates if the product is in stock.
    """
    name: str = Field(min_length=1, pattern=r'^[A-Za-z]+.*\s*$', examples=['bigbear', 'monkey'])
    description: str = Field(min_length=1, pattern=r'^[A-Za-z]+.*\s*$', examples=['Bear Soft Toy', 'Monkey Soft Toy'])
    price: float = Field(ge=1.0, examples=[9.99, 29.99])
    image_url: str = Field(min_length=1, examples=['https://images.app.goo.gl/cgcHpeehRdu5osot8', 'data:image/png;base64,iVBORw0KGg...'])
    category: str = Field(min_length=1, pattern=r'^[A-Za-z]+.*\s*$', examples=['Toys', 'Stuffed Animals'])
    in_stock: bool = Field(default=False, examples=[True, False])

class Product(ProductBase):
    """
    Represents a product in the database.

    Attributes:
        product_id (int): The ID of the product.
    """
    product_id: int = Field(examples=[1])
    updated_at: Optional[datetime] = Field(default_factory=lambda: datetime.now(timezone.utc))
    created_at: Optional[datetime] = Field(default_factory=lambda: datetime.now(timezone.utc))

class ProductCreate(ProductBase):
    """
    Represents a product creation instance.

    This class inherits from the `ProductBase` class and is used to define the attributes
    required to create a new product.
    """
    pass


class ProductUpdate(BaseModel):
    """
    Represents an update for a product.

    Attributes:
        name (str): The updated name of the product.
        description (str): The updated description of the product.
        price (float): The updated price of the product.
        image_url (str): The updated URL of the product image.
        category (str): The updated category of the product.
        in_stock (bool): The updated stock availability of the product.
    """

    name: str = Field(default=None, min_length=1, pattern=r'^[A-Za-z]+.*\s*$', json_schema_extra={'example': 'bigbear'})
    description: str = Field(default=None, min_length=1, pattern=r'^[A-Za-z]+.*\s*$', json_schema_extra={'example': 'Bear Soft Toy'})
    price: float = Field(default=None, ge=1.0, json_schema_extra={'example': 29.99})
    image_url: str = Field(default=None, min_length=1, json_schema_extra={'example': 'https://images.app.goo.gl/cgcHpeehRdu5osot8'})
    category: str = Field(default=None, min_length=1, pattern=r'^[A-Za-z]+.*\s*$', json_schema_extra={'example': 'Toys'})
    in_stock: bool = Field(default=False, json_schema_extra={'example': True})

class ProductUpdateResponse(ProductBase):
    """
    Represents a product update response instance.

    This class inherits from the `ProductBase` class and is used to define the attributes
    returned in the response when a product is updated.
    """

    product_id: int = Field(examples=[1])
    price: float = Field(default=None, ge=1.0, json_schema_extra={'example': 29.99})
    created_at: datetime = Field(examples=['2025-02-25T10:54:22-05:00', '2025-02-26T10:54:22-05:00'])
    updated_at: datetime = Field(examples=['2025-02-25T10:54:22-05:00', '2025-02-26T10:54:22-05:00'])

class ProductResponse(ProductBase):
    """
    Represents a product response instance.

    This class inherits from the `ProductBase` class and is used to define the attributes
    returned in the response when a product is retrieved.
    
    Attributes:
        id (int): The ID of the product.
    """

    product_id: int = Field(examples=[1])
    created_at: datetime = Field(examples=['2025-02-25T10:54:22-05:00', '2025-02-26T10:54:22-05:00'])
    updated_at: datetime = Field(examples=['2025-02-25T10:54:22-05:00', '2025-02-26T10:54:22-05:00'])

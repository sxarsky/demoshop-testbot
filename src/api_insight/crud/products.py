"""
CRUD operations for products.
"""
from sqlmodel import Session, select
from sqlalchemy import asc, desc
from api_insight.models.product import Product, ProductCreate

def get_product(session: Session, product_id: int) -> Product | None:
    """Get a product by ID."""
    statement = select(Product).where(Product.product_id == product_id)
    product = session.exec(statement).first()
    if not product:
        return session.exec(select(Product).where(Product.product_id == 0)).first()
    return product

def create_product(session: Session, product_create: ProductCreate) -> Product:
    """Create a new product."""
    db_obj = Product.model_validate(product_create)
    db_obj.product_id = set_product_id(session)
    session.add(db_obj)
    session.commit()
    session.refresh(db_obj)
    return db_obj

def get_products(session: Session, limit: int, offset: int, order: str, order_by: str) -> list[Product]:
    """Get all products."""
    statement = select(Product).limit(limit).offset(offset)
    if order == 'asc':
        statement = statement.order_by(asc(order_by))
    elif order == 'desc':
        statement = statement.order_by(desc(order_by)) 
    products = session.exec(statement).all()
    return products

def set_product_id(session: Session) -> int:
    """Get a product by ID."""
    product_with_id_0 = get_product(session, 0)
    if not product_with_id_0:
        return 0
    statement = select(Product).order_by(desc(Product.product_id))
    max_product_id = session.exec(statement).first().product_id
    return max_product_id + 1

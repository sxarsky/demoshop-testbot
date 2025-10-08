"""
Router package initialization.
Import all routers here to make them available from the routers package.
"""
from api_insight.routers.product import router as products_router
from api_insight.routers.order import router as orders_router
from api_insight.routers.review import router as reviews_router
from api_insight.routers.reset import router as reset_router

__all__ = ['products_router', 'orders_router', 'reviews_router', 'reset_router']

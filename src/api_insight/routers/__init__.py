"""
Router package initialization.
Import all routers here to make them available from the routers package.
"""
from api_insight.routers.login import router as login_router
from api_insight.routers.register import router as register_router
from api_insight.routers.product import router as products_router
from api_insight.routers.order import router as orders_router

__all__ = ['login_router', 'register_router', 'products_router', 'orders_router']

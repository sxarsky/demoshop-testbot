"""
Library package initialization.
Import utility functions here to make them available from the libs package.
"""
from api_insight.core.config import get_settings
from api_insight.core.cache import (
    pool, init_data, init_indexes,
    get_or_create_products_index,
    get_or_create_order_items_index,
    get_or_create_orders_index,
    get_or_create_reviews_index
)
__all__ = ['get_settings',
           'pool',
           'init_data',
           'init_indexes',
           'get_or_create_products_index',
           'get_or_create_orders_index',
           'get_or_create_order_items_index',
           'get_or_create_reviews_index'
           ]

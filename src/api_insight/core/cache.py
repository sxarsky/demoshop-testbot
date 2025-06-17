"""
Redis support for Caching
"""
import logging
import ssl
from redis import Redis, ResponseError, SSLConnection, ConnectionPool
from redis.commands.search.field import TextField, NumericField
from redis.commands.search.index_definition import IndexDefinition, IndexType
from api_insight.core.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

def create_pool():
    """Create redis connection pool"""
    kwargs = {}
    if settings.SKYRAMP_ENVIRONMENT != "local":
        kwargs['connection_class']=SSLConnection
        kwargs['ssl_cert_reqs']="required"
        kwargs['username']=settings.REDIS_USER
        kwargs['password']=settings.REDIS_PASS
        kwargs['ssl_certfile']=settings.REDIS_CLIENT_CRT
        kwargs['ssl_keyfile']=settings.REDIS_CLIENT_KEY
        kwargs['ssl_ca_certs']=settings.REDIS_CA_PEM
        kwargs['ssl_min_version']=ssl.TLSVersion.TLSv1_3

    return ConnectionPool(
        host=settings.REDIS_HOST,
        port=settings.REDIS_PORT,
        decode_responses=True,
        # optional:
        **kwargs
    )

def init_data(cache: Redis, session_id: str):
    """init data"""
    collections = ["products", "reviews", "orders", "orderitems"]
    default_data = "demoshop_default"

    for collection in collections:
        resource_keys_exists = cache.exists(f"{session_id}:{collection}:0")
        if resource_keys_exists:
            logger.debug('skip init data')
            continue
        pattern = f"{default_data}:{collection}:*"
        default_keys = cache.keys(pattern)

        with cache.pipeline() as pipe:
            for k in default_keys:
                pipe.json().get(k)
            default_values = pipe.execute()

        with cache.pipeline() as pipe:
            for k, v in zip(default_keys, default_values):
                if v is not None:
                    resource_id = k.split(":")[-1]
                    new_key = f"{session_id}:{collection}:{resource_id}"
                    pipe.json().set(new_key, '$', v)
                    pipe.expire(new_key, settings.KEY_TTL_SECONDS)
            pipe.execute()

def get_or_create_products_index(cache: Redis, key):
    """Get or create product index"""
    index = cache.ft(f"idx:{key}:products")
    try:
        index.info()
        return index
    except ResponseError:
        logger.debug("index doesn't exist, creating")

    definition=IndexDefinition(prefix=[f"{key}:products:"], index_type=IndexType.JSON)
    index.create_index((
        TextField("$.name", as_name='name'),
        TextField("$.description", as_name='description'),
        NumericField("$.price", sortable=True, as_name='price'),
        TextField("$.image_url", as_name='image_url'),
        TextField("$.category", as_name='category'),
        ),
        definition=definition,
        temporary=settings.KEY_TTL_SECONDS
    )
    return index

def get_or_create_orders_index(cache: Redis, key):
    """Get or create orders index"""
    index = cache.ft(f"idx:{key}:orders")
    try:
        index.info()
        return index
    except ResponseError:
        print("index doesn't exist, creating")

    definition=IndexDefinition(prefix=[f"{key}:orders:"], index_type=IndexType.JSON)
    index.create_index((
        NumericField("$.order_id", as_name='order_id'),
        TextField("$.customer_email", as_name='customer_email'),
        TextField("$.status", as_name='status'),
        NumericField("$.total_amount", as_name='total_amount'),
        ),
        definition=definition,
        temporary=settings.KEY_TTL_SECONDS
    )
    return index

def get_or_create_order_items_index(cache: Redis, key):
    """Get or create orderitems index"""
    index = cache.ft(f"idx:{key}:orderitems")
    try:
        index.info()
        return index
    except ResponseError:
        print("index doesn't exist, creating")

    definition=IndexDefinition(prefix=[f"{key}:orderitems:"], index_type=IndexType.JSON)
    index.create_index((
        NumericField("$.order_id", as_name='order_id'),
        ),
        definition=definition,
        temporary=settings.KEY_TTL_SECONDS
    )
    return index

def get_or_create_reviews_index(cache: Redis, key):
    """Get or create reviews index"""
    index = cache.ft(f"idx:{key}:reviews")
    try:
        index.info()
        return index
    except ResponseError:
        print("index doesn't exist, creating")

    definition=IndexDefinition(prefix=[f"{key}:reviews:"], index_type=IndexType.JSON)
    index.create_index((
        NumericField("$.product_id", as_name='product_id')),
        definition=definition,
        temporary=settings.KEY_TTL_SECONDS
    )
    return index

def init_indexes(cache: Redis, session_id: str):
    """init indexes"""
    get_or_create_products_index(cache, session_id)
    get_or_create_orders_index(cache, session_id)
    get_or_create_order_items_index(cache, session_id)
    get_or_create_reviews_index(cache, session_id)

pool = create_pool()

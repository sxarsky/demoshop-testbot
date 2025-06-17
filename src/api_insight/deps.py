"""
Dependencies
"""
import logging
from typing import Annotated
from fastapi import Depends, Request
from redis import Redis
from api_insight.core.cache import pool, init_data, init_indexes
logger = logging.getLogger(__name__)
def get_cache():
    """Re-use connection pool"""
    return Redis(connection_pool=pool)

CacheDep = Annotated[Redis, Depends(get_cache)]

def get_ip(request: Request):
    """Get IP"""
    cf_connecting_ip = request.headers.get("CF-Connecting-IP")
    if cf_connecting_ip and cf_connecting_ip != "":
        logger.debug("using cf_connecting_ip:%s", cf_connecting_ip)
        return cf_connecting_ip
    real_ip = request.headers.get("X-Real-IP")
    if real_ip and real_ip != "":
        logger.debug("using real_ip: %s", real_ip)
        return real_ip
    xff = request.headers.get("X-Forwarded-For")
    if xff and len(xff) > 0:
        # X-Forwarded-For can be a comma-separated list, take the first
        ip = xff.split(",")[0].strip()
        logger.debug("using xff: %s", ip)
        return ip
    client_host = request.client.host
    if client_host and client_host != "":
        logger.debug("using client_host: %s", client_host)
        return client_host
    return None

GetIpDep = Annotated[str | None, Depends(get_ip)]

def ensure_session_data(
    cache: Redis = Depends(get_cache),
    session_id: str = Depends(get_ip)
):
    """Ensure data and indexes are initialized for the session (ip)."""
    if not session_id:
        return  # No session/ip, skip
    # Check if any key exists for this session
    if cache.exists(f"{session_id}:products:1"):  # quick check for one collection
        return
    init_data(cache, session_id)
    init_indexes(cache, session_id)

EnsureSessionDep = Depends(ensure_session_data)

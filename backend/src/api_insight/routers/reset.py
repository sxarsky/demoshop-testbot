"""Reset API to reset or clean the db for given session id"""
from fastapi import APIRouter, status
from api_insight.core.cache import COLLECTIONS
from api_insight.deps import CacheDep, EnsureSessionDep, GetSessionIdDep
from api_insight.exceptions import ResourceNotFoundException

router = APIRouter(
    prefix="/reset",
    tags=["reset"],
    dependencies=[EnsureSessionDep]
)

@router.post("", status_code=status.HTTP_200_OK,
                summary="Reset data",
                description="Reset data for session")
async def reset(session_id: GetSessionIdDep, cache: CacheDep):
    """Reset API to reset or clean DB state for given session id"""
    try:
        with cache.pipeline() as pipe:
            for key in cache.scan_iter(match=f'{session_id}:*:*', count=1000):
                pipe.json().delete(key)
            for collection in COLLECTIONS:
                pipe.ft(f"idx:{session_id}:{collection}").dropindex(delete_documents=False)
            pipe.execute()
    except Exception as exc:
        raise ResourceNotFoundException(status_code=400, detail="Session ID not found") from exc

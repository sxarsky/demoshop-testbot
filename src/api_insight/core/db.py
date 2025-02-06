"""
Database operations and utilities.
"""
import logging
import time
from typing import Callable, Any
from sqlmodel import SQLModel, create_engine, Session
from api_insight.core.config import get_settings
from sqlalchemy.exc import OperationalError, IntegrityError

settings = get_settings()

engine = create_engine(
    settings.database_url,
    echo=True if settings.ENVIRONMENT == "local" else False
)

logger = logging.getLogger(__name__)

def execute_with_retry(
    operation: Callable,
    *args,
    max_retries: int = 3,
    retry_delay: float = 1.0,
    **kwargs
) -> Any:
    """
    Execute a database operation with retry logic.
    
    Args:
        operation (Callable): The database operation to execute
        *args: Positional arguments to pass to the operation
        max_retries (int): Maximum number of retry attempts
        retry_delay (float): Delay between retries in seconds
        **kwargs: Keyword arguments to pass to the operation
    
    Returns:
        Any: Result of the database operation
    
    Raises:
        Exception: If all retry attempts fail
    """
    retries = 0
    last_error = None

    while retries < max_retries:
        try:
            return operation(*args, **kwargs)

        except OperationalError as e:
            last_error = e
            retries += 1
            if retries == max_retries:
                logger.error("Failed to execute database operation after %d attempts: %s",
                             max_retries, str(e))
                raise

            logger.warning("Database operation failed (attempt %d/%d). Retrying in %s seconds...",
                         retries, max_retries, retry_delay)
            time.sleep(retry_delay)

        except IntegrityError as e:
            logger.error("Integrity error in database operation: %s", str(e))
            raise

        except Exception as e:
            logger.error("Unexpected error in database operation: %s", str(e))
            raise

    if last_error:
        raise last_error

def init_db():
    """
    Initialize the database.
    """
    def _init():
        SQLModel.metadata.create_all(engine)

    execute_with_retry(_init)

# Example usage in a database operation
def execute_db_operation(session: Session, operation: Callable, *args, **kwargs):
    """
    Execute a database operation within a session with retry logic.
    
    Args:
        session (Session): SQLAlchemy session
        operation (Callable): Database operation to execute
        *args: Positional arguments for the operation
        **kwargs: Keyword arguments for the operation
    
    Returns:
        Any: Result of the database operation
    """
    def _execute():
        return operation(session, *args, **kwargs)

    return execute_with_retry(_execute)

# Usage example:
# def get_product_by_id(session: Session, product_id: int):
#     return execute_db_operation(
#         session,
#         lambda s, pid: s.get(Product, pid),
#         product_id
#     )

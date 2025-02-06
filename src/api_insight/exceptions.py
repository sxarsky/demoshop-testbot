# app/exceptions.py

from fastapi import Request, FastAPI
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from typing import Dict, Any

class  ResourceNotFoundException(Exception):
    def __init__(self, status_code: int, detail: str ):
        self.status_code = status_code
        self.detail = detail


async def custom_request_validation_exception_handler(
    request: Request, exc: RequestValidationError
) -> JSONResponse:
    """
    Custom handler for validation errors.
    Returns different status codes based on the type of validation error.
    """
    errors = exc.errors()
    response_content = {"detail": []}

    for error in errors:
        loc_length = len(error["loc"])
        field = error["loc"][loc_length - 1]
        message = error["msg"]
        error_type = error["type"]

        # Example: Return 400 for 'value_error.number.not_ge'
        if error_type == "value_error.number.not_ge":
            status_code = 400
            error_detail = {
                "field": field,
                "message": f"{field} must be greater than or equal to {error['ctx']['limit_value']}" if field else message,
                "type": error_type
            }
            response_content["detail"].append(error_detail)
        else:
            # Default to 422 for other types
            response_content["detail"].append({
                "field": field,
                "message": message,
                "type": error_type
            })

    return JSONResponse(
        status_code=400,  # Or dynamically set based on errors
        content=response_content,
    )

async def resource_not_found_exception_handler(
    request: Request, exc: ResourceNotFoundException
) -> JSONResponse:
     return JSONResponse(
         status_code=exc.status_code,
         content={"detail": exc.detail},
     )
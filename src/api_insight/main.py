"""
Main FastAPI application module.
Handles application initialization, middleware setup, and route configuration.
"""
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.utils import get_openapi
from fastapi.exceptions import RequestValidationError

from api_insight.core.db import init_db
from api_insight.core.config import get_settings
from api_insight.routers.product import router as products_router
from api_insight.routers.order import router as orders_router
from api_insight.routers.login import router as login_router
from api_insight.routers.register import router as register_router
from api_insight.exceptions import custom_request_validation_exception_handler
from api_insight.exceptions import resource_not_found_exception_handler
from api_insight.exceptions import ResourceNotFoundException


settings = get_settings()

# Startup and shutdown events
@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifecycle manager for FastAPI application.
    Handles database initialization on startup.
    
    Args:
        app: FastAPI application instance
    """
    # Startup: create tables
    init_db()
    yield
    # Shutdown: add any cleanup here if needed
    pass

# Initialize FastAPI app
app = FastAPI(
    title="Product Catalog API",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_exception_handler(RequestValidationError, custom_request_validation_exception_handler)
app.add_exception_handler(ResourceNotFoundException, resource_not_found_exception_handler)

# API version prefix
api_prefix = f"/api/{settings.api_version}"

# Include routers
app.include_router(
    products_router,
    prefix=api_prefix,
)

app.include_router(
    orders_router,
    prefix=api_prefix,
)

app.include_router(
    login_router,
    prefix=api_prefix,
)

app.include_router(
    register_router,
    prefix=api_prefix,
)

# Custom OpenAPI schema configuration
def custom_openapi():
    """
    Customize OpenAPI schema for API documentation.
    
    Returns:
        dict: Modified OpenAPI schema
    """
    if app.openapi_schema:
        return app.openapi_schema

    openapi_schema = get_openapi(
        title="Product Catalog API",
        version="1.0.0",
        description="OpenAPI for managing product catalogs and orders.",
        routes=app.routes,
    )

    # Custom schema additions
    openapi_schema["info"]["x-logo"] = {
        "url": "https://example.com/logo.png"
    }

    app.openapi_schema = openapi_schema
    return app.openapi_schema

app.openapi = custom_openapi

# Root endpoint
@app.get("/",
         summary="Root endpoint",
         description="Returns basic API information",
         tags=["status"])
async def root():
    """
    Root endpoint returning basic API information.
    
    Returns:
        dict: API metadata including version and environment
    """
    return {
        "message": "Product Catalog API",
        "version": settings.api_version,
        "environment": settings.environment,
        "docs": "/docs",
        "redoc": "/redoc"
    }

# Health check endpoint
@app.get("/health",
         summary="Health check",
         description="Returns the health status of the API",
         tags=["status"])
async def health_check():
    """
    Health check endpoint for monitoring API status.
    
    Returns:
        dict: Health status information
    """
    return {
        "status": "healthy",
        "environment": settings.environment,
        "version": settings.api_version
    }

# @app.exception_handler(ResourceNotFoundException)
# async def custom_exception_handler(request: Request, exc: ResourceNotFoundException):
#     return JSONResponse(
#         status_code=exc.status_code,
#         content={"detail": exc.detail},
#     )

# @app.exception_handler(RequestValidationError)
# async def validation_exception_handler(request: Request, exc: RequestValidationError):
#     # Format exception details in a serializable format
#     errors = [{"location": e["loc"], "msg": e["msg"], "type": e["type"]} for e in exc.errors()]
#     error_response = {
#         "detail": "Validation error",
#         "errors": errors,
#         # Convert exception message to string if required
#         # "message": str(exc)
#     }
#     return JSONResponse(
#         status_code=400,
#         content=error_response,
#     )

# Error handlers
# @app.exception_handler(HTTPException)
# async def http_exception_handler(request, exc):
#     """
#     Handle HTTP exceptions.
    
#     Args:
#         request: Request instance
#         exc: HTTPException instance
    
#     Returns:
#         dict: Error response
#     """
#     print(exc)
#     return {
#         "status_code": exc.status_code,
#         "detail": exc.detail,
#         "message": str(exc.detail)
#     }

# @app.exception_handler(Exception)
# async def general_exception_handler(request, exc):
#     """
#     Handle uncaught exceptions.
    
#     Args:
#         request: Request instance
#         exc: Exception instance
    
#     Returns:
#         dict: Error response
#     """
#     return {
#         "status_code": 500,
#         "detail": "Internal Server Error",
#         "message": str(exc)
#     }

# Run the application
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

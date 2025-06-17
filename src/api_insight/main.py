"""
Main FastAPI application module.
Handles application initialization, middleware setup, and route configuration.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.openapi.utils import get_openapi
from fastapi.exceptions import RequestValidationError
from mangum import Mangum
from api_insight.core.config import get_settings
from api_insight.routers.product import router as products_router
from api_insight.routers.order import router as orders_router
from api_insight.routers.review import router as reviews_router
from api_insight.exceptions import custom_request_validation_exception_handler
from api_insight.exceptions import resource_not_found_exception_handler
from api_insight.exceptions import ResourceNotFoundException

settings = get_settings()

# Initialize FastAPI app
app = FastAPI(
    docs_url="/api",
    redoc_url=None,
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
api_prefix = f"/api/{settings.API_VERSION}"

# Include routers
products_router.include_router(
    reviews_router,
    prefix="/{product_id}",
)

app.include_router(
    products_router,
    prefix=api_prefix,
)

app.include_router(
    orders_router,
    prefix=api_prefix,
)

app.mount("/sample", StaticFiles(directory="sample"), name="sample")

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
        title="Demo Shop API",
        version="1.0.0",
        description="""The Skyramp Demo Shop mimics a very simple e-commerce setup where \
            users can create, update, and manage a catalog of products and handle orders. \
            <br/>It will be used throughout the Skyramp Documentation to demonstrate Skyramp's \
            functionality and provide a playground to test out the tool. \
            <br/> <br/> Additional information on this API can be found \
            <a href=\"https://www.skyramp.dev/docs/references/demo-shop\">here</a>.""",
        routes=app.routes,
    )

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
        "message": "Demo Shop API",
        "version": settings.API_VERSION,
        "api-docs": "/api"
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
        "version": settings.API_VERSION
    }

handler = Mangum(app)

# Run the application
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

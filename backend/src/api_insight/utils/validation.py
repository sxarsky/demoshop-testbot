"""
Validation utility functions for API Insight.
"""

def validate_price_range(price: float, min_price: float = 0.0, max_price: float = 100000.0) -> bool:
    """
    Validate if a price is within the specified range.

    Args:
        price: The price to validate
        min_price: Minimum allowed price (default: 0.0)
        max_price: Maximum allowed price (default: 100000.0)

    Returns:
        True if price is within range, False otherwise

    Examples:
        >>> validate_price_range(10.99)
        True
        >>> validate_price_range(-5.00)
        False
        >>> validate_price_range(50.0, min_price=10.0, max_price=100.0)
        True
        >>> validate_price_range(150.0, min_price=10.0, max_price=100.0)
        False
    """
    return min_price <= price <= max_price


def format_currency(amount: float) -> str:
    """
    Format a float amount as a currency string.

    Args:
        amount: The amount to format

    Returns:
        Formatted currency string with $ symbol and 2 decimal places

    Examples:
        >>> format_currency(10.5)
        '$10.50'
        >>> format_currency(100)
        '$100.00'
        >>> format_currency(9.99)
        '$9.99'
    """
    return f"${amount:.2f}"

import { useEffect, useState, useRef, useCallback } from "react"
import { useLocation } from "react-router-dom"
import ProductItem from "./ProductItem"
import { getSessionIdFromCookie } from '../../lib/utils';
import { apiUrl } from '../../config';

interface Product {
  product_id: number
  name: string
  price: number
  category: string
  description: string
  image_url: string
  created_at: string
}

export default function ProductList() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<string>('default')
  const location = useLocation();

  const fetchingRef = useRef(false);
    const lastFetchTimeRef = useRef(0);
    const FETCH_COOLDOWN = 5000; // 5 seconds cooldown
  
    const fetchProducts = useCallback(() => {
      // Prevent multiple simultaneous fetches
      if (fetchingRef.current) {
        // If already fetching, skip this call
        return Promise.resolve();
      }
  
      // Implement cooldown to prevent rapid successive fetches
      const now = Date.now();
      if (now - lastFetchTimeRef.current < FETCH_COOLDOWN) {
        console.log("Fetch cooldown active, skipping...");
        return Promise.resolve();
      }
  
      // Proceed with fetching products
      fetchingRef.current = true;
      setLoading(true);
      lastFetchTimeRef.current = now;
  
      const sessionId = getSessionIdFromCookie();
      
      return fetch(apiUrl('/api/v1/products?limit=50'), {
        headers: { 'Authorization': `Bearer ${sessionId}` }
      })
        .then(res => {
          if (!res.ok) throw new Error("Failed to fetch products");
          return res.json();
        })
        .then((data) => {
          const sorted = (data || []).sort(
            (a: { product_id: number; }, b: { product_id: number; }) => b.product_id - a.product_id
          );
          setProducts(sorted);
          return sorted;
        })
        .catch(err => {
          setError(err.message);
          throw err;
        })
        .finally(() => {
          setLoading(false);
          fetchingRef.current = false;
        });
    }, []);

  useEffect(() => {
    fetchProducts();
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        fetchProducts();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [location, fetchProducts]);

  // Sort products based on selected criterion
  const getSortedProducts = () => {
    const productsCopy = [...products];

    switch (sortBy) {
      case 'name-asc':
        // BUG 1: Sort direction backwards (A-Z shows Z-A)
        return productsCopy.sort((a, b) => b.name.localeCompare(a.name));
      case 'name-desc':
        // BUG 1: Sort direction backwards (Z-A shows A-Z)
        return productsCopy.sort((a, b) => a.name.localeCompare(b.name));
      case 'price-low-high':
        return productsCopy.sort((a, b) => a.price - b.price);
      case 'price-high-low':
        return productsCopy.sort((a, b) => b.price - a.price);
      case 'date-newest':
        return productsCopy.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      case 'date-oldest':
        return productsCopy.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      default:
        return productsCopy.sort((a, b) => b.product_id - a.product_id);
    }
  };

  // BUG 2: Case-sensitive sorting (not used, but name sorting has issues)
  // The localeCompare should use { sensitivity: 'base' } for case-insensitive sorting

  const sortedProducts = getSortedProducts();

  if (loading) return <div>Loading products...</div>
  if (error) return <div className="text-red-500">{error}</div>

  return (
    <div style={{ width: '100%' }}>
      {/* Sorting Controls */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-start',
          marginBottom: '1.5rem',
          gap: '0.5rem',
          alignItems: 'center',
        }}
      >
        <label
          style={{
            fontSize: '0.875rem',
            fontWeight: 500,
            color: '#374151',
          }}
        >
          Sort by:
        </label>
        <select
          value={sortBy}
          onChange={(e) => {
            // BUG 3: Sort resets when filters applied
            // When the component re-renders due to location changes,
            // sortBy state is reset to 'default' because it's not persisted
            setSortBy(e.target.value);
          }}
          style={{
            padding: '0.5rem 2rem 0.5rem 0.75rem',
            border: '1.5px solid #d1d5db',
            borderRadius: '0.375rem',
            fontSize: '0.875rem',
            background: '#fff',
            cursor: 'pointer',
          }}
          data-testid="sort-select"
        >
          <option value="default">Default (Newest First)</option>
          <option value="name-asc">Name (A-Z)</option>
          <option value="name-desc">Name (Z-A)</option>
          <option value="price-low-high">Price (Low to High)</option>
          <option value="price-high-low">Price (High to Low)</option>
          <option value="date-newest">Date (Newest First)</option>
          <option value="date-oldest">Date (Oldest First)</option>
        </select>
      </div>

      {/* Product Grid */}
      <div
        style={{
          width: '100%',
          display: 'flex',
          flexWrap: 'wrap',
          columnGap: '2.5rem',
          rowGap: '2.5rem',
          justifyContent: 'center',
          alignItems: 'stretch',
        }}
        data-testId="product-list"
      >
      {sortedProducts.map(product => (
        <div
          key={product.product_id}
          style={{
            flex: '0 1 27%',
            minWidth: '160px',
            maxWidth: '27%',
            height: '420px', // increased height
            display: 'flex',
            alignItems: 'stretch',
          }}
        >
          <ProductItem product={product} minHeight={400} data-testId={`product-name-${product.name}`} />
        </div>
      ))}
      </div>
    </div>
  )
}
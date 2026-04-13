import { useEffect, useState, useRef, useCallback, useMemo } from "react"
import { useLocation } from "react-router-dom"
import ProductItem from "./ProductItem"
import { Button } from "@/components/ui/button"
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
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("")
  const location = useLocation();

  const categories = useMemo(() => {
    const unique = new Set(
      products.map((p) => p.category).filter((c): c is string => Boolean(c?.trim()))
    )
    return Array.from(unique).sort((a, b) => a.localeCompare(b))
  }, [products])

  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    return products.filter((p) => {
      if (categoryFilter && p.category !== categoryFilter) return false
      if (!q) return true
      const name = (p.name || "").toLowerCase()
      const desc = (p.description || "").toLowerCase()
      return name.includes(q) || desc.includes(q)
    })
  }, [products, searchQuery, categoryFilter])

  const clearFilters = () => {
    setSearchQuery("")
    setCategoryFilter("")
  }

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

  if (loading) return <div>Loading products...</div>
  if (error) return <div className="text-red-500">{error}</div>

  return (
    <div style={{ width: "100%" }}>
      <div
        className="mb-6 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end"
        data-testId="product-list-filters"
      >
        <div className="min-w-0 flex-1 sm:min-w-[200px]">
          <label
            htmlFor="product-list-search"
            className="mb-1 block text-left text-sm font-medium text-gray-700"
          >
            Search
          </label>
          <input
            id="product-list-search"
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or description"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
            data-testId="product-list-search"
          />
        </div>
        <div className="w-full sm:w-48">
          <label
            htmlFor="product-list-category"
            className="mb-1 block text-left text-sm font-medium text-gray-700"
          >
            Category
          </label>
          <select
            id="product-list-category"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-900"
            data-testId="product-list-category-filter"
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={clearFilters}
          data-testId="product-list-clear-filters"
        >
          Clear Filters
        </Button>
      </div>
      <p
        className="mb-4 text-left text-sm text-gray-600"
        data-testId="product-list-count"
      >
        {filteredProducts.length === 1
          ? "1 product matches your filters"
          : `${filteredProducts.length} products match your filters`}
      </p>
      <div
        style={{
          width: "100%",
          display: "flex",
          flexWrap: "wrap",
          columnGap: "2.5rem",
          rowGap: "2.5rem",
          justifyContent: "center",
          alignItems: "stretch",
        }}
        data-testId="product-list"
      >
        {filteredProducts.map((product) => (
          <div
            key={product.product_id}
            style={{
              flex: "0 1 27%",
              minWidth: "160px",
              maxWidth: "27%",
              height: "420px",
              display: "flex",
              alignItems: "stretch",
            }}
          >
            <ProductItem
              product={product}
              minHeight={400}
              data-testId={`product-name-${product.name}`}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
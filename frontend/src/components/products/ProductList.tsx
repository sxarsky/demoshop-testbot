import { useEffect, useState, useRef, useCallback } from "react"
import { useLocation } from "react-router-dom"
import ProductItem from "./ProductItem"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
  const [selectedCategory, setSelectedCategory] = useState("all")
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

  if (loading) return <div>Loading products...</div>
  if (error) return <div className="text-red-500">{error}</div>

  const categories = Array.from(
    new Set(products.map(p => p.category).filter(Boolean))
  ).sort()

  const filteredProducts = products.filter(product => {
    const q = searchQuery.trim().toLowerCase()
    const matchesSearch =
      !q ||
      product.name.toLowerCase().includes(q) ||
      (product.description ?? "").toLowerCase().includes(q)
    const matchesCategory =
      selectedCategory === "all" || product.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const hasFilters = searchQuery.trim() !== "" || selectedCategory !== "all"

  return (
    <div style={{ width: '100%' }}>
      {/* Filter bar */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.75rem',
          alignItems: 'center',
          marginBottom: '1.5rem',
        }}
      >
        <Input
          type="text"
          placeholder="Search by name or description…"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          style={{ maxWidth: '320px', flex: '1 1 200px' }}
          data-testId="product-search-input"
        />

        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger style={{ width: '180px' }} data-testId="product-category-filter">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(cat => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasFilters && (
          <Button
            variant="outline"
            onClick={() => { setSearchQuery(""); setSelectedCategory("all"); }}
            data-testId="product-clear-filters"
          >
            Clear Filters
          </Button>
        )}

        <span
          style={{ marginLeft: 'auto', fontSize: '0.875rem', color: '#6b7280', whiteSpace: 'nowrap' }}
          data-testId="product-count"
        >
          {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'} found
        </span>
      </div>

      {/* Product grid */}
      <div
      style={{
        width: '100%',
        display: 'flex',
        flexWrap: 'wrap',
        columnGap: '2.5rem', // more horizontal space between boxes
        rowGap: '2.5rem', // more vertical space between boxes
        justifyContent: 'center',
        alignItems: 'stretch',
      }}
      data-testId="product-list"
    >
      {filteredProducts.length === 0 ? (
        <div style={{ width: '100%', textAlign: 'center', color: '#6b7280', padding: '3rem 0' }}>
          No products match your filters.
        </div>
      ) : (
        filteredProducts.map(product => (
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
        ))
      )}
      </div>
    </div>
  )
}
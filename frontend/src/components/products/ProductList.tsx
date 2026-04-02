import { useEffect, useState, useRef, useCallback, useMemo } from "react"
import { useLocation } from "react-router-dom"
import ProductItem from "./ProductItem"
import { getSessionIdFromCookie } from '../../lib/utils';
import { apiUrl } from '../../config';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Product {
  product_id: number
  name: string
  price: number
  category: string
  description: string
  image_url: string
  created_at: string
}

const SORT_STORAGE_KEY = "productListSort"

type ProductSortOption =
  | "name-asc"
  | "name-desc"
  | "price-asc"
  | "price-desc"
  | "newest"

const SORT_OPTIONS: { value: ProductSortOption; label: string }[] = [
  { value: "name-asc", label: "Name: A-Z" },
  { value: "name-desc", label: "Name: Z-A" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "newest", label: "Newest First" },
]

function readStoredSort(): ProductSortOption {
  try {
    const raw = localStorage.getItem(SORT_STORAGE_KEY)
    if (raw && SORT_OPTIONS.some((o) => o.value === raw)) {
      return raw as ProductSortOption
    }
  } catch {
    /* ignore */
  }
  return "newest"
}

function sortProducts(list: Product[], sortBy: ProductSortOption): Product[] {
  const copy = [...list]
  const createdMs = (p: Product) => {
    const t = new Date(p.created_at).getTime()
    return Number.isFinite(t) ? t : 0
  }
  switch (sortBy) {
    case "name-asc":
      return copy.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }))
    case "name-desc":
      return copy.sort((a, b) => b.name.localeCompare(a.name, undefined, { sensitivity: "base" }))
    case "price-asc":
      return copy.sort((a, b) => a.price - b.price || a.product_id - b.product_id)
    case "price-desc":
      return copy.sort((a, b) => b.price - a.price || a.product_id - b.product_id)
    case "newest":
    default:
      return copy.sort(
        (a, b) =>
          createdMs(b) - createdMs(a) ||
          b.product_id - a.product_id
      )
  }
}

export default function ProductList() {
  const [products, setProducts] = useState<Product[]>([])
  const [sortBy, setSortBy] = useState<ProductSortOption>(() => readStoredSort())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const location = useLocation();

  const sortedProducts = useMemo(() => sortProducts(products, sortBy), [products, sortBy])

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
          const list = data || []
          setProducts(list);
          return list;
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
    <div style={{ width: '100%' }}>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.75rem',
          marginBottom: '1.5rem',
        }}
      >
        <label htmlFor="product-sort" className="text-sm text-gray-700">
          Sort by
        </label>
        <Select
          value={sortBy}
          onValueChange={(v) => {
            const next = v as ProductSortOption
            setSortBy(next)
            try {
              localStorage.setItem(SORT_STORAGE_KEY, next)
            } catch {
              /* ignore */
            }
          }}
        >
          <SelectTrigger id="product-sort" className="w-[min(100%,220px)]" data-testId="product-sort-select">
            <SelectValue placeholder="Sort products" />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
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
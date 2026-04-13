import { useEffect, useState, useRef, useCallback } from "react"
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
} from "@/components/ui/select";

const SORT_STORAGE_KEY = "productListSortOrder";

type SortOption = "newest" | "name-asc" | "name-desc" | "price-asc" | "price-desc";

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "newest",     label: "Newest First" },
  { value: "name-asc",   label: "Name: A-Z" },
  { value: "name-desc",  label: "Name: Z-A" },
  { value: "price-asc",  label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
];

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
  const [sortOrder, setSortOrder] = useState<SortOption>(
    () => (localStorage.getItem(SORT_STORAGE_KEY) as SortOption) ?? "newest"
  );
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
          setProducts(data || []);
          return data || [];
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

  const handleSortChange = (value: SortOption) => {
    setSortOrder(value);
    localStorage.setItem(SORT_STORAGE_KEY, value);
  };

  const sortedProducts = [...products].sort((a, b) => {
    switch (sortOrder) {
      case "name-asc":   return a.name.localeCompare(b.name);
      case "name-desc":  return b.name.localeCompare(a.name);
      case "price-asc":  return a.price - b.price;
      case "price-desc": return b.price - a.price;
      case "newest":
      default:           return b.product_id - a.product_id;
    }
  });

  return (
    <div data-testId="product-list">
      {/* Sort dropdown */}
      <div className="flex justify-end mb-4">
        <Select value={sortOrder} onValueChange={handleSortChange}>
          <SelectTrigger className="w-52" data-testId="sort-select">
            <SelectValue placeholder="Sort by..." />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map(opt => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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
import { useEffect, useState, useRef, useCallback } from "react"
import { useLocation } from "react-router-dom"
import ProductItem from "./ProductItem"
import { getSessionIdFromCookie } from '../../lib/utils';
import { apiUrl } from '../../config';
import { Input } from "@/components/ui/input";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";

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
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  // BUG: Product count is set once and never updates
  const [productCount] = useState(0)
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

  // Filter products based on search and category
  const filteredProducts = products.filter(product => {
    // BUG: Case-sensitive search - won't find "Monkey" if you search "monkey"
    const matchesSearch = searchTerm === "" || product.name.includes(searchTerm) || product.description.includes(searchTerm);
    const matchesCategory = selectedCategory === "all" || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Get unique categories
  const categories = Array.from(new Set(products.map(p => p.category)));

  const handleClearFilters = () => {
    setSearchTerm("");
    // BUG: Doesn't reset category filter, only clears search
    // setSelectedCategory("all");  // This line is commented out/missing
  };

  if (loading) return <div>Loading products...</div>
  if (error) return <div className="text-red-500">{error}</div>

  return (
    <div style={{ width: '100%' }}>
      {/* Search and Filter Controls */}
      <div style={{
        display: 'flex',
        gap: '1rem',
        marginBottom: '2rem',
        padding: '1rem',
        background: '#f9fafb',
        borderRadius: '0.5rem',
        border: '1px solid #e5e7eb',
        alignItems: 'center',
        flexWrap: 'wrap'
      }}>
        <Input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            flex: '1 1 200px',
            minWidth: '200px',
            border: '1.5px solid #d1d5db',
            borderRadius: '0.375rem',
            padding: '0.5rem 1rem'
          }}
        />
        <Select
          value={selectedCategory}
          onValueChange={setSelectedCategory}
        >
          <SelectTrigger style={{
            flex: '0 1 180px',
            minWidth: '180px',
            border: '1.5px solid #d1d5db',
            borderRadius: '0.375rem',
            padding: '0.5rem 1rem'
          }}>
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(cat => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          onClick={handleClearFilters}
          variant="outline"
          style={{
            background: '#fff',
            border: '1.5px solid #d1d5db',
            color: '#374151',
            padding: '0.5rem 1.5rem',
            borderRadius: '0.375rem'
          }}
        >
          Clear Filters
        </Button>
        {/* BUG: Product count never updates from initial 0 */}
        <div style={{ marginLeft: 'auto', color: '#6b7280', fontSize: '0.95rem' }}>
          Showing {productCount} products
        </div>
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
        {filteredProducts.map(product => (
          <div
            key={product.product_id}
            style={{
              flex: '0 1 27%',
              minWidth: '160px',
              maxWidth: '27%',
              height: '420px',
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
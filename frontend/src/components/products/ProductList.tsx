import { useEffect, useState, useRef, useCallback, useMemo } from "react"
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

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100] as const
const FETCH_BATCH = 100

function productsListUrl(offset: number) {
  const params = new URLSearchParams({
    limit: String(FETCH_BATCH),
    offset: String(offset),
    order: "desc",
    orderBy: "product_id",
  })
  return apiUrl(`/api/v1/products?${params}`)
}

export default function ProductList() {
  const [products, setProducts] = useState<Product[]>([])
  const [pageSize, setPageSize] = useState<number>(25)
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
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

      const loadAll = async (): Promise<Product[]> => {
        const merged: Product[] = []
        let offset = 0
        for (;;) {
          const res = await fetch(productsListUrl(offset), {
            headers: { Authorization: `Bearer ${sessionId}` },
          })
          if (!res.ok) throw new Error("Failed to fetch products")
          const batch: Product[] = await res.json()
          if (!batch?.length) break
          merged.push(...batch)
          if (batch.length < FETCH_BATCH) break
          offset += FETCH_BATCH
        }
        return merged
      }

      return loadAll()
        .then((merged) => {
          setProducts(merged)
          return merged
        })
        .catch(err => {
          setError(err.message)
          throw err
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

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(products.length / pageSize)),
    [products.length, pageSize]
  )

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return products.slice(start, start + pageSize)
  }, [products, currentPage, pageSize])

  const goPrev = () => setCurrentPage((p) => Math.max(1, p - 1))
  const goNext = () => setCurrentPage((p) => Math.min(totalPages, p + 1))

  const renderPagination = (placement: "top" | "bottom") => (
    <div
      className="flex flex-wrap items-center justify-center gap-4 py-3 text-sm text-gray-700"
      data-testId={`product-list-pagination-${placement}`}
    >
      <label className="flex items-center gap-2">
        <span>Per page</span>
        <select
          className="rounded border border-gray-300 bg-white px-2 py-1"
          value={pageSize}
          onChange={(e) => {
            setPageSize(Number(e.target.value))
            setCurrentPage(1)
          }}
          aria-label="Items per page"
          data-testId={`product-list-page-size-${placement}`}
        >
          {PAGE_SIZE_OPTIONS.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </label>
      <span data-testId={`product-list-page-indicator-${placement}`}>
        Page {products.length === 0 ? 0 : currentPage} of {totalPages}
      </span>
      <div className="flex gap-2">
        <button
          type="button"
          className="rounded border border-gray-300 bg-white px-3 py-1 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          onClick={goPrev}
          disabled={currentPage <= 1 || products.length === 0}
          data-testId={`product-list-prev-${placement}`}
        >
          Previous
        </button>
        <button
          type="button"
          className="rounded border border-gray-300 bg-white px-3 py-1 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          onClick={goNext}
          disabled={currentPage >= totalPages || products.length === 0}
          data-testId={`product-list-next-${placement}`}
        >
          Next
        </button>
      </div>
    </div>
  )

  if (loading) return <div>Loading products...</div>
  if (error) return <div className="text-red-500">{error}</div>

  return (
    <div style={{ width: '100%' }}>
      {renderPagination("top")}
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
        {paginatedProducts.map((product) => (
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
      {renderPagination("bottom")}
    </div>
  )
}
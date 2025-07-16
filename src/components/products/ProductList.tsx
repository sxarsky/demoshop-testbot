import { useEffect, useState } from "react"
import { useLocation } from "react-router-dom"
import ProductItem from "./ProductItem"
import { getSessionIdFromCookie } from '../../lib/utils';

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
  const location = useLocation();

  const fetchProducts = () => {
    setLoading(true)
    const sessionId = getSessionIdFromCookie();
    fetch('https://dev.demoshop.skyramp.dev/api/v1/products', {
      headers: { 'Authorization': `Bearer ${sessionId}` }
    })
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch products")
        return res.json()
      })
      .then((data: Product[]) => {
        const sorted = (data || []).sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
        setProducts(sorted)
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchProducts();
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        fetchProducts();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [location])

  if (loading) return <div>Loading products...</div>
  if (error) return <div className="text-red-500">{error}</div>

  return (
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
      {products.map(product => (
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
          <ProductItem product={product} minHeight={400} data-testId={`product-id-${product.name}`} />
        </div>
      ))}
    </div>
  )
}
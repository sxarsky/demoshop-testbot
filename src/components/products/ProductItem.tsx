import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { useNavigate } from "react-router-dom"

type Product = {
  product_id: number;
  name: string;
  price: number;
  image_url?: string;
};

export default function ProductItem({ product }: { product: Product }) {
  const [imgSrc, setImgSrc] = useState(
    product.image_url && product.image_url.trim() !== ""
      ? product.image_url
      : "/placeholder.webp"
  )
  const navigate = useNavigate();
  const handleImgError = () => {
    if (imgSrc !== "/placeholder.webp") {
      setImgSrc("/placeholder.webp")
    }
  }
  return (
    <Card className="shadow-none border-0">
      <CardContent
        className="flex items-center py-2 px-4 min-h-0 border-0 !gap-4 !p-0"
        style={{ gap: '1rem', padding: 0 }}
      >
        {/* Product Image */}
        <img
          src={imgSrc}
          alt={product.name}
          style={{ width: '60px', height: '60px' }}
          className="object-cover rounded bg-muted flex items-center justify-center text-xs text-muted-foreground border-0 outline-none"
          loading="lazy"
          onError={handleImgError}
        />

        {/* Product Info */}
        <div className="flex flex-col flex-grow items-start gap-2" style={{ gap: '0.5rem', minWidth: '12rem', marginRight: '8rem' }}>
          <h2 className="text-lg leading-none m-0 p-0" style={{ margin: 0, padding: 0, lineHeight: 1, fontWeight: 400 }}>{product.name}</h2>
          <p className="text-xs text-muted-foreground leading-none m-0 p-0" style={{ margin: 0, padding: 0, lineHeight: 1 }}>${product.price.toFixed(2)}</p>
        </div>

        {/* View Details */}
        <Button
          variant="link"
          className="ml-auto"
          style={{ color: '#60a5fa', transition: 'background 0.2s', background: '#f3f4f6' }}
          onMouseOver={e => { e.currentTarget.style.background = '#e5e7eb'; }}
          onMouseOut={e => { e.currentTarget.style.background = '#f3f4f6'; }}
          onClick={() => navigate(`/products/${product.product_id}`)}
        >
          View Details
        </Button>
      </CardContent>
    </Card>
  );
}
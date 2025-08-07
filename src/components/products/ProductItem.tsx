import { Button } from "@/components/ui/button"
import { useState } from "react"
import { productImageUrlMap } from "@/lib/product_utils"
import { useNavigate } from "react-router-dom"

type Product = {
  product_id: number;
  name: string;
  price: number;
  image_url?: string;
};

interface ProductItemProps {
  product: Product;
  horizontal?: boolean;
  minHeight?: number;
  'data-testId'?: string;
}

export default function ProductItem({ product, horizontal = false, minHeight, 'data-testId': dataTestId }: ProductItemProps) {
  // Prefer mapped local image if available
  const initialImgSrc = product.image_url && product.image_url.trim() !== ""
    ? (productImageUrlMap[product.image_url] || product.image_url)
    : "/placeholder.webp";
  const [imgSrc, setImgSrc] = useState(initialImgSrc)

  const navigate = useNavigate();
  const handleImgError = () => {
    if (imgSrc !== "/placeholder.webp") {
      setImgSrc("/placeholder.webp")
    }
  }
  if (horizontal) {
    // For OrderDetail: horizontal, no box, name right of photo, price under name, button far right
    return (
      <div
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          background: 'none',
          border: 'none',
          borderRadius: 0,
          boxShadow: 'none',
          padding: 0,
          marginBottom: '0.5rem',
          gap: '1rem', // decreased gap for even less space between name and button
        }}
        data-testId={dataTestId}
      >
        {/* Product Image */}
        <div style={{ width: '72px', height: '72px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f3f4f6', borderRadius: '0.5rem', flexShrink: 0 }}>
          <img
            src={imgSrc}
            alt={product.name}
            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: '0.5rem' }}
            className="object-contain rounded bg-muted border-0 outline-none"
            loading="lazy"
            onError={handleImgError}
          />
        </div>
        {/* Product Info */}
        <div
          className="product-name-container"
          data-testId={`product-${product.name.replace(/\s+/g, '-')}-info`}
        >
          <span data-testId={`product-${product.name.replace(/\s+/g, '-')}`} style={{ fontSize: '1.1rem', fontWeight: 500, color: '#1e293b', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{product.name}</span>
          <div className="product-price-container">
            <span data-testId={`product-${product.name.replace(/\s+/g, '-')}-price`} style={{ fontSize: '1rem', color: '#0f766e', fontWeight: 500, margin: 0, marginTop: '0.25rem' }}>${product.price.toFixed(2)}</span>
          </div>
        </div>
        <Button
          variant="link"
          style={{ color: '#60a5fa', background: '#f3f4f6', borderRadius: '0.5rem', fontWeight: 500, padding: '0.5rem 1.25rem', border: '1px solid #9ca3af', boxShadow: 'none', transition: 'background 0.2s', minWidth: '7rem', textAlign: 'center', marginLeft: 'auto', fontSize: '1rem' }}
          onMouseOver={e => { e.currentTarget.style.background = '#e5e7eb'; }}
          onMouseOut={e => { e.currentTarget.style.background = '#f3f4f6'; }}
          onClick={() => navigate(`/products/${product.product_id}`)}
        >
          View Details
        </Button>
      </div>
    );
  }
  // Boxed layout
  return (
    <div
      style={{
        width: '100%',
        background: '#f9fafb',
        border: '1px solid #9ca3af', // darker border
        borderRadius: '0.75rem',
        boxShadow: '0 2px 8px 0 rgba(0,0,0,0.03)',
        padding: '0.75rem 1rem',
        marginBottom: '0.5rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        gap: '1.25rem', // more vertical space
        minHeight: minHeight || '180px',
      }}
      data-testId={dataTestId}
    >
      {/* Product Image */}
      <div style={{ width: '240px', height: '240px', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f3f4f6', borderRadius: '0.5rem' }}>
        <img
          src={imgSrc}
          alt={product.name}
          style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: '0.5rem' }}
          className="object-contain rounded bg-muted flex items-center justify-center text-xs text-muted-foreground border-0 outline-none"
          loading="lazy"
          onError={handleImgError}
        />
      </div>
      {/* Product Info */}
      <div
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.15rem', width: '100%', marginTop: '0.5rem' }}
        data-testId={`product-${product.name.replace(/\s+/g, '-')}-info`}
      >
        <div className="product-name-container">
          <h2
            data-testId={`product-${product.name.replace(/\s+/g, '-')}`}
            style={{
              fontSize: '1.1rem',
              fontWeight: 500,
              color: '#1e293b',
              margin: 0,
              textAlign: 'center',
              width: '100%',
              maxWidth: '220px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
            title={product.name}
          >
            {product.name}
          </h2>
        </div>
        <div className="product-price-container">
          <p data-testId={`product-${product.name.replace(/\s+/g, '-')}-price`} style={{ fontSize: '1.05rem', color: '#0f766e', fontWeight: 500, margin: 0, textAlign: 'center' }}>${product.price.toFixed(2)}</p>
        </div>
      </div>
      {/* View Details */}
      <div style={{ width: '100%', minHeight: '3.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Button
          variant="link"
          style={{ color: '#60a5fa', background: '#f3f4f6', borderRadius: '0.5rem', fontWeight: 500, padding: '0.5rem 1.25rem', border: '1px solid #9ca3af', boxShadow: 'none', transition: 'background 0.2s', minWidth: '7rem', textAlign: 'center', fontSize: '1rem' }}
          onMouseOver={e => { e.currentTarget.style.background = '#e5e7eb'; }}
          onMouseOut={e => { e.currentTarget.style.background = '#f3f4f6'; }}
          onClick={() => navigate(`/products/${product.product_id}`)}
          data-testId={`product-${product.name.replace(/\s+/g, '-')}-view-details`}
        >
          View Details
        </Button>
      </div>
    </div>
  );
}
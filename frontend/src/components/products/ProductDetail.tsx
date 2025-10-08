import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { productImageUrlMap } from '@/lib/product_utils'
import { Button } from '@/components/ui/button'
import { NavBar } from '../ui/navbar';
import { getSessionIdFromCookie } from '../../lib/utils';
import { apiUrl } from '../../config';

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editMode, setEditMode] = useState(false);
  const [formState, setFormState] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Use shared getSessionIdFromCookie from utils

  useEffect(() => {
    setLoading(true)
    const sessionId = getSessionIdFromCookie();
    fetch(apiUrl(`/api/v1/products/${id}`), {
      headers: { 'Authorization': `Bearer ${sessionId}` }
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch product')
        return res.json()
      })
      .then(data => {
        setProduct(data)
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    if (product) setFormState(product);
  }, [product]);

  // Handle input changes in edit mode
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormState((prev: any) => ({ ...prev, [name]: value }));
  };

  // Save product changes
  const handleSave = async () => {
    setSaving(true);
    const sessionId = getSessionIdFromCookie();
    try {
      const payload = {
        ...formState,
        price: parseFloat(formState.price),
        in_stock: formState.in_stock === true || formState.in_stock === 'true',
        image_url: formState.image_url || '',
      };
      const { product_id, created_at, updated_at, ...reducedPayload } = payload; // Exclude unwanted fields
      const res = await fetch(apiUrl(`/api/v1/products/${product.product_id}`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionId}`
        },
        body: JSON.stringify(reducedPayload),
      });
      if (!res.ok) throw new Error('Failed to update product');
      setProduct({ ...product, ...formState });
      setEditMode(false);
    } catch (err) {
      alert('Failed to save product.');
    } finally {
      setSaving(false);
    }
  };

  // Delete product
  const handleDelete = async () => {
    setDeleting(true);
    const sessionId = getSessionIdFromCookie();
    try {
      await fetch(apiUrl(`/api/v1/products/${product.product_id}`), {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${sessionId}` }
      });
      // Pass deleted info to ProductCatalog via localStorage
      localStorage.setItem('deletedProductBanner', JSON.stringify({ name: product.name }));
      navigate('/products');
    } catch (err) {
      alert('Failed to delete product.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white px-6 py-10" style={{ width: '100%', maxWidth: '80rem', margin: '0 auto' }} data-testId="product-detail-root">
      <NavBar active="products" />
      {/* Page Heading directly below nav */}
      <h1
        className="text-4xl font-bold text-gray-900 tracking-tight"
        style={{
          textAlign: 'center',
          width: '100%',
          margin: 0,
          paddingTop: '0.5rem',
          marginBottom: '1.5rem', // space below heading
        }}
        data-testId="product-detail-heading"
      >
        Product Details
      </h1>
      {loading && <div className="flex justify-center items-center h-40" style={{ justifyContent: 'flex-start' }} data-testId="product-detail-loading"><span className="text-lg text-gray-500" style={{ textAlign: 'left' }}>Loading...</span></div>}
      {error && <div className="text-red-500 text-center font-semibold" style={{ textAlign: 'left' }} data-testId="product-detail-error">{error}</div>}
      {!loading && !error && !product && (
        <div className="text-gray-500 text-center" style={{ textAlign: 'left' }} data-testId="product-detail-notfound">Product not found.</div>
      )}
      {product && Object.keys(product).length > 0 && (
        <div className="max-w-4xl mx-auto w-full bg-white rounded-2xl shadow-lg p-8 mb-8 flex flex-row gap-10" style={{ alignItems: 'flex-start', marginLeft: 0 }} data-testId="product-detail-main">
          <div className="flex flex-col flex-1" style={{ gap: '1rem', alignItems: 'flex-start' }} data-testId="product-detail-info-container">
            {/* Name */}
            <div data-testId="product-detail-name">
              <label className="block text-sm mb-1" style={{ color: '#9ca3af', fontWeight: 'normal', textAlign: 'left' }} data-testId="product-detail-label-name">Name</label>
              {editMode ? (
                <input
                  className="w-full border rounded px-3 py-2 text-gray-900"
                  name="name"
                  value={formState?.name || ''}
                  onChange={handleInputChange}
                  disabled={saving}
                  data-testId="product-detail-input-name"
                />
              ) : (
                <div style={{ fontSize: '1.125rem', fontWeight: 500 }} className="text-gray-900 mt-1" data-testId="product-detail-value-name">{product.name}</div>
              )}
            </div>
            {/* In Stock */}
            <div className="flex flex-col items-center" style={{ alignItems: 'flex-start' }} data-testId="product-detail-instock">
              <label className="block text-sm mb-1" style={{ color: '#9ca3af', fontWeight: 'normal', textAlign: 'left' }} data-testId="product-detail-label-instock">In Stock</label>
              {editMode ? (
                <select
                  className="w-40 border rounded px-3 py-2"
                  name="in_stock"
                  value={formState?.in_stock ? 'true' : 'false'}
                  onChange={e => setFormState((prev: any) => ({ ...prev, in_stock: e.target.value === 'true' }))}
                  disabled={saving}
                  data-testId="product-detail-input-instock"
                >
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              ) : product.in_stock ? (
                <span
                  className="px-4 py-1 rounded-full text-sm font-semibold bg-green-600 text-white"
                  style={{ background: '#16a34a', color: 'white', padding: '0.5rem 1.25rem' }}
                  data-testId="product-detail-value-instock"
                >
                  In Stock
                </span>
              ) : (
                <span
                  className="px-4 py-1 rounded-full text-sm font-semibold bg-red-600 text-white"
                  style={{ background: '#dc2626', color: 'white', padding: '0.5rem 1.25rem' }}
                  data-testId="product-detail-value-outstock"
                >
                  Out of Stock
                </span>
              )}
            </div>
            {/* Description */}
            <div data-testId="product-detail-description">
              <label className="block text-sm mb-1" style={{ color: '#9ca3af', fontWeight: 'normal', textAlign: 'left' }} data-testId="product-detail-label-description">Description</label>
              {editMode ? (
                <textarea
                  className="w-full border rounded px-3 py-2 text-gray-900"
                  name="description"
                  value={formState?.description || ''}
                  onChange={handleInputChange}
                  disabled={saving}
                  data-testId="product-detail-input-description"
                />
              ) : (
                <div style={{ fontSize: '1.125rem', fontWeight: 500 }} className="text-gray-900 mt-1" data-testId="product-detail-value-description">{product.description}</div>
              )}
            </div>
            {/* Category */}
            <div data-testId="product-detail-category">
              <label className="block text-sm mb-1" style={{ color: '#9ca3af', fontWeight: 'normal', textAlign: 'left' }} data-testId="product-detail-label-category">Category</label>
              {editMode ? (
                <input
                  className="w-full border rounded px-3 py-2 text-gray-900"
                  name="category"
                  value={formState?.category || ''}
                  onChange={handleInputChange}
                  disabled={saving}
                  data-testId="product-detail-input-category"
                />
              ) : (
                <div style={{ fontSize: '1.125rem', fontWeight: 500, textTransform: 'capitalize', textAlign: 'left' }} className="text-gray-900 mt-1" data-testId="product-detail-value-category">{product.category}</div>
              )}
            </div>
            {/* Price */}
            <div data-testId="product-detail-price">
              <label className="block text-sm mb-1" style={{ color: '#9ca3af', fontWeight: 'normal', textAlign: 'left' }} data-testId="product-detail-label-price">Price</label>
              {editMode ? (
                <input
                  className="w-full border rounded px-3 py-2 text-gray-900"
                  name="price"
                  type="number"
                  value={formState?.price || ''}
                  onChange={handleInputChange}
                  disabled={saving}
                  data-testId="product-detail-input-price"
                />
              ) : (
                <div style={{ fontSize: '1.125rem', fontWeight: 500 }} className="text-gray-900 mt-1" data-testId="product-detail-value-price">${product.price}</div>
              )}
            </div>
            {/* Created At */}
            <div data-testId="product-detail-createdat">
              <label className="block text-sm mb-1" style={{ color: '#9ca3af', fontWeight: 'normal', textAlign: 'left' }} data-testId="product-detail-label-createdat">Created At</label>
              <div style={{ fontSize: '1.125rem', fontWeight: 500 }} className="text-gray-900 mt-1" data-testId="product-detail-value-createdat">{product.created_at && new Date(product.created_at).toLocaleString()}</div>
            </div>
            {/* Last Updated */}
            <div data-testId="product-detail-updatedat">
              <label className="block text-sm mb-1" style={{ color: '#9ca3af', fontWeight: 'normal', textAlign: 'left' }} data-testId="product-detail-label-updatedat">Last Updated</label>
              <div style={{ fontSize: '1.125rem', fontWeight: 500 }} className="text-gray-900 mt-1" data-testId="product-detail-value-updatedat">{product.updated_at && new Date(product.updated_at).toLocaleString()}</div>
            </div>
            {/* Product ID */}
            <div data-testId="product-detail-id">
              <label className="block text-sm mb-1" style={{ color: '#9ca3af', fontWeight: 'normal', textAlign: 'left' }} data-testId="product-detail-label-id">Product ID</label>
              <div style={{ fontSize: '1.125rem', fontWeight: 500, textAlign: 'left' }} className="text-gray-900 mt-1" data-testId="product-detail-value-id">{product.product_id}</div>
            </div>
          </div>
          {product.image_url && (
            <div
              className="flex justify-center items-start"
              style={{ minWidth: '24rem', maxWidth: '24rem', marginLeft: '2rem', marginBottom: 0 }}
              data-testId="product-detail-image-container"
            >
              <img
                src={productImageUrlMap[product.image_url] || product.image_url || "/placeholder.webp"}
                alt={product.name}
                style={{
                  width: '24rem', // 384px
                  height: '20rem', // 320px
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain',
                  borderRadius: '0.75rem', // rounded-xl
                  background: '#f9fafb', // bg-gray-50
                  boxShadow: '0 1px 2px 0 rgb(0 0 0 / 0.05)', // shadow-sm
                }}
                onError={e => {
                  const target = e.target as HTMLImageElement;
                  if (target.src.indexOf('placeholder.webp') === -1) {
                    target.src = "/placeholder.webp";
                  }
                }}
                data-testId="product-detail-image"
              />
            </div>
          )}
        </div>
      )}
      {/* Buttons centered */}
      <div className="flex flex-col items-center" style={{ gap: '1rem', marginTop: '1.5rem' }} data-testId="product-detail-buttons">
        {editMode ? (
          <Button
            variant="default"
            className="w-48"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Product'}
          </Button>
        ) : (
          <Button
            variant="default"
            className="w-48"
            onClick={() => setEditMode(true)}
            style={{
              color: '#fff', // White text
              background: '#111', // Black background
              border: '1.5px solid #111', // Black border
              transition: 'background 0.2s, border-color 0.2s, color 0.2s',
            }}
            onMouseOver={e => {
              e.currentTarget.style.background = 'rgba(17,17,17,0.7)'; // Translucent black on hover
              e.currentTarget.style.borderColor = '#111'; // Keep border black
              e.currentTarget.style.color = '#fff'; // Keep text white
            }}
            onMouseOut={e => {
              e.currentTarget.style.background = '#111'; // Black
              e.currentTarget.style.borderColor = '#111'; // Black border
              e.currentTarget.style.color = '#fff'; // White text
            }}
          >
            Edit Product
          </Button>
        )}
        <Button
          variant="destructive"
          className="w-48"
          onClick={handleDelete}
          disabled={deleting}
          style={{
            color: '#fff',
            background: '#dc2626', // Default red
            border: '1.5px solid transparent', // Reserve space for border
            transition: 'background 0.2s, border-color 0.2s',
          }}
          onMouseOver={e => {
            e.currentTarget.style.background = '#f87171'; // Lighter red
            e.currentTarget.style.borderColor = '#991b1b'; // Dark red border
          }}
          onMouseOut={e => {
            e.currentTarget.style.background = '#dc2626'; // Default red
            e.currentTarget.style.borderColor = 'transparent';
          }}
        >
          {deleting ? 'Deleting...' : 'Delete Product'}
        </Button>
        <Button 
          variant="link" 
          className="w-48" 
          onClick={() => navigate('/products')}
          style={{ 
            color: '#111', // Black text
            background: '#e5e7eb', // Slightly darker than #f3f4f6
            border: '1.5px solid transparent', // Reserve space for border
            transition: 'background 0.2s, border-color 0.2s, color 0.2s',
          }}
          onMouseOver={e => { 
            e.currentTarget.style.background = '#d1d5db'; // Darker grey on hover
            e.currentTarget.style.borderColor = '#111'; // Black border
            e.currentTarget.style.color = '#111'; // Keep text black on hover
          }}
          onMouseOut={e => { 
            e.currentTarget.style.background = '#e5e7eb'; // Slightly darker default
            e.currentTarget.style.borderColor = 'transparent'; 
            e.currentTarget.style.color = '#111'; // Keep text black
          }}
        >
          Back
        </Button>
      </div>
    </div>
  )
}
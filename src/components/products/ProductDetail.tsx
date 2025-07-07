import { useParams, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'

function Header() {
  return (
    <header className="w-full">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo + Brand */}
        <div className="flex items-center gap-2">
          <img
            src="/logo.avif"
            alt="Skyramp Logo"
            width={150}
            height={100}
            className="object-contain"
          />
        </div>
        {/* Nav Links */}
        <nav className="flex items-center text-sm font-medium gap-x-16">
          <a href="/products" className="underline underline-offset-4" style={{ color: '#60a5fa' }}>Products</a>
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          <a href="/orders" className="hover:underline" style={{ color: '#60a5fa' }}>Orders</a>
        </nav>
      </div>
    </header>
  )
}

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

  useEffect(() => {
    setLoading(true)
    fetch(`https://demoshop.skyramp.dev/api/v1/products/${id}`)
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
    try {
      const payload = {
        ...formState,
        price: parseFloat(formState.price),
        in_stock: formState.in_stock === true || formState.in_stock === 'true',
        image_url: formState.image_url || '',
      };
      const { product_id, created_at, updated_at, ...reducedPayload } = payload; // Exclude unwanted fields
      const res = await fetch(`https://demoshop.skyramp.dev/api/v1/products/${product.product_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reducedPayload),
      });
      if (!res.ok) throw new Error('Failed to update product');
      const updated = await res.json();
      setProduct(updated);
      setEditMode(false);
    } catch (err) {
      alert('Failed to save product.');
    } finally {
      setSaving(false);
    }
  };

  // Delete product
  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    setDeleting(true);
    try {
      await fetch(`https://demoshop.skyramp.dev/api/v1/products/${product.product_id}`, { method: 'DELETE' });
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
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-100 px-6 py-10">
      <Header />
      <div className="flex flex-col items-center pb-4 mb-8 gap-4">
        <h1 className="text-4xl font-bold text-gray-900 text-center tracking-tight">Product Details</h1>
      </div>
      {loading && <div className="flex justify-center items-center h-40"><span className="text-lg text-gray-500">Loading...</span></div>}
      {error && <div className="text-red-500 text-center font-semibold">{error}</div>}
      {!loading && !error && !product && (
        <div className="text-gray-500 text-center">Product not found.</div>
      )}
      {product && Object.keys(product).length > 0 && (
        <div className="max-w-lg mx-auto w-full bg-white rounded-2xl shadow-lg p-8 mb-8 flex flex-col gap-6">
          {product.image_url && (
            <div className="flex justify-center mb-2">
              <img
                src={product.image_url || "/placeholder.webp"}
                alt={product.name}
                className="w-64 h-56 object-contain rounded-xl bg-gray-50 shadow-sm"
                onError={e => {
                  const target = e.target as HTMLImageElement;
                  if (target.src.indexOf('placeholder.webp') === -1) {
                    target.src = "/placeholder.webp";
                  }
                }}
              />
            </div>
          )}
          <div className="flex flex-col" style={{ gap: '1rem' }}>
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" style={{ fontWeight: 'bold' }}>Name</label>
              {editMode ? (
                <input
                  className="w-full border rounded px-3 py-2 text-gray-900"
                  name="name"
                  value={formState?.name || ''}
                  onChange={handleInputChange}
                  disabled={saving}
                />
              ) : (
                <div className="text-lg text-gray-900 font-normal">{product.name}</div>
              )}
            </div>
            {/* In Stock */}
            <div className="flex flex-col items-center">
              <label className="block text-sm font-medium text-gray-700 mb-1" style={{ fontWeight: 'bold' }}>In Stock</label>
              {editMode ? (
                <select
                  className="w-40 border rounded px-3 py-2"
                  name="in_stock"
                  value={formState?.in_stock ? 'true' : 'false'}
                  onChange={e => setFormState((prev: any) => ({ ...prev, in_stock: e.target.value === 'true' }))}
                  disabled={saving}
                >
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              ) : product.in_stock ? (
                <span
                  className="px-4 py-1 rounded-full text-sm font-semibold bg-green-600 text-white"
                  style={{ background: '#16a34a', color: 'white', padding: '0.5rem 1.25rem' }}
                >
                  In Stock
                </span>
              ) : (
                <span
                  className="px-4 py-1 rounded-full text-sm font-semibold bg-red-600 text-white"
                  style={{ background: '#dc2626', color: 'white', padding: '0.5rem 1.25rem' }}
                >
                  Out of Stock
                </span>
              )}
            </div>
            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" style={{ fontWeight: 'bold' }}>Description</label>
              {editMode ? (
                <textarea
                  className="w-full border rounded px-3 py-2 text-gray-900"
                  name="description"
                  value={formState?.description || ''}
                  onChange={handleInputChange}
                  disabled={saving}
                />
              ) : (
                <div className="text-gray-800 font-normal">{product.description}</div>
              )}
            </div>
            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" style={{ fontWeight: 'bold' }}>Category</label>
              {editMode ? (
                <input
                  className="w-full border rounded px-3 py-2 text-gray-900"
                  name="category"
                  value={formState?.category || ''}
                  onChange={handleInputChange}
                  disabled={saving}
                />
              ) : (
                <div className="text-gray-800 font-normal">{product.category}</div>
              )}
            </div>
            {/* Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" style={{ fontWeight: 'bold' }}>Price</label>
              {editMode ? (
                <input
                  className="w-full border rounded px-3 py-2 text-gray-900"
                  name="price"
                  type="number"
                  value={formState?.price || ''}
                  onChange={handleInputChange}
                  disabled={saving}
                />
              ) : (
                <div className="text-gray-800 font-normal">${product.price}</div>
              )}
            </div>
            {/* Created At */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" style={{ fontWeight: 'bold' }}>Created At</label>
              <div className="text-xs text-gray-500 font-normal">{product.created_at && new Date(product.created_at).toLocaleString()}</div>
            </div>
            {/* Last Updated */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" style={{ fontWeight: 'bold' }}>Last Updated</label>
              <div className="text-xs text-gray-500 font-normal">{product.updated_at && new Date(product.updated_at).toLocaleString()}</div>
            </div>
            {/* Product ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" style={{ fontWeight: 'bold' }}>Product ID</label>
              <div className="text-xs text-gray-500 font-normal">{product.product_id}</div>
            </div>
          </div>
        </div>
      )}
      <div className="flex flex-col items-center" style={{ gap: '1rem', marginTop: '1.5rem' }}>
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
          >
            Edit Product
          </Button>
        )}
        <Button
          variant="destructive"
          className="w-48"
          onClick={handleDelete}
          disabled={deleting}
          style={{ color: '#fff' }}
        >
          {deleting ? 'Deleting...' : 'Delete Product'}
        </Button>
        <Button variant="outline" className="w-48" onClick={() => navigate('/products')}>
          Back
        </Button>
      </div>
    </div>
  )
}
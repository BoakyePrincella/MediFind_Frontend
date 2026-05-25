import { useState, useEffect } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import Spinner from '../../components/ui/Spinner';
import {
  adminGetProducts,
  adminCreateProduct,
  adminDeleteProduct,
} from '../../api/admin';
import { adminGetCategories } from '../../api/admin';
import type { Product, Category } from '../../types';

export default function AdminProducts() {
  const [products,   setProducts]   = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [page,       setPage]       = useState(1);
  const [lastPage,   setLastPage]   = useState(1);
  const [total,      setTotal]      = useState(0);
  const [search,     setSearch]     = useState('');
  const [error,      setError]      = useState('');
  const [success,    setSuccess]    = useState('');
  const [showForm,   setShowForm]   = useState(false);
  const [saving,     setSaving]     = useState(false);

  // Form fields
  const [name,       setName]       = useState('');
  const [brand,      setBrand]      = useState('');
  const [desc,       setDesc]       = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [image,      setImage]      = useState<File | null>(null);

  useEffect(() => {
    adminGetCategories().then(r => setCategories(r.data));
  }, []);

  useEffect(() => {
    load();
  }, [page, search]);

  const load = () => {
    setLoading(true);
    adminGetProducts({ q: search || undefined, page })
      .then(r => {
        setProducts(r.data.data);
        setLastPage(r.data.last_page);
        setTotal(r.data.total);
      })
      .catch(() => setError('Could not load products.'))
      .finally(() => setLoading(false));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryId) { setError('Please select a category.'); return; }
    setSaving(true);
    setError('');

    const formData = new FormData();
    formData.append('name',        name.trim());
    formData.append('brand',       brand.trim());
    formData.append('description', desc.trim());
    formData.append('category_id', categoryId);
    formData.append('is_active',   '1');
    if (image) formData.append('image', image);

    try {
      await adminCreateProduct(formData);
      setName(''); setBrand(''); setDesc('');
      setCategoryId(''); setImage(null);
      setShowForm(false);
      setSuccess('Product created successfully.');
      setTimeout(() => setSuccess(''), 3000);
      setPage(1);
      load();
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Could not create product.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (product: Product) => {
    if (!confirm(`Delete "${product.name}"? This cannot be undone.`)) return;
    setError('');
    try {
      await adminDeleteProduct(product.id);
      setSuccess('Product deleted.');
      setTimeout(() => setSuccess(''), 3000);
      load();
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Could not delete product.');
    }
  };

  // Flatten all categories for the dropdown
  const allCategories = categories.flatMap(cat => [
    cat,
    ...(cat.children ?? []),
  ]);

  return (
    <AdminLayout>
      <div className="p-8">

        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-xl font-semibold text-gray-800">Products</h1>
            <p className="text-sm text-gray-400 mt-0.5">
              {total} products in the global catalogue
            </p>
          </div>
          <button
            onClick={() => { setShowForm(!showForm); setError(''); }}
            className="text-sm bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700 transition-colors font-medium"
          >
            {showForm ? '✕ Cancel' : '+ New product'}
          </button>
        </div>

        {success && (
          <div className="bg-green-50 border border-green-100 text-green-700 text-sm rounded-xl px-4 py-3 mb-5">
            ✓ {success}
          </div>
        )}
        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl px-4 py-3 mb-5">
            {error}
          </div>
        )}

        {/* Create form */}
        {showForm && (
          <form onSubmit={handleCreate} className="bg-white rounded-xl border border-gray-100 p-6 mb-6 space-y-4">
            <h2 className="text-sm font-semibold text-gray-700">New product</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Product name</label>
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Paracetamol 500mg"
                  required
                  autoFocus
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-green-400"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  Brand
                  <span className="text-gray-300 font-normal ml-1">(optional)</span>
                </label>
                <input
                  value={brand}
                  onChange={e => setBrand(e.target.value)}
                  placeholder="e.g. Panadol"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-green-400"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Category</label>
              <select
                value={categoryId}
                onChange={e => setCategoryId(e.target.value)}
                required
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-green-400 bg-white"
              >
                <option value="">Select a category</option>
                {allCategories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.parent_id ? `  ↳ ${cat.name}` : cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                Description
                <span className="text-gray-300 font-normal ml-1">(optional)</span>
              </label>
              <textarea
                value={desc}
                onChange={e => setDesc(e.target.value)}
                placeholder="What is this product used for?"
                rows={2}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-green-400 resize-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                Image
                <span className="text-gray-300 font-normal ml-1">(optional)</span>
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={e => setImage(e.target.files?.[0] ?? null)}
                className="w-full text-sm text-gray-600 file:mr-3 file:text-xs file:font-medium file:bg-green-50 file:text-green-600 file:border-0 file:px-3 file:py-1.5 file:rounded-lg"
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              className="bg-green-600 text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-green-700 disabled:opacity-60 transition-colors"
            >
              {saving ? 'Creating...' : 'Create product'}
            </button>
          </form>
        )}

        {/* Search */}
        <div className="mb-4">
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search products..."
            className="w-full md:w-80 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-green-400 transition-colors"
          />
        </div>

        {/* Product list */}
        {loading ? <Spinner /> : (
          <>
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              {products.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                  <p className="text-3xl mb-2">💊</p>
                  <p className="text-sm">No products found.</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-12 gap-4 px-5 py-3 bg-gray-50 border-b border-gray-100 text-xs font-medium text-gray-400 uppercase tracking-wide">
                    <div className="col-span-5">Product</div>
                    <div className="col-span-3">Category</div>
                    <div className="col-span-2">Brand</div>
                    <div className="col-span-1 text-center">Status</div>
                    <div className="col-span-1"></div>
                  </div>
                  {products.map(product => (
                    <div
                      key={product.id}
                      className="grid grid-cols-12 gap-4 px-5 py-4 border-b border-gray-50 last:border-0 items-center hover:bg-gray-50/50 transition-colors"
                    >
                      <div className="col-span-5">
                        <p className="text-sm font-medium text-gray-800">{product.name}</p>
                        <p className="text-xs text-gray-400 font-mono">{product.slug}</p>
                      </div>
                      <div className="col-span-3 text-sm text-gray-500">
                        {product.category?.name ?? '—'}
                      </div>
                      <div className="col-span-2 text-sm text-gray-400">
                        {product.brand ?? '—'}
                      </div>
                      <div className="col-span-1 flex justify-center">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          product.is_active
                            ? 'bg-green-50 text-green-600'
                            : 'bg-gray-100 text-gray-400'
                        }`}>
                          {product.is_active ? 'Active' : 'Off'}
                        </span>
                      </div>
                      <div className="col-span-1 flex justify-end">
                        <button
                          onClick={() => handleDelete(product)}
                          className="text-xs text-red-400 hover:text-red-600 transition-colors"
                          title="Delete product"
                        >
                          🗑
                        </button>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </div>

            {/* Pagination */}
            {lastPage > 1 && (
              <div className="flex justify-center items-center gap-2 mt-6">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                  className="px-4 py-2 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors"
                >
                  ← Previous
                </button>
                <span className="text-sm text-gray-500 px-2">
                  Page {page} of {lastPage}
                </span>
                <button
                  disabled={page === lastPage}
                  onClick={() => setPage(p => p + 1)}
                  className="px-4 py-2 text-sm border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors"
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  );
}
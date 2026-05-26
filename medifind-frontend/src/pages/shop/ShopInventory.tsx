import { useState, useEffect } from 'react';
import ShopLayout from '../../components/layout/ShopLayout';
import Spinner from '../../components/ui/Spinner';
import {
  getInventory,
  addToInventory,
  createInventoryProduct,
  updateInventoryItem,
  removeFromInventory,
} from '../../api/shop';
import { getCategories, searchProducts } from '../../api/public';
import type { ShopProduct, Product, Category } from '../../types';

export default function ShopInventory() {
  const [inventory,  setInventory]  = useState<ShopProduct[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [page,       setPage]       = useState(1);
  const [lastPage,   setLastPage]   = useState(1);

  // Add product panel state
  const [showAdd,    setShowAdd]    = useState(false);
  const [catalogue,  setCatalogue]  = useState<Product[]>([]);
  const [catSearch,  setCatSearch]  = useState('');
  const [catLoading, setCatLoading] = useState(false);
  const [addingId,   setAddingId]   = useState<number | null>(null);
  const [newPrice,   setNewPrice]   = useState<Record<number, string>>({});
  const [addMode,    setAddMode]    = useState<'existing' | 'new'>('existing');

  // New product form state
  const [categories, setCategories] = useState<Category[]>([]);
  const [newName,    setNewName]    = useState('');
  const [newBrand,   setNewBrand]   = useState('');
  const [newDesc,    setNewDesc]    = useState('');
  const [newCategory,setNewCategory]= useState('');
  const [newProductPrice, setNewProductPrice] = useState('');
  const [newNotes,   setNewNotes]   = useState('');
  const [newInStock, setNewInStock] = useState(true);
  const [newImage,   setNewImage]   = useState<File | null>(null);
  const [creating,   setCreating]   = useState(false);

  // Inline edit state
  const [editingId,  setEditingId]  = useState<number | null>(null);
  const [editPrice,  setEditPrice]  = useState('');
  const [saving,     setSaving]     = useState(false);
  const [error,      setError]      = useState('');

  // Load inventory
  useEffect(() => {
    loadInventory();
  }, [page]);

  const loadInventory = () => {
    setLoading(true);
    getInventory(page)
      .then(r => {
        setInventory(r.data.data);
        setLastPage(r.data.last_page);
      })
      .catch(() => setError('Could not load inventory.'))
      .finally(() => setLoading(false));
  };

  // Search catalogue when shop owner types
  useEffect(() => {
    if (!showAdd) return;
    setCatLoading(true);
    const timer = setTimeout(() => {
      searchProducts({ q: catSearch || undefined })
        .then(r => setCatalogue(r.data.data))
        .finally(() => setCatLoading(false));
    }, 300); // debounce — wait 300ms after typing stops
    return () => clearTimeout(timer);
  }, [catSearch, showAdd]);

  useEffect(() => {
    if (!showAdd || categories.length > 0) return;
    getCategories()
      .then(r => setCategories(r.data))
      .catch(() => setError('Could not load product categories.'));
  }, [categories.length, showAdd]);

  // Add a product to inventory
  const handleAdd = async (product: Product) => {
    const price = parseFloat(newPrice[product.id] ?? '');
    if (!price || price <= 0) {
      setError('Please enter a valid price before adding.');
      return;
    }
    setAddingId(product.id);
    setError('');
    try {
      await addToInventory({
        product_id: product.id,
        price,
        in_stock: true,
      });
      setNewPrice(prev => {
        const copy = { ...prev };
        delete copy[product.id];
        return copy;
      });
      loadInventory();
    } catch (err: any) {
      setError(
        err.response?.data?.message ?? 'Could not add product.'
      );
    } finally {
      setAddingId(null);
    }
  };

  const resetNewProductForm = () => {
    setNewName('');
    setNewBrand('');
    setNewDesc('');
    setNewCategory('');
    setNewProductPrice('');
    setNewNotes('');
    setNewInStock(true);
    setNewImage(null);
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const price = parseFloat(newProductPrice);

    if (!newCategory) {
      setError('Please select a category.');
      return;
    }

    if (!price || price <= 0) {
      setError('Please enter a valid price.');
      return;
    }

    const formData = new FormData();
    formData.append('name', newName.trim());
    formData.append('brand', newBrand.trim());
    formData.append('description', newDesc.trim());
    formData.append('category_id', newCategory);
    formData.append('price', String(price));
    formData.append('in_stock', newInStock ? '1' : '0');
    formData.append('notes', newNotes.trim());
    if (newImage) formData.append('image', newImage);

    setCreating(true);
    setError('');
    try {
      const { data } = await createInventoryProduct(formData);
      setInventory(prev => [data, ...prev]);
      resetNewProductForm();
      setShowAdd(false);
    } catch (err: any) {
      const errs = err.response?.data?.errors;
      if (errs) {
        const first = Object.values(errs)[0] as string[];
        setError(first[0]);
      } else {
        setError(err.response?.data?.message ?? 'Could not create product.');
      }
    } finally {
      setCreating(false);
    }
  };

  // Toggle in_stock
  const handleToggleStock = async (sp: ShopProduct) => {
    try {
      const updated = await updateInventoryItem(sp.id, {
        in_stock: !sp.in_stock,
      });
      setInventory(prev =>
        prev.map(item => item.id === sp.id ? updated.data : item)
      );
    } catch {
      setError('Could not update stock status.');
    }
  };

  // Save edited price
  const handleSavePrice = async (sp: ShopProduct) => {
    const price = parseFloat(editPrice);
    if (!price || price <= 0) {
      setError('Please enter a valid price.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const updated = await updateInventoryItem(sp.id, { price });
      setInventory(prev =>
        prev.map(item => item.id === sp.id ? updated.data : item)
      );
      setEditingId(null);
    } catch {
      setError('Could not update price.');
    } finally {
      setSaving(false);
    }
  };

  // Remove product from inventory
  const handleRemove = async (sp: ShopProduct) => {
    if (!confirm(`Remove ${sp.product?.name} from your inventory?`)) return;
    try {
      await removeFromInventory(sp.id);
      setInventory(prev => prev.filter(item => item.id !== sp.id));
    } catch {
      setError('Could not remove product.');
    }
  };

  const allCategories = categories.flatMap(cat => [
    cat,
    ...(cat.children ?? []),
  ]);

  return (
    <ShopLayout>
      <div className="p-8">

        {/* ── Header ── */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-xl font-semibold text-gray-800">Inventory</h1>
            <p className="text-sm text-gray-400 mt-0.5">
              Manage the products your shop stocks
            </p>
          </div>
          <button
            onClick={() => { setShowAdd(!showAdd); setCatSearch(''); setError(''); }}
            className="text-sm bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700 transition-colors font-medium"
          >
            {showAdd ? '✕ Cancel' : '+ Add product'}
          </button>
        </div>

        {/* ── Error banner ── */}
        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl px-4 py-3 mb-5">
            {error}
            <button
              onClick={() => setError('')}
              className="ml-3 text-red-400 hover:text-red-600"
            >
              ✕
            </button>
          </div>
        )}

        {/* ── Add product panel ── */}
        {showAdd && (
          <div className="bg-white rounded-xl border border-gray-100 p-5 mb-6">
            <div className="flex items-center justify-between gap-4 mb-4">
              <h2 className="text-sm font-semibold text-gray-700">
                Add product
              </h2>
              <div className="flex rounded-xl bg-gray-50 p-1">
                <button
                  type="button"
                  onClick={() => setAddMode('existing')}
                  className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
                    addMode === 'existing'
                      ? 'bg-white text-green-700 shadow-sm font-medium'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  Existing
                </button>
                <button
                  type="button"
                  onClick={() => setAddMode('new')}
                  className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${
                    addMode === 'new'
                      ? 'bg-white text-green-700 shadow-sm font-medium'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  New product
                </button>
              </div>
            </div>

            {addMode === 'existing' ? (
              <>

            {/* Search catalogue */}
            <input
              type="text"
              value={catSearch}
              onChange={e => setCatSearch(e.target.value)}
              placeholder="Search catalogue — Paracetamol, Nivea, Vitamin C..."
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-green-400 transition-colors mb-4"
              autoFocus
            />

            {catLoading ? (
              <Spinner />
            ) : catalogue.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">
                {catSearch ? `No products found for "${catSearch}"` : 'Start typing to search the catalogue'}
              </p>
            ) : (
              <div className="space-y-2 max-h-72 overflow-y-auto">
                {catalogue.map(product => {
                  // Check if already in inventory
                  const alreadyAdded = inventory.some(
                    sp => sp.product_id === product.id
                  );

                  return (
                    <div
                      key={product.id}
                      className={`flex items-center justify-between gap-4 p-3 rounded-xl border transition-colors ${
                        alreadyAdded
                          ? 'border-gray-100 bg-gray-50 opacity-60'
                          : 'border-gray-100 hover:border-green-200'
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">
                          {product.name}
                        </p>
                        <p className="text-xs text-gray-400">
                          {product.category?.name}
                          {product.brand && ` · ${product.brand}`}
                        </p>
                      </div>

                      {alreadyAdded ? (
                        <span className="text-xs text-gray-400 shrink-0">
                          Already added
                        </span>
                      ) : (
                        <div className="flex items-center gap-2 shrink-0">
                          {/* Price input */}
                          <div className="relative">
                            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                              GH₵
                            </span>
                            <input
                              type="number"
                              value={newPrice[product.id] ?? ''}
                              onChange={e => setNewPrice(prev => ({
                                ...prev,
                                [product.id]: e.target.value,
                              }))}
                              placeholder="0.00"
                              min="0"
                              step="0.01"
                              className="w-24 border border-gray-200 rounded-lg pl-9 pr-2 py-1.5 text-sm outline-none focus:border-green-400"
                            />
                          </div>
                          {/* Add button */}
                          <button
                            onClick={() => handleAdd(product)}
                            disabled={addingId === product.id}
                            className="text-xs bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-60 font-medium"
                          >
                            {addingId === product.id ? '...' : 'Add'}
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
              </>
            ) : (
              <form onSubmit={handleCreateProduct} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">Product name</label>
                    <input
                      value={newName}
                      onChange={e => setNewName(e.target.value)}
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
                      value={newBrand}
                      onChange={e => setNewBrand(e.target.value)}
                      placeholder="e.g. Panadol"
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-green-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">Category</label>
                    <select
                      value={newCategory}
                      onChange={e => setNewCategory(e.target.value)}
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
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">Price</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                        GH₵
                      </span>
                      <input
                        type="number"
                        value={newProductPrice}
                        onChange={e => setNewProductPrice(e.target.value)}
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        required
                        className="w-full border border-gray-200 rounded-xl pl-11 pr-4 py-2.5 text-sm outline-none focus:border-green-400"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">
                    Description
                    <span className="text-gray-300 font-normal ml-1">(optional)</span>
                  </label>
                  <textarea
                    value={newDesc}
                    onChange={e => setNewDesc(e.target.value)}
                    placeholder="What is this product used for?"
                    rows={2}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-green-400 resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1.5">
                      Notes
                      <span className="text-gray-300 font-normal ml-1">(optional)</span>
                    </label>
                    <input
                      value={newNotes}
                      onChange={e => setNewNotes(e.target.value)}
                      placeholder="Prescription required"
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-green-400"
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
                      onChange={e => setNewImage(e.target.files?.[0] ?? null)}
                      className="w-full text-sm text-gray-600 file:mr-3 file:text-xs file:font-medium file:bg-green-50 file:text-green-600 file:border-0 file:px-3 file:py-1.5 file:rounded-lg"
                    />
                  </div>
                </div>

                <label className="flex w-fit items-center gap-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={newInStock}
                    onChange={e => setNewInStock(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-400"
                  />
                  In stock
                </label>

                <button
                  type="submit"
                  disabled={creating}
                  className="bg-green-600 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-green-700 disabled:opacity-60 transition-colors"
                >
                  {creating ? 'Creating...' : 'Create and add to inventory'}
                </button>
              </form>
            )}
          </div>
        )}

        {/* ── Inventory list ── */}
        {loading ? (
          <Spinner />
        ) : inventory.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
            <p className="text-4xl mb-3">📦</p>
            <p className="text-sm font-medium text-gray-600">
              Your inventory is empty
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Click "Add product" to create or add products to your shop
            </p>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">

              {/* Table header */}
              <div className="grid grid-cols-12 gap-4 px-5 py-3 bg-gray-50 border-b border-gray-100 text-xs font-medium text-gray-400 uppercase tracking-wide">
                <div className="col-span-5">Product</div>
                <div className="col-span-2">Category</div>
                <div className="col-span-2 text-right">Price</div>
                <div className="col-span-2 text-center">Stock</div>
                <div className="col-span-1"></div>
              </div>

              {/* Rows */}
              {inventory.map(sp => (
                <div
                  key={sp.id}
                  className="grid grid-cols-12 gap-4 px-5 py-4 border-b border-gray-50 last:border-0 items-center hover:bg-gray-50/50 transition-colors"
                >
                  {/* Product name */}
                  <div className="col-span-5">
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {sp.product?.name}
                    </p>
                    {sp.product?.brand && (
                      <p className="text-xs text-gray-400 mt-0.5">
                        {sp.product.brand}
                      </p>
                    )}
                    {sp.notes && (
                      <p className="text-xs text-amber-600 mt-0.5">
                        ⚠ {sp.notes}
                      </p>
                    )}
                  </div>

                  {/* Category */}
                  <div className="col-span-2">
                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full truncate block w-fit">
                      {sp.product?.category?.name}
                    </span>
                  </div>

                  {/* Price — click to edit inline */}
                  <div className="col-span-2 text-right">
                    {editingId === sp.id ? (
                      <div className="flex items-center gap-1 justify-end">
                        <div className="relative">
                          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                            ₵
                          </span>
                          <input
                            type="number"
                            value={editPrice}
                            onChange={e => setEditPrice(e.target.value)}
                            className="w-20 border border-green-400 rounded-lg pl-6 pr-2 py-1 text-sm outline-none text-right"
                            autoFocus
                            onKeyDown={e => {
                              if (e.key === 'Enter') handleSavePrice(sp);
                              if (e.key === 'Escape') setEditingId(null);
                            }}
                          />
                        </div>
                        <button
                          onClick={() => handleSavePrice(sp)}
                          disabled={saving}
                          className="text-xs text-green-600 hover:text-green-700 font-medium"
                        >
                          {saving ? '...' : 'Save'}
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="text-xs text-gray-400 hover:text-gray-600"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setEditingId(sp.id);
                          setEditPrice(String(sp.price));
                        }}
                        className="text-sm font-medium text-gray-700 hover:text-green-600 transition-colors"
                        title="Click to edit price"
                      >
                        GH₵ {sp.price.toFixed(2)}
                      </button>
                    )}
                  </div>

                  {/* Stock toggle */}
                  <div className="col-span-2 flex justify-center">
                    <button
                      onClick={() => handleToggleStock(sp)}
                      className={`text-xs px-3 py-1 rounded-full font-medium transition-colors ${
                        sp.in_stock
                          ? 'bg-green-50 text-green-600 hover:bg-green-100'
                          : 'bg-red-50 text-red-500 hover:bg-red-100'
                      }`}
                    >
                      {sp.in_stock ? 'In stock' : 'Out of stock'}
                    </button>
                  </div>

                  {/* Remove */}
                  <div className="col-span-1 flex justify-end">
                    <button
                      onClick={() => handleRemove(sp)}
                      className="text-xs text-gray-300 hover:text-red-500 transition-colors"
                      title="Remove from inventory"
                    >
                      🗑
                    </button>
                  </div>
                </div>
              ))}
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
    </ShopLayout>
  );
}

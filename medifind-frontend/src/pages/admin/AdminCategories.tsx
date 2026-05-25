import { useState, useEffect } from 'react';
import AdminLayout from '../../components/layout/AdminLayout';
import Spinner from '../../components/ui/Spinner';
import {
  adminGetCategories,
  adminCreateCategory,
  adminUpdateCategory,
  adminDeleteCategory,
} from '../../api/admin';
import type { Category } from '../../types';

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState('');
  const [success,    setSuccess]    = useState('');

  // New category form
  const [showForm, setShowForm]   = useState(false);
  const [name,     setName]       = useState('');
  const [icon,     setIcon]       = useState('');
  const [parentId, setParentId]   = useState('');
  const [saving,   setSaving]     = useState(false);

  // Editing
  const [editingId,   setEditingId]   = useState<number | null>(null);
  const [editName,    setEditName]    = useState('');
  const [editActive,  setEditActive]  = useState(true);

  useEffect(() => { load(); }, []);

  const load = () => {
    setLoading(true);
    adminGetCategories()
      .then(r => setCategories(r.data))
      .catch(() => setError('Could not load categories.'))
      .finally(() => setLoading(false));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    setError('');
    try {
      await adminCreateCategory({
        name: name.trim(),
        icon: icon.trim() || undefined,
        parent_id: parentId ? Number(parentId) : undefined,
        is_active: true,
      });
      setName(''); setIcon(''); setParentId('');
      setShowForm(false);
      setSuccess('Category created.');
      setTimeout(() => setSuccess(''), 3000);
      load();
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Could not create category.');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (cat: Category) => {
    setSaving(true);
    setError('');
    try {
      await adminUpdateCategory(cat.id, {
        name:      editName,
        is_active: editActive,
      });
      setEditingId(null);
      setSuccess('Category updated.');
      setTimeout(() => setSuccess(''), 3000);
      load();
    } catch {
      setError('Could not update category.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (cat: Category) => {
    if (!confirm(`Delete "${cat.name}"? This cannot be undone.`)) return;
    setError('');
    try {
      await adminDeleteCategory(cat.id);
      setSuccess('Category deleted.');
      setTimeout(() => setSuccess(''), 3000);
      load();
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Could not delete category.');
    }
  };

  return (
    <AdminLayout>
      <div className="p-8">

        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-xl font-semibold text-gray-800">Categories</h1>
            <p className="text-sm text-gray-400 mt-0.5">Manage the product category tree</p>
          </div>
          <button
            onClick={() => { setShowForm(!showForm); setError(''); }}
            className="text-sm bg-green-600 text-white px-4 py-2 rounded-xl hover:bg-green-700 transition-colors font-medium"
          >
            {showForm ? '✕ Cancel' : '+ New category'}
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
          <form onSubmit={handleCreate} className="bg-white rounded-xl border border-gray-100 p-5 mb-6 space-y-4">
            <h2 className="text-sm font-semibold text-gray-700">New category</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Name</label>
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Pharmacy"
                  required
                  autoFocus
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-green-400"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">
                  Icon name
                  <span className="text-gray-300 font-normal ml-1">(optional)</span>
                </label>
                <input
                  value={icon}
                  onChange={e => setIcon(e.target.value)}
                  placeholder="e.g. pill"
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-green-400"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">
                Parent category
                <span className="text-gray-300 font-normal ml-1">(leave empty for top-level)</span>
              </label>
              <select
                value={parentId}
                onChange={e => setParentId(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-green-400 bg-white"
              >
                <option value="">Top-level category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              disabled={saving}
              className="bg-green-600 text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-green-700 disabled:opacity-60 transition-colors"
            >
              {saving ? 'Creating...' : 'Create category'}
            </button>
          </form>
        )}

        {/* Category list */}
        {loading ? <Spinner /> : (
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            {categories.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <p className="text-3xl mb-2">📂</p>
                <p className="text-sm">No categories yet. Create your first one.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-12 gap-4 px-5 py-3 bg-gray-50 border-b border-gray-100 text-xs font-medium text-gray-400 uppercase tracking-wide">
                  <div className="col-span-4">Name</div>
                  <div className="col-span-2">Icon</div>
                  <div className="col-span-3">Parent</div>
                  <div className="col-span-1 text-center">Active</div>
                  <div className="col-span-2"></div>
                </div>
                {categories.map(cat => (
                  <div
                    key={cat.id}
                    className="grid grid-cols-12 gap-4 px-5 py-4 border-b border-gray-50 last:border-0 items-center hover:bg-gray-50/50 transition-colors"
                  >
                    {editingId === cat.id ? (
                      <>
                        <div className="col-span-4">
                          <input
                            value={editName}
                            onChange={e => setEditName(e.target.value)}
                            autoFocus
                            className="w-full border border-green-400 rounded-lg px-3 py-1.5 text-sm outline-none"
                          />
                        </div>
                        <div className="col-span-2 text-xs text-gray-400">{cat.icon ?? '—'}</div>
                        <div className="col-span-3 text-xs text-gray-400">
                          {categories.find(c => c.id === cat.parent_id)?.name ?? '—'}
                        </div>
                        <div className="col-span-1 flex justify-center">
                          <button
                            onClick={() => setEditActive(!editActive)}
                            className={`w-9 h-5 rounded-full transition-colors relative ${editActive ? 'bg-green-500' : 'bg-gray-300'}`}
                          >
                            <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${editActive ? 'translate-x-4' : 'translate-x-0'}`} />
                          </button>
                        </div>
                        <div className="col-span-2 flex gap-2 justify-end">
                          <button
                            onClick={() => handleUpdate(cat)}
                            disabled={saving}
                            className="text-xs text-green-600 hover:text-green-700 font-medium"
                          >
                            {saving ? '...' : 'Save'}
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="text-xs text-gray-400 hover:text-gray-600"
                          >
                            Cancel
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="col-span-4">
                          <p className="text-sm font-medium text-gray-800">{cat.name}</p>
                          <p className="text-xs text-gray-400 font-mono">{cat.slug}</p>
                        </div>
                        <div className="col-span-2 text-sm text-gray-400">{cat.icon ?? '—'}</div>
                        <div className="col-span-3 text-sm text-gray-400">
                          {categories.find(c => c.id === cat.parent_id)?.name ?? (
                            <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Top-level</span>
                          )}
                        </div>
                        <div className="col-span-1 flex justify-center">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${cat.is_active ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                            {cat.is_active ? 'Active' : 'Off'}
                          </span>
                        </div>
                        <div className="col-span-2 flex gap-3 justify-end">
                          <button
                            onClick={() => {
                              setEditingId(cat.id);
                              setEditName(cat.name);
                              setEditActive(cat.is_active);
                            }}
                            className="text-xs text-gray-400 hover:text-gray-700 transition-colors"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(cat)}
                            className="text-xs text-red-400 hover:text-red-600 transition-colors"
                          >
                            Delete
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
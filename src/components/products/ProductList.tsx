import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase/client';
import { getCoverImageUrl, canDeleteProduct } from '@/lib/products';
import {
  fetchProductsStore,
  deleteProductStore,
  toggleProductActiveStore,
} from '@/lib/productsStore';
import type { Product } from '@/types';
import {
  Package,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  FileText,
  AlertTriangle,
  Loader2,
  ExternalLink,
  Calendar,
  IndianRupee,
  RefreshCw,
  ImageIcon,
  Sparkles,
} from 'lucide-react';

interface ProductListProps {
  onAddProduct: () => void;
  onEditProduct: (product: Product) => void;
  onViewLandingPage?: (slug: string) => void;
}

export const ProductList: React.FC<ProductListProps> = ({
  onAddProduct,
  onEditProduct,
  onViewLandingPage,
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLiveDb, setIsLiveDb] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Deletion modal state
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Status toggle loading state
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const { products: fetched, isLiveDb: live } = await fetchProductsStore();
      setProducts(fetched);
      setIsLiveDb(live);
    } catch (err: any) {
      console.error('Failed to fetch products:', err);
      setError(err.message || 'Could not load products.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Toggle active/inactive
  const handleToggleActive = async (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    setTogglingId(product.id);
    const newStatus = !product.active;

    try {
      await toggleProductActiveStore(product.id, newStatus);
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, active: newStatus } : p))
      );
      showToast(newStatus ? `"${product.title}" activated.` : `"${product.title}" deactivated.`);
    } catch (err: any) {
      alert(`Failed to update status: ${err.message}`);
    } finally {
      setTogglingId(null);
    }
  };

  // Handle Delete
  const confirmDelete = async () => {
    if (!productToDelete) return;
    setDeleteLoading(true);
    setDeleteError(null);

    try {
      // 1. Check orders safety
      const { canDelete, orderCount } = await canDeleteProduct(supabase, productToDelete.id);
      if (!canDelete) {
        throw new Error(
          `Cannot delete product: It is associated with ${orderCount} existing customer order(s). Deactivate the product instead to preserve sales history.`
        );
      }

      // 2. Remove files from storage if present
      if (productToDelete.cover_image_path) {
        try {
          await supabase.storage.from('product-images').remove([productToDelete.cover_image_path]);
        } catch {
          // ignore
        }
      }
      if (productToDelete.pdf_storage_path) {
        try {
          await supabase.storage.from('product-pdfs').remove([productToDelete.pdf_storage_path]);
        } catch {
          // ignore
        }
      }

      // 3. Delete from store (Supabase or Local)
      await deleteProductStore(productToDelete.id);

      setProducts((prev) => prev.filter((p) => p.id !== productToDelete.id));
      showToast('Product deleted successfully.');
      setProductToDelete(null);
    } catch (err: any) {
      setDeleteError(err.message || 'Failed to delete product.');
    } finally {
      setDeleteLoading(false);
    }
  };

  // Filtered and searched products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Search
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        p.title.toLowerCase().includes(query) ||
        p.slug.toLowerCase().includes(query);

      // Status
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && p.active) ||
        (statusFilter === 'inactive' && !p.active);

      return matchesSearch && matchesStatus;
    });
  }, [products, searchQuery, statusFilter]);

  const activeCount = useMemo(() => products.filter((p) => p.active).length, [products]);
  const inactiveCount = useMemo(() => products.filter((p) => !p.active).length, [products]);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    try {
      return new Date(dateStr).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="px-4 py-3 bg-slate-900 text-white rounded-xl shadow-xl flex items-center gap-2 text-sm border border-slate-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Products</h1>
            <span
              className={`px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full ${
                isLiveDb
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
              }`}
            >
              {isLiveDb ? 'Supabase Live DB' : 'Active Store'}
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">Manage your digital products.</p>
        </div>

        <button
          onClick={onAddProduct}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-xs transition-colors shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add Product</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Search by title or slug..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
          />
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 hidden sm:inline-block mr-1">
            Status:
          </span>
          <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition ${
                statusFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'hover:text-slate-900'
              }`}
            >
              All ({products.length})
            </button>
            <button
              onClick={() => setStatusFilter('active')}
              className={`px-3 py-1.5 rounded-lg transition ${
                statusFilter === 'active'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'hover:text-slate-900'
              }`}
            >
              Active ({activeCount})
            </button>
            <button
              onClick={() => setStatusFilter('inactive')}
              className={`px-3 py-1.5 rounded-lg transition ${
                statusFilter === 'inactive'
                  ? 'bg-white text-slate-700 shadow-xs'
                  : 'hover:text-slate-900'
              }`}
            >
              Inactive ({inactiveCount})
            </button>
          </div>

          <button
            onClick={fetchProducts}
            title="Refresh list"
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl border border-slate-200 transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Content Area */}
      {loading && products.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto mb-3" />
          <p className="text-sm text-slate-500 font-medium">Loading digital products...</p>
        </div>
      ) : error ? (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-amber-900 space-y-3">
          <div className="flex items-center gap-2 font-bold text-base">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            {error.includes('schema cache') || error.includes('does not exist')
              ? 'Database Tables Not Initialized Yet'
              : 'Unable to fetch products'}
          </div>
          <p className="text-xs text-amber-800 leading-relaxed max-w-2xl">
            {error.includes('schema cache') || error.includes('does not exist')
              ? 'The PostgreSQL tables (products, orders, customers, etc.) need to be created once in your Supabase SQL Editor. Once executed, products will automatically persist here.'
              : error}
          </p>
          <div className="flex items-center gap-3 pt-1">
            <a
              href="https://supabase.com/dashboard/project/grmtpdbjepyaykysuhui/sql/new"
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition"
            >
              Open Supabase SQL Editor &rarr;
            </a>
            <button
              onClick={fetchProducts}
              className="px-3.5 py-1.5 bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl text-xs font-semibold transition"
            >
              Refresh Connection
            </button>
          </div>
        </div>
      ) : filteredProducts.length === 0 ? (
        /* Empty State */
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4">
            <Package className="w-6 h-6" />
          </div>
          {searchQuery || statusFilter !== 'all' ? (
            <>
              <h3 className="text-base font-bold text-slate-900 mb-1">No matching products found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
                No products match your current search query or status filter.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition"
              >
                Clear Filters
              </button>
            </>
          ) : (
            <>
              <h3 className="text-base font-bold text-slate-900 mb-1">No products yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mb-6">
                Create your first digital product and start selling.
              </p>
              <button
                onClick={onAddProduct}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition"
              >
                <Plus className="w-4 h-4" />
                <span>+ Add Product</span>
              </button>
            </>
          )}
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-4">Product</th>
                  <th className="py-3.5 px-4">Price</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">PDF Asset</th>
                  <th className="py-3.5 px-4">Created / Updated</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredProducts.map((p) => {
                  const coverUrl = getCoverImageUrl(p.cover_image_path);
                  const isToggling = togglingId === p.id;

                  return (
                    <tr
                      key={p.id}
                      className="hover:bg-slate-50/70 transition-colors group cursor-pointer"
                      onClick={() => onEditProduct(p)}
                    >
                      {/* Product info with image */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                            {coverUrl ? (
                              <img
                                src={coverUrl}
                                alt={p.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <ImageIcon className="w-5 h-5 text-slate-400" />
                            )}
                          </div>
                          <div className="min-w-0 max-w-xs">
                            <div className="font-bold text-slate-900 truncate">{p.title}</div>
                            <div className="text-xs text-slate-400 font-mono truncate">
                              /{p.slug}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Price */}
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-900">
                          ₹{Number(p.price).toLocaleString('en-IN')}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium ml-1">
                          {p.currency}
                        </span>
                      </td>

                      {/* Status toggle */}
                      <td className="py-3.5 px-4">
                        <button
                          type="button"
                          onClick={(e) => handleToggleActive(p, e)}
                          disabled={isToggling}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition ${
                            p.active
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                              : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              p.active ? 'bg-emerald-500' : 'bg-slate-400'
                            }`}
                          />
                          <span>{isToggling ? '...' : p.active ? 'Active' : 'Inactive'}</span>
                        </button>
                      </td>

                      {/* PDF status */}
                      <td className="py-3.5 px-4">
                        {p.pdf_storage_path ? (
                          <span className="inline-flex items-center gap-1 text-xs text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md font-mono">
                            <FileText className="w-3.5 h-3.5 text-indigo-600" />
                            Uploaded
                          </span>
                        ) : (
                          <span className="text-xs text-amber-600 font-medium">Missing PDF</span>
                        )}
                      </td>

                      {/* Dates */}
                      <td className="py-3.5 px-4 text-xs text-slate-500">
                        <div>Created: {formatDate(p.created_at)}</div>
                        <div className="text-[11px] text-slate-400">
                          Updated: {formatDate(p.updated_at)}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div
                          className="inline-flex items-center gap-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {p.active && onViewLandingPage && (
                            <button
                              type="button"
                              onClick={() => onViewLandingPage(p.slug)}
                              title="View Public Landing Page"
                              className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => onEditProduct(p)}
                            title="Edit Product"
                            className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setProductToDelete(p)}
                            title="Delete Product"
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Responsive Cards */}
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {filteredProducts.map((p) => {
              const coverUrl = getCoverImageUrl(p.cover_image_path);
              const isToggling = togglingId === p.id;

              return (
                <div
                  key={p.id}
                  onClick={() => onEditProduct(p)}
                  className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3 cursor-pointer hover:border-indigo-300 transition"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-14 h-14 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                      {coverUrl ? (
                        <img src={coverUrl} alt={p.title} className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon className="w-6 h-6 text-slate-400" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-slate-900 text-sm leading-snug truncate">
                        {p.title}
                      </div>
                      <div className="text-xs text-slate-400 font-mono mt-0.5 truncate">
                        /{p.slug}
                      </div>
                      <div className="text-base font-extrabold text-slate-900 mt-1">
                        ₹{Number(p.price).toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                    <button
                      type="button"
                      onClick={(e) => handleToggleActive(p, e)}
                      disabled={isToggling}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-semibold transition ${
                        p.active
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          p.active ? 'bg-emerald-500' : 'bg-slate-400'
                        }`}
                      />
                      <span>{isToggling ? '...' : p.active ? 'Active' : 'Inactive'}</span>
                    </button>

                    <div
                      className="flex items-center gap-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {p.active && onViewLandingPage && (
                        <button
                          type="button"
                          onClick={() => onViewLandingPage(p.slug)}
                          title="View Public Landing Page"
                          className="p-1.5 text-slate-500 hover:text-emerald-600 bg-slate-100 rounded-lg"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => onEditProduct(p)}
                        className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium flex items-center gap-1"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        Edit
                      </button>
                      <button
                        onClick={() => setProductToDelete(p)}
                        className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Delete Confirmation Modal */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-lg font-bold text-slate-900">
                Delete &ldquo;{productToDelete.title}&rdquo;?
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                This action will permanently remove the product and its associated cover image and PDF asset from storage.
              </p>
            </div>

            {deleteError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800">
                {deleteError}
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setProductToDelete(null);
                  setDeleteError(null);
                }}
                disabled={deleteLoading}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={deleteLoading}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-xs transition flex items-center gap-1.5"
              >
                {deleteLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>{deleteLoading ? 'Deleting...' : 'Delete Product'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

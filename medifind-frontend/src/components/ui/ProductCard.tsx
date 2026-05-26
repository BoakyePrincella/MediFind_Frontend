import { Link } from 'react-router-dom';
import type { Product } from '../../types';
import { storageUrl } from '../../utils/media';

export default function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      to={`/products/${product.slug}`}
      className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:border-green-200 hover:shadow-sm transition-all group block"
    >
      {/* Image or placeholder */}
      <div className="h-32 bg-green-50 flex items-center justify-center text-4xl">
        {product.image ? (
          <img
            src={storageUrl(product.image)}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        ) : (
          '💊'
        )}
      </div>

      <div className="p-3">
        <p className="text-sm font-medium text-gray-800 truncate">{product.name}</p>
        <p className="text-xs text-gray-400 mt-0.5">{product.category?.name}</p>
        {product.brand && (
          <p className="text-xs text-gray-300 mt-0.5">{product.brand}</p>
        )}
        <div className="flex justify-between items-center mt-2">
          <span className="text-xs text-gray-400">
            {product.shops_count ?? 0} shop{product.shops_count !== 1 ? 's' : ''}
          </span>
          <span className="text-xs text-green-600 font-medium group-hover:underline">
            View →
          </span>
        </div>
      </div>
    </Link>
  );
}

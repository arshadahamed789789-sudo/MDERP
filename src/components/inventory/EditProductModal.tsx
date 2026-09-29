import React, { useState, useEffect } from 'react';
import { X, Check, Trash2, Edit3, AlertCircle, DollarSign, Boxes, ShieldAlert } from 'lucide-react';
import { Product, ProductVariant } from '../../types/erp';
import { useERP } from '../../services/erpStore';
import { formatBDT } from '../../utils/formatters';

interface EditProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product | null;
  onDeleteSuccess?: () => void;
}

export const EditProductModal: React.FC<EditProductModalProps> = ({
  isOpen,
  onClose,
  product,
  onDeleteSuccess
}) => {
  const { brands, categories, updateProduct, deleteProduct, language } = useERP();

  const [model, setModel] = useState('');
  const [brandId, setBrandId] = useState('');
  const [category, setCategory] = useState('');
  const [reorderLevel, setReorderLevel] = useState(5);
  const [warrantyMonths, setWarrantyMonths] = useState(12);
  const [description, setDescription] = useState('');
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (product) {
      setModel(product.model);
      setBrandId(product.brandId);
      setCategory(product.category);
      setReorderLevel(product.reorderLevel);
      setWarrantyMonths(product.warrantyMonths);
      setDescription(product.description || '');
      setVariants(JSON.parse(JSON.stringify(product.variants)));
      setErrorMsg('');
      setConfirmDelete(false);
    }
  }, [product, isOpen]);

  if (!isOpen || !product) return null;

  const handleVariantPriceChange = (variantId: string, field: keyof ProductVariant, val: number) => {
    setVariants(prev => prev.map(v => {
      if (v.id !== variantId) return v;
      return { ...v, [field]: Number(val) || 0 };
    }));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!model.trim()) {
      setErrorMsg(language === 'bn' ? 'মডেলের নাম অবশ্যই দিতে হবে' : 'Model name is required');
      return;
    }

    const selectedBrand = brands.find(b => b.id === brandId);

    const success = updateProduct(product.id, {
      model: model.trim(),
      brandId,
      brandName: selectedBrand ? selectedBrand.name : product.brandName,
      category,
      reorderLevel: Number(reorderLevel) || 1,
      warrantyMonths: Number(warrantyMonths) || 0,
      description: description.trim(),
      variants
    });

    if (success) {
      onClose();
    }
  };

  const handleDelete = () => {
    const res = deleteProduct(product.id);
    if (!res.success) {
      setErrorMsg(res.error || 'Cannot delete product');
      setConfirmDelete(false);
    } else {
      if (onDeleteSuccess) onDeleteSuccess();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in-50">
      <div 
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Edit3 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-wide">
                {language === 'bn' ? 'প্রোডাক্ট তথ্য ও মূল্য সম্পাদনা' : 'Edit Product & Variant Pricing'}
              </h2>
              <p className="text-[11px] text-slate-400">
                {product.brandName} {product.model}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 text-xs">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Model & Brand */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-1">
              <label className="font-bold text-slate-700 mb-1 block">Brand *</label>
              <select
                value={brandId}
                onChange={e => setBrandId(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium focus:bg-white focus:ring-1 focus:ring-emerald-500"
              >
                {brands.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="font-bold text-slate-700 mb-1 block">Model Name *</label>
              <input
                type="text"
                required
                value={model}
                onChange={e => setModel(e.target.value)}
                placeholder="e.g. Galaxy S24 Ultra"
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold focus:bg-white focus:ring-1 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="font-bold text-slate-700 mb-1 block">Category</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium focus:bg-white"
              >
                {categories.map(c => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 mb-1 block">Reorder Alert Level</label>
              <input
                type="number"
                min="0"
                value={reorderLevel}
                onChange={e => setReorderLevel(Number(e.target.value))}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono focus:bg-white"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 mb-1 block">Warranty (Months)</label>
              <input
                type="number"
                min="0"
                value={warrantyMonths}
                onChange={e => setWarrantyMonths(Number(e.target.value))}
                className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono focus:bg-white"
              />
            </div>
          </div>

          {/* Variants and Multi-tier Pricing */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                <Boxes className="w-3.5 h-3.5 text-emerald-600" />
                <span>Multi-tier Pricing & Variants ({variants.length})</span>
              </h3>
              <span className="text-[10px] text-slate-400">Retail, Wholesale & Dealer rates</span>
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 bg-slate-50/50">
              {variants.map(v => (
                <div key={v.id} className="p-3 bg-white space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-xs">
                      {v.storage ? `${v.ram || ''} ${v.storage} - ${v.color}` : v.color}
                    </span>
                    <span className="text-[11px] font-mono text-slate-500">
                      SKU: {v.sku} • Stock: <strong className="text-emerald-700">{v.currentStock}</strong>
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div>
                      <span className="text-[10px] font-semibold text-slate-400 block mb-0.5">Purchase Cost (৳)</span>
                      <input
                        type="number"
                        min="0"
                        value={v.purchasePrice}
                        onChange={e => handleVariantPriceChange(v.id, 'purchasePrice', Number(e.target.value))}
                        className="w-full p-1.5 bg-slate-50 border rounded-lg font-mono text-xs text-slate-700"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] font-semibold text-blue-600 block mb-0.5">Wholesale Price (৳)</span>
                      <input
                        type="number"
                        min="0"
                        value={v.wholesalePrice}
                        onChange={e => handleVariantPriceChange(v.id, 'wholesalePrice', Number(e.target.value))}
                        className="w-full p-1.5 bg-slate-50 border rounded-lg font-mono text-xs font-bold text-blue-700"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] font-semibold text-violet-600 block mb-0.5">Dealer Price (৳)</span>
                      <input
                        type="number"
                        min="0"
                        value={v.dealerPrice}
                        onChange={e => handleVariantPriceChange(v.id, 'dealerPrice', Number(e.target.value))}
                        className="w-full p-1.5 bg-slate-50 border rounded-lg font-mono text-xs font-bold text-violet-700"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] font-semibold text-emerald-600 block mb-0.5">Retail Price MRP (৳)</span>
                      <input
                        type="number"
                        min="0"
                        value={v.retailPrice}
                        onChange={e => handleVariantPriceChange(v.id, 'retailPrice', Number(e.target.value))}
                        className="w-full p-1.5 bg-slate-50 border rounded-lg font-mono text-xs font-bold text-emerald-800"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="font-bold text-slate-700 mb-1 block">Specifications / Notes</label>
            <textarea
              rows={2}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Processor, battery, camera specs or warranty conditions..."
              className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white"
            />
          </div>

          {/* Delete Danger Zone */}
          <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            {!confirmDelete ? (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1.5 py-1 px-2 hover:bg-rose-50 rounded-lg transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Catalog Model</span>
              </button>
            ) : (
              <div className="flex items-center gap-2 bg-rose-50 p-2 rounded-xl border border-rose-200">
                <span className="text-rose-800 font-semibold text-[11px]">Confirm delete?</span>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg"
                >
                  Yes, Delete
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  className="px-2.5 py-1 bg-slate-200 text-slate-700 font-semibold rounded-lg"
                >
                  Cancel
                </button>
              </div>
            )}

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                {language === 'bn' ? 'বাতিল' : 'Cancel'}
              </button>
              <button
                type="submit"
                className="px-5 py-2 font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md transition flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{language === 'bn' ? 'পরিবর্তন সংরক্ষণ করুন' : 'Save Changes'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

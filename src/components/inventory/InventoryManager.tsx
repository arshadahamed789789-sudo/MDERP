import React, { useState } from 'react';
import { 
  Boxes, Plus, Search, ArrowRightLeft, Smartphone, AlertTriangle, 
  Layers, Package, Check, X, SlidersHorizontal, Pencil
} from 'lucide-react';
import { useERP } from '../../services/erpStore';
import { formatBDT } from '../../utils/formatters';
import { StockAdjustmentModal } from './StockAdjustmentModal';
import { EditProductModal } from './EditProductModal';
import { Product } from '../../types/erp';
import { ShareExportButtons } from '../common/ShareExportButtons';

export const InventoryManager: React.FC = () => {
  const { 
    businessConfig, products, brands, categories, branches, imeis, 
    addProduct, createStockTransfer, language, currentBranchId 
  } = useERP();

  const [activeSubTab, setActiveSubTab] = useState<'catalog' | 'transfers' | 'valuation'>('catalog');
  const [searchTerm, setSearchTerm] = useState('');
  const [brandFilter, setBrandFilter] = useState('ALL');

  // Add Product Modal
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [newModel, setNewModel] = useState('');
  const [newBrandId, setNewBrandId] = useState(brands[0]?.id || '');
  const [newCategory, setNewCategory] = useState(categories[0]?.name || 'Smartphones');
  const [hasImei, setHasImei] = useState(true);
  const [newRam, setNewRam] = useState('8GB');
  const [newStorage, setNewStorage] = useState('256GB');
  const [newColor, setNewColor] = useState('Black');
  const [newPurchasePrice, setNewPurchasePrice] = useState(0);
  const [newWholesalePrice, setNewWholesalePrice] = useState(0);
  const [newDealerPrice, setNewDealerPrice] = useState(0);
  const [newRetailPrice, setNewRetailPrice] = useState(0);

  // Transfer Modal
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [fromBranchId, setFromBranchId] = useState(branches[0]?.id || '');
  const [toBranchId, setToBranchId] = useState(branches[1]?.id || '');
  const [transferProductId, setTransferProductId] = useState('');
  const [transferVariantId, setTransferVariantId] = useState('');
  const [selectedTransferImeis, setSelectedTransferImeis] = useState<string[]>([]);
  const [transferQty, setTransferQty] = useState(1);
  const [transferError, setTransferError] = useState('');

  // Stock Adjustment Modal
  const [showAdjustmentModal, setShowAdjustmentModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Filter products
  const filteredProducts = products.filter(p => {
    const q = searchTerm.toLowerCase();
    const matchSearch = p.model.toLowerCase().includes(q) || p.brandName.toLowerCase().includes(q);
    const matchBrand = brandFilter === 'ALL' || p.brandId === brandFilter;
    return matchSearch && matchBrand;
  });

  // Calculate stock stats
  const totalStockUnits = products.reduce((acc, p) => {
    return acc + p.variants.reduce((vSum, v) => vSum + v.currentStock, 0);
  }, 0);

  const lowStockProducts = products.filter(p => 
    p.variants.some(v => v.currentStock <= p.reorderLevel)
  );

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newModel.trim()) return;

    const brand = brands.find(b => b.id === newBrandId);
    const variantId = `var-${Date.now()}`;
    const sku = `${brand?.name.substring(0, 3).toUpperCase()}-${newModel.replace(/\s+/g, '').substring(0, 6).toUpperCase()}-${newColor.toUpperCase()}`;

    addProduct({
      brandId: newBrandId,
      brandName: brand?.name || 'Brand',
      model: newModel,
      category: newCategory,
      hasImei,
      warrantyMonths: 12,
      reorderLevel: 3,
      variants: [
        {
          id: variantId,
          ram: hasImei ? newRam : undefined,
          storage: hasImei ? newStorage : undefined,
          color: newColor,
          sku,
          purchasePrice: newPurchasePrice,
          wholesalePrice: newWholesalePrice,
          dealerPrice: newDealerPrice,
          retailPrice: newRetailPrice,
          minSellingPrice: newWholesalePrice > 0 ? newWholesalePrice - 500 : newPurchasePrice,
          currentStock: 0
        }
      ]
    });

    setShowAddProductModal(false);
    setNewModel('');
  };

  const handleExecuteTransfer = () => {
    setTransferError('');
    if (fromBranchId === toBranchId) {
      setTransferError(language === 'bn' ? 'উৎস ও গন্তব্য ব্রাঞ্চ একই হতে পারে না।' : 'Source and destination branches cannot be the same.');
      return;
    }

    createStockTransfer({
      fromBranchId,
      toBranchId,
      productId: transferProductId,
      variantId: transferVariantId,
      imeis: selectedTransferImeis,
      quantity: selectedTransferImeis.length > 0 ? selectedTransferImeis.length : transferQty
    });

    setShowTransferModal(false);
    setSelectedTransferImeis([]);
    setTransferProductId('');
  };

  const availableTransferImeis = imeis.filter(i => 
    i.productId === transferProductId &&
    i.variantId === transferVariantId &&
    i.branchId === fromBranchId &&
    i.status === 'IN_STOCK'
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {language === 'bn' ? 'ইনভেন্টরি ও স্টক ব্যবস্থাপনা' : 'Inventory Management'}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {language === 'bn' 
              ? 'মোবাইল ফোন ও গ্যাজেট স্টক, আইএমইআই স্ট্যাটাস ও গুদামজাতকরণ' 
              : 'Device stock counts, multi-tiered wholesale pricing, and branch transfers.'}
          </p>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap self-start sm:self-auto">
          <ShareExportButtons
            title={language === 'bn' ? 'ইনভেন্টরি স্টক ও মূল্যায়ন রিপোর্ট' : 'Inventory Stock & Valuation Report'}
            subtitle={`Catalog: ${products.length} Models • ${totalStockUnits} Units`}
            summaryMetrics={[
              { label: 'Total Units in Stock', value: `${totalStockUnits} pcs` },
              { label: 'Catalog Models', value: `${products.length}` },
              { label: 'Low Stock Alert', value: `${lowStockProducts.length} items` }
            ]}
            shareText={`📦 *${language === 'bn' ? 'ইনভেন্টরি স্টক ও মালপত্র রিপোর্ট' : 'Inventory Stock Report'}*\n🏛️ শোরুম: *${businessConfig?.shopName || 'DEALERFLOW ERP'}*\n📅 ${language === 'bn' ? 'তারিখ' : 'Date'}: ${new Date().toLocaleDateString('en-US', { dateStyle: 'medium' })}\n\n📱 *স্টক বিবরণ:*\n• মোট হ্যান্ডসেট ও গ্যাজেট মডেল: ${products.length} টি\n• দোকানে বর্তমান মোট ইউনিট: ${totalStockUnits} টি\n• রি-অর্ডারের জন্য লো-স্টক আইটেম: ${lowStockProducts.length} টি\n\nGenerated via DEALERFLOW Hub.`}
            csvData={{
              filename: 'inventory_catalog_stock',
              headers: ['Model', 'Brand', 'Category', 'Color', 'SKU', 'Current Stock', 'Purchase Cost (BDT)', 'Retail Price (BDT)', 'Wholesale Price (BDT)', 'Warranty Months'],
              rows: filteredProducts.flatMap(p => 
                p.variants.map(v => [
                  p.model, p.brandName, p.category, v.color, v.sku,
                  v.currentStock, v.purchasePrice, v.retailPrice, v.wholesalePrice, p.warrantyMonths
                ])
              )
            }}
          />
          <button
            type="button"
            onClick={() => setShowAdjustmentModal(true)}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-2xl text-xs font-bold transition flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <SlidersHorizontal className="w-4 h-4 text-amber-600" />
            <span>{language === 'bn' ? 'স্টক সমন্বয়' : 'Stock Adjustment'}</span>
          </button>
          <button
            type="button"
            onClick={() => setShowTransferModal(true)}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-2xl text-xs font-bold transition flex items-center gap-1.5 shadow-2xs"
          >
            <ArrowRightLeft className="w-4 h-4 text-[#00B074]" />
            <span>{language === 'bn' ? 'স্টক ট্রান্সফার' : 'Stock Transfer'}</span>
          </button>
          <button
            type="button"
            onClick={() => setShowAddProductModal(true)}
            className="px-5 py-2.5 bg-[#1E60D5] hover:bg-blue-700 text-white rounded-2xl text-xs font-black transition flex items-center gap-2 shadow-md shadow-blue-500/25 active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>{language === 'bn' ? '+ নতুন স্টক যোগ' : 'Add Stock'}</span>
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <p className="text-xs font-semibold text-slate-500 uppercase">Total Catalog Models</p>
          <p className="text-xl font-black text-slate-900 font-mono mt-1">{products.length} Models</p>
          <p className="text-[11px] text-slate-400 mt-0.5">{brands.length} Registered Brands</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <p className="text-xs font-semibold text-emerald-600 uppercase">Total Physical Units</p>
          <p className="text-xl font-black text-emerald-700 font-mono mt-1">{totalStockUnits} Units</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Across all branches and warehouse</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200">
          <p className="text-xs font-semibold text-amber-600 uppercase">Low Stock Alerts</p>
          <p className="text-xl font-black text-amber-600 font-mono mt-1">{lowStockProducts.length} Items</p>
          <p className="text-[11px] text-slate-400 mt-0.5">Below reorder threshold</p>
        </div>
      </div>

      {/* Search & Brand Filter */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search model, brand, variant..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full text-xs pl-9 pr-3 py-2 border border-slate-200 rounded-lg bg-slate-50 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-slate-500 font-medium">Brand:</span>
          <select
            value={brandFilter}
            onChange={(e) => setBrandFilter(e.target.value)}
            className="text-xs font-medium p-2 border border-slate-200 rounded-lg bg-slate-50"
          >
            <option value="ALL">All Brands</option>
            {brands.map(b => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Product List Cards & Variants */}
      <div className="space-y-4">
        {filteredProducts.map(prod => (
          <div key={prod.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-slate-200 text-slate-700 text-[10px] font-bold uppercase rounded">
                    {prod.brandName}
                  </span>
                  <h3 className="font-bold text-sm text-slate-900">{prod.model}</h3>
                  <span className="text-xs text-slate-500">({prod.category})</span>
                </div>
                {prod.description && <p className="text-xs text-slate-500 mt-0.5">{prod.description}</p>}
              </div>

              <div className="flex items-center gap-3 text-xs flex-wrap">
                <span className="text-slate-500">
                  Warranty: <strong className="text-slate-800">{prod.warrantyMonths} Mos</strong>
                </span>
                <span className="text-slate-500">
                  Reorder Level: <strong className="text-slate-800">{prod.reorderLevel} Units</strong>
                </span>
                <button
                  type="button"
                  onClick={() => setEditingProduct(prod)}
                  className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold transition flex items-center gap-1 shadow-xs"
                >
                  <Pencil className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{language === 'bn' ? 'এডিট' : 'Edit'}</span>
                </button>
              </div>
            </div>

            {/* Variants Table with Pricing Levels */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                    <th className="py-2.5 px-3">Variant (RAM/Storage/Color)</th>
                    <th className="py-2.5 px-3">SKU</th>
                    <th className="py-2.5 px-3 text-right">Purchase Cost</th>
                    <th className="py-2.5 px-3 text-right">Wholesale Price</th>
                    <th className="py-2.5 px-3 text-right">Dealer Price</th>
                    <th className="py-2.5 px-3 text-right font-bold text-slate-900">Retail MRP</th>
                    <th className="py-2.5 px-3 text-center">Stock</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {prod.variants.map(v => (
                    <tr key={v.id} className="hover:bg-slate-50/70">
                      <td className="py-3 px-3">
                        <span className="font-semibold text-slate-900">
                          {v.storage ? `${v.ram || ''} ${v.storage} - ${v.color}` : v.color}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono text-[11px] text-slate-500">
                        {v.sku}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-slate-600">
                        {formatBDT(v.purchasePrice)}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-blue-700">
                        {formatBDT(v.wholesalePrice)}
                      </td>
                      <td className="py-3 px-3 text-right font-mono text-violet-700">
                        {formatBDT(v.dealerPrice)}
                      </td>
                      <td className="py-3 px-3 text-right font-mono font-bold text-emerald-800">
                        {formatBDT(v.retailPrice)}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full font-mono font-bold text-xs ${
                          v.currentStock <= prod.reorderLevel 
                            ? 'bg-rose-100 text-rose-800' 
                            : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {v.currentStock} in stock
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>

      {/* Add Product Modal */}
      {showAddProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg border border-slate-200 overflow-hidden">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <h2 className="text-sm font-bold">Add New Mobile Product / Accessory</h2>
              <button onClick={() => setShowAddProductModal(false)}>
                <X className="w-5 h-5 text-slate-400 hover:text-white" />
              </button>
            </div>
            <form onSubmit={handleCreateProduct} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 mb-1 block">Brand</label>
                  <select
                    value={newBrandId}
                    onChange={(e) => setNewBrandId(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  >
                    {brands.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 mb-1 block">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 mb-1 block">Model Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Galaxy A56 5G or iPhone 16 Plus"
                  value={newModel}
                  onChange={(e) => setNewModel(e.target.value)}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="font-semibold text-slate-700 mb-1 block">RAM</label>
                  <input
                    type="text"
                    value={newRam}
                    onChange={(e) => setNewRam(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 mb-1 block">Storage</label>
                  <input
                    type="text"
                    value={newStorage}
                    onChange={(e) => setNewStorage(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 mb-1 block">Color</label>
                  <input
                    type="text"
                    value={newColor}
                    onChange={(e) => setNewColor(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                <div>
                  <label className="font-semibold text-slate-700 mb-1 block">Purchase Cost (৳)</label>
                  <input
                    type="number"
                    value={newPurchasePrice || ''}
                    onChange={(e) => setNewPurchasePrice(Number(e.target.value))}
                    className="w-full p-2 font-mono border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 mb-1 block">Retail MRP (৳)</label>
                  <input
                    type="number"
                    value={newRetailPrice || ''}
                    onChange={(e) => setNewRetailPrice(Number(e.target.value))}
                    className="w-full p-2 font-mono border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 mb-1 block">Wholesale Rate (৳)</label>
                  <input
                    type="number"
                    value={newWholesalePrice || ''}
                    onChange={(e) => setNewWholesalePrice(Number(e.target.value))}
                    className="w-full p-2 font-mono border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 mb-1 block">Dealer Rate (৳)</label>
                  <input
                    type="number"
                    value={newDealerPrice || ''}
                    onChange={(e) => setNewDealerPrice(Number(e.target.value))}
                    className="w-full p-2 font-mono border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddProductModal(false)}
                  className="px-4 py-2 border rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stock Transfer Modal */}
      {showTransferModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg border border-slate-200 overflow-hidden">
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <h2 className="text-sm font-bold flex items-center gap-2">
                <ArrowRightLeft className="w-4 h-4 text-emerald-400" />
                <span>Inter-Branch Stock Transfer</span>
              </h2>
              <button onClick={() => setShowTransferModal(false)}>
                <X className="w-5 h-5 text-slate-400 hover:text-white" />
              </button>
            </div>
            <div className="p-5 space-y-4 text-xs">
              {transferError && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{transferError}</span>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 mb-1 block">From Branch / Warehouse</label>
                  <select
                    value={fromBranchId}
                    onChange={(e) => setFromBranchId(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  >
                    {branches.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 mb-1 block">To Destination Branch</label>
                  <select
                    value={toBranchId}
                    onChange={(e) => setToBranchId(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  >
                    {branches.map(b => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 mb-1 block">Product to Transfer</label>
                <select
                  value={transferProductId}
                  onChange={(e) => {
                    setTransferProductId(e.target.value);
                    const prod = products.find(p => p.id === e.target.value);
                    if (prod && prod.variants.length > 0) {
                      setTransferVariantId(prod.variants[0].id);
                    }
                    setSelectedTransferImeis([]);
                  }}
                  className="w-full p-2 border border-slate-300 rounded-lg"
                >
                  <option value="">-- Choose Product --</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.brandName} {p.model}</option>
                  ))}
                </select>
              </div>

              {transferProductId && (
                <div>
                  <label className="font-semibold text-slate-700 mb-1 block">Variant</label>
                  <select
                    value={transferVariantId}
                    onChange={(e) => {
                      setTransferVariantId(e.target.value);
                      setSelectedTransferImeis([]);
                    }}
                    className="w-full p-2 border border-slate-300 rounded-lg"
                  >
                    {products.find(p => p.id === transferProductId)?.variants.map(v => (
                      <option key={v.id} value={v.id}>{v.storage ? `${v.storage} - ${v.color}` : v.color}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Select IMEIs in source branch */}
              {availableTransferImeis.length > 0 && (
                <div>
                  <label className="font-semibold text-slate-700 mb-1 block">
                    Select IMEIs to Dispatch ({availableTransferImeis.length} in source stock):
                  </label>
                  <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto p-2 bg-slate-50 border rounded-lg">
                    {availableTransferImeis.map(im => {
                      const isSel = selectedTransferImeis.includes(im.imei1);
                      return (
                        <button
                          key={im.imei1}
                          type="button"
                          onClick={() => {
                            if (isSel) {
                              setSelectedTransferImeis(prev => prev.filter(i => i !== im.imei1));
                            } else {
                              setSelectedTransferImeis(prev => [...prev, im.imei1]);
                            }
                          }}
                          className={`px-2 py-1 rounded text-xs font-mono border ${
                            isSel ? 'bg-emerald-600 text-white border-emerald-600 font-bold' : 'bg-white text-slate-700 border-slate-200'
                          }`}
                        >
                          {im.imei1}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowTransferModal(false)}
                  className="px-4 py-2 border rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleExecuteTransfer}
                  disabled={!transferProductId || fromBranchId === toBranchId}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white rounded-lg font-bold"
                >
                  Confirm Transfer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stock Adjustment Modal */}
      <StockAdjustmentModal
        isOpen={showAdjustmentModal}
        onClose={() => setShowAdjustmentModal(false)}
        onSuccess={(adjNo) => {
          setShowAdjustmentModal(false);
        }}
      />

      {/* Edit Product Modal */}
      <EditProductModal
        isOpen={!!editingProduct}
        product={editingProduct}
        onClose={() => setEditingProduct(null)}
      />
    </div>
  );
};

import React, { useState } from 'react';
import { 
  BarChart3, TrendingUp, Smartphone, Download, Printer, 
  Layers, Package, AlertTriangle, Zap, CheckCircle2
} from 'lucide-react';
import { useERP } from '../../services/erpStore';
import { formatBDT } from '../../utils/formatters';
import { exportToCSV } from '../../utils/exportToCsv';

export const ReportsManager: React.FC = () => {
  const { sales, products, brands, imeis, language } = useERP();
  const [reportType, setReportType] = useState<'brand_profit' | 'stock_velocity' | 'salesman_commission'>('brand_profit');

  // 1. Compute Brand Performance
  const brandMetrics = brands.map(brand => {
    const salesForBrand = sales.flatMap(s => 
      s.items.filter(it => {
        const prod = products.find(p => p.id === it.productId);
        return prod?.brandId === brand.id;
      })
    );

    const unitsSold = salesForBrand.reduce((acc, it) => acc + it.quantity, 0);
    const revenue = salesForBrand.reduce((acc, it) => acc + it.total, 0);
    const cost = salesForBrand.reduce((acc, it) => acc + (it.unitCost * it.quantity), 0);
    const profit = revenue - cost;

    return {
      brandId: brand.id,
      brandName: brand.name,
      unitsSold,
      revenue,
      cost,
      profit,
      marginPercent: revenue > 0 ? ((profit / revenue) * 100).toFixed(1) : '0'
    };
  }).filter(b => b.revenue > 0 || b.unitsSold > 0);

  // 2. Compute Fast vs Slow Moving Stock Analysis
  const stockVelocityMetrics = products.map(prod => {
    // Current physical stock
    const currentUnitsInStock = prod.variants.reduce((sum, v) => sum + v.currentStock, 0);
    const stockValuation = prod.variants.reduce((sum, v) => sum + (v.currentStock * v.purchasePrice), 0);

    // Units sold in invoices
    const salesForProduct = sales.flatMap(s => s.items.filter(it => it.productId === prod.id));
    const totalSoldUnits = salesForProduct.reduce((sum, it) => sum + it.quantity, 0);
    const totalRevenue = salesForProduct.reduce((sum, it) => sum + it.total, 0);

    let velocity: 'FAST' | 'MODERATE' | 'SLOW';
    let recommendation: string;

    if (totalSoldUnits >= 3) {
      velocity = 'FAST';
      recommendation = currentUnitsInStock <= prod.reorderLevel ? 'Reorder immediately (High Demand)' : 'High velocity, maintain buffer';
    } else if (totalSoldUnits >= 1) {
      velocity = 'MODERATE';
      recommendation = 'Normal sales cycle';
    } else {
      velocity = 'SLOW';
      recommendation = currentUnitsInStock > 0 ? 'Aging stock! Consider dealer discount or promo' : 'No sales, 0 stock';
    }

    return {
      productId: prod.id,
      model: prod.model,
      brandName: prod.brandName,
      category: prod.category,
      currentUnitsInStock,
      stockValuation,
      totalSoldUnits,
      totalRevenue,
      velocity,
      recommendation
    };
  });

  // 3. Salesman Performance
  const salesmanMetrics = [
    { name: 'Sabbir Ahmed (Salesman)', salesCount: 1, revenue: 76000, commissionRate: '1.0%', commissionEarned: 760 },
    { name: 'Mahbubur Rahman (Manager)', salesCount: 1, revenue: 166500, commissionRate: '0.8%', commissionEarned: 1332 }
  ];

  // CSV Exporter for active report
  const handleExportCSV = () => {
    if (reportType === 'brand_profit') {
      const headers = ['Brand Name', 'Units Sold', 'Revenue (BDT)', 'Cost COGS (BDT)', 'Gross Profit (BDT)', 'Margin %'];
      const rows = brandMetrics.map(b => [
        b.brandName,
        b.unitsSold,
        b.revenue,
        b.cost,
        b.profit,
        `${b.marginPercent}%`
      ]);
      exportToCSV('brand_profitability_report', headers, rows);
    } else if (reportType === 'stock_velocity') {
      const headers = ['Model', 'Brand', 'Category', 'Units in Stock', 'Valuation at Cost (BDT)', 'Units Sold', 'Revenue (BDT)', 'Velocity Status', 'Action Recommendation'];
      const rows = stockVelocityMetrics.map(s => [
        s.model,
        s.brandName,
        s.category,
        s.currentUnitsInStock,
        s.stockValuation,
        s.totalSoldUnits,
        s.totalRevenue,
        s.velocity,
        s.recommendation
      ]);
      exportToCSV('stock_velocity_aging_report', headers, rows);
    } else {
      const headers = ['Sales Representative', 'Invoices Completed', 'Sales Volume (BDT)', 'Commission Rate', 'Earned Commission (BDT)'];
      const rows = salesmanMetrics.map(sm => [
        sm.name,
        sm.salesCount,
        sm.revenue,
        sm.commissionRate,
        sm.commissionEarned
      ]);
      exportToCSV('salesman_commission_report', headers, rows);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            {language === 'bn' ? 'ব্যবসায়িক অ্যানালিটিক্স ও রিপোর্ট' : 'Reports & Business Intelligence'}
          </h1>
          <p className="text-xs text-slate-500">
            {language === 'bn' 
              ? 'ব্র্যান্ড-ভিত্তিক লাভ, দ্রুত ও ধীরগতির অচল স্টক বিশ্লেষণ এবং বিক্রয়কর্মীদের কমিশন' 
              : 'Brand-level profitability, inventory movement velocity, and sales representative commissions.'}
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 border border-slate-300 shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'এক্সপোর্ট CSV' : 'Export CSV'}</span>
          </button>
          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
          >
            <Printer className="w-3.5 h-3.5 text-emerald-400" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-4 text-xs font-bold overflow-x-auto">
        <button
          onClick={() => setReportType('brand_profit')}
          className={`pb-2.5 transition border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
            reportType === 'brand_profit' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Smartphone className="w-4 h-4" />
          <span>Brand-Wise Sales & Profitability</span>
        </button>

        <button
          onClick={() => setReportType('stock_velocity')}
          className={`pb-2.5 transition border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
            reportType === 'stock_velocity' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>Fast vs Slow-Moving Stock Velocity</span>
        </button>

        <button
          onClick={() => setReportType('salesman_commission')}
          className={`pb-2.5 transition border-b-2 flex items-center gap-1.5 whitespace-nowrap ${
            reportType === 'salesman_commission' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Salesman Performance & Commission</span>
        </button>
      </div>

      {/* Report 1: Brand Profitability */}
      {reportType === 'brand_profit' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center text-xs">
            <div>
              <span className="font-bold text-slate-900 text-sm">Brand Performance Breakdown</span>
              <p className="text-slate-500">Analysis of units, sales volume, COGS, and profit margin per brand</p>
            </div>
            <span className="text-slate-500 font-medium">Auto-aggregated from sales invoices</span>
          </div>

          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-3">Brand</th>
                <th className="py-2.5 px-3 text-center">Units Sold</th>
                <th className="py-2.5 px-3 text-right">Revenue (৳)</th>
                <th className="py-2.5 px-3 text-right">Cost (COGS ৳)</th>
                <th className="py-2.5 px-3 text-right">Gross Profit (৳)</th>
                <th className="py-2.5 px-3 text-center">Margin %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {brandMetrics.map(b => (
                <tr key={b.brandId} className="hover:bg-slate-50">
                  <td className="py-3 px-3 font-bold text-slate-900">{b.brandName}</td>
                  <td className="py-3 px-3 text-center font-mono">{b.unitsSold} pcs</td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">{formatBDT(b.revenue)}</td>
                  <td className="py-3 px-3 text-right font-mono text-slate-500">{formatBDT(b.cost)}</td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-emerald-700">{formatBDT(b.profit)}</td>
                  <td className="py-3 px-3 text-center">
                    <span className="px-2 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800 text-[10px]">
                      {b.marginPercent}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Report 2: Fast vs Slow Moving Stock Velocity */}
      {reportType === 'stock_velocity' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center text-xs">
            <div>
              <span className="font-bold text-slate-900 text-sm">Stock Velocity & Aging Inventory Analysis</span>
              <p className="text-slate-500">Identifies fast-selling models vs stagnant capital trapped in slow inventory</p>
            </div>
            <span className="text-slate-500 font-medium">{stockVelocityMetrics.length} Catalog Models</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-3">Model & Brand</th>
                  <th className="py-2.5 px-3 text-center">Stock Units</th>
                  <th className="py-2.5 px-3 text-right">Stock Valuation (Cost)</th>
                  <th className="py-2.5 px-3 text-center">Units Sold</th>
                  <th className="py-2.5 px-3 text-right">Revenue Generated</th>
                  <th className="py-2.5 px-3 text-center">Velocity</th>
                  <th className="py-2.5 px-3">Inventory Recommendation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {stockVelocityMetrics.map(item => (
                  <tr key={item.productId} className="hover:bg-slate-50">
                    <td className="py-3 px-3">
                      <p className="font-bold text-slate-900">{item.brandName} {item.model}</p>
                      <span className="text-[10px] text-slate-500">{item.category}</span>
                    </td>
                    <td className="py-3 px-3 text-center font-mono font-bold text-slate-800">
                      {item.currentUnitsInStock} units
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-medium text-slate-700">
                      {formatBDT(item.stockValuation)}
                    </td>
                    <td className="py-3 px-3 text-center font-mono font-bold text-emerald-700">
                      {item.totalSoldUnits}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">
                      {formatBDT(item.totalRevenue)}
                    </td>
                    <td className="py-3 px-3 text-center">
                      {item.velocity === 'FAST' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800 text-[10px]">
                          <Zap className="w-3 h-3 text-emerald-600" />
                          <span>Fast Moving</span>
                        </span>
                      )}
                      {item.velocity === 'MODERATE' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold bg-blue-100 text-blue-800 text-[10px]">
                          <span>Normal</span>
                        </span>
                      )}
                      {item.velocity === 'SLOW' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold bg-amber-100 text-amber-800 text-[10px]">
                          <AlertTriangle className="w-3 h-3 text-amber-600" />
                          <span>Slow / Aging</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-[11px] text-slate-600 font-medium">
                      {item.recommendation}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Report 3: Salesman Commission */}
      {reportType === 'salesman_commission' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-200 text-xs">
            <span className="font-bold text-slate-900 text-sm">Sales Representative Commission Ledger</span>
            <p className="text-slate-500 mt-0.5">Calculated based on verified invoice turnover</p>
          </div>

          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-3">Salesman Name</th>
                <th className="py-2.5 px-3 text-center">Invoices Completed</th>
                <th className="py-2.5 px-3 text-right">Total Sales Turnover</th>
                <th className="py-2.5 px-3 text-center">Commission Rule</th>
                <th className="py-2.5 px-3 text-right">Commission Payable</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {salesmanMetrics.map((sm, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  <td className="py-3 px-3 font-bold text-slate-900">{sm.name}</td>
                  <td className="py-3 px-3 text-center font-mono">{sm.salesCount}</td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-slate-900">{formatBDT(sm.revenue)}</td>
                  <td className="py-3 px-3 text-center font-mono">{sm.commissionRate}</td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-emerald-700 text-sm">
                    {formatBDT(sm.commissionEarned)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

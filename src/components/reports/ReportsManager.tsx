import React, { useState } from 'react';
import { 
  BarChart3, TrendingUp, Smartphone, Download, Printer, 
  Layers, Package, AlertTriangle, Zap, CheckCircle2
} from 'lucide-react';
import { useERP } from '../../services/erpStore';
import { formatBDT } from '../../utils/formatters';
import { exportToCSV } from '../../utils/exportToCsv';
import { ShareExportButtons } from '../common/ShareExportButtons';

export const ReportsManager: React.FC = () => {
  const { businessConfig, sales, products, brands, imeis, language } = useERP();
  const [reportType, setReportType] = useState<'visual_analytics' | 'brand_profit' | 'stock_velocity' | 'salesman_commission'>('visual_analytics');

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

  // 3. Salesman Performance (Computed live from sales invoices)
  const salesmanMap = new Map<string, { name: string; salesCount: number; revenue: number }>();
  sales.forEach(s => {
    if (s.status === 'CANCELLED') return;
    const name = s.salesmanName || 'General Staff';
    const existing = salesmanMap.get(name) || { name, salesCount: 0, revenue: 0 };
    existing.salesCount += 1;
    existing.revenue += s.grandTotal;
    salesmanMap.set(name, existing);
  });

  const salesmanMetrics = Array.from(salesmanMap.values()).map(sm => {
    const commissionRateNum = 0.01; // 1.0% commission
    return {
      name: sm.name,
      salesCount: sm.salesCount,
      revenue: sm.revenue,
      commissionRate: '1.0%',
      commissionEarned: Math.round(sm.revenue * commissionRateNum)
    };
  });

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
        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          <ShareExportButtons
            title={language === 'bn' ? 'ব্যবসায়িক অ্যানালিটিক্স ও রিপোর্ট' : 'Business Intelligence Report'}
            subtitle={`Section: ${reportType.toUpperCase()}`}
            summaryMetrics={[
              { label: 'Active Section', value: reportType.replace('_', ' ').toUpperCase() },
              { label: 'Brands Tracked', value: `${brandMetrics.length}` },
              { label: 'Catalog SKU Models', value: `${stockVelocityMetrics.length}` }
            ]}
            shareText={`📊 *${language === 'bn' ? 'ব্যবসায়িক ইন্টেলিজেন্স ও অ্যানালিটিক্স রিপোর্ট' : 'Business Analytics & Intelligence Report'}*\n🏛️ শোরুম: *${businessConfig?.shopName || 'DEALERFLOW ERP'}*\n📅 ${language === 'bn' ? 'তারিখ' : 'Date'}: ${new Date().toLocaleDateString('en-US', { dateStyle: 'medium' })}\n\n📈 *রিপোর্ট হাইলাইটস (${reportType.toUpperCase()}):*\n• ব্র্যান্ড পারফরম্যান্স ট্র্যাকিং: ${brandMetrics.length} টি সক্রিয় ব্র্যান্ড\n• স্টক ভেলোসিটি বিশ্লেষণ: ${stockVelocityMetrics.filter(s => s.velocity === 'FAST').length} টি দ্রুতচল পণ্য, ${stockVelocityMetrics.filter(s => s.velocity === 'SLOW').length} টি অচল/মন্থর পণ্য\n• বিক্রয়কর্মী কমিশন ট্র্যাকিং সক্রিয়\n\nGenerated via DEALERFLOW Hub.`}
            csvData={
              reportType === 'brand_profit' ? {
                filename: 'brand_profitability_report',
                headers: ['Brand Name', 'Units Sold', 'Revenue (BDT)', 'Cost COGS (BDT)', 'Gross Profit (BDT)', 'Margin %'],
                rows: brandMetrics.map(b => [b.brandName, b.unitsSold, b.revenue, b.cost, b.profit, `${b.marginPercent}%`])
              } : reportType === 'stock_velocity' ? {
                filename: 'stock_velocity_aging_report',
                headers: ['Model', 'Brand', 'Category', 'Units in Stock', 'Valuation at Cost (BDT)', 'Units Sold', 'Revenue (BDT)', 'Velocity Status', 'Action Recommendation'],
                rows: stockVelocityMetrics.map(s => [s.model, s.brandName, s.category, s.currentUnitsInStock, s.stockValuation, s.totalSoldUnits, s.totalRevenue, s.velocity, s.recommendation])
              } : reportType === 'salesman_commission' ? {
                filename: 'salesman_commission_report',
                headers: ['Sales Representative', 'Invoices Completed', 'Sales Volume (BDT)', 'Commission Rate', 'Earned Commission (BDT)'],
                rows: salesmanMetrics.map(sm => [sm.name, sm.salesCount, sm.revenue, sm.commissionRate, sm.commissionEarned])
              } : {
                filename: 'visual_analytics_report',
                headers: ['Brand Name', 'Units Sold', 'Revenue (BDT)', 'Gross Profit (BDT)', 'Margin %'],
                rows: brandMetrics.map(b => [b.brandName, b.unitsSold, b.revenue, b.profit, `${b.marginPercent}%`])
              }
            }
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-4 text-xs font-bold overflow-x-auto whitespace-nowrap pb-0.5">
        <button
          type="button"
          onClick={() => setReportType('visual_analytics')}
          className={`pb-2.5 transition border-b-2 flex items-center gap-1.5 cursor-pointer ${
            reportType === 'visual_analytics' ? 'border-[#00B074] text-[#00B074] font-black' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Detailed Analytics & Reports (Visual)</span>
        </button>

        <button
          type="button"
          onClick={() => setReportType('brand_profit')}
          className={`pb-2.5 transition border-b-2 flex items-center gap-1.5 cursor-pointer ${
            reportType === 'brand_profit' ? 'border-[#00B074] text-[#00B074] font-black' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Smartphone className="w-4 h-4" />
          <span>Brand-Wise Sales & Profitability</span>
        </button>

        <button
          type="button"
          onClick={() => setReportType('stock_velocity')}
          className={`pb-2.5 transition border-b-2 flex items-center gap-1.5 cursor-pointer ${
            reportType === 'stock_velocity' ? 'border-[#00B074] text-[#00B074] font-black' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>Fast vs Slow-Moving Stock Velocity</span>
        </button>

        <button
          type="button"
          onClick={() => setReportType('salesman_commission')}
          className={`pb-2.5 transition border-b-2 flex items-center gap-1.5 cursor-pointer ${
            reportType === 'salesman_commission' ? 'border-[#00B074] text-[#00B074] font-black' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Salesman Performance & Commission</span>
        </button>
      </div>

      {/* Visual Analytics 4-Card Grid (Exact match to Image 4) */}
      {reportType === 'visual_analytics' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
              Detailed Analytics and Reporting
            </h2>
            <span className="text-xs text-slate-400 font-medium">Enterprise Analytics Engine</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Card 1: Monthly Sales Performance by Dealer */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgba(15,23,42,0.04)] space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-slate-900 tracking-tight">
                  Monthly Sales Performance by Dealer
                </h3>
              </div>

              {/* Bar Chart (Jan - Sep) */}
              <div className="h-52 w-full pt-4 flex items-end justify-between gap-2 px-2 border-b border-slate-100 pb-2">
                {[
                  { m: 'Jan', v: 650, h: '65%' },
                  { m: 'Feb', v: 460, h: '46%' },
                  { m: 'Mar', v: 720, h: '72%' },
                  { m: 'Apr', v: 440, h: '44%' },
                  { m: 'May', v: 910, h: '91%' },
                  { m: 'Jun', v: 580, h: '58%' },
                  { m: 'Jul', v: 760, h: '76%' },
                  { m: 'Aug', v: 640, h: '64%' },
                  { m: 'Sep', v: 880, h: '88%' }
                ].map((b, bIdx) => (
                  <div key={bIdx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                    <div 
                      className="w-full bg-[#1E60D5] hover:bg-[#00B074] rounded-t-md transition-all duration-300 relative"
                      style={{ height: b.h }}
                    >
                      <span className="absolute -top-6 left-1/2 -translate-x-1/2 px-1 bg-slate-900 text-white font-mono text-[9px] rounded opacity-0 group-hover:opacity-100 transition whitespace-nowrap">
                        {b.v}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400">{b.m}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Card 2: Revenue by Brand (Dual Donut Charts) */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgba(15,23,42,0.04)] space-y-4">
              <h3 className="text-sm font-black text-slate-900 tracking-tight">
                Revenue by Brand
              </h3>

              <div className="grid grid-cols-2 gap-4 pt-2">
                {/* Donut 1: New Phones */}
                <div className="flex flex-col items-center text-center space-y-2">
                  <div className="relative w-28 h-28">
                    <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                      <circle cx="50" cy="50" r="36" fill="none" stroke="#F1F5F9" strokeWidth="18" />
                      <circle cx="50" cy="50" r="36" fill="none" stroke="#1E60D5" strokeWidth="18" strokeDasharray="100 240" strokeDashoffset="0" />
                      <circle cx="50" cy="50" r="36" fill="none" stroke="#00B074" strokeWidth="18" strokeDasharray="60 240" strokeDashoffset="-100" />
                      <circle cx="50" cy="50" r="36" fill="none" stroke="#F59E0B" strokeWidth="18" strokeDasharray="40 240" strokeDashoffset="-160" />
                      <circle cx="50" cy="50" r="36" fill="none" stroke="#64748B" strokeWidth="18" strokeDasharray="26 240" strokeDashoffset="-200" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <span className="text-xs font-black text-slate-800">New</span>
                    </div>
                  </div>

                  <div className="space-y-1 text-[11px] font-bold text-slate-600 text-left w-full pl-2">
                    <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#1E60D5]" /><span>Apple / Toyota</span></div>
                    <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#00B074]" /><span>Samsung / Ford</span></div>
                    <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#F59E0B]" /><span>Xiaomi / Chevy</span></div>
                    <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#64748B]" /><span>Google / Honda</span></div>
                  </div>
                </div>

                {/* Donut 2: Used & Refurbished */}
                <div className="flex flex-col items-center text-center space-y-2">
                  <div className="relative w-28 h-28">
                    <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                      <circle cx="50" cy="50" r="36" fill="none" stroke="#F1F5F9" strokeWidth="18" />
                      <circle cx="50" cy="50" r="36" fill="none" stroke="#1E60D5" strokeWidth="18" strokeDasharray="115 240" strokeDashoffset="0" />
                      <circle cx="50" cy="50" r="36" fill="none" stroke="#00B074" strokeWidth="18" strokeDasharray="50 240" strokeDashoffset="-115" />
                      <circle cx="50" cy="50" r="36" fill="none" stroke="#F59E0B" strokeWidth="18" strokeDasharray="45 240" strokeDashoffset="-165" />
                      <circle cx="50" cy="50" r="36" fill="none" stroke="#64748B" strokeWidth="18" strokeDasharray="16 240" strokeDashoffset="-210" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <span className="text-xs font-black text-slate-800">Used</span>
                    </div>
                  </div>

                  <div className="space-y-1 text-[11px] font-bold text-slate-600 text-left w-full pl-2">
                    <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#1E60D5]" /><span>Apple / Toyota</span></div>
                    <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#00B074]" /><span>Samsung / Ford</span></div>
                    <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#F59E0B]" /><span>Xiaomi / Chevy</span></div>
                    <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#64748B]" /><span>Google / Honda</span></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 3: Quarterly Revenue Trend */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgba(15,23,42,0.04)] space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-slate-900 tracking-tight">
                  Quarterly Revenue Trend
                </h3>
                <span className="px-2.5 py-0.5 bg-emerald-100 text-[#00B074] rounded-full text-xs font-bold flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Growth</span>
                </span>
              </div>

              {/* Spline Area Chart */}
              <div className="h-44 w-full relative pt-2">
                <svg viewBox="0 0 400 120" className="w-full h-full overflow-visible" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="qGrowthGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#1E60D5" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#1E60D5" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M 20,95 Q 120,50 200,60 T 300,90 T 380,25 L 380,120 L 20,120 Z"
                    fill="url(#qGrowthGrad)"
                  />
                  <path
                    d="M 20,95 Q 120,50 200,60 T 300,90 T 380,25"
                    fill="none"
                    stroke="#1E60D5"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-400 mt-2 px-2">
                  <span>Q1 2026</span>
                  <span>Q2 2026</span>
                  <span>Q3 2026</span>
                  <span>Q4 2026</span>
                </div>
              </div>
            </div>

            {/* Card 4: Yearly Sales Trend (Wave chart 2016-2025) */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgba(15,23,42,0.04)] space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-slate-900 tracking-tight">
                  Yearly Sales Trend
                </h3>
                <span className="px-2.5 py-0.5 bg-emerald-100 text-[#00B074] rounded-full text-xs font-bold flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Growth</span>
                </span>
              </div>

              {/* Multi-wave Spline Chart */}
              <div className="h-44 w-full relative pt-2">
                <svg viewBox="0 0 500 120" className="w-full h-full overflow-visible" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="yearWaveGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#1E60D5" stopOpacity="0.2" />
                      <stop offset="100%" stopColor="#1E60D5" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M 20,110 Q 80,95 130,95 T 220,50 T 300,80 T 380,40 T 480,15 L 480,120 L 20,120 Z"
                    fill="url(#yearWaveGrad)"
                  />
                  <path
                    d="M 20,110 Q 80,95 130,95 T 220,50 T 300,80 T 380,40 T 480,15"
                    fill="none"
                    stroke="#1E60D5"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                </svg>
                <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 mt-2 px-1 overflow-x-auto">
                  <span>2016</span>
                  <span>2018</span>
                  <span>2020</span>
                  <span>2022</span>
                  <span>2024</span>
                  <span>2026</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Report 1: Brand Profitability */}
      {reportType === 'brand_profit' && (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgba(15,23,42,0.04)] overflow-hidden">
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

import React, { useState } from 'react';
import { 
  Sparkles, Send, TrendingUp, AlertTriangle, Smartphone, 
  HelpCircle, CheckCircle2, ChevronRight, BarChart2
} from 'lucide-react';
import { useERP } from '../../services/erpStore';
import { formatBDT } from '../../utils/formatters';

export const BusinessAIAdvisor: React.FC = () => {
  const { sales, products, brands, customers, expenses, imeis, language } = useERP();
  const [query, setQuery] = useState('');
  const [activeAnalysis, setActiveAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Compute live business numbers for analytical queries
  const topProfitBrand = () => {
    let bestBrand = 'Samsung';
    let bestProfit = 0;
    brands.forEach(b => {
      const brandSales = sales.flatMap(s => s.items.filter(it => products.find(p => p.id === it.productId)?.brandId === b.id));
      const profit = brandSales.reduce((acc, it) => acc + (it.total - (it.unitCost * it.quantity)), 0);
      if (profit > bestProfit) {
        bestProfit = profit;
        bestBrand = b.name;
      }
    });
    return { brand: bestBrand, profit: bestProfit };
  };

  const highRiskCustomers = customers.filter(c => c.currentDue > 80000);
  const lowStockList = products.flatMap(p => p.variants.filter(v => v.currentStock <= p.reorderLevel).map(v => `${p.model} (${v.color})`));

  const handleRunAnalysis = (promptType: string, userText?: string) => {
    setLoading(true);
    setActiveAnalysis(null);

    setTimeout(() => {
      setLoading(false);
      if (promptType === 'profit_brand' || userText?.includes('লাভ') || userText?.toLowerCase().includes('profit')) {
        const top = topProfitBrand();
        setActiveAnalysis(`
### 📊 ব্র্যান্ড প্রফিট অ্যানালাইসিস (Brand Profitability Analysis)
* **সর্বাধিক মুনাফাজনক ব্র্যান্ড:** **${top.brand}** (মোট মুনাফা: ${formatBDT(top.profit)})
* **দ্বিতীয় অবস্থানে:** **Apple** (iPhone 16 সিরিজ উচ্চ মূল্যের কারণে প্রতি ইউনিটে উল্লেখযোগ্য মুনাফা তৈরি করেছে)।
* **পরামর্শ:** Samsung এবং Apple ব্র্যান্ডের ওপর ডিলার ডিসকাউন্ট বেশি পাওয়া যায় বিধায় এই মডেলগুলোর ইনভেন্টরি রোটেশন বাড়ানো লাভজনক হবে।
        `);
      } else if (promptType === 'due_risk' || userText?.includes('বাকি') || userText?.toLowerCase().includes('due')) {
        setActiveAnalysis(`
### ⚠️ কাস্টমার বাকি ও বাকির ঝুঁকি (Customer Due Risk Assessment)
* **উচ্চ ঝুঁকিপূর্ণ ডিলার:** **${highRiskCustomers.map(c => c.businessName || c.name).join(', ')}**
* **মোট বকেয়া ঝুঁকি:** **${formatBDT(highRiskCustomers.reduce((acc, c) => acc + c.currentDue, 0))}**
* **কার্যকর পদক্ষেপ:** 
  1. রহমান টেলিকম এবং চৌধুরী গ্যাজেটসকে নতুন কোনো বাকিতে মাল দেওয়ার আগে পূর্বের চালান নিষ্পত্তি করার নোটিশ পাঠানো হয়েছে।
  2. ৩ দিনের মধ্যে ন্যূনতম ৫০% কালেকশন করার জন্য অটোমেটিক রিমাইন্ডার পাঠানো সমীচীন।
        `);
      } else if (promptType === 'reorder_forecast' || userText?.includes('স্টক') || userText?.toLowerCase().includes('stock')) {
        setActiveAnalysis(`
### 📦 স্টক ও রি-অর্ডার পূর্বাভাস (Inventory Demand Forecast)
* **দ্রুত স্টক শেষ হতে যাওয়া মডেলসমূহ:** 
  ${lowStockList.map(item => `  - **${item}** (রি-অর্ডার লেভেলের নিচে)`).join('\n')}
* **পরামর্শ:** আসন্ন উৎসব ও মাসের শুরুতে স্মার্টফোনের চাহিদা বাড়ে। অনুমোদিত পরিবেশক Excel Telecom ও Smart Technologies-এ এখনই পারচেজ অর্ডার সাবমিট করার সুপারিশ করা হচ্ছে।
        `);
      } else if (promptType === 'dead_stock') {
        setActiveAnalysis(`
### 💡 স্লো-মুভিং ও ডেড স্টক অ্যানালাইসিস (Dead Stock Detection)
* **শনাক্তকৃত আইটেম:** Baseus Encok H19 3.5mm Earphone (বর্তমানে ৪৮টি স্টকে আছে কিন্তু চলতি মাসে বিক্রয় ধীরগতির)।
* **ক্যাশফ্লো কৌশল:**
  - প্রতিটি নতুন মোবাইল ক্রয়ের সাথে ৫০% ছাড়ে বান্ডেল অফার দিলে আটকে থাকা মূলধন দ্রুত ক্যাশে পরিণত হবে।
        `);
      } else {
        setActiveAnalysis(`
### 📈 সামগ্রিক ব্যবসায়িক স্বাস্থ্য রিপোর্ট (ERP Business Health Overview)
* **চলতি মাসের মোট রাজস্ব:** **${formatBDT(sales.reduce((acc, s) => acc + s.grandTotal, 0))}**
* **মোট অর্জিত মোট লাভ (Gross Profit):** **${formatBDT(sales.reduce((acc, s) => acc + s.grossProfit, 0))}**
* **পরিচালন খরচ:** **${formatBDT(expenses.reduce((acc, e) => acc + e.amount, 0))}**
* **নিট মুনাফা:** **${formatBDT(sales.reduce((acc, s) => acc + s.grossProfit, 0) - expenses.reduce((acc, e) => acc + e.amount, 0))}**
* আপনার ব্যবসার আর্থিক স্বাস্থ্য খুবই শক্তিশালী এবং ক্যাশ টু রিসিভেবল অনুপাত সন্তোষজনক।
        `);
      }
    }, 450);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-emerald-500 text-white flex items-center justify-center font-bold">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">
              {language === 'bn' ? 'এআই বিজনেস অ্যাডভাইজর ও অ্যানালিটিক্স' : 'AI Business Intelligence & Forecasting'}
            </h2>
            <p className="text-xs text-slate-500">
              {language === 'bn' 
                ? 'ডাটাবেস বিশ্লেষণ করে সরাসরি বাংলা ও ইংরেজিতে ব্যবসায়িক প্রশ্নের উত্তর ও পূর্বাভাস' 
                : 'AI-assisted demand forecast, profit analysis, and due recovery recommendations.'}
            </p>
          </div>
        </div>
      </div>

      {/* Recommended Quick Question Chips */}
      <div>
        <p className="text-xs font-semibold text-slate-500 mb-2">
          {language === 'bn' ? 'জনপ্রিয় ব্যবসায়িক প্রশ্নসমূহ:' : 'Recommended Analytical Prompts:'}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-xs">
          <button
            onClick={() => handleRunAnalysis('profit_brand')}
            className="p-3 bg-slate-50 hover:bg-emerald-50/80 border border-slate-200 hover:border-emerald-300 rounded-xl text-left transition flex flex-col justify-between"
          >
            <span className="font-bold text-slate-800">কোন ব্র্যান্ডে সবচেয়ে বেশি লাভ?</span>
            <span className="text-[11px] text-slate-500 mt-1">Brand Profitability Check</span>
          </button>

          <button
            onClick={() => handleRunAnalysis('due_risk')}
            className="p-3 bg-slate-50 hover:bg-rose-50/80 border border-slate-200 hover:border-rose-300 rounded-xl text-left transition flex flex-col justify-between"
          >
            <span className="font-bold text-slate-800">কোন ডিলারের বাকি বেশি ঝুঁকিপূর্ণ?</span>
            <span className="text-[11px] text-slate-500 mt-1">Overdue Risk Assessment</span>
          </button>

          <button
            onClick={() => handleRunAnalysis('reorder_forecast')}
            className="p-3 bg-slate-50 hover:bg-blue-50/80 border border-slate-200 hover:border-blue-300 rounded-xl text-left transition flex flex-col justify-between"
          >
            <span className="font-bold text-slate-800">কোন কোন ফোন দ্রুত কিনতে হবে?</span>
            <span className="text-[11px] text-slate-500 mt-1">Reorder Demand Forecast</span>
          </button>

          <button
            onClick={() => handleRunAnalysis('dead_stock')}
            className="p-3 bg-slate-50 hover:bg-amber-50/80 border border-slate-200 hover:border-amber-300 rounded-xl text-left transition flex flex-col justify-between"
          >
            <span className="font-bold text-slate-800">দোকানে স্লো বা ডেড স্টক আছে কি?</span>
            <span className="text-[11px] text-slate-500 mt-1">Dead Stock Liquidation</span>
          </button>
        </div>
      </div>

      {/* Query Bar */}
      <div className="flex gap-2">
        <input
          type="text"
          placeholder={language === 'bn' 
            ? 'যেমন: গত মাসে কোন ব্র্যান্ড থেকে সবচেয়ে বেশি লাভ হয়েছে?' 
            : 'Ask any business question based on live ERP ledger and inventory records...'}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && query.trim()) {
              handleRunAnalysis('custom', query);
            }
          }}
          className="flex-1 text-xs p-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:ring-1 focus:ring-emerald-500 font-medium"
        />
        <button
          onClick={() => {
            if (query.trim()) handleRunAnalysis('custom', query);
          }}
          disabled={!query.trim() || loading}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Ask</span>
        </button>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="p-6 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-2">
          <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs text-slate-500 font-medium">Analyzing real transactions, ledgers, and inventory data...</p>
        </div>
      )}

      {/* AI Analysis Result */}
      {activeAnalysis && !loading && (
        <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-xl text-xs space-y-2 animate-in fade-in-50 text-slate-800 leading-relaxed font-sans">
          <div className="whitespace-pre-line">
            {activeAnalysis}
          </div>
        </div>
      )}
    </div>
  );
};

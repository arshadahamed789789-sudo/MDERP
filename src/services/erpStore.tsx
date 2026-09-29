import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Branch, User, UserRole, BusinessType, Brand, Category, Product, ProductIMEI,
  Customer, Supplier, CashAccount, BankAccount, AccountTransaction, ExpenseCategory,
  Expense, SaleInvoice, PurchaseInvoice, ChartOfAccount, JournalEntry,
  CustomerLedgerEntry, SupplierLedgerEntry, AuditLog, DailyClosingRecord,
  BusinessConfig, WarrantyClaim, PaymentRecord, StockTransfer,
  Quotation, SalesReturn, PurchaseReturn, StockAdjustment, SalesReturnItem, PurchaseReturnItem
} from '../types/erp';
import { 
  initialBusinessConfig, initialBranches, initialUsers, initialBrands,
  initialCategories, initialProducts, initialImeis, initialCustomers,
  initialSuppliers, initialCashAccounts, initialBankAccounts,
  initialExpenseCategories, initialExpenses, initialChartOfAccounts,
  initialSales, initialPurchases, initialCustomerLedger,
  initialSupplierLedger, initialWarrantyClaims, initialDailyClosings,
  initialAuditLogs, initialQuotations, initialSalesReturns,
  initialPurchaseReturns, initialStockAdjustments
} from './seedData';

interface ERPContextType {
  // Config & Context
  businessConfig: BusinessConfig;
  updateBusinessConfig: (config: Partial<BusinessConfig>) => void;
  businessType: BusinessType;
  setBusinessType: (type: BusinessType) => void;
  currentUser: User;
  setCurrentUser: (user: User) => void;
  currentBranchId: string; // 'all' or specific branch id
  setCurrentBranchId: (id: string) => void;
  currentBranchName: string;
  language: 'bn' | 'en';
  setLanguage: (lang: 'bn' | 'en') => void;

  // Entities
  branches: Branch[];
  users: User[];
  brands: Brand[];
  categories: Category[];
  products: Product[];
  imeis: ProductIMEI[];
  customers: Customer[];
  suppliers: Supplier[];
  cashAccounts: CashAccount[];
  bankAccounts: BankAccount[];
  accountTransactions: AccountTransaction[];
  expenseCategories: ExpenseCategory[];
  expenses: Expense[];
  sales: SaleInvoice[];
  purchases: PurchaseInvoice[];
  quotations: Quotation[];
  salesReturns: SalesReturn[];
  purchaseReturns: PurchaseReturn[];
  stockTransfers: StockTransfer[];
  stockAdjustments: StockAdjustment[];
  warrantyClaims: WarrantyClaim[];
  dailyClosings: DailyClosingRecord[];
  chartOfAccounts: ChartOfAccount[];
  journalEntries: JournalEntry[];
  customerLedgers: CustomerLedgerEntry[];
  supplierLedgers: SupplierLedgerEntry[];
  auditLogs: AuditLog[];

  // Action methods
  createSale: (saleData: {
    customerId: string;
    items: Array<{
      productId: string;
      variantId: string;
      productName: string;
      variantName: string;
      imeiList: string[];
      quantity: number;
      unitPrice: number;
      unitCost: number;
      discount: number;
      total: number;
    }>;
    subtotal: number;
    discount: number;
    tax: number;
    grandTotal: number;
    paidAmount: number;
    dueAmount: number;
    payments: PaymentRecord[];
    salesmanId: string;
    branchId: string;
    notes?: string;
  }) => { success: boolean; invoice?: SaleInvoice; error?: string };

  createPurchase: (purchaseData: {
    supplierId: string;
    supplierInvoiceNo: string;
    branchId: string;
    items: Array<{
      productId: string;
      variantId: string;
      productName: string;
      variantName: string;
      quantity: number;
      purchaseRate: number;
      allocatedLandedCost: number;
      effectiveUnitCost: number;
      total: number;
      imeis: { imei1: string; imei2?: string }[];
    }>;
    landedCost: { transport: number; courier: number; handling: number; other: number };
    totalLandedCost: number;
    subtotal: number;
    grandTotal: number;
    paidAmount: number;
    dueAmount: number;
    payments: PaymentRecord[];
    notes?: string;
  }) => { success: boolean; invoice?: PurchaseInvoice; error?: string };

  receiveCustomerPayment: (data: {
    customerId: string;
    amount: number;
    accountId: string;
    method: any;
    trxId?: string;
    notes?: string;
  }) => boolean;

  paySupplier: (data: {
    supplierId: string;
    amount: number;
    accountId: string;
    method: any;
    trxId?: string;
    notes?: string;
  }) => boolean;

  createExpense: (data: {
    categoryId: string;
    amount: number;
    paidFromAccountId: string;
    recipient: string;
    description: string;
    voucherNo?: string;
    branchId: string;
  }) => boolean;

  createStockTransfer: (data: {
    fromBranchId: string;
    toBranchId: string;
    productId: string;
    variantId: string;
    imeis: string[];
    quantity: number;
    notes?: string;
  }) => boolean;

  createWarrantyClaim: (data: {
    imei: string;
    customerName: string;
    customerPhone: string;
    problemDescription: string;
  }) => { success: boolean; claimNo?: string; error?: string };

  updateWarrantyStatus: (claimId: string, status: any, resolutionNotes?: string) => void;

  performDailyClosing: (data: {
    branchId: string;
    actualPhysicalCash: number;
    notes?: string;
  }) => { success: boolean; closing?: DailyClosingRecord };

  addProduct: (product: Omit<Product, 'id'>) => Product;
  updateProduct: (id: string, updated: Partial<Product>) => boolean;
  deleteProduct: (id: string) => { success: boolean; error?: string };

  addCustomer: (customer: Omit<Customer, 'id' | 'currentDue' | 'totalPurchased' | 'totalPaid'>) => Customer;
  updateCustomer: (id: string, updated: Partial<Customer>) => boolean;
  deleteCustomer: (id: string) => { success: boolean; error?: string };

  addSupplier: (supplier: Omit<Supplier, 'id' | 'currentPayable' | 'totalPurchased' | 'totalPaid'>) => Supplier;
  updateSupplier: (id: string, updated: Partial<Supplier>) => boolean;
  deleteSupplier: (id: string) => { success: boolean; error?: string };

  updateExpense: (id: string, updated: Partial<ExpenseRecord>) => boolean;
  deleteExpense: (id: string) => boolean;

  updateWarrantyClaim: (id: string, updated: Partial<WarrantyClaim>) => boolean;
  deleteWarrantyClaim: (id: string) => boolean;

  addCashAccount: (account: Omit<CashAccount, 'id'>) => CashAccount;
  updateCashAccount: (id: string, updated: Partial<CashAccount>) => boolean;
  deleteCashAccount: (id: string) => boolean;

  addBankAccount: (account: Omit<BankAccount, 'id'>) => BankAccount;
  updateBankAccount: (id: string, updated: Partial<BankAccount>) => boolean;
  deleteBankAccount: (id: string) => boolean;

  createQuotation: (data: {
    customerId: string;
    branchId: string;
    validUntil: string;
    items: any[];
    subtotal: number;
    discount: number;
    grandTotal: number;
    notes?: string;
  }) => Quotation;

  updateQuotation: (id: string, updated: Partial<Quotation>) => boolean;
  deleteQuotation: (id: string) => boolean;

  voidSaleInvoice: (invoiceNo: string, reason?: string) => { success: boolean; error?: string };

  convertQuotationToSale: (quoteId: string) => { success: boolean; invoice?: SaleInvoice; error?: string };

  createSalesReturn: (data: {
    saleInvoiceNo: string;
    customerId: string;
    branchId: string;
    items: SalesReturnItem[];
    refundMethod: 'Cash' | 'Credit_Adjustment' | 'Bank';
    accountId?: string;
    notes?: string;
  }) => { success: boolean; returnNo?: string; error?: string };

  createPurchaseReturn: (data: {
    purchaseInvoiceNo: string;
    supplierId: string;
    branchId: string;
    items: PurchaseReturnItem[];
    notes?: string;
  }) => { success: boolean; returnNo?: string; error?: string };

  updateIMEI: (imei1: string, updated: Partial<ProductIMEI>) => boolean;
  deleteIMEI: (imei1: string) => { success: boolean; error?: string };

  addBranch: (branch: Omit<Branch, 'id'>) => Branch;
  updateBranch: (id: string, updated: Partial<Branch>) => boolean;
  deleteBranch: (id: string) => { success: boolean; error?: string };

  addBrand: (name: string, country?: string) => Brand;
  deleteBrand: (id: string) => { success: boolean; error?: string };

  voidPurchaseBill: (invoiceNo: string, reason?: string) => { success: boolean; error?: string };

  createStockAdjustment: (data: {
    branchId: string;
    productId: string;
    variantId: string;
    adjustmentType: 'ADD' | 'REMOVE';
    quantity: number;
    imeis: string[];
    reason: 'PHYSICAL_COUNT_DISCREPANCY' | 'DAMAGED' | 'THEFT_LOSS' | 'OTHER';
    notes?: string;
  }) => { success: boolean; adjustmentNo?: string; error?: string };

  exportAllBusinessData: () => void;

  resetToDemoData: () => void;
  globalSearch: (query: string) => {
    imeis: ProductIMEI[];
    customers: Customer[];
    invoices: SaleInvoice[];
    products: Product[];
  };
}

const ERPContext = createContext<ERPContextType | null>(null);

const STORAGE_PREFIX = 'MOBILE_DERP_';

export const ERPProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load from LocalStorage or Seed Data
  const loadState = <T,>(key: string, fallback: T): T => {
    try {
      const stored = localStorage.getItem(STORAGE_PREFIX + key);
      return stored ? JSON.parse(stored) : fallback;
    } catch {
      return fallback;
    }
  };

  const saveState = (key: string, val: any) => {
    try {
      localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(val));
    } catch (e) {
      console.error('LocalStorage write failed:', e);
    }
  };

  const [businessConfig, setBusinessConfig] = useState<BusinessConfig>(() => 
    loadState('config', initialBusinessConfig)
  );
  const [businessType, setBusinessType] = useState<BusinessType>(() => 
    loadState('biz_type', 'RETAIL_WHOLESALE')
  );
  const [branches, setBranches] = useState<Branch[]>(() => 
    loadState('branches', initialBranches)
  );
  const [users] = useState<User[]>(initialUsers);
  const [currentUser, setCurrentUser] = useState<User>(initialUsers[0]);
  const [currentBranchId, setCurrentBranchId] = useState<string>('all');
  const [language, setLanguage] = useState<'bn' | 'en'>('en');

  const [brands, setBrands] = useState<Brand[]>(() => loadState('brands', initialBrands));
  const [categories, setCategories] = useState<Category[]>(() => loadState('categories', initialCategories));
  const [products, setProducts] = useState<Product[]>(() => loadState('products', initialProducts));
  const [imeis, setImeis] = useState<ProductIMEI[]>(() => loadState('imeis', initialImeis));
  const [customers, setCustomers] = useState<Customer[]>(() => loadState('customers', initialCustomers));
  const [suppliers, setSuppliers] = useState<Supplier[]>(() => loadState('suppliers', initialSuppliers));
  const [cashAccounts, setCashAccounts] = useState<CashAccount[]>(() => loadState('cash_accounts', initialCashAccounts));
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>(() => loadState('bank_accounts', initialBankAccounts));
  const [accountTransactions, setAccountTransactions] = useState<AccountTransaction[]>(() => loadState('acc_trx', []));
  const [expenseCategories, setExpenseCategories] = useState<ExpenseCategory[]>(() => loadState('exp_cat', initialExpenseCategories));
  const [expenses, setExpenses] = useState<Expense[]>(() => loadState('expenses', initialExpenses));
  const [sales, setSales] = useState<SaleInvoice[]>(() => loadState('sales', initialSales));
  const [purchases, setPurchases] = useState<PurchaseInvoice[]>(() => loadState('purchases', initialPurchases));
  const [quotations, setQuotations] = useState<Quotation[]>(() => loadState('quotations', initialQuotations));
  const [salesReturns, setSalesReturns] = useState<SalesReturn[]>(() => loadState('sales_returns', initialSalesReturns));
  const [purchaseReturns, setPurchaseReturns] = useState<PurchaseReturn[]>(() => loadState('pur_returns', initialPurchaseReturns));
  const [stockTransfers, setStockTransfers] = useState<StockTransfer[]>(() => loadState('transfers', []));
  const [stockAdjustments, setStockAdjustments] = useState<StockAdjustment[]>(() => loadState('adjustments', initialStockAdjustments));
  const [warrantyClaims, setWarrantyClaims] = useState<WarrantyClaim[]>(() => loadState('warranties', initialWarrantyClaims));
  const [dailyClosings, setDailyClosings] = useState<DailyClosingRecord[]>(() => loadState('closings', initialDailyClosings));
  const [chartOfAccounts, setChartOfAccounts] = useState<ChartOfAccount[]>(() => loadState('coa', initialChartOfAccounts));
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>(() => loadState('journals', []));
  const [customerLedgers, setCustomerLedgers] = useState<CustomerLedgerEntry[]>(() => loadState('cust_ledger', initialCustomerLedger));
  const [supplierLedgers, setSupplierLedgers] = useState<SupplierLedgerEntry[]>(() => loadState('sup_ledger', initialSupplierLedger));
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => loadState('audit_logs', initialAuditLogs));

  // Auto-sync state changes to localStorage
  useEffect(() => saveState('config', businessConfig), [businessConfig]);
  useEffect(() => saveState('biz_type', businessType), [businessType]);
  useEffect(() => saveState('branches', branches), [branches]);
  useEffect(() => saveState('brands', brands), [brands]);
  useEffect(() => saveState('categories', categories), [categories]);
  useEffect(() => saveState('products', products), [products]);
  useEffect(() => saveState('imeis', imeis), [imeis]);
  useEffect(() => saveState('customers', customers), [customers]);
  useEffect(() => saveState('suppliers', suppliers), [suppliers]);
  useEffect(() => saveState('cash_accounts', cashAccounts), [cashAccounts]);
  useEffect(() => saveState('bank_accounts', bankAccounts), [bankAccounts]);
  useEffect(() => saveState('acc_trx', accountTransactions), [accountTransactions]);
  useEffect(() => saveState('expenses', expenses), [expenses]);
  useEffect(() => saveState('sales', sales), [sales]);
  useEffect(() => saveState('purchases', purchases), [purchases]);
  useEffect(() => saveState('quotations', quotations), [quotations]);
  useEffect(() => saveState('sales_returns', salesReturns), [salesReturns]);
  useEffect(() => saveState('pur_returns', purchaseReturns), [purchaseReturns]);
  useEffect(() => saveState('transfers', stockTransfers), [stockTransfers]);
  useEffect(() => saveState('adjustments', stockAdjustments), [stockAdjustments]);
  useEffect(() => saveState('warranties', warrantyClaims), [warrantyClaims]);
  useEffect(() => saveState('closings', dailyClosings), [dailyClosings]);
  useEffect(() => saveState('coa', chartOfAccounts), [chartOfAccounts]);
  useEffect(() => saveState('journals', journalEntries), [journalEntries]);
  useEffect(() => saveState('cust_ledger', customerLedgers), [customerLedgers]);
  useEffect(() => saveState('sup_ledger', supplierLedgers), [supplierLedgers]);
  useEffect(() => saveState('audit_logs', auditLogs), [auditLogs]);

  const currentBranchName = currentBranchId === 'all' 
    ? 'All Branches (Consolidated)' 
    : branches.find(b => b.id === currentBranchId)?.name || 'Branch';

  const logAudit = (action: string, module: string, recordId: string, details: string) => {
    const newLog: AuditLog = {
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      userName: currentUser.name,
      userRole: currentUser.role,
      action,
      module,
      recordId,
      details
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const updateBusinessConfig = (config: Partial<BusinessConfig>) => {
    setBusinessConfig(prev => ({ ...prev, ...config }));
  };

  // Helper to post double-entry journal items and update Chart of Accounts balances
  const postJournalEntry = (
    referenceType: 'SALE' | 'PURCHASE' | 'PAYMENT' | 'EXPENSE' | 'CLOSING' | 'MANUAL',
    referenceId: string,
    description: string,
    items: Array<{ accountCode: string; accountName: string; debit: number; credit: number }>
  ) => {
    const entryNo = `JRN-${Date.now().toString().slice(-6)}`;
    const today = new Date().toISOString().split('T')[0];
    const totalAmount = items.reduce((acc, it) => acc + (it.debit || 0), 0);

    const newJournal: JournalEntry = {
      id: `jrn-${Date.now()}`,
      entryNo,
      date: today,
      referenceType,
      referenceId,
      description,
      items,
      totalAmount
    };

    setJournalEntries(prev => [newJournal, ...prev]);

    // Update Chart of Account balances
    setChartOfAccounts(prev => prev.map(account => {
      const match = items.find(i => i.accountCode === account.code);
      if (!match) return account;

      let netChange = 0;
      if (account.normalBalance === 'DEBIT') {
        netChange = (match.debit || 0) - (match.credit || 0);
      } else {
        netChange = (match.credit || 0) - (match.debit || 0);
      }
      return {
        ...account,
        balance: Math.max(0, account.balance + netChange)
      };
    }));
  };

  // 1. CREATE SALE: Complete lifecycle transaction
  const createSale = (saleData: {
    customerId: string;
    items: Array<{
      productId: string;
      variantId: string;
      productName: string;
      variantName: string;
      imeiList: string[];
      quantity: number;
      unitPrice: number;
      unitCost: number;
      discount: number;
      total: number;
    }>;
    subtotal: number;
    discount: number;
    tax: number;
    grandTotal: number;
    paidAmount: number;
    dueAmount: number;
    payments: PaymentRecord[];
    salesmanId: string;
    branchId: string;
    notes?: string;
  }) => {
    const customer = customers.find(c => c.id === saleData.customerId);
    if (!customer) return { success: false, error: 'Customer not found' };

    // Check credit limit if wholesale dealer
    if (saleData.dueAmount > 0 && customer.creditLimit > 0) {
      if (customer.currentDue + saleData.dueAmount > customer.creditLimit) {
        // Warning noted, manager can approve
      }
    }

    const branch = branches.find(b => b.id === saleData.branchId) || branches[0];
    const salesman = users.find(u => u.id === saleData.salesmanId) || currentUser;
    const invoiceNo = `INV-2026-${String(sales.length + 3).padStart(3, '0')}`;
    const today = new Date().toISOString().split('T')[0];

    const totalCost = saleData.items.reduce((acc, it) => acc + (it.unitCost * it.quantity), 0);
    const grossProfit = saleData.grandTotal - totalCost;

    const newInvoice: SaleInvoice = {
      id: `sale-${Date.now()}`,
      invoiceNo,
      date: today,
      customerId: customer.id,
      customerName: customer.businessName ? `${customer.businessName} (${customer.name})` : customer.name,
      customerMobile: customer.mobile,
      customerType: customer.customerType,
      branchId: branch.id,
      branchName: branch.name,
      salesmanId: salesman.id,
      salesmanName: salesman.name,
      items: saleData.items,
      subtotal: saleData.subtotal,
      discount: saleData.discount,
      tax: saleData.tax,
      grandTotal: saleData.grandTotal,
      paidAmount: saleData.paidAmount,
      dueAmount: saleData.dueAmount,
      totalCost,
      grossProfit,
      payments: saleData.payments,
      status: 'COMPLETED',
      notes: saleData.notes
    };

    // 1. Deduct Product Variant Stocks
    setProducts(prev => prev.map(p => {
      const soldItemsForProduct = saleData.items.filter(it => it.productId === p.id);
      if (soldItemsForProduct.length === 0) return p;

      return {
        ...p,
        variants: p.variants.map(v => {
          const item = soldItemsForProduct.find(it => it.variantId === v.id);
          if (!item) return v;
          return {
            ...v,
            currentStock: Math.max(0, v.currentStock - item.quantity)
          };
        })
      };
    }));

    // 2. Update IMEIs status to 'SOLD'
    const soldImeisList = saleData.items.flatMap(it => it.imeiList);
    const warrantyExpiry = new Date();
    warrantyExpiry.setFullYear(warrantyExpiry.getFullYear() + 1);
    const warrantyExpiryStr = warrantyExpiry.toISOString().split('T')[0];

    if (soldImeisList.length > 0) {
      setImeis(prev => prev.map(im => {
        if (soldImeisList.includes(im.imei1)) {
          return {
            ...im,
            status: 'SOLD',
            saleInvoiceId: invoiceNo,
            customerId: customer.id,
            customerName: newInvoice.customerName,
            saleDate: today,
            warrantyExpiryDate: warrantyExpiryStr
          };
        }
        return im;
      }));
    }

    // 3. Update Customer Current Due, Totals & Customer Ledger
    const newCustomerDue = customer.currentDue + saleData.dueAmount;
    setCustomers(prev => prev.map(c => {
      if (c.id === customer.id) {
        return {
          ...c,
          currentDue: newCustomerDue,
          totalPurchased: c.totalPurchased + saleData.grandTotal,
          totalPaid: c.totalPaid + saleData.paidAmount
        };
      }
      return c;
    }));

    // Ledger entries
    const ledgerEntries: CustomerLedgerEntry[] = [
      {
        id: `cld-${Date.now()}-1`,
        customerId: customer.id,
        date: today,
        type: 'SALE',
        referenceNo: invoiceNo,
        debit: saleData.grandTotal,
        credit: 0,
        balance: customer.currentDue + saleData.grandTotal,
        description: `Sale invoice ${invoiceNo} (${saleData.items.map(i => i.productName).join(', ')})`
      }
    ];

    if (saleData.paidAmount > 0) {
      ledgerEntries.push({
        id: `cld-${Date.now()}-2`,
        customerId: customer.id,
        date: today,
        type: 'PAYMENT',
        referenceNo: `PMT-${invoiceNo}`,
        debit: 0,
        credit: saleData.paidAmount,
        balance: newCustomerDue,
        description: `Payment received against invoice ${invoiceNo}`
      });
    }

    setCustomerLedgers(prev => [...prev, ...ledgerEntries]);

    // 4. Update Cash/Bank Account Balances & Transactions
    saleData.payments.forEach(pmt => {
      if (pmt.amount <= 0) return;
      // Check cash or bank
      const isCash = cashAccounts.some(c => c.id === pmt.accountId);
      if (isCash) {
        setCashAccounts(prev => prev.map(ca => {
          if (ca.id === pmt.accountId) {
            return { ...ca, balance: ca.balance + pmt.amount };
          }
          return ca;
        }));
      } else {
        setBankAccounts(prev => prev.map(ba => {
          if (ba.id === pmt.accountId) {
            return { ...ba, balance: ba.balance + pmt.amount };
          }
          return ba;
        }));
      }

      const newTrx: AccountTransaction = {
        id: `trx-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        date: today,
        accountId: pmt.accountId,
        accountName: pmt.accountName,
        accountType: isCash ? 'CASH' : 'BANK',
        type: 'IN',
        amount: pmt.amount,
        category: 'Sales Receipt',
        referenceType: 'SALE',
        referenceId: invoiceNo,
        description: `Sales payment for invoice ${invoiceNo} from ${customer.name}`,
        balanceAfter: 0
      };
      setAccountTransactions(prev => [newTrx, ...prev]);
    });

    // 5. Automatic Double-Entry Journal Postings
    // Entry 1: Revenue & Receivables / Cash
    const journalItems = [];
    if (saleData.paidAmount > 0) {
      journalItems.push({
        accountCode: '1010',
        accountName: 'Cash & Bank Receipts',
        debit: saleData.paidAmount,
        credit: 0
      });
    }
    if (saleData.dueAmount > 0) {
      journalItems.push({
        accountCode: '1100',
        accountName: 'Accounts Receivable (Customer Due)',
        debit: saleData.dueAmount,
        credit: 0
      });
    }
    journalItems.push({
      accountCode: '4010',
      accountName: 'Sales Revenue',
      debit: 0,
      credit: saleData.grandTotal
    });

    // Entry 2: Cost of Goods Sold & Inventory
    journalItems.push({
      accountCode: '5010',
      accountName: 'Cost of Goods Sold (COGS)',
      debit: totalCost,
      credit: 0
    });
    journalItems.push({
      accountCode: '1200',
      accountName: 'Merchandise Inventory',
      debit: 0,
      credit: totalCost
    });

    postJournalEntry('SALE', invoiceNo, `Sale invoice ${invoiceNo} to ${customer.name}`, journalItems);

    // 6. Record Invoice & Audit Log
    setSales(prev => [newInvoice, ...prev]);
    logAudit('SALE_CREATED', 'Sales', invoiceNo, `Created sale for ${customer.name} total ৳${saleData.grandTotal.toLocaleString()} (Paid: ৳${saleData.paidAmount.toLocaleString()}, Due: ৳${saleData.dueAmount.toLocaleString()})`);

    return { success: true, invoice: newInvoice };
  };

  // 2. CREATE PURCHASE: With Landed Cost & IMEI Generator
  const createPurchase = (purchaseData: {
    supplierId: string;
    supplierInvoiceNo: string;
    branchId: string;
    items: Array<{
      productId: string;
      variantId: string;
      productName: string;
      variantName: string;
      quantity: number;
      purchaseRate: number;
      allocatedLandedCost: number;
      effectiveUnitCost: number;
      total: number;
      imeis: { imei1: string; imei2?: string }[];
    }>;
    landedCost: { transport: number; courier: number; handling: number; other: number };
    totalLandedCost: number;
    subtotal: number;
    grandTotal: number;
    paidAmount: number;
    dueAmount: number;
    payments: PaymentRecord[];
    notes?: string;
  }) => {
    const supplier = suppliers.find(s => s.id === purchaseData.supplierId);
    if (!supplier) return { success: false, error: 'Supplier not found' };

    const branch = branches.find(b => b.id === purchaseData.branchId) || branches[0];
    const invoiceNo = `PUR-2026-${String(purchases.length + 2).padStart(3, '0')}`;
    const today = new Date().toISOString().split('T')[0];

    const newPurchase: PurchaseInvoice = {
      id: `pur-${Date.now()}`,
      invoiceNo,
      supplierInvoiceNo: purchaseData.supplierInvoiceNo || `SUP-INV-${Date.now().toString().slice(-4)}`,
      date: today,
      supplierId: supplier.id,
      supplierName: supplier.name,
      branchId: branch.id,
      branchName: branch.name,
      items: purchaseData.items,
      subtotal: purchaseData.subtotal,
      landedCost: purchaseData.landedCost,
      totalLandedCost: purchaseData.totalLandedCost,
      grandTotal: purchaseData.grandTotal,
      paidAmount: purchaseData.paidAmount,
      dueAmount: purchaseData.dueAmount,
      payments: purchaseData.payments,
      status: 'RECEIVED',
      notes: purchaseData.notes
    };

    // 1. Increase product stock
    setProducts(prev => prev.map(p => {
      const itemsForProd = purchaseData.items.filter(it => it.productId === p.id);
      if (itemsForProd.length === 0) return p;

      return {
        ...p,
        variants: p.variants.map(v => {
          const matchItem = itemsForProd.find(it => it.variantId === v.id);
          if (!matchItem) return v;
          return {
            ...v,
            currentStock: v.currentStock + matchItem.quantity,
            purchasePrice: matchItem.effectiveUnitCost
          };
        })
      };
    }));

    // 2. Insert new IMEIs
    const newImeiRecords: ProductIMEI[] = [];
    purchaseData.items.forEach(it => {
      it.imeis.forEach(im => {
        newImeiRecords.push({
          imei1: im.imei1,
          imei2: im.imei2,
          productId: it.productId,
          variantId: it.variantId,
          productName: it.productName,
          variantName: it.variantName,
          purchaseInvoiceId: invoiceNo,
          purchaseCost: it.effectiveUnitCost,
          supplierId: supplier.id,
          supplierName: supplier.name,
          purchaseDate: today,
          branchId: branch.id,
          branchName: branch.name,
          status: 'IN_STOCK'
        });
      });
    });

    if (newImeiRecords.length > 0) {
      setImeis(prev => [...newImeiRecords, ...prev]);
    }

    // 3. Update Supplier Payable & Ledger
    const newPayable = supplier.currentPayable + purchaseData.dueAmount;
    setSuppliers(prev => prev.map(s => {
      if (s.id === supplier.id) {
        return {
          ...s,
          currentPayable: newPayable,
          totalPurchased: s.totalPurchased + purchaseData.grandTotal,
          totalPaid: s.totalPaid + purchaseData.paidAmount
        };
      }
      return s;
    }));

    const supLedgers: SupplierLedgerEntry[] = [
      {
        id: `sld-${Date.now()}-1`,
        supplierId: supplier.id,
        date: today,
        type: 'PURCHASE',
        referenceNo: invoiceNo,
        debit: 0,
        credit: purchaseData.grandTotal,
        balance: supplier.currentPayable + purchaseData.grandTotal,
        description: `Purchase invoice ${invoiceNo} (Supplier Bill: ${newPurchase.supplierInvoiceNo})`
      }
    ];

    if (purchaseData.paidAmount > 0) {
      supLedgers.push({
        id: `sld-${Date.now()}-2`,
        supplierId: supplier.id,
        date: today,
        type: 'PAYMENT',
        referenceNo: `PAY-${invoiceNo}`,
        debit: purchaseData.paidAmount,
        credit: 0,
        balance: newPayable,
        description: `Payment against purchase invoice ${invoiceNo}`
      });
    }

    setSupplierLedgers(prev => [...prev, ...supLedgers]);

    // 4. Update Cash/Bank account deductions
    purchaseData.payments.forEach(pmt => {
      if (pmt.amount <= 0) return;
      const isCash = cashAccounts.some(c => c.id === pmt.accountId);
      if (isCash) {
        setCashAccounts(prev => prev.map(ca => {
          if (ca.id === pmt.accountId) {
            return { ...ca, balance: ca.balance - pmt.amount };
          }
          return ca;
        }));
      } else {
        setBankAccounts(prev => prev.map(ba => {
          if (ba.id === pmt.accountId) {
            return { ...ba, balance: ba.balance - pmt.amount };
          }
          return ba;
        }));
      }

      const newTrx: AccountTransaction = {
        id: `trx-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        date: today,
        accountId: pmt.accountId,
        accountName: pmt.accountName,
        accountType: isCash ? 'CASH' : 'BANK',
        type: 'OUT',
        amount: pmt.amount,
        category: 'Supplier Payment',
        referenceType: 'PURCHASE',
        referenceId: invoiceNo,
        description: `Payment for purchase ${invoiceNo} to ${supplier.name}`,
        balanceAfter: 0
      };
      setAccountTransactions(prev => [newTrx, ...prev]);
    });

    // 5. Accounting Entries for Purchase
    const journalItems = [
      {
        accountCode: '1200',
        accountName: 'Merchandise Inventory',
        debit: purchaseData.grandTotal,
        credit: 0
      }
    ];

    if (purchaseData.paidAmount > 0) {
      journalItems.push({
        accountCode: '1030',
        accountName: 'Cash / Bank Outflow',
        debit: 0,
        credit: purchaseData.paidAmount
      });
    }
    if (purchaseData.dueAmount > 0) {
      journalItems.push({
        accountCode: '2010',
        accountName: 'Accounts Payable (Supplier Due)',
        debit: 0,
        credit: purchaseData.dueAmount
      });
    }

    postJournalEntry('PURCHASE', invoiceNo, `Purchase invoice ${invoiceNo} from ${supplier.name}`, journalItems);

    setPurchases(prev => [newPurchase, ...prev]);
    logAudit('PURCHASE_CREATED', 'Purchase', invoiceNo, `Purchased stock from ${supplier.name} for ৳${purchaseData.grandTotal.toLocaleString()} (IMEIs entered: ${newImeiRecords.length})`);

    return { success: true, invoice: newPurchase };
  };

  // 3. RECEIVE CUSTOMER DUE PAYMENT
  const receiveCustomerPayment = (data: {
    customerId: string;
    amount: number;
    accountId: string;
    method: any;
    trxId?: string;
    notes?: string;
  }) => {
    const customer = customers.find(c => c.id === data.customerId);
    if (!customer) return false;

    const today = new Date().toISOString().split('T')[0];
    const receiptNo = `RCT-${Date.now().toString().slice(-6)}`;
    const newDue = Math.max(0, customer.currentDue - data.amount);

    // Update customer
    setCustomers(prev => prev.map(c => {
      if (c.id === customer.id) {
        return {
          ...c,
          currentDue: newDue,
          totalPaid: c.totalPaid + data.amount
        };
      }
      return c;
    }));

    // Customer Ledger
    const ledgerEntry: CustomerLedgerEntry = {
      id: `cld-${Date.now()}`,
      customerId: customer.id,
      date: today,
      type: 'PAYMENT',
      referenceNo: receiptNo,
      debit: 0,
      credit: data.amount,
      balance: newDue,
      description: `Due collection: ${data.method} ${data.trxId ? `(Trx: ${data.trxId})` : ''} - ${data.notes || 'Payment received'}`
    };
    setCustomerLedgers(prev => [...prev, ledgerEntry]);

    // Update Cash / Bank Account
    const isCash = cashAccounts.some(c => c.id === data.accountId);
    let accName = '';
    if (isCash) {
      setCashAccounts(prev => prev.map(ca => {
        if (ca.id === data.accountId) {
          accName = ca.name;
          return { ...ca, balance: ca.balance + data.amount };
        }
        return ca;
      }));
    } else {
      setBankAccounts(prev => prev.map(ba => {
        if (ba.id === data.accountId) {
          accName = ba.bankName;
          return { ...ba, balance: ba.balance + data.amount };
        }
        return ba;
      }));
    }

    const newTrx: AccountTransaction = {
      id: `trx-${Date.now()}`,
      date: today,
      accountId: data.accountId,
      accountName: accName || data.method,
      accountType: isCash ? 'CASH' : 'BANK',
      type: 'IN',
      amount: data.amount,
      category: 'Customer Collection',
      referenceType: 'CUSTOMER_PAYMENT',
      referenceId: receiptNo,
      description: `Due payment received from ${customer.name}`,
      balanceAfter: 0
    };
    setAccountTransactions(prev => [newTrx, ...prev]);

    // Accounting Entry
    postJournalEntry('PAYMENT', receiptNo, `Due collection from customer ${customer.name}`, [
      {
        accountCode: isCash ? '1010' : '1030',
        accountName: isCash ? 'Counter Cash' : 'Bank Account',
        debit: data.amount,
        credit: 0
      },
      {
        accountCode: '1100',
        accountName: 'Accounts Receivable (Customer Due)',
        debit: 0,
        credit: data.amount
      }
    ]);

    logAudit('CUSTOMER_PAYMENT', 'Customers', receiptNo, `Collected ৳${data.amount.toLocaleString()} from ${customer.name} via ${data.method}`);
    return true;
  };

  // 4. PAY SUPPLIER
  const paySupplier = (data: {
    supplierId: string;
    amount: number;
    accountId: string;
    method: any;
    trxId?: string;
    notes?: string;
  }) => {
    const supplier = suppliers.find(s => s.id === data.supplierId);
    if (!supplier) return false;

    const today = new Date().toISOString().split('T')[0];
    const voucherNo = `VCH-PAY-${Date.now().toString().slice(-6)}`;
    const newPayable = Math.max(0, supplier.currentPayable - data.amount);

    setSuppliers(prev => prev.map(s => {
      if (s.id === supplier.id) {
        return {
          ...s,
          currentPayable: newPayable,
          totalPaid: s.totalPaid + data.amount
        };
      }
      return s;
    }));

    const supLedger: SupplierLedgerEntry = {
      id: `sld-${Date.now()}`,
      supplierId: supplier.id,
      date: today,
      type: 'PAYMENT',
      referenceNo: voucherNo,
      debit: data.amount,
      credit: 0,
      balance: newPayable,
      description: `Supplier payment: ${data.method} ${data.trxId ? `(Trx: ${data.trxId})` : ''} - ${data.notes || ''}`
    };
    setSupplierLedgers(prev => [...prev, supLedger]);

    const isCash = cashAccounts.some(c => c.id === data.accountId);
    let accName = '';
    if (isCash) {
      setCashAccounts(prev => prev.map(ca => {
        if (ca.id === data.accountId) {
          accName = ca.name;
          return { ...ca, balance: ca.balance - data.amount };
        }
        return ca;
      }));
    } else {
      setBankAccounts(prev => prev.map(ba => {
        if (ba.id === data.accountId) {
          accName = ba.bankName;
          return { ...ba, balance: ba.balance - data.amount };
        }
        return ba;
      }));
    }

    const newTrx: AccountTransaction = {
      id: `trx-${Date.now()}`,
      date: today,
      accountId: data.accountId,
      accountName: accName || data.method,
      accountType: isCash ? 'CASH' : 'BANK',
      type: 'OUT',
      amount: data.amount,
      category: 'Supplier Payment',
      referenceType: 'SUPPLIER_PAYMENT',
      referenceId: voucherNo,
      description: `Payment to supplier ${supplier.name}`,
      balanceAfter: 0
    };
    setAccountTransactions(prev => [newTrx, ...prev]);

    postJournalEntry('PAYMENT', voucherNo, `Supplier payment to ${supplier.name}`, [
      {
        accountCode: '2010',
        accountName: 'Accounts Payable (Supplier Due)',
        debit: data.amount,
        credit: 0
      },
      {
        accountCode: isCash ? '1010' : '1030',
        accountName: isCash ? 'Counter Cash' : 'Bank Account',
        debit: 0,
        credit: data.amount
      }
    ]);

    logAudit('SUPPLIER_PAYMENT', 'Suppliers', voucherNo, `Paid ৳${data.amount.toLocaleString()} to ${supplier.name} via ${data.method}`);
    return true;
  };

  // 5. CREATE EXPENSE
  const createExpense = (data: {
    categoryId: string;
    amount: number;
    paidFromAccountId: string;
    recipient: string;
    description: string;
    voucherNo?: string;
    branchId: string;
  }) => {
    const cat = expenseCategories.find(c => c.id === data.categoryId);
    const branch = branches.find(b => b.id === data.branchId) || branches[0];
    const today = new Date().toISOString().split('T')[0];
    const vch = data.voucherNo || `EXP-${Date.now().toString().slice(-5)}`;

    const isCash = cashAccounts.some(c => c.id === data.paidFromAccountId);
    let accName = '';
    if (isCash) {
      setCashAccounts(prev => prev.map(ca => {
        if (ca.id === data.paidFromAccountId) {
          accName = ca.name;
          return { ...ca, balance: ca.balance - data.amount };
        }
        return ca;
      }));
    } else {
      setBankAccounts(prev => prev.map(ba => {
        if (ba.id === data.paidFromAccountId) {
          accName = ba.bankName;
          return { ...ba, balance: ba.balance - data.amount };
        }
        return ba;
      }));
    }

    const newExpense: Expense = {
      id: `exp-${Date.now()}`,
      date: today,
      categoryId: data.categoryId,
      categoryName: cat?.name || 'General Expense',
      amount: data.amount,
      branchId: branch.id,
      branchName: branch.name,
      paidFromAccountId: data.paidFromAccountId,
      paidFromAccountName: accName,
      recipient: data.recipient,
      description: data.description,
      voucherNo: vch
    };

    setExpenses(prev => [newExpense, ...prev]);

    // Accounting
    postJournalEntry('EXPENSE', vch, `Expense: ${newExpense.categoryName} - ${newExpense.description}`, [
      {
        accountCode: '5110',
        accountName: newExpense.categoryName,
        debit: data.amount,
        credit: 0
      },
      {
        accountCode: isCash ? '1010' : '1030',
        accountName: accName || 'Cash/Bank',
        debit: 0,
        credit: data.amount
      }
    ]);

    logAudit('EXPENSE_CREATED', 'Expenses', vch, `Recorded expense ৳${data.amount.toLocaleString()} for ${newExpense.categoryName} (${data.recipient})`);
    return true;
  };

  // 6. STOCK TRANSFER
  const createStockTransfer = (data: {
    fromBranchId: string;
    toBranchId: string;
    productId: string;
    variantId: string;
    imeis: string[];
    quantity: number;
    notes?: string;
  }) => {
    const fromB = branches.find(b => b.id === data.fromBranchId);
    const toB = branches.find(b => b.id === data.toBranchId);
    const prod = products.find(p => p.id === data.productId);
    const transferNo = `TRF-2026-${Date.now().toString().slice(-4)}`;
    const today = new Date().toISOString().split('T')[0];

    const newTransfer: StockTransfer = {
      id: `trf-${Date.now()}`,
      transferNo,
      date: today,
      fromBranchId: fromB?.id || '',
      fromBranchName: fromB?.name || '',
      toBranchId: toB?.id || '',
      toBranchName: toB?.name || '',
      productId: data.productId,
      variantId: data.variantId,
      productName: prod?.model || 'Product',
      imeis: data.imeis,
      quantity: data.quantity,
      status: 'RECEIVED',
      notes: data.notes
    };

    // Update IMEI locations
    if (data.imeis.length > 0 && toB) {
      setImeis(prev => prev.map(im => {
        if (data.imeis.includes(im.imei1)) {
          return {
            ...im,
            branchId: toB.id,
            branchName: toB.name
          };
        }
        return im;
      }));
    }

    setStockTransfers(prev => [newTransfer, ...prev]);
    logAudit('STOCK_TRANSFERRED', 'Inventory', transferNo, `Transferred ${data.quantity} units from ${fromB?.name} to ${toB?.name}`);
    return true;
  };

  // 7. WARRANTY CLAIM
  const createWarrantyClaim = (data: {
    imei: string;
    customerName: string;
    customerPhone: string;
    problemDescription: string;
  }) => {
    const imeiRecord = imeis.find(i => i.imei1 === data.imei || i.imei2 === data.imei);
    if (!imeiRecord) {
      return { success: false, error: 'IMEI not found in database' };
    }

    const claimNo = `WCL-2026-${String(warrantyClaims.length + 2).padStart(3, '0')}`;
    const today = new Date().toISOString().split('T')[0];

    const newClaim: WarrantyClaim = {
      id: `wcl-${Date.now()}`,
      claimNo,
      date: today,
      imei: imeiRecord.imei1,
      productName: imeiRecord.productName,
      customerName: data.customerName || imeiRecord.customerName || 'Customer',
      customerPhone: data.customerPhone,
      problemDescription: data.problemDescription,
      status: 'PENDING',
      receivedDate: today
    };

    // Set IMEI status to WARRANTY
    setImeis(prev => prev.map(im => {
      if (im.imei1 === imeiRecord.imei1) {
        return { ...im, status: 'WARRANTY' };
      }
      return im;
    }));

    setWarrantyClaims(prev => [newClaim, ...prev]);
    logAudit('WARRANTY_CLAIM_OPENED', 'Warranty', claimNo, `Registered warranty claim for IMEI ${imeiRecord.imei1} (${imeiRecord.productName})`);
    return { success: true, claimNo };
  };

  const updateWarrantyStatus = (claimId: string, status: any, resolutionNotes?: string) => {
    setWarrantyClaims(prev => prev.map(c => {
      if (c.id === claimId) {
        return {
          ...c,
          status,
          resolutionNotes: resolutionNotes || c.resolutionNotes,
          completionDate: ['DELIVERED', 'REJECTED'].includes(status) 
            ? new Date().toISOString().split('T')[0] 
            : undefined
        };
      }
      return c;
    }));
  };

  // 8. DAILY BUSINESS CLOSING
  const performDailyClosing = (data: {
    branchId: string;
    actualPhysicalCash: number;
    notes?: string;
  }) => {
    const branch = branches.find(b => b.id === data.branchId) || branches[0];
    const today = new Date().toISOString().split('T')[0];

    // Compute day's figures for this branch
    const branchCashAcc = cashAccounts.find(ca => ca.branchId === branch.id) || cashAccounts[0];
    const openingCash = 50000; // Standard day opening drawer float

    // Today cash sales
    const todayCashSales = sales
      .filter(s => s.date === today && s.branchId === branch.id)
      .reduce((acc, s) => {
        const cashPmt = s.payments.filter(p => p.method === 'Cash').reduce((sum, p) => sum + p.amount, 0);
        return acc + cashPmt;
      }, 0);

    // Today customer collection
    const todayCollection = accountTransactions
      .filter(t => t.date === today && t.accountId === branchCashAcc?.id && t.referenceType === 'CUSTOMER_PAYMENT')
      .reduce((acc, t) => acc + t.amount, 0);

    // Today expenses from this cash
    const todayExpenses = expenses
      .filter(e => e.date === today && e.paidFromAccountId === branchCashAcc?.id)
      .reduce((acc, e) => acc + e.amount, 0);

    const expectedClosingCash = (openingCash + todayCashSales + todayCollection) - todayExpenses;
    const variance = data.actualPhysicalCash - expectedClosingCash;

    const record: DailyClosingRecord = {
      id: `cls-${Date.now()}`,
      date: today,
      branchId: branch.id,
      branchName: branch.name,
      openingCash,
      totalCashSales: todayCashSales,
      totalCustomerCollection: todayCollection,
      otherCashIn: 0,
      totalExpenses: todayExpenses,
      totalSupplierPayment: 0,
      otherCashOut: 0,
      expectedClosingCash,
      actualPhysicalCash: data.actualPhysicalCash,
      variance,
      closedBy: `${currentUser.name} (${currentUser.role})`,
      notes: data.notes,
      closedAt: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    };

    setDailyClosings(prev => [record, ...prev]);
    logAudit('DAILY_CLOSING_PERFORMED', 'Cash', record.id, `Daily closing for ${branch.name}. Expected: ৳${expectedClosingCash}, Actual: ৳${data.actualPhysicalCash}, Variance: ৳${variance}`);

    return { success: true, closing: record };
  };

  // Add Product helper
  const addProduct = (productData: Omit<Product, 'id'>) => {
    const newId = `prod-${Date.now()}`;
    const newProduct: Product = {
      ...productData,
      id: newId
    };
    setProducts(prev => [newProduct, ...prev]);
    logAudit('PRODUCT_CREATED', 'Products', newId, `Added product ${productData.model} (${productData.brandName})`);
    return newProduct;
  };

  // Add Customer helper
  const addCustomer = (customerData: Omit<Customer, 'id' | 'currentDue' | 'totalPurchased' | 'totalPaid'>) => {
    const newId = `cust-${Date.now()}`;
    const newCustomer: Customer = {
      ...customerData,
      id: newId,
      currentDue: 0,
      totalPurchased: 0,
      totalPaid: 0
    };
    setCustomers(prev => [newCustomer, ...prev]);
    logAudit('CUSTOMER_CREATED', 'Customers', newId, `Added customer ${newCustomer.name} (${newCustomer.customerType})`);
    return newCustomer;
  };

  // Add Supplier helper
  const addSupplier = (supplierData: Omit<Supplier, 'id' | 'currentPayable' | 'totalPurchased' | 'totalPaid'>) => {
    const newId = `sup-${Date.now()}`;
    const newSupplier: Supplier = {
      ...supplierData,
      id: newId,
      currentPayable: 0,
      totalPurchased: 0,
      totalPaid: 0
    };
    setSuppliers(prev => [newSupplier, ...prev]);
    logAudit('SUPPLIER_CREATED', 'Suppliers', newId, `Added supplier ${newSupplier.name}`);
    return newSupplier;
  };

  // --- CRUD FUNCTIONS ---

  // 1. Product CRUD
  const updateProduct = (id: string, updated: Partial<Product>) => {
    setProducts(prev => prev.map(p => {
      if (p.id !== id) return p;
      return { ...p, ...updated };
    }));
    logAudit('PRODUCT_UPDATED', 'Products', id, `Updated product model / pricing`);
    return true;
  };

  const deleteProduct = (id: string) => {
    const prod = products.find(p => p.id === id);
    if (!prod) return { success: false, error: 'Product not found' };

    const totalStock = prod.variants.reduce((sum, v) => sum + v.currentStock, 0);
    const hasInStockImeis = imeis.some(im => im.productId === id && im.status === 'IN_STOCK');
    if (totalStock > 0 || hasInStockImeis) {
      return {
        success: false,
        error: `Cannot delete "${prod.brandName} ${prod.model}". There are still ${totalStock} physical units in stock.`
      };
    }

    setProducts(prev => prev.filter(p => p.id !== id));
    logAudit('PRODUCT_DELETED', 'Products', id, `Deleted product catalog model ${prod.model}`);
    return { success: true };
  };

  // 2. Customer CRUD
  const updateCustomer = (id: string, updated: Partial<Customer>) => {
    setCustomers(prev => prev.map(c => {
      if (c.id !== id) return c;
      return { ...c, ...updated };
    }));
    logAudit('CUSTOMER_UPDATED', 'Customers', id, `Updated customer profile info`);
    return true;
  };

  const deleteCustomer = (id: string) => {
    const cust = customers.find(c => c.id === id);
    if (!cust) return { success: false, error: 'Customer not found' };

    if (cust.currentDue > 0) {
      return {
        success: false,
        error: `Cannot delete ${cust.name}. An unpaid due balance of ৳${cust.currentDue.toLocaleString()} exists.`
      };
    }

    setCustomers(prev => prev.filter(c => c.id !== id));
    logAudit('CUSTOMER_DELETED', 'Customers', id, `Deleted customer ${cust.name}`);
    return { success: true };
  };

  // 3. Supplier CRUD
  const updateSupplier = (id: string, updated: Partial<Supplier>) => {
    setSuppliers(prev => prev.map(s => {
      if (s.id !== id) return s;
      return { ...s, ...updated };
    }));
    logAudit('SUPPLIER_UPDATED', 'Suppliers', id, `Updated supplier profile info`);
    return true;
  };

  const deleteSupplier = (id: string) => {
    const sup = suppliers.find(s => s.id === id);
    if (!sup) return { success: false, error: 'Supplier not found' };

    if (sup.currentPayable > 0) {
      return {
        success: false,
        error: `Cannot delete ${sup.name}. An outstanding payable balance of ৳${sup.currentPayable.toLocaleString()} exists.`
      };
    }

    setSuppliers(prev => prev.filter(s => s.id !== id));
    logAudit('SUPPLIER_DELETED', 'Suppliers', id, `Deleted supplier ${sup.name}`);
    return { success: true };
  };

  // 4. Expense CRUD
  const updateExpense = (id: string, updated: Partial<ExpenseRecord>) => {
    setExpenses(prev => prev.map(e => {
      if (e.id !== id) return e;
      const cat = updated.categoryId ? expenseCategories.find(c => c.id === updated.categoryId) : undefined;
      return {
        ...e,
        ...updated,
        categoryName: cat ? cat.name : e.categoryName
      };
    }));
    logAudit('EXPENSE_UPDATED', 'Expenses', id, `Updated expense voucher`);
    return true;
  };

  const deleteExpense = (id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
    logAudit('EXPENSE_DELETED', 'Expenses', id, `Deleted expense voucher`);
    return true;
  };

  // 5. Warranty Claims CRUD
  const updateWarrantyClaim = (id: string, updated: Partial<WarrantyClaim>) => {
    setWarrantyClaims(prev => prev.map(w => {
      if (w.id !== id) return w;
      return { ...w, ...updated };
    }));
    logAudit('WARRANTY_CLAIM_UPDATED', 'Warranty', id, `Updated warranty claim`);
    return true;
  };

  const deleteWarrantyClaim = (id: string) => {
    setWarrantyClaims(prev => prev.filter(w => w.id !== id));
    logAudit('WARRANTY_CLAIM_DELETED', 'Warranty', id, `Deleted warranty claim`);
    return true;
  };

  // 6. Cash & Bank Accounts CRUD
  const addCashAccount = (accountData: Omit<CashAccount, 'id'>) => {
    const newId = `cash-${Date.now()}`;
    const newAccount: CashAccount = {
      ...accountData,
      id: newId
    };
    setCashAccounts(prev => [...prev, newAccount]);
    logAudit('CASH_ACCOUNT_CREATED', 'CashBank', newId, `Added cash drawer ${newAccount.name}`);
    return newAccount;
  };

  const updateCashAccount = (id: string, updated: Partial<CashAccount>) => {
    setCashAccounts(prev => prev.map(a => {
      if (a.id !== id) return a;
      return { ...a, ...updated };
    }));
    logAudit('CASH_ACCOUNT_UPDATED', 'CashBank', id, `Updated cash drawer details`);
    return true;
  };

  const deleteCashAccount = (id: string) => {
    setCashAccounts(prev => prev.filter(a => a.id !== id));
    logAudit('CASH_ACCOUNT_DELETED', 'CashBank', id, `Deleted cash account`);
    return true;
  };

  const addBankAccount = (accountData: Omit<BankAccount, 'id'>) => {
    const newId = `bank-${Date.now()}`;
    const newAccount: BankAccount = {
      ...accountData,
      id: newId
    };
    setBankAccounts(prev => [...prev, newAccount]);
    logAudit('BANK_ACCOUNT_CREATED', 'CashBank', newId, `Added bank/MFS account ${newAccount.bankName} (${newAccount.accountNumber})`);
    return newAccount;
  };

  const updateBankAccount = (id: string, updated: Partial<BankAccount>) => {
    setBankAccounts(prev => prev.map(a => {
      if (a.id !== id) return a;
      return { ...a, ...updated };
    }));
    logAudit('BANK_ACCOUNT_UPDATED', 'CashBank', id, `Updated bank/MFS account details`);
    return true;
  };

  const deleteBankAccount = (id: string) => {
    setBankAccounts(prev => prev.filter(a => a.id !== id));
    logAudit('BANK_ACCOUNT_DELETED', 'CashBank', id, `Deleted bank account`);
    return true;
  };

  // 7. Quotations CRUD
  const updateQuotation = (id: string, updated: Partial<Quotation>) => {
    setQuotations(prev => prev.map(q => {
      if (q.id !== id) return q;
      return { ...q, ...updated };
    }));
    logAudit('QUOTATION_UPDATED', 'Sales', id, `Updated quotation`);
    return true;
  };

  const deleteQuotation = (id: string) => {
    setQuotations(prev => prev.filter(q => q.id !== id));
    logAudit('QUOTATION_DELETED', 'Sales', id, `Deleted quotation`);
    return true;
  };

  // 8. Void / Cancel Sales Invoice
  const voidSaleInvoice = (invoiceNo: string, reason?: string) => {
    const sale = sales.find(s => s.invoiceNo === invoiceNo);
    if (!sale) return { success: false, error: 'Sale invoice not found' };
    if (sale.status === 'CANCELLED') return { success: false, error: 'Invoice is already cancelled' };

    // Mark invoice cancelled
    setSales(prev => prev.map(s => s.invoiceNo === invoiceNo ? {
      ...s,
      status: 'CANCELLED',
      notes: `${s.notes ? s.notes + ' | ' : ''}CANCELLED: ${reason || 'Voided by user'}`
    } : s));

    // Restore sold IMEIs back to IN_STOCK
    const soldImeis = sale.items.flatMap(it => it.imeiList || []);
    if (soldImeis.length > 0) {
      setImeis(prev => prev.map(im => {
        if (soldImeis.includes(im.imei1)) {
          return {
            ...im,
            status: 'IN_STOCK',
            customerName: undefined,
            saleDate: undefined,
            saleInvoiceId: undefined
          };
        }
        return im;
      }));
    }

    // Restore product physical stock
    sale.items.forEach(it => {
      setProducts(prev => prev.map(p => {
        if (p.id !== it.productId) return p;
        return {
          ...p,
          variants: p.variants.map(v => {
            if (v.id !== it.variantId) return v;
            return { ...v, currentStock: v.currentStock + it.quantity };
          })
        };
      }));
    });

    // Reverse customer due if any
    if (sale.dueAmount > 0) {
      setCustomers(prev => prev.map(c => {
        if (c.id !== sale.customerId) return c;
        return {
          ...c,
          currentDue: Math.max(0, c.currentDue - sale.dueAmount),
          totalPurchased: Math.max(0, c.totalPurchased - sale.grandTotal)
        };
      }));
    }

    logAudit('SALE_INVOICE_CANCELLED', 'Sales', invoiceNo, `Voided invoice ${invoiceNo}. Restored ${soldImeis.length} devices to inventory. Reason: ${reason || 'User voided'}`);
    return { success: true };
  };

  // IMEI CRUD
  const updateIMEI = (imei1: string, updated: Partial<ProductIMEI>) => {
    setImeis(prev => prev.map(im => {
      if (im.imei1 !== imei1) return im;
      return { ...im, ...updated };
    }));
    logAudit('IMEI_UPDATED', 'IMEI', imei1, `Updated IMEI device details`);
    return true;
  };

  const deleteIMEI = (imei1: string) => {
    const im = imeis.find(i => i.imei1 === imei1);
    if (!im) return { success: false, error: 'IMEI not found' };
    if (im.status === 'SOLD') {
      return { success: false, error: 'Cannot delete sold IMEI. Please cancel the sale invoice first.' };
    }
    if (im.status === 'WARRANTY') {
      return { success: false, error: 'Cannot delete IMEI under active warranty claim.' };
    }

    setImeis(prev => prev.filter(i => i.imei1 !== imei1));
    // Decrement physical stock for corresponding variant
    setProducts(prev => prev.map(p => {
      if (p.id !== im.productId) return p;
      return {
        ...p,
        variants: p.variants.map(v => {
          if (v.id !== im.variantId) return v;
          return { ...v, currentStock: Math.max(0, v.currentStock - 1) };
        })
      };
    }));

    logAudit('IMEI_DELETED', 'IMEI', imei1, `Deleted in-stock IMEI device ${imei1} (${im.productName})`);
    return { success: true };
  };

  // Branch CRUD
  const addBranch = (branchData: Omit<Branch, 'id'>) => {
    const newId = `branch-${Date.now()}`;
    const newBranch: Branch = {
      ...branchData,
      id: newId
    };
    setBranches(prev => [...prev, newBranch]);
    logAudit('BRANCH_CREATED', 'Settings', newId, `Added new branch ${newBranch.name} (${newBranch.location})`);
    return newBranch;
  };

  const updateBranch = (id: string, updated: Partial<Branch>) => {
    setBranches(prev => prev.map(b => {
      if (b.id !== id) return b;
      return { ...b, ...updated };
    }));
    logAudit('BRANCH_UPDATED', 'Settings', id, `Updated branch details`);
    return true;
  };

  const deleteBranch = (id: string) => {
    if (branches.length <= 1) {
      return { success: false, error: 'At least one operational branch is required.' };
    }
    const hasImeis = imeis.some(im => im.branchId === id && im.status === 'IN_STOCK');
    if (hasImeis) {
      return { success: false, error: 'Cannot delete branch with active in-stock inventory. Transfer devices first.' };
    }
    setBranches(prev => prev.filter(b => b.id !== id));
    logAudit('BRANCH_DELETED', 'Settings', id, `Removed branch`);
    return { success: true };
  };

  // Brand CRUD
  const addBrand = (name: string, country: string = 'International') => {
    const newBrand: Brand = {
      id: `brand-${Date.now()}`,
      name: name.trim(),
      country: country.trim(),
      productCount: 0
    };
    setBrands(prev => [...prev, newBrand]);
    logAudit('BRAND_CREATED', 'Inventory', newBrand.id, `Added brand ${newBrand.name}`);
    return newBrand;
  };

  const deleteBrand = (id: string) => {
    const hasProducts = products.some(p => p.brandId === id);
    if (hasProducts) {
      return { success: false, error: 'Cannot delete brand that has catalog products.' };
    }
    setBrands(prev => prev.filter(b => b.id !== id));
    logAudit('BRAND_DELETED', 'Inventory', id, `Deleted brand`);
    return { success: true };
  };

  // Void Purchase Bill
  const voidPurchaseBill = (invoiceNo: string, reason?: string) => {
    const pur = purchases.find(p => p.invoiceNo === invoiceNo);
    if (!pur) return { success: false, error: 'Purchase bill not found' };
    if (pur.status === 'CANCELLED') return { success: false, error: 'Bill is already cancelled' };

    const purchasedImeis = pur.items.flatMap(it => (it.imeis || []).map(im => im.imei1));
    const soldFromThisBill = imeis.filter(im => purchasedImeis.includes(im.imei1) && im.status === 'SOLD');
    if (soldFromThisBill.length > 0) {
      return { 
        success: false, 
        error: `Cannot cancel purchase bill: ${soldFromThisBill.length} phone(s) from this bill have already been sold (e.g. ${soldFromThisBill[0].imei1}).` 
      };
    }

    setPurchases(prev => prev.map(p => p.invoiceNo === invoiceNo ? {
      ...p,
      status: 'CANCELLED',
      notes: `${p.notes ? p.notes + ' | ' : ''}CANCELLED: ${reason || 'Voided by user'}`
    } : p));

    if (purchasedImeis.length > 0) {
      setImeis(prev => prev.filter(im => !purchasedImeis.includes(im.imei1)));
    }

    pur.items.forEach(it => {
      setProducts(prev => prev.map(p => {
        if (p.id !== it.productId) return p;
        return {
          ...p,
          variants: p.variants.map(v => {
            if (v.id !== it.variantId) return v;
            return { ...v, currentStock: Math.max(0, v.currentStock - it.quantity) };
          })
        };
      }));
    });

    if (pur.dueAmount > 0) {
      setSuppliers(prev => prev.map(s => {
        if (s.id !== pur.supplierId) return s;
        return {
          ...s,
          currentPayable: Math.max(0, s.currentPayable - pur.dueAmount),
          totalPurchased: Math.max(0, s.totalPurchased - pur.grandTotal)
        };
      }));
    }

    logAudit('PURCHASE_BILL_CANCELLED', 'Procurement', invoiceNo, `Voided purchase bill ${invoiceNo}. Removed ${purchasedImeis.length} devices from stock. Reason: ${reason || 'Voided'}`);
    return { success: true };
  };

  // 9. QUOTATIONS
  const createQuotation = (data: {
    customerId: string;
    branchId: string;
    validUntil: string;
    items: any[];
    subtotal: number;
    discount: number;
    grandTotal: number;
    notes?: string;
  }) => {
    const cust = customers.find(c => c.id === data.customerId);
    const branch = branches.find(b => b.id === data.branchId) || branches[0];
    const quoteNo = `QT-2026-${String(quotations.length + 2).padStart(3, '0')}`;
    const today = new Date().toISOString().split('T')[0];

    const newQuote: Quotation = {
      id: `qt-${Date.now()}`,
      quoteNo,
      date: today,
      validUntil: data.validUntil || today,
      customerId: data.customerId,
      customerName: cust?.businessName || cust?.name || 'Customer',
      customerMobile: cust?.mobile || '',
      customerType: cust?.customerType || 'Wholesale Dealer',
      branchId: branch.id,
      branchName: branch.name,
      items: data.items,
      subtotal: data.subtotal,
      discount: data.discount,
      grandTotal: data.grandTotal,
      status: 'SENT',
      notes: data.notes
    };

    setQuotations(prev => [newQuote, ...prev]);
    logAudit('QUOTATION_CREATED', 'Sales', quoteNo, `Quotation ${quoteNo} generated for ${newQuote.customerName} (৳${data.grandTotal.toLocaleString()})`);
    return newQuote;
  };

  const convertQuotationToSale = (quoteId: string) => {
    const quote = quotations.find(q => q.id === quoteId);
    if (!quote) return { success: false, error: 'Quotation not found' };

    const saleRes = createSale({
      customerId: quote.customerId,
      items: quote.items,
      subtotal: quote.subtotal,
      discount: quote.discount,
      tax: 0,
      grandTotal: quote.grandTotal,
      paidAmount: quote.grandTotal, // Default counter settled
      dueAmount: 0,
      payments: [
        {
          id: `pmt-qt-${Date.now()}`,
          method: 'Cash',
          amount: quote.grandTotal,
          accountId: cashAccounts[0]?.id || '',
          accountName: cashAccounts[0]?.name || 'Counter Cash',
          date: new Date().toISOString().split('T')[0]
        }
      ],
      salesmanId: currentUser.id,
      branchId: quote.branchId,
      notes: `Converted from Quotation ${quote.quoteNo}`
    });

    if (saleRes.success) {
      setQuotations(prev => prev.map(q => q.id === quoteId ? { ...q, status: 'CONVERTED' } : q));
      logAudit('QUOTATION_CONVERTED', 'Sales', quote.quoteNo, `Quotation ${quote.quoteNo} converted to sale invoice ${saleRes.invoice?.invoiceNo}`);
    }

    return saleRes;
  };

  // 10. SALES RETURN
  const createSalesReturn = (data: {
    saleInvoiceNo: string;
    customerId: string;
    branchId: string;
    items: SalesReturnItem[];
    refundMethod: 'Cash' | 'Credit_Adjustment' | 'Bank';
    accountId?: string;
    notes?: string;
  }) => {
    const cust = customers.find(c => c.id === data.customerId);
    if (!cust) return { success: false, error: 'Customer not found' };

    const returnNo = `SRT-2026-${String(salesReturns.length + 2).padStart(3, '0')}`;
    const today = new Date().toISOString().split('T')[0];
    const totalRefund = data.items.reduce((acc, it) => acc + it.total, 0);
    const branch = branches.find(b => b.id === data.branchId) || branches[0];

    const newReturn: SalesReturn = {
      id: `sret-${Date.now()}`,
      returnNo,
      date: today,
      saleInvoiceNo: data.saleInvoiceNo,
      customerId: cust.id,
      customerName: cust.name,
      branchId: branch.id,
      branchName: branch.name,
      items: data.items,
      totalRefund,
      refundMethod: data.refundMethod,
      accountId: data.accountId,
      notes: data.notes
    };

    // 1. Revert restockable items/IMEIs
    data.items.forEach(it => {
      if (it.condition === 'RESTOCKABLE') {
        // Increase stock
        setProducts(prev => prev.map(p => {
          if (p.id !== it.productId) return p;
          return {
            ...p,
            variants: p.variants.map(v => {
              if (v.id !== it.variantId) return v;
              return { ...v, currentStock: v.currentStock + it.quantity };
            })
          };
        }));

        // Reset IMEI back to IN_STOCK
        if (it.imeiList.length > 0) {
          setImeis(prev => prev.map(im => {
            if (it.imeiList.includes(im.imei1)) {
              return {
                ...im,
                status: 'IN_STOCK',
                saleInvoiceId: undefined,
                customerId: undefined,
                customerName: undefined,
                salePrice: undefined
              };
            }
            return im;
          }));
        }
      } else {
        // Mark as WARRANTY / DEFECTIVE
        if (it.imeiList.length > 0) {
          setImeis(prev => prev.map(im => {
            if (it.imeiList.includes(im.imei1)) {
              return { ...im, status: 'RETURNED' };
            }
            return im;
          }));
        }
      }
    });

    // 2. Adjust customer ledger & due or cash
    if (data.refundMethod === 'Credit_Adjustment') {
      const newDue = Math.max(0, cust.currentDue - totalRefund);
      setCustomers(prev => prev.map(c => c.id === cust.id ? { ...c, currentDue: newDue } : c));
      setCustomerLedgers(prev => [
        ...prev,
        {
          id: `cld-ret-${Date.now()}`,
          customerId: cust.id,
          date: today,
          type: 'RETURN',
          referenceNo: returnNo,
          debit: 0,
          credit: totalRefund,
          balance: newDue,
          description: `Sales return against ${data.saleInvoiceNo}`
        }
      ]);
    } else {
      // Refunded via Cash/Bank
      const accId = data.accountId || cashAccounts[0]?.id;
      const isCash = cashAccounts.some(c => c.id === accId);
      if (isCash) {
        setCashAccounts(prev => prev.map(ca => ca.id === accId ? { ...ca, balance: ca.balance - totalRefund } : ca));
      } else {
        setBankAccounts(prev => prev.map(ba => ba.id === accId ? { ...ba, balance: ba.balance - totalRefund } : ba));
      }
    }

    // 3. Reversing Accounting Entry
    postJournalEntry('SALE', returnNo, `Sales Return ${returnNo} against invoice ${data.saleInvoiceNo}`, [
      {
        accountCode: '4010',
        accountName: 'Sales Returns & Allowances',
        debit: totalRefund,
        credit: 0
      },
      {
        accountCode: data.refundMethod === 'Credit_Adjustment' ? '1100' : '1010',
        accountName: data.refundMethod === 'Credit_Adjustment' ? 'Accounts Receivable' : 'Cash/Bank Refund',
        debit: 0,
        credit: totalRefund
      }
    ]);

    setSalesReturns(prev => [newReturn, ...prev]);
    logAudit('SALES_RETURN_PROCESSED', 'Sales', returnNo, `Processed return ${returnNo} (৳${totalRefund.toLocaleString()}) for invoice ${data.saleInvoiceNo}`);
    return { success: true, returnNo };
  };

  // 11. PURCHASE RETURN
  const createPurchaseReturn = (data: {
    purchaseInvoiceNo: string;
    supplierId: string;
    branchId: string;
    items: PurchaseReturnItem[];
    notes?: string;
  }) => {
    const sup = suppliers.find(s => s.id === data.supplierId);
    if (!sup) return { success: false, error: 'Supplier not found' };

    const returnNo = `PRT-2026-${String(purchaseReturns.length + 1).padStart(3, '0')}`;
    const today = new Date().toISOString().split('T')[0];
    const totalCredit = data.items.reduce((acc, it) => acc + it.total, 0);
    const branch = branches.find(b => b.id === data.branchId) || branches[0];

    const newPurReturn: PurchaseReturn = {
      id: `pret-${Date.now()}`,
      returnNo,
      date: today,
      purchaseInvoiceNo: data.purchaseInvoiceNo,
      supplierId: sup.id,
      supplierName: sup.name,
      branchId: branch.id,
      branchName: branch.name,
      items: data.items,
      totalCredit,
      notes: data.notes
    };

    // Deduct stock & mark IMEIs RETURNED
    data.items.forEach(it => {
      setProducts(prev => prev.map(p => {
        if (p.id !== it.productId) return p;
        return {
          ...p,
          variants: p.variants.map(v => {
            if (v.id !== it.variantId) return v;
            return { ...v, currentStock: Math.max(0, v.currentStock - it.quantity) };
          })
        };
      }));

      if (it.imeiList.length > 0) {
        setImeis(prev => prev.map(im => {
          if (it.imeiList.includes(im.imei1)) {
            return { ...im, status: 'RETURNED' };
          }
          return im;
        }));
      }
    });

    // Reduce supplier payable
    const newPayable = Math.max(0, sup.currentPayable - totalCredit);
    setSuppliers(prev => prev.map(s => s.id === sup.id ? { ...s, currentPayable: newPayable } : s));

    // Supplier ledger entry
    setSupplierLedgers(prev => [
      ...prev,
      {
        id: `sld-ret-${Date.now()}`,
        supplierId: sup.id,
        date: today,
        type: 'RETURN',
        referenceNo: returnNo,
        debit: totalCredit,
        credit: 0,
        balance: newPayable,
        description: `Purchase return to ${sup.name} against ${data.purchaseInvoiceNo}`
      }
    ]);

    // Reversing accounting entry
    postJournalEntry('PURCHASE', returnNo, `Purchase Return ${returnNo} to supplier ${sup.name}`, [
      {
        accountCode: '2010',
        accountName: 'Accounts Payable (Supplier Due)',
        debit: totalCredit,
        credit: 0
      },
      {
        accountCode: '1200',
        accountName: 'Merchandise Inventory',
        debit: 0,
        credit: totalCredit
      }
    ]);

    setPurchaseReturns(prev => [newPurReturn, ...prev]);
    logAudit('PURCHASE_RETURN_PROCESSED', 'Purchase', returnNo, `Returned stock (৳${totalCredit.toLocaleString()}) to ${sup.name}`);
    return { success: true, returnNo };
  };

  // 12. STOCK ADJUSTMENT
  const createStockAdjustment = (data: {
    branchId: string;
    productId: string;
    variantId: string;
    adjustmentType: 'ADD' | 'REMOVE';
    quantity: number;
    imeis: string[];
    reason: 'PHYSICAL_COUNT_DISCREPANCY' | 'DAMAGED' | 'THEFT_LOSS' | 'OTHER';
    notes?: string;
  }) => {
    const prod = products.find(p => p.id === data.productId);
    const variant = prod?.variants.find(v => v.id === data.variantId);
    if (!prod || !variant) return { success: false, error: 'Product variant not found' };

    const adjustmentNo = `ADJ-2026-${String(stockAdjustments.length + 2).padStart(3, '0')}`;
    const today = new Date().toISOString().split('T')[0];
    const costImpact = variant.purchasePrice * data.quantity;
    const branch = branches.find(b => b.id === data.branchId) || branches[0];

    const newAdj: StockAdjustment = {
      id: `adj-${Date.now()}`,
      adjustmentNo,
      date: today,
      branchId: branch.id,
      branchName: branch.name,
      productId: prod.id,
      variantId: variant.id,
      productName: `${prod.brandName} ${prod.model}`,
      adjustmentType: data.adjustmentType,
      quantity: data.quantity,
      imeis: data.imeis,
      reason: data.reason,
      costImpact,
      approvedBy: `${currentUser.name} (${currentUser.role})`,
      notes: data.notes
    };

    // Update product stock
    setProducts(prev => prev.map(p => {
      if (p.id !== prod.id) return p;
      return {
        ...p,
        variants: p.variants.map(v => {
          if (v.id !== variant.id) return v;
          const newQty = data.adjustmentType === 'ADD' 
            ? v.currentStock + data.quantity 
            : Math.max(0, v.currentStock - data.quantity);
          return { ...v, currentStock: newQty };
        })
      };
    }));

    // Post accounting loss/gain
    postJournalEntry('MANUAL', adjustmentNo, `Stock Adjustment: ${data.reason} (${data.adjustmentType} ${data.quantity} units)`, [
      {
        accountCode: data.adjustmentType === 'REMOVE' ? '5130' : '1200',
        accountName: data.adjustmentType === 'REMOVE' ? 'Inventory Loss / Discrepancy' : 'Merchandise Inventory',
        debit: costImpact,
        credit: 0
      },
      {
        accountCode: data.adjustmentType === 'REMOVE' ? '1200' : '5130',
        accountName: data.adjustmentType === 'REMOVE' ? 'Merchandise Inventory' : 'Inventory Loss / Discrepancy',
        debit: 0,
        credit: costImpact
      }
    ]);

    setStockAdjustments(prev => [newAdj, ...prev]);
    logAudit('STOCK_ADJUSTMENT_POSTED', 'Inventory', adjustmentNo, `${data.adjustmentType} ${data.quantity} units (${data.reason}) with cost impact ৳${costImpact.toLocaleString()}`);
    return { success: true, adjustmentNo };
  };

  // 13. EXPORT ALL BUSINESS DATA
  const exportAllBusinessData = () => {
    const backupData = {
      businessConfig,
      businessType,
      exportDate: new Date().toISOString(),
      branches,
      products,
      imeis,
      customers,
      suppliers,
      cashAccounts,
      bankAccounts,
      sales,
      purchases,
      quotations,
      salesReturns,
      purchaseReturns,
      stockAdjustments,
      warrantyClaims,
      expenses,
      dailyClosings,
      chartOfAccounts,
      journalEntries,
      auditLogs
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `MOBILE_DERP_BACKUP_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    logAudit('DATA_BACKUP_EXPORTED', 'Settings', 'BACKUP', 'Exported comprehensive database snapshot to JSON file');
  };

  // Reset to Demo Data
  const resetToDemoData = () => {
    localStorage.clear();
    setBusinessConfig(initialBusinessConfig);
    setBusinessType('RETAIL_WHOLESALE');
    setBrands(initialBrands);
    setCategories(initialCategories);
    setProducts(initialProducts);
    setImeis(initialImeis);
    setCustomers(initialCustomers);
    setSuppliers(initialSuppliers);
    setCashAccounts(initialCashAccounts);
    setBankAccounts(initialBankAccounts);
    setAccountTransactions([]);
    setExpenseCategories(initialExpenseCategories);
    setExpenses(initialExpenses);
    setSales(initialSales);
    setPurchases(initialPurchases);
    setQuotations(initialQuotations);
    setSalesReturns(initialSalesReturns);
    setPurchaseReturns(initialPurchaseReturns);
    setStockTransfers([]);
    setStockAdjustments(initialStockAdjustments);
    setWarrantyClaims(initialWarrantyClaims);
    setDailyClosings(initialDailyClosings);
    setChartOfAccounts(initialChartOfAccounts);
    setJournalEntries([]);
    setCustomerLedgers(initialCustomerLedger);
    setSupplierLedgers(initialSupplierLedger);
    setAuditLogs(initialAuditLogs);
    setCurrentUser(initialUsers[0]);
  };

  // Global search
  const globalSearch = (query: string) => {
    const q = query.trim().toLowerCase();
    if (!q) return { imeis: [], customers: [], invoices: [], products: [] };

    return {
      imeis: imeis.filter(i => 
        i.imei1.includes(q) || 
        (i.imei2 && i.imei2.includes(q)) || 
        (i.serialNumber && i.serialNumber.toLowerCase().includes(q)) ||
        i.productName.toLowerCase().includes(q)
      ).slice(0, 10),
      customers: customers.filter(c => 
        c.name.toLowerCase().includes(q) || 
        c.mobile.includes(q) || 
        (c.businessName && c.businessName.toLowerCase().includes(q))
      ).slice(0, 8),
      invoices: sales.filter(s => 
        s.invoiceNo.toLowerCase().includes(q) || 
        s.customerName.toLowerCase().includes(q) ||
        s.customerMobile.includes(q)
      ).slice(0, 8),
      products: products.filter(p => 
        p.model.toLowerCase().includes(q) || 
        p.brandName.toLowerCase().includes(q)
      ).slice(0, 8)
    };
  };

  return (
    <ERPContext.Provider value={{
      businessConfig,
      updateBusinessConfig,
      businessType,
      setBusinessType,
      currentUser,
      setCurrentUser,
      currentBranchId,
      setCurrentBranchId,
      currentBranchName,
      language,
      setLanguage,
      branches,
      users,
      brands,
      categories,
      products,
      imeis,
      customers,
      suppliers,
      cashAccounts,
      bankAccounts,
      accountTransactions,
      expenseCategories,
      expenses,
      sales,
      purchases,
      quotations,
      salesReturns,
      purchaseReturns,
      stockTransfers,
      stockAdjustments,
      warrantyClaims,
      dailyClosings,
      chartOfAccounts,
      journalEntries,
      customerLedgers,
      supplierLedgers,
      auditLogs,
      createSale,
      createPurchase,
      createQuotation,
      convertQuotationToSale,
      createSalesReturn,
      createPurchaseReturn,
      createStockAdjustment,
      exportAllBusinessData,
      receiveCustomerPayment,
      paySupplier,
      createExpense,
      createStockTransfer,
      createWarrantyClaim,
      updateWarrantyStatus,
      performDailyClosing,
      addProduct,
      updateProduct,
      deleteProduct,
      addCustomer,
      updateCustomer,
      deleteCustomer,
      addSupplier,
      updateSupplier,
      deleteSupplier,
      updateExpense,
      deleteExpense,
      updateWarrantyClaim,
      deleteWarrantyClaim,
      addCashAccount,
      updateCashAccount,
      deleteCashAccount,
      addBankAccount,
      updateBankAccount,
      deleteBankAccount,
      updateQuotation,
      deleteQuotation,
      voidSaleInvoice,
      updateIMEI,
      deleteIMEI,
      addBranch,
      updateBranch,
      deleteBranch,
      addBrand,
      deleteBrand,
      voidPurchaseBill,
      resetToDemoData,
      globalSearch
    }}>
      {children}
    </ERPContext.Provider>
  );
};

export const useERP = () => {
  const context = useContext(ERPContext);
  if (!context) {
    throw new Error('useERP must be used within an ERPProvider');
  }
  return context;
};

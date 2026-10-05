import JSZip from 'jszip';
import { 
  Product, ProductIMEI, SaleInvoice, Customer, Supplier, 
  Expense, CashAccount, BankAccount, JournalEntry, AuditLog,
  Branch, Brand, Category, ExpenseCategory, BusinessConfig
} from '../types/erp';

// Helper to escape values safely for CSV
function sanitizeCsvValue(val: unknown): string {
  if (val === undefined || val === null) return '""';
  if (typeof val === 'object') {
    const jsonStr = JSON.stringify(val).replace(/"/g, '""');
    return `"${jsonStr}"`;
  }
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
}

// Convert headers and rows into CSV string with UTF-8 BOM
export function generateCsvString(headers: string[], rows: (string | number | boolean | null | undefined)[][]): string {
  const headerLine = headers.map(sanitizeCsvValue).join(',');
  const rowLines = rows.map(r => r.map(sanitizeCsvValue).join(','));
  return '\uFEFF' + [headerLine, ...rowLines].join('\r\n');
}

export interface FullErpDatabaseSnapshot {
  businessConfig: BusinessConfig;
  branches: Branch[];
  brands: Brand[];
  categories: Category[];
  products: Product[];
  imeis: ProductIMEI[];
  customers: Customer[];
  suppliers: Supplier[];
  expenses: Expense[];
  expenseCategories: ExpenseCategory[];
  cashAccounts: CashAccount[];
  bankAccounts: BankAccount[];
  sales: SaleInvoice[];
  journalEntries: JournalEntry[];
  auditLogs: AuditLog[];
}

export function buildProductsCsv(products: Product[]): string {
  const headers = ['Product ID', 'Brand', 'Model / Title', 'Category', 'Purchase Cost', 'Retail Price', 'Total Stock', 'Reorder Level', 'Warranty Months', 'Description'];
  const rows = products.map(p => {
    const totalStock = p.variants?.reduce((sum, v) => sum + (v.currentStock || 0), 0) ?? 0;
    const baseCost = p.variants?.[0]?.purchasePrice ?? 0;
    const baseSale = p.variants?.[0]?.retailPrice ?? 0;
    return [
      p.id,
      p.brandName,
      p.model,
      p.category,
      baseCost,
      baseSale,
      totalStock,
      p.reorderLevel ?? 5,
      p.warrantyMonths ?? 0,
      p.description || ''
    ];
  });
  return generateCsvString(headers, rows);
}

export function buildImeisCsv(imeis: ProductIMEI[]): string {
  const headers = ['IMEI 1', 'IMEI 2', 'Product ID', 'Product Name', 'Variant / Spec', 'Purchase Cost', 'Sale Price', 'Status', 'Branch ID', 'Supplier Name', 'Purchase Date', 'Sale Date', 'Customer Name', 'Notes'];
  const rows = imeis.map(i => [
    i.imei1,
    i.imei2 || '',
    i.productId,
    i.productName,
    i.variantName,
    i.purchaseCost,
    i.salePrice || '',
    i.status,
    i.branchId,
    i.supplierName || '',
    i.purchaseDate || '',
    i.saleDate || '',
    i.customerName || '',
    i.notes || ''
  ]);
  return generateCsvString(headers, rows);
}

export function buildSalesCsv(sales: SaleInvoice[]): string {
  const headers = ['Invoice No', 'Date', 'Customer Name', 'Customer Mobile', 'Branch Name', 'Items Summary', 'Subtotal', 'Discount', 'Tax', 'Grand Total', 'Paid Amount', 'Due Balance', 'Payment Methods', 'Salesman', 'Status'];
  const rows = sales.map(s => {
    const itemsSummary = s.items.map(it => `${it.productName} (x${it.quantity})`).join('; ');
    const paymentMethods = s.payments?.map(p => `${p.method}: ${p.amount}`).join('; ') || 'N/A';
    return [
      s.invoiceNo,
      s.date,
      s.customerName,
      s.customerMobile,
      s.branchName,
      itemsSummary,
      s.subtotal,
      s.discount,
      s.tax,
      s.grandTotal,
      s.paidAmount,
      s.dueAmount,
      paymentMethods,
      s.salesmanName,
      s.status
    ];
  });
  return generateCsvString(headers, rows);
}

export function buildCustomersCsv(customers: Customer[]): string {
  const headers = ['Customer ID', 'Full Name', 'Business / Shop Name', 'Mobile / Phone', 'Alt Mobile', 'Address', 'Total Purchases', 'Total Paid', 'Current Due Balance', 'Credit Limit', 'Customer Type', 'Status'];
  const rows = customers.map(c => [
    c.id,
    c.name,
    c.businessName || '',
    c.mobile,
    c.altMobile || '',
    c.address || '',
    c.totalPurchased || 0,
    c.totalPaid || 0,
    c.currentDue,
    c.creditLimit || 0,
    c.customerType,
    c.status
  ]);
  return generateCsvString(headers, rows);
}

export function buildSuppliersCsv(suppliers: Supplier[]): string {
  const headers = ['Supplier ID', 'Supplier Name', 'Company Name', 'Contact Person', 'Mobile / Contact', 'Address', 'Total Purchased', 'Total Paid', 'Current Payable Balance', 'Status'];
  const rows = suppliers.map(s => [
    s.id,
    s.name,
    s.company,
    s.contactPerson,
    s.mobile,
    s.address || '',
    s.totalPurchased || 0,
    s.totalPaid || 0,
    s.currentPayable,
    s.status
  ]);
  return generateCsvString(headers, rows);
}

export function buildExpensesCsv(expenses: Expense[]): string {
  const headers = ['Expense ID', 'Date', 'Expense Category', 'Amount', 'Paid From Account', 'Branch Name', 'Recipient', 'Description', 'Voucher No', 'Approved By'];
  const rows = expenses.map(e => [
    e.id,
    e.date,
    e.categoryName,
    e.amount,
    e.paidFromAccountName,
    e.branchName,
    e.recipient || '',
    e.description,
    e.voucherNo || '',
    e.approvedBy || ''
  ]);
  return generateCsvString(headers, rows);
}

export function buildCashBankCsv(cashAccounts: CashAccount[], bankAccounts: BankAccount[]): string {
  const headers = ['Account Type', 'Account Name', 'Bank / Details', 'Branch ID', 'Account Classification', 'Current Balance (BDT)'];
  const rows = [
    ...cashAccounts.map(c => ['CASH', c.name, 'Drawer Cash', c.branchId, c.type, c.balance]),
    ...bankAccounts.map(b => ['BANK / MFS', b.accountName, `${b.bankName} - ${b.accountNumber}`, b.branchName, b.type, b.balance])
  ];
  return generateCsvString(headers, rows);
}

export function buildAuditLogsCsv(auditLogs: AuditLog[]): string {
  const headers = ['Log ID', 'Timestamp', 'User Name', 'User Role', 'Action Code', 'Module', 'Record Reference', 'Action Details'];
  const rows = auditLogs.map(a => [
    a.id,
    a.timestamp,
    a.userName,
    a.userRole,
    a.action,
    a.module,
    a.recordId,
    a.details
  ]);
  return generateCsvString(headers, rows);
}

/**
 * Downloads an entire database as a bundled ZIP file containing individual CSV files for every table
 */
export async function exportDatabaseToCsvZip(db: FullErpDatabaseSnapshot, baseName = 'MOBILE_DERP_CSV_BACKUP'): Promise<void> {
  const zip = new JSZip();
  const dateStr = new Date().toISOString().split('T')[0];

  // 1. Generate individual CSVs
  const productsCsv = buildProductsCsv(db.products);
  const imeisCsv = buildImeisCsv(db.imeis);
  const salesCsv = buildSalesCsv(db.sales);
  const customersCsv = buildCustomersCsv(db.customers);
  const suppliersCsv = buildSuppliersCsv(db.suppliers);
  const expensesCsv = buildExpensesCsv(db.expenses);
  const accountsCsv = buildCashBankCsv(db.cashAccounts, db.bankAccounts);
  const auditLogsCsv = buildAuditLogsCsv(db.auditLogs);

  // 2. Add to Zip archive
  zip.file('1_Products_Catalog.csv', productsCsv);
  zip.file('2_IMEI_Device_Inventory.csv', imeisCsv);
  zip.file('3_Sales_Invoices.csv', salesCsv);
  zip.file('4_Customers_Directory_and_Dues.csv', customersCsv);
  zip.file('5_Suppliers_Ledger_and_Payables.csv', suppliersCsv);
  zip.file('6_Expenses_Register.csv', expensesCsv);
  zip.file('7_Cash_and_Bank_Accounts.csv', accountsCsv);
  zip.file('8_System_Audit_Logs.csv', auditLogsCsv);

  // 3. Add Readme summary
  const summaryText = `========================================================
MOBILE D-ERP DATABASE BACKUP (CSV ARCHIVE)
========================================================
Business: ${db.businessConfig?.name || 'Mobile Showroom'}
Tagline: ${db.businessConfig?.tagline || 'Mobile Management ERP'}
Phone: ${db.businessConfig?.phone || 'N/A'}
Export Date: ${new Date().toLocaleString()}
Database Tables Included:
- Products: ${db.products.length} records
- IMEI Devices: ${db.imeis.length} devices
- Sales Invoices: ${db.sales.length} transactions
- Customers: ${db.customers.length} customer records
- Suppliers: ${db.suppliers.length} vendor accounts
- Expenses: ${db.expenses.length} expense vouchers
- Cash & Bank Accounts: ${db.cashAccounts.length + db.bankAccounts.length} accounts
- Audit Logs: ${db.auditLogs.length} events logged

Encoding: UTF-8 with BOM (Opens directly in MS Excel & Google Sheets without garbled Bengali text).
Safe for local offline archiving and financial audits.
========================================================`;
  zip.file('README_BACKUP_SUMMARY.txt', summaryText);

  // 4. Generate Blob and trigger download
  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${baseName}_${dateStr}.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Downloads a single consolidated CSV file with all tables separated by clean header blocks
 */
export function exportConsolidatedDatabaseCsv(db: FullErpDatabaseSnapshot, baseName = 'MOBILE_DERP_CONSOLIDATED'): void {
  const dateStr = new Date().toISOString().split('T')[0];
  const now = new Date().toLocaleString();

  const sections: string[] = [
    `=== MOBILE D-ERP CONSOLIDATED DATABASE EXPORT ===`,
    `Business: ${db.businessConfig?.name || 'Mobile Showroom'} | Export Date: ${now}`,
    `\r\n=== 1. PRODUCTS CATALOG (${db.products.length} ITEMS) ===`,
    buildProductsCsv(db.products),
    `\r\n=== 2. IMEI INVENTORY (${db.imeis.length} DEVICES) ===`,
    buildImeisCsv(db.imeis),
    `\r\n=== 3. SALES INVOICES (${db.sales.length} TRANSACTIONS) ===`,
    buildSalesCsv(db.sales),
    `\r\n=== 4. CUSTOMER DIRECTORY & DUES (${db.customers.length} CUSTOMERS) ===`,
    buildCustomersCsv(db.customers),
    `\r\n=== 5. SUPPLIERS & PAYABLES (${db.suppliers.length} SUPPLIERS) ===`,
    buildSuppliersCsv(db.suppliers),
    `\r\n=== 6. EXPENSES (${db.expenses.length} ENTRIES) ===`,
    buildExpensesCsv(db.expenses),
    `\r\n=== 7. CASH & BANK ACCOUNTS ===`,
    buildCashBankCsv(db.cashAccounts, db.bankAccounts)
  ];

  const fullContent = '\uFEFF' + sections.join('\r\n\r\n');
  const blob = new Blob([fullContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${baseName}_${dateStr}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Download single table CSV helper
 */
export function downloadSingleCsv(csvString: string, filename: string): void {
  const dateStr = new Date().toISOString().split('T')[0];
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}_${dateStr}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export type BusinessType = 'RETAIL' | 'WHOLESALE' | 'RETAIL_WHOLESALE';

export type UserRole = 
  | 'Super Admin'
  | 'Business Owner'
  | 'Manager'
  | 'Accountant'
  | 'Salesman'
  | 'Store Keeper';

export type CustomerType = 
  | 'Retail Customer'
  | 'Retail Shop'
  | 'Wholesale Dealer'
  | 'Sub Dealer'
  | 'Corporate Customer'
  | 'VIP Customer';

export type PriceLevel = 'retail' | 'wholesale' | 'dealer' | 'special';

export type PaymentMethod = 
  | 'Cash'
  | 'Bank'
  | 'bKash'
  | 'Nagad'
  | 'Rocket'
  | 'Card'
  | 'Cheque';

export type ImeiStatus = 
  | 'PURCHASED'
  | 'IN_STOCK'
  | 'RESERVED'
  | 'SOLD'
  | 'RETURNED'
  | 'WARRANTY';

export type WarrantyStatus = 'ACTIVE' | 'EXPIRED' | 'CLAIMED' | 'SERVICED';

export type TransferStatus = 'DRAFT' | 'DISPATCHED' | 'RECEIVED' | 'CANCELLED';

export interface Branch {
  id: string;
  name: string;
  code: string;
  type: 'BRANCH' | 'WAREHOUSE' | 'HEAD_OFFICE';
  location: string;
  contact: string;
  isDefault?: boolean;
}

export interface User {
  id: string;
  name: string;
  username: string;
  role: UserRole;
  branchId: string;
  phone: string;
  email: string;
}

export interface Brand {
  id: string;
  name: string;
  country: string;
  logo?: string;
  productCount?: number;
}

export interface Category {
  id: string;
  name: string;
  hasImei: boolean; // e.g. phones have IMEI, chargers/cables use barcode/qty
}

export interface ProductVariant {
  id: string;
  ram?: string;
  storage?: string;
  color: string;
  sku: string;
  purchasePrice: number;
  wholesalePrice: number;
  dealerPrice: number;
  retailPrice: number;
  minSellingPrice: number;
  currentStock: number;
}

export interface Product {
  id: string;
  brandId: string;
  brandName: string;
  model: string;
  category: string;
  hasImei: boolean;
  warrantyMonths: number;
  reorderLevel: number;
  variants: ProductVariant[];
  description?: string;
}

export interface ProductIMEI {
  imei1: string;
  imei2?: string;
  serialNumber?: string;
  productId: string;
  variantId: string;
  productName: string;
  variantName: string;
  purchaseInvoiceId: string;
  purchaseCost: number; // Includes allocated landed cost
  supplierId: string;
  supplierName: string;
  purchaseDate: string;
  branchId: string;
  branchName: string;
  status: ImeiStatus;
  saleInvoiceId?: string;
  customerId?: string;
  customerName?: string;
  saleDate?: string;
  salePrice?: number;
  warrantyExpiryDate?: string;
  notes?: string;
}

export interface Customer {
  id: string;
  name: string;
  businessName?: string;
  mobile: string;
  altMobile?: string;
  address: string;
  nid?: string;
  tradeLicense?: string;
  customerType: CustomerType;
  priceLevel: PriceLevel;
  creditLimit: number;
  currentDue: number;
  totalPurchased: number;
  totalPaid: number;
  status: 'ACTIVE' | 'BLOCKED';
  notes?: string;
}

export interface Supplier {
  id: string;
  name: string;
  company: string;
  contactPerson: string;
  mobile: string;
  address: string;
  bankInfo?: string;
  currentPayable: number;
  totalPurchased: number;
  totalPaid: number;
  status: 'ACTIVE' | 'INACTIVE';
  notes?: string;
}

export interface SaleItem {
  productId: string;
  variantId: string;
  productName: string;
  variantName: string;
  imeiList: string[]; // for phones: each item corresponds to 1 IMEI
  quantity: number;
  unitPrice: number;
  unitCost: number;
  discount: number;
  total: number;
}

export interface PaymentRecord {
  id: string;
  method: PaymentMethod;
  amount: number;
  accountId: string;
  accountName: string;
  trxId?: string;
  phoneOrRef?: string;
  date: string;
}

export interface SaleInvoice {
  id: string;
  invoiceNo: string;
  date: string;
  customerId: string;
  customerName: string;
  customerMobile: string;
  customerType: CustomerType;
  branchId: string;
  branchName: string;
  salesmanId: string;
  salesmanName: string;
  items: SaleItem[];
  subtotal: number;
  discount: number;
  tax: number;
  grandTotal: number;
  paidAmount: number;
  dueAmount: number;
  totalCost: number;
  grossProfit: number;
  payments: PaymentRecord[];
  status: 'COMPLETED' | 'RETURNED_PARTIAL' | 'RETURNED_FULL' | 'CANCELLED';
  notes?: string;
}

export interface PurchaseLandedCost {
  transport: number;
  courier: number;
  handling: number;
  other: number;
}

export interface PurchaseItem {
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
}

export interface PurchaseInvoice {
  id: string;
  invoiceNo: string;
  supplierInvoiceNo: string;
  date: string;
  supplierId: string;
  supplierName: string;
  branchId: string;
  branchName: string;
  items: PurchaseItem[];
  subtotal: number;
  landedCost: PurchaseLandedCost;
  totalLandedCost: number;
  grandTotal: number;
  paidAmount: number;
  dueAmount: number;
  payments: PaymentRecord[];
  status: 'RECEIVED' | 'RETURNED' | 'CANCELLED';
  notes?: string;
}

export interface CashAccount {
  id: string;
  name: string;
  branchId: string;
  balance: number;
  type: 'COUNTER_CASH' | 'MAIN_CASH' | 'PETTY_CASH';
}

export interface BankAccount {
  id: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  branchName: string;
  routingNumber?: string;
  balance: number;
  type: 'BANK' | 'BKASH_MERCHANT' | 'NAGAD_MERCHANT' | 'ROCKET';
}

export interface AccountTransaction {
  id: string;
  date: string;
  accountId: string;
  accountName: string;
  accountType: 'CASH' | 'BANK' | 'MFS';
  type: 'IN' | 'OUT';
  amount: number;
  category: string;
  referenceType: 'SALE' | 'PURCHASE' | 'CUSTOMER_PAYMENT' | 'SUPPLIER_PAYMENT' | 'EXPENSE' | 'TRANSFER' | 'ADJUSTMENT';
  referenceId: string;
  description: string;
  balanceAfter: number;
}

export interface ExpenseCategory {
  id: string;
  name: string;
  nameBn: string;
}

export interface Expense {
  id: string;
  date: string;
  categoryId: string;
  categoryName: string;
  amount: number;
  branchId: string;
  branchName: string;
  paidFromAccountId: string;
  paidFromAccountName: string;
  recipient: string;
  description: string;
  voucherNo?: string;
  approvedBy?: string;
}

export type ExpenseRecord = Expense;

export interface StockTransfer {
  id: string;
  transferNo: string;
  date: string;
  fromBranchId: string;
  fromBranchName: string;
  toBranchId: string;
  toBranchName: string;
  productId: string;
  variantId: string;
  productName: string;
  imeis: string[];
  quantity: number;
  status: TransferStatus;
  notes?: string;
}

export interface WarrantyClaim {
  id: string;
  claimNo: string;
  date: string;
  imei: string;
  productName: string;
  customerName: string;
  customerPhone: string;
  problemDescription: string;
  status: 'PENDING' | 'IN_REPAIR' | 'REPLACED' | 'DELIVERED' | 'REJECTED';
  resolutionNotes?: string;
  receivedDate: string;
  completionDate?: string;
}

export interface DailyClosingRecord {
  id: string;
  date: string;
  branchId: string;
  branchName: string;
  openingCash: number;
  totalCashSales: number;
  totalCustomerCollection: number;
  otherCashIn: number;
  totalExpenses: number;
  totalSupplierPayment: number;
  otherCashOut: number;
  expectedClosingCash: number;
  actualPhysicalCash: number;
  variance: number; // actual - expected
  closedBy: string;
  notes?: string;
  closedAt: string;
}

export interface ChartOfAccount {
  code: string;
  name: string;
  type: 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'EXPENSE';
  balance: number;
  normalBalance: 'DEBIT' | 'CREDIT';
}

export interface JournalEntryItem {
  accountCode: string;
  accountName: string;
  debit: number;
  credit: number;
}

export interface JournalEntry {
  id: string;
  entryNo: string;
  date: string;
  referenceType: 'SALE' | 'PURCHASE' | 'PAYMENT' | 'EXPENSE' | 'CLOSING' | 'MANUAL';
  referenceId: string;
  description: string;
  items: JournalEntryItem[];
  totalAmount: number;
}

export interface CustomerLedgerEntry {
  id: string;
  customerId: string;
  date: string;
  type: 'SALE' | 'PAYMENT' | 'RETURN' | 'OPENING';
  referenceNo: string;
  debit: number; // increases due
  credit: number; // decreases due
  balance: number;
  description: string;
}

export interface SupplierLedgerEntry {
  id: string;
  supplierId: string;
  date: string;
  type: 'PURCHASE' | 'PAYMENT' | 'RETURN' | 'OPENING';
  referenceNo: string;
  debit: number; // decreases payable
  credit: number; // increases payable
  balance: number;
  description: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userName: string;
  userRole: UserRole;
  action: string;
  module: string;
  recordId: string;
  details: string;
}

export interface BusinessConfig {
  name: string;
  tagline: string;
  type: BusinessType;
  currency: string;
  phone: string;
  altPhone: string;
  email: string;
  address: string;
  tradeLicense: string;
  taxNumber: string;
  invoicePrefix: string;
  invoiceFooterNote: string;
  warrantyTerms: string;
}

export interface Quotation {
  id: string;
  quoteNo: string;
  date: string;
  validUntil: string;
  customerId: string;
  customerName: string;
  customerMobile: string;
  customerType: CustomerType;
  branchId: string;
  branchName: string;
  items: SaleItem[];
  subtotal: number;
  discount: number;
  grandTotal: number;
  status: 'DRAFT' | 'SENT' | 'CONVERTED' | 'EXPIRED';
  notes?: string;
}

export interface SalesReturnItem {
  productId: string;
  variantId: string;
  productName: string;
  variantName: string;
  quantity: number;
  refundRate: number;
  imeiList: string[];
  condition: 'RESTOCKABLE' | 'DEFECTIVE_SERVICE';
  total: number;
}

export interface SalesReturn {
  id: string;
  returnNo: string;
  date: string;
  saleInvoiceNo: string;
  customerId: string;
  customerName: string;
  branchId: string;
  branchName: string;
  items: SalesReturnItem[];
  totalRefund: number;
  refundMethod: 'Cash' | 'Credit_Adjustment' | 'Bank';
  accountId?: string;
  notes?: string;
}

export interface PurchaseReturnItem {
  productId: string;
  variantId: string;
  productName: string;
  variantName: string;
  quantity: number;
  returnRate: number;
  imeiList: string[];
  reason: string;
  total: number;
}

export interface PurchaseReturn {
  id: string;
  returnNo: string;
  date: string;
  purchaseInvoiceNo: string;
  supplierId: string;
  supplierName: string;
  branchId: string;
  branchName: string;
  items: PurchaseReturnItem[];
  totalCredit: number;
  notes?: string;
}

export interface StockAdjustment {
  id: string;
  adjustmentNo: string;
  date: string;
  branchId: string;
  branchName: string;
  productId: string;
  variantId: string;
  productName: string;
  adjustmentType: 'ADD' | 'REMOVE';
  quantity: number;
  imeis: string[];
  reason: 'PHYSICAL_COUNT_DISCREPANCY' | 'DAMAGED' | 'THEFT_LOSS' | 'OTHER';
  costImpact: number;
  approvedBy: string;
  notes?: string;
}


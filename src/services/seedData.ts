import { 
  Branch, User, Brand, Category, Product, ProductIMEI, Customer, Supplier,
  CashAccount, BankAccount, ExpenseCategory, Expense, SaleInvoice,
  PurchaseInvoice, ChartOfAccount, JournalEntry, CustomerLedgerEntry,
  SupplierLedgerEntry, AuditLog, DailyClosingRecord, BusinessConfig, WarrantyClaim,
  Quotation, SalesReturn, PurchaseReturn, StockAdjustment
} from '../types/erp';

export const initialBusinessConfig: BusinessConfig = {
  name: 'MOBILE D-ERP BANGLADESH',
  tagline: 'মোবাইল ব্যবসার সম্পূর্ণ ডিজিটাল ব্যবস্থাপনা',
  type: 'RETAIL_WHOLESALE',
  currency: '৳',
  phone: '+880 1711-234567',
  altPhone: '+880 1819-876543',
  email: 'info@mobiled-erp.com.bd',
  address: 'Shop 42-45, Level 5, Block B, Bashundhara City Shopping Mall, Panthapath, Dhaka-1215',
  tradeLicense: 'TRAD/DNCC/024819/2024',
  taxNumber: 'BIN-002849102-0101',
  invoicePrefix: 'INV-2026-',
  invoiceFooterNote: 'ধন্যবাদ আবার আসবেন। ওয়ারেন্টি দাবির জন্য অবশ্যই অরিজিনাল ক্যাশ মেমো ও আইএমইআই মিলিয়ে আনতে হবে।',
  warrantyTerms: '৭ দিনের মধ্যে রিপ্লেসমেন্ট এবং ১ বছরের অফিশিয়াল ব্র্যান্ড সার্ভিস ওয়ারেন্টি প্রযোজ্য। পানির ক্ষতি বা ডিসপ্লে ভাঙলে ওয়ারেন্টি গ্রহণযোগ্য নয়।'
};

export const initialBranches: Branch[] = [
  {
    id: 'br-01',
    name: 'Bashundhara City Branch',
    code: 'BC-01',
    type: 'BRANCH',
    location: 'Shop 45, Level 5, Block B, Bashundhara City, Dhaka',
    contact: '01711-234567',
    isDefault: true
  },
  {
    id: 'br-02',
    name: 'Jamuna Future Park Branch',
    code: 'JFP-02',
    type: 'BRANCH',
    location: 'Shop 12, Level 4, Zone C, Jamuna Future Park, Kuril, Dhaka',
    contact: '01819-334455'
  },
  {
    id: 'wh-01',
    name: 'Central Warehouse (Motijheel)',
    code: 'WH-01',
    type: 'WAREHOUSE',
    location: 'House 14, Road 3, Motijheel Commercial Area, Dhaka',
    contact: '01912-778899'
  }
];

export const initialUsers: User[] = [
  {
    id: 'usr-admin',
    name: 'Admin User',
    username: 'admin',
    password: 'password123',
    role: 'Super Admin',
    branchId: 'br-01',
    phone: '01700-112233',
    email: 'admin@mobiled-erp.bd'
  },
  {
    id: 'usr-1',
    name: 'Arshad Ahamed',
    username: 'owner',
    password: 'password123',
    role: 'Business Owner',
    branchId: 'br-01',
    phone: '01711-234567',
    email: 'arshadahamed789789@gmail.com'
  },
  {
    id: 'usr-2',
    name: 'Mahbubur Rahman',
    username: 'manager',
    password: 'password123',
    role: 'Manager',
    branchId: 'br-01',
    phone: '01812-445566',
    email: 'manager@mobiled-erp.bd'
  },
  {
    id: 'usr-3',
    name: 'Kazi Farhan',
    username: 'accountant',
    password: 'password123',
    role: 'Accountant',
    branchId: 'br-01',
    phone: '01911-332211',
    email: 'accounts@mobiled-erp.bd'
  },
  {
    id: 'usr-4',
    name: 'Sabbir Ahmed',
    username: 'salesman',
    password: 'password123',
    role: 'Salesman',
    branchId: 'br-01',
    phone: '01611-998877',
    email: 'sabbir@mobiled-erp.bd'
  },
  {
    id: 'usr-5',
    name: 'Rafiqul Islam',
    username: 'storekeeper',
    password: 'password123',
    role: 'Store Keeper',
    branchId: 'wh-01',
    phone: '01715-112233',
    email: 'store@mobiled-erp.bd'
  }
];

export const initialBrands: Brand[] = [
  { id: 'b-sam', name: 'Samsung', country: 'South Korea' },
  { id: 'b-app', name: 'Apple', country: 'USA' },
  { id: 'b-xia', name: 'Xiaomi', country: 'China' },
  { id: 'b-rea', name: 'Realme', country: 'China' },
  { id: 'b-one', name: 'OnePlus', country: 'China' },
  { id: 'b-viv', name: 'Vivo', country: 'China' },
  { id: 'b-opp', name: 'Oppo', country: 'China' },
  { id: 'b-ank', name: 'Anker', country: 'USA' },
  { id: 'b-bas', name: 'Baseus', country: 'China' }
];

export const initialCategories: Category[] = [
  { id: 'cat-smart', name: 'Smartphones', hasImei: true },
  { id: 'cat-feat', name: 'Feature Phones', hasImei: true },
  { id: 'cat-tab', name: 'Tablets & iPads', hasImei: true },
  { id: 'cat-charge', name: 'Chargers & Adapters', hasImei: false },
  { id: 'cat-audio', name: 'Earphones & TWS', hasImei: false },
  { id: 'cat-power', name: 'Power Banks', hasImei: false },
  { id: 'cat-acc', name: 'Covers & Protectors', hasImei: false }
];

export const initialProducts: Product[] = [
  {
    id: 'prod-s24',
    brandId: 'b-sam',
    brandName: 'Samsung',
    model: 'Galaxy S24 FE 5G',
    category: 'Smartphones',
    hasImei: true,
    warrantyMonths: 12,
    reorderLevel: 3,
    description: 'Exynos 2400e, 6.7" Dynamic AMOLED 2X, 50MP Camera',
    variants: [
      {
        id: 'var-s24-blk',
        ram: '8GB',
        storage: '256GB',
        color: 'Graphite Black',
        sku: 'SAM-S24FE-8-256-BLK',
        purchasePrice: 68500,
        wholesalePrice: 72000,
        dealerPrice: 71200,
        retailPrice: 76999,
        minSellingPrice: 70500,
        currentStock: 4
      },
      {
        id: 'var-s24-blu',
        ram: '8GB',
        storage: '128GB',
        color: 'Blue Light',
        sku: 'SAM-S24FE-8-128-BLU',
        purchasePrice: 62000,
        wholesalePrice: 65500,
        dealerPrice: 64800,
        retailPrice: 69999,
        minSellingPrice: 64000,
        currentStock: 2
      }
    ]
  },
  {
    id: 'prod-ip16',
    brandId: 'b-app',
    brandName: 'Apple',
    model: 'iPhone 16 Pro',
    category: 'Smartphones',
    hasImei: true,
    warrantyMonths: 12,
    reorderLevel: 2,
    description: 'A18 Pro chip, Titanium build, 48MP Fusion Camera',
    variants: [
      {
        id: 'var-ip16-des',
        ram: '8GB',
        storage: '128GB',
        color: 'Desert Titanium',
        sku: 'APP-IP16P-128-DES',
        purchasePrice: 148000,
        wholesalePrice: 154000,
        dealerPrice: 152500,
        retailPrice: 162999,
        minSellingPrice: 151500,
        currentStock: 3
      },
      {
        id: 'var-ip16-nat',
        ram: '8GB',
        storage: '256GB',
        color: 'Natural Titanium',
        sku: 'APP-IP16P-256-NAT',
        purchasePrice: 162000,
        wholesalePrice: 168000,
        dealerPrice: 166500,
        retailPrice: 178000,
        minSellingPrice: 165000,
        currentStock: 2
      }
    ]
  },
  {
    id: 'prod-rn14',
    brandId: 'b-xia',
    brandName: 'Xiaomi',
    model: 'Redmi Note 14 Pro+ 5G',
    category: 'Smartphones',
    hasImei: true,
    warrantyMonths: 12,
    reorderLevel: 5,
    description: 'Snapdragon 7s Gen 3, 200MP OIS, 6200mAh 90W HyperCharge',
    variants: [
      {
        id: 'var-rn14-blk',
        ram: '8GB',
        storage: '256GB',
        color: 'Midnight Black',
        sku: 'XIA-RN14PP-8-256-BLK',
        purchasePrice: 33500,
        wholesalePrice: 35800,
        dealerPrice: 35200,
        retailPrice: 38500,
        minSellingPrice: 34900,
        currentStock: 6
      }
    ]
  },
  {
    id: 'prod-rea13',
    brandId: 'b-rea',
    brandName: 'Realme',
    model: 'Realme 13 Pro 5G',
    category: 'Smartphones',
    hasImei: true,
    warrantyMonths: 12,
    reorderLevel: 4,
    description: 'Sony LYT-701 OIS, 120Hz Curved OLED, Monet Gold edition',
    variants: [
      {
        id: 'var-rea13-gld',
        ram: '8GB',
        storage: '128GB',
        color: 'Monet Gold',
        sku: 'REA-13P-8-128-GLD',
        purchasePrice: 28500,
        wholesalePrice: 30400,
        dealerPrice: 29900,
        retailPrice: 32999,
        minSellingPrice: 29500,
        currentStock: 5
      }
    ]
  },
  {
    id: 'prod-ank-20w',
    brandId: 'b-ank',
    brandName: 'Anker',
    model: 'PowerPort III Nano 20W USB-C',
    category: 'Chargers & Adapters',
    hasImei: false,
    warrantyMonths: 18,
    reorderLevel: 10,
    description: 'Ultra-compact fast charging for iPhone and Samsung',
    variants: [
      {
        id: 'var-ank-wht',
        color: 'White',
        sku: 'ANK-CHG-20W-WHT',
        purchasePrice: 1100,
        wholesalePrice: 1350,
        dealerPrice: 1300,
        retailPrice: 1650,
        minSellingPrice: 1250,
        currentStock: 35
      }
    ]
  },
  {
    id: 'prod-bas-encok',
    brandId: 'b-bas',
    brandName: 'Baseus',
    model: 'Encok H19 3.5mm Earphone',
    category: 'Earphones & TWS',
    hasImei: false,
    warrantyMonths: 6,
    reorderLevel: 15,
    description: 'Hi-Fi 6D sound, built-in mic, tangle-free cable',
    variants: [
      {
        id: 'var-bas-blk',
        color: 'Black',
        sku: 'BAS-EAR-H19-BLK',
        purchasePrice: 420,
        wholesalePrice: 520,
        dealerPrice: 490,
        retailPrice: 650,
        minSellingPrice: 470,
        currentStock: 48
      }
    ]
  }
];

export const initialImeis: ProductIMEI[] = [
  // S24 FE Graphite
  {
    imei1: '864209061001234',
    imei2: '864209061001235',
    productId: 'prod-s24',
    variantId: 'var-s24-blk',
    productName: 'Samsung Galaxy S24 FE 5G',
    variantName: '8GB / 256GB - Graphite Black',
    purchaseInvoiceId: 'PUR-2026-001',
    purchaseCost: 68650,
    supplierId: 'sup-excel',
    supplierName: 'Excel Telecom Ltd (Samsung Dist.)',
    purchaseDate: '2026-09-10',
    branchId: 'br-01',
    branchName: 'Bashundhara City Branch',
    status: 'IN_STOCK'
  },
  {
    imei1: '864209061001236',
    imei2: '864209061001237',
    productId: 'prod-s24',
    variantId: 'var-s24-blk',
    productName: 'Samsung Galaxy S24 FE 5G',
    variantName: '8GB / 256GB - Graphite Black',
    purchaseInvoiceId: 'PUR-2026-001',
    purchaseCost: 68650,
    supplierId: 'sup-excel',
    supplierName: 'Excel Telecom Ltd (Samsung Dist.)',
    purchaseDate: '2026-09-10',
    branchId: 'br-01',
    branchName: 'Bashundhara City Branch',
    status: 'IN_STOCK'
  },
  {
    imei1: '864209061001238',
    imei2: '864209061001239',
    productId: 'prod-s24',
    variantId: 'var-s24-blk',
    productName: 'Samsung Galaxy S24 FE 5G',
    variantName: '8GB / 256GB - Graphite Black',
    purchaseInvoiceId: 'PUR-2026-001',
    purchaseCost: 68650,
    supplierId: 'sup-excel',
    supplierName: 'Excel Telecom Ltd (Samsung Dist.)',
    purchaseDate: '2026-09-10',
    branchId: 'br-02',
    branchName: 'Jamuna Future Park Branch',
    status: 'IN_STOCK'
  },
  {
    imei1: '864209061001240',
    imei2: '864209061001241',
    productId: 'prod-s24',
    variantId: 'var-s24-blk',
    productName: 'Samsung Galaxy S24 FE 5G',
    variantName: '8GB / 256GB - Graphite Black',
    purchaseInvoiceId: 'PUR-2026-001',
    purchaseCost: 68650,
    supplierId: 'sup-excel',
    supplierName: 'Excel Telecom Ltd (Samsung Dist.)',
    purchaseDate: '2026-09-10',
    branchId: 'wh-01',
    branchName: 'Central Warehouse (Motijheel)',
    status: 'IN_STOCK'
  },
  // Sold S24 FE
  {
    imei1: '864209061001242',
    imei2: '864209061001243',
    productId: 'prod-s24',
    variantId: 'var-s24-blk',
    productName: 'Samsung Galaxy S24 FE 5G',
    variantName: '8GB / 256GB - Graphite Black',
    purchaseInvoiceId: 'PUR-2026-001',
    purchaseCost: 68650,
    supplierId: 'sup-excel',
    supplierName: 'Excel Telecom Ltd (Samsung Dist.)',
    purchaseDate: '2026-09-10',
    branchId: 'br-01',
    branchName: 'Bashundhara City Branch',
    status: 'SOLD',
    saleInvoiceId: 'INV-2026-001',
    customerId: 'cust-ret-1',
    customerName: 'Md. Tanvir Hossain',
    saleDate: '2026-09-22',
    salePrice: 76000,
    warrantyExpiryDate: '2027-09-22'
  },
  // iPhone 16 Pro Desert Titanium
  {
    imei1: '354890123456781',
    serialNumber: 'XF99L4QP11',
    productId: 'prod-ip16',
    variantId: 'var-ip16-des',
    productName: 'Apple iPhone 16 Pro',
    variantName: '8GB / 128GB - Desert Titanium',
    purchaseInvoiceId: 'PUR-2026-002',
    purchaseCost: 148200,
    supplierId: 'sup-smart',
    supplierName: 'Smart Technologies (BD) Ltd',
    purchaseDate: '2026-09-15',
    branchId: 'br-01',
    branchName: 'Bashundhara City Branch',
    status: 'IN_STOCK'
  },
  {
    imei1: '354890123456782',
    serialNumber: 'XF99L4QP12',
    productId: 'prod-ip16',
    variantId: 'var-ip16-des',
    productName: 'Apple iPhone 16 Pro',
    variantName: '8GB / 128GB - Desert Titanium',
    purchaseInvoiceId: 'PUR-2026-002',
    purchaseCost: 148200,
    supplierId: 'sup-smart',
    supplierName: 'Smart Technologies (BD) Ltd',
    purchaseDate: '2026-09-15',
    branchId: 'br-01',
    branchName: 'Bashundhara City Branch',
    status: 'IN_STOCK'
  },
  {
    imei1: '354890123456783',
    serialNumber: 'XF99L4QP13',
    productId: 'prod-ip16',
    variantId: 'var-ip16-des',
    productName: 'Apple iPhone 16 Pro',
    variantName: '8GB / 128GB - Desert Titanium',
    purchaseInvoiceId: 'PUR-2026-002',
    purchaseCost: 148200,
    supplierId: 'sup-smart',
    supplierName: 'Smart Technologies (BD) Ltd',
    purchaseDate: '2026-09-15',
    branchId: 'br-02',
    branchName: 'Jamuna Future Park Branch',
    status: 'IN_STOCK'
  },
  // Sold iPhone to Dealer Rahman Telecom
  {
    imei1: '354890123456784',
    serialNumber: 'XF99L4QP14',
    productId: 'prod-ip16',
    variantId: 'var-ip16-nat',
    productName: 'Apple iPhone 16 Pro',
    variantName: '8GB / 256GB - Natural Titanium',
    purchaseInvoiceId: 'PUR-2026-002',
    purchaseCost: 162250,
    supplierId: 'sup-smart',
    supplierName: 'Smart Technologies (BD) Ltd',
    purchaseDate: '2026-09-15',
    branchId: 'br-01',
    branchName: 'Bashundhara City Branch',
    status: 'SOLD',
    saleInvoiceId: 'INV-2026-002',
    customerId: 'cust-dlr-1',
    customerName: 'Rahman Telecom (Motijheel)',
    saleDate: '2026-09-24',
    salePrice: 166500,
    warrantyExpiryDate: '2027-09-24'
  },
  // Redmi Note 14 Pro+
  {
    imei1: '867112048992001',
    imei2: '867112048992002',
    productId: 'prod-rn14',
    variantId: 'var-rn14-blk',
    productName: 'Xiaomi Redmi Note 14 Pro+ 5G',
    variantName: '8GB / 256GB - Midnight Black',
    purchaseInvoiceId: 'PUR-2026-003',
    purchaseCost: 33580,
    supplierId: 'sup-salextra',
    supplierName: 'Salextra Distribution PLC',
    purchaseDate: '2026-09-18',
    branchId: 'br-01',
    branchName: 'Bashundhara City Branch',
    status: 'IN_STOCK'
  },
  {
    imei1: '867112048992003',
    imei2: '867112048992004',
    productId: 'prod-rn14',
    variantId: 'var-rn14-blk',
    productName: 'Xiaomi Redmi Note 14 Pro+ 5G',
    variantName: '8GB / 256GB - Midnight Black',
    purchaseInvoiceId: 'PUR-2026-003',
    purchaseCost: 33580,
    supplierId: 'sup-salextra',
    supplierName: 'Salextra Distribution PLC',
    purchaseDate: '2026-09-18',
    branchId: 'br-01',
    branchName: 'Bashundhara City Branch',
    status: 'IN_STOCK'
  },
  {
    imei1: '867112048992005',
    imei2: '867112048992006',
    productId: 'prod-rn14',
    variantId: 'var-rn14-blk',
    productName: 'Xiaomi Redmi Note 14 Pro+ 5G',
    variantName: '8GB / 256GB - Midnight Black',
    purchaseInvoiceId: 'PUR-2026-003',
    purchaseCost: 33580,
    supplierId: 'sup-salextra',
    supplierName: 'Salextra Distribution PLC',
    purchaseDate: '2026-09-18',
    branchId: 'wh-01',
    branchName: 'Central Warehouse (Motijheel)',
    status: 'IN_STOCK'
  }
];

export const initialCustomers: Customer[] = [
  {
    id: 'cust-dlr-1',
    name: 'Md. Lutfor Rahman',
    businessName: 'Rahman Telecom (Motijheel)',
    mobile: '01711-889900',
    altMobile: '01819-223344',
    address: 'Shop 21, Ground Floor, Motijheel Plaza, Dhaka',
    tradeLicense: 'TRAD/DSCC/019283/2023',
    nid: '19842691234567890',
    customerType: 'Wholesale Dealer',
    priceLevel: 'dealer',
    creditLimit: 500000,
    currentDue: 145000,
    totalPurchased: 1250000,
    totalPaid: 1105000,
    status: 'ACTIVE',
    notes: 'Primary wholesale dealer in Motijheel area. High turnover.'
  },
  {
    id: 'cust-dlr-2',
    name: 'Engr. Kamrul Hasan',
    businessName: 'Chowdhury Gadgets (Uttara)',
    mobile: '01912-334455',
    address: 'Plot 15, Sector 7, Uttara, Dhaka',
    tradeLicense: 'TRAD/DNCC/082736/2024',
    customerType: 'Wholesale Dealer',
    priceLevel: 'dealer',
    creditLimit: 350000,
    currentDue: 85000,
    totalPurchased: 890000,
    totalPaid: 805000,
    status: 'ACTIVE',
    notes: 'Regular dealer, pays via City Bank transfer weekly.'
  },
  {
    id: 'cust-sub-1',
    name: 'Shahidul Islam Khan',
    businessName: 'Khan Mobile Zone (Mirpur 10)',
    mobile: '01815-667788',
    address: 'Roundabout Market, Mirpur 10, Dhaka',
    customerType: 'Sub Dealer',
    priceLevel: 'wholesale',
    creditLimit: 200000,
    currentDue: 42000,
    totalPurchased: 450000,
    totalPaid: 408000,
    status: 'ACTIVE'
  },
  {
    id: 'cust-ret-1',
    name: 'Md. Tanvir Hossain',
    mobile: '01712-345678',
    address: 'Dhanmondi 27, Dhaka',
    customerType: 'Retail Customer',
    priceLevel: 'retail',
    creditLimit: 0,
    currentDue: 0,
    totalPurchased: 76000,
    totalPaid: 76000,
    status: 'ACTIVE'
  },
  {
    id: 'cust-ret-2',
    name: 'Farhana Akter',
    mobile: '01819-876543',
    address: 'Banani Road 11, Dhaka',
    customerType: 'VIP Customer',
    priceLevel: 'special',
    creditLimit: 30000,
    currentDue: 0,
    totalPurchased: 125000,
    totalPaid: 125000,
    status: 'ACTIVE'
  }
];

export const initialSuppliers: Supplier[] = [
  {
    id: 'sup-excel',
    name: 'Excel Telecom Ltd',
    company: 'Excel Telecom (National Samsung Distributor)',
    contactPerson: 'Mr. Asif Iqbal',
    mobile: '01713-112233',
    address: 'Gulshan 1, Dhaka-1212',
    bankInfo: 'Islami Bank Gulshan Br, A/C: 2050118020098000',
    currentPayable: 185000,
    totalPurchased: 2450000,
    totalPaid: 2265000,
    status: 'ACTIVE'
  },
  {
    id: 'sup-smart',
    name: 'Smart Technologies (BD) Ltd',
    company: 'Smart Technologies (Apple & IT Importer)',
    contactPerson: 'Zahirul Islam',
    mobile: '01817-554433',
    address: 'Jahangir Tower, Karwan Bazar, Dhaka',
    bankInfo: 'City Bank Principal Br, A/C: 1101928374001',
    currentPayable: 320000,
    totalPurchased: 3800000,
    totalPaid: 3480000,
    status: 'ACTIVE'
  },
  {
    id: 'sup-salextra',
    name: 'Salextra Distribution PLC',
    company: 'Salextra (Official Xiaomi & Gadgets Partner)',
    contactPerson: 'Sakib Mahmud',
    mobile: '01914-998877',
    address: 'Tejgaon I/A, Dhaka-1208',
    bankInfo: 'BRAC Bank Tejgaon Br, A/C: 1501203948571001',
    currentPayable: 95000,
    totalPurchased: 1650000,
    totalPaid: 1555000,
    status: 'ACTIVE'
  }
];

export const initialCashAccounts: CashAccount[] = [
  {
    id: 'cash-bc',
    name: 'Counter Cash - Bashundhara City',
    branchId: 'br-01',
    balance: 84500,
    type: 'COUNTER_CASH'
  },
  {
    id: 'cash-jfp',
    name: 'Counter Cash - Jamuna Future Park',
    branchId: 'br-02',
    balance: 42000,
    type: 'COUNTER_CASH'
  },
  {
    id: 'cash-vault',
    name: 'Central Vault Cash (Motijheel)',
    branchId: 'wh-01',
    balance: 280000,
    type: 'MAIN_CASH'
  }
];

export const initialBankAccounts: BankAccount[] = [
  {
    id: 'bank-ibbl',
    bankName: 'Islami Bank Bangladesh PLC',
    accountName: 'MOBILE D-ERP BANGLADESH',
    accountNumber: '20501830200145000',
    branchName: 'Panthapath Branch',
    routingNumber: '125273891',
    balance: 650000,
    type: 'BANK'
  },
  {
    id: 'bank-city',
    bankName: 'City Bank PLC',
    accountName: 'MOBILE D-ERP BANGLADESH',
    accountNumber: '1102948192001',
    branchName: 'Bashundhara City Branch',
    routingNumber: '225261890',
    balance: 425000,
    type: 'BANK'
  },
  {
    id: 'mfs-bkash',
    bankName: 'bKash Merchant Account',
    accountName: 'MOBILE D-ERP (01711-987654)',
    accountNumber: '01711-987654',
    branchName: 'Online Gateway',
    balance: 135000,
    type: 'BKASH_MERCHANT'
  },
  {
    id: 'mfs-nagad',
    bankName: 'Nagad Merchant Account',
    accountName: 'MOBILE D-ERP (01822-456789)',
    accountNumber: '01822-456789',
    branchName: 'Online Gateway',
    balance: 68000,
    type: 'NAGAD_MERCHANT'
  }
];

export const initialExpenseCategories: ExpenseCategory[] = [
  { id: 'exp-rent', name: 'Shop & Warehouse Rent', nameBn: 'দোকান ও গোডাউন ভাড়া' },
  { id: 'exp-sal', name: 'Staff Salary & Allowance', nameBn: 'কর্মচারীদের বেতন ও ভাতা' },
  { id: 'exp-util', name: 'Electricity & Utilities', nameBn: 'বিদ্যুৎ ও পানি বিল' },
  { id: 'exp-net', name: 'Internet & Telephone', nameBn: 'ইন্টারনেট ও ফোন বিল' },
  { id: 'exp-courier', name: 'Courier & Transport (Sundarban/SA)', nameBn: 'কুরিয়ার ও পরিবহন খরচ' },
  { id: 'exp-ent', name: 'Tea, Snacks & Entertainment', nameBn: 'চা, নাস্তা ও অতিথি আপ্যায়ন' },
  { id: 'exp-mkt', name: 'Facebook Ads & Marketing', nameBn: 'বিজ্ঞাপন ও প্রচারণা' },
  { id: 'exp-gov', name: 'Trade License & Govt. Fees', nameBn: 'ট্রেড লাইসেন্স ও সরকারি ফি' },
  { id: 'exp-rep', name: 'Shop Maintenance & Repairs', nameBn: 'দোকান মেরামত ও রক্ষণাবেক্ষণ' }
];

export const initialExpenses: Expense[] = [
  {
    id: 'exp-001',
    date: '2026-09-25',
    categoryId: 'exp-rent',
    categoryName: 'Shop & Warehouse Rent',
    amount: 45000,
    branchId: 'br-01',
    branchName: 'Bashundhara City Branch',
    paidFromAccountId: 'bank-city',
    paidFromAccountName: 'City Bank PLC',
    recipient: 'Bashundhara City Mall Authority',
    description: 'Shop rent for September 2026',
    voucherNo: 'VCH-2026-091'
  },
  {
    id: 'exp-002',
    date: '2026-09-26',
    categoryId: 'exp-courier',
    categoryName: 'Courier & Transport (Sundarban/SA)',
    amount: 2800,
    branchId: 'br-01',
    branchName: 'Bashundhara City Branch',
    paidFromAccountId: 'cash-bc',
    paidFromAccountName: 'Counter Cash - Bashundhara City',
    recipient: 'Sundarban Courier Service',
    description: 'Chittagong dealer parcel delivery charges',
    voucherNo: 'VCH-2026-092'
  },
  {
    id: 'exp-003',
    date: '2026-09-27',
    categoryId: 'exp-ent',
    categoryName: 'Tea, Snacks & Entertainment',
    amount: 1450,
    branchId: 'br-01',
    branchName: 'Bashundhara City Branch',
    paidFromAccountId: 'cash-bc',
    paidFromAccountName: 'Counter Cash - Bashundhara City',
    recipient: 'Mama Tea Stall & Confectionery',
    description: 'Guest refreshment for wholesale buyers meeting',
    voucherNo: 'VCH-2026-093'
  }
];

export const initialChartOfAccounts: ChartOfAccount[] = [
  // Assets (1000 - 1999)
  { code: '1010', name: 'Counter Cash - Bashundhara City', type: 'ASSET', balance: 84500, normalBalance: 'DEBIT' },
  { code: '1015', name: 'Counter Cash - Jamuna Future Park', type: 'ASSET', balance: 42000, normalBalance: 'DEBIT' },
  { code: '1020', name: 'Central Vault Cash (Motijheel)', type: 'ASSET', balance: 280000, normalBalance: 'DEBIT' },
  { code: '1030', name: 'Islami Bank Bangladesh PLC', type: 'ASSET', balance: 650000, normalBalance: 'DEBIT' },
  { code: '1035', name: 'City Bank PLC', type: 'ASSET', balance: 425000, normalBalance: 'DEBIT' },
  { code: '1040', name: 'bKash Merchant Account', type: 'ASSET', balance: 135000, normalBalance: 'DEBIT' },
  { code: '1045', name: 'Nagad Merchant Account', type: 'ASSET', balance: 68000, normalBalance: 'DEBIT' },
  { code: '1100', name: 'Accounts Receivable (Customer Due)', type: 'ASSET', balance: 272000, normalBalance: 'DEBIT' },
  { code: '1200', name: 'Merchandise Inventory (Phones & Acc)', type: 'ASSET', balance: 1485600, normalBalance: 'DEBIT' },

  // Liabilities (2000 - 2999)
  { code: '2010', name: 'Accounts Payable (Supplier Due)', type: 'LIABILITY', balance: 600000, normalBalance: 'CREDIT' },
  { code: '2050', name: 'Customer Advances / Overpayments', type: 'LIABILITY', balance: 0, normalBalance: 'CREDIT' },

  // Equity (3000 - 3999)
  { code: '3010', name: "Owner's Capital", type: 'EQUITY', balance: 2600000, normalBalance: 'CREDIT' },
  { code: '3020', name: 'Retained Earnings', type: 'EQUITY', balance: 154100, normalBalance: 'CREDIT' },

  // Revenue (4000 - 4999)
  { code: '4010', name: 'Sales Revenue - Smartphones', type: 'REVENUE', balance: 242500, normalBalance: 'CREDIT' },
  { code: '4020', name: 'Sales Revenue - Accessories', type: 'REVENUE', balance: 0, normalBalance: 'CREDIT' },

  // Expenses (5000 - 5999)
  { code: '5010', name: 'Cost of Goods Sold (COGS)', type: 'EXPENSE', balance: 230900, normalBalance: 'DEBIT' },
  { code: '5110', name: 'Shop & Warehouse Rent', type: 'EXPENSE', balance: 45000, normalBalance: 'DEBIT' },
  { code: '5120', name: 'Courier & Transport Expense', type: 'EXPENSE', balance: 2800, normalBalance: 'DEBIT' },
  { code: '5130', name: 'Entertainment & Refreshment', type: 'EXPENSE', balance: 1450, normalBalance: 'DEBIT' }
];

export const initialSales: SaleInvoice[] = [
  {
    id: 'sale-001',
    invoiceNo: 'INV-2026-001',
    date: '2026-09-22',
    customerId: 'cust-ret-1',
    customerName: 'Md. Tanvir Hossain',
    customerMobile: '01712-345678',
    customerType: 'Retail Customer',
    branchId: 'br-01',
    branchName: 'Bashundhara City Branch',
    salesmanId: 'usr-4',
    salesmanName: 'Sabbir Ahmed',
    items: [
      {
        productId: 'prod-s24',
        variantId: 'var-s24-blk',
        productName: 'Samsung Galaxy S24 FE 5G (8GB/256GB - Graphite Black)',
        variantName: '8GB / 256GB',
        imeiList: ['864209061001242'],
        quantity: 1,
        unitPrice: 76999,
        unitCost: 68650,
        discount: 999,
        total: 76000
      }
    ],
    subtotal: 76999,
    discount: 999,
    tax: 0,
    grandTotal: 76000,
    paidAmount: 76000,
    dueAmount: 0,
    totalCost: 68650,
    grossProfit: 7350,
    payments: [
      {
        id: 'pmt-001',
        method: 'Cash',
        amount: 36000,
        accountId: 'cash-bc',
        accountName: 'Counter Cash - Bashundhara City',
        date: '2026-09-22'
      },
      {
        id: 'pmt-002',
        method: 'bKash',
        amount: 40000,
        accountId: 'mfs-bkash',
        accountName: 'bKash Merchant Account',
        trxId: 'BKS90218731',
        phoneOrRef: '01712-345678',
        date: '2026-09-22'
      }
    ],
    status: 'COMPLETED',
    notes: 'Paid full at counter. 1 year official warranty registered.'
  },
  {
    id: 'sale-002',
    invoiceNo: 'INV-2026-002',
    date: '2026-09-24',
    customerId: 'cust-dlr-1',
    customerName: 'Rahman Telecom (Motijheel)',
    customerMobile: '01711-889900',
    customerType: 'Wholesale Dealer',
    branchId: 'br-01',
    branchName: 'Bashundhara City Branch',
    salesmanId: 'usr-2',
    salesmanName: 'Mahbubur Rahman',
    items: [
      {
        productId: 'prod-ip16',
        variantId: 'var-ip16-nat',
        productName: 'Apple iPhone 16 Pro (8GB/256GB - Natural Titanium)',
        variantName: '8GB / 256GB',
        imeiList: ['354890123456784'],
        quantity: 1,
        unitPrice: 166500,
        unitCost: 162250,
        discount: 0,
        total: 166500
      }
    ],
    subtotal: 166500,
    discount: 0,
    tax: 0,
    grandTotal: 166500,
    paidAmount: 66500,
    dueAmount: 100000,
    totalCost: 162250,
    grossProfit: 4250,
    payments: [
      {
        id: 'pmt-003',
        method: 'Bank',
        amount: 66500,
        accountId: 'bank-city',
        accountName: 'City Bank PLC',
        trxId: 'CTY-NPSB-998231',
        phoneOrRef: 'City Bank Transfer',
        date: '2026-09-24'
      }
    ],
    status: 'COMPLETED',
    notes: 'Wholesale dealer price applied. Balance ৳1,00,000 due within 7 days.'
  }
];

export const initialPurchases: PurchaseInvoice[] = [
  {
    id: 'PUR-2026-001',
    invoiceNo: 'PUR-2026-001',
    supplierInvoiceNo: 'EXL-DH-8842',
    date: '2026-09-10',
    supplierId: 'sup-excel',
    supplierName: 'Excel Telecom Ltd',
    branchId: 'br-01',
    branchName: 'Bashundhara City Branch',
    items: [
      {
        productId: 'prod-s24',
        variantId: 'var-s24-blk',
        productName: 'Samsung Galaxy S24 FE 5G',
        variantName: '8GB / 256GB - Graphite Black',
        quantity: 5,
        purchaseRate: 68500,
        allocatedLandedCost: 150,
        effectiveUnitCost: 68650,
        total: 342500,
        imeis: [
          { imei1: '864209061001234', imei2: '864209061001235' },
          { imei1: '864209061001236', imei2: '864209061001237' },
          { imei1: '864209061001238', imei2: '864209061001239' },
          { imei1: '864209061001240', imei2: '864209061001241' },
          { imei1: '864209061001242', imei2: '864209061001243' }
        ]
      }
    ],
    subtotal: 342500,
    landedCost: {
      transport: 500,
      courier: 0,
      handling: 250,
      other: 0
    },
    totalLandedCost: 750,
    grandTotal: 343250,
    paidAmount: 200000,
    dueAmount: 143250,
    payments: [
      {
        id: 'pur-pmt-1',
        method: 'Bank',
        amount: 200000,
        accountId: 'bank-ibbl',
        accountName: 'Islami Bank Bangladesh PLC',
        trxId: 'IBBL-FT-449102',
        date: '2026-09-10'
      }
    ],
    status: 'RECEIVED'
  }
];

export const initialCustomerLedger: CustomerLedgerEntry[] = [
  {
    id: 'cld-001',
    customerId: 'cust-dlr-1',
    date: '2026-09-01',
    type: 'OPENING',
    referenceNo: 'OPN-2026',
    debit: 45000,
    credit: 0,
    balance: 45000,
    description: 'Opening balance brought forward'
  },
  {
    id: 'cld-002',
    customerId: 'cust-dlr-1',
    date: '2026-09-24',
    type: 'SALE',
    referenceNo: 'INV-2026-002',
    debit: 166500,
    credit: 0,
    balance: 211500,
    description: 'Sale of Apple iPhone 16 Pro (Natural Titanium)'
  },
  {
    id: 'cld-003',
    customerId: 'cust-dlr-1',
    date: '2026-09-24',
    type: 'PAYMENT',
    referenceNo: 'PMT-INV-002',
    debit: 0,
    credit: 66500,
    balance: 145000,
    description: 'Bank payment against invoice INV-2026-002'
  }
];

export const initialSupplierLedger: SupplierLedgerEntry[] = [
  {
    id: 'sld-001',
    supplierId: 'sup-excel',
    date: '2026-09-01',
    type: 'OPENING',
    referenceNo: 'OPN-2026',
    debit: 0,
    credit: 41750,
    balance: 41750,
    description: 'Opening payable brought forward'
  },
  {
    id: 'sld-002',
    supplierId: 'sup-excel',
    date: '2026-09-10',
    type: 'PURCHASE',
    referenceNo: 'PUR-2026-001',
    debit: 0,
    credit: 343250,
    balance: 385000,
    description: 'Purchase 5 units Samsung S24 FE with landed cost'
  },
  {
    id: 'sld-003',
    supplierId: 'sup-excel',
    date: '2026-09-10',
    type: 'PAYMENT',
    referenceNo: 'PAY-PUR-001',
    debit: 200000,
    credit: 0,
    balance: 185000,
    description: 'Payment via Islami Bank (IBBL-FT-449102)'
  }
];

export const initialWarrantyClaims: WarrantyClaim[] = [
  {
    id: 'wclaim-001',
    claimNo: 'WCL-2026-001',
    date: '2026-09-26',
    imei: '864209061001242',
    productName: 'Samsung Galaxy S24 FE 5G',
    customerName: 'Md. Tanvir Hossain',
    customerPhone: '01712-345678',
    problemDescription: 'Display flickering intermittently after 4 days of use. No physical damage.',
    status: 'IN_REPAIR',
    receivedDate: '2026-09-26',
    resolutionNotes: 'Dispatched to official Samsung Authorized Care Center Gulshan for panel diagnostic.'
  }
];

export const initialDailyClosings: DailyClosingRecord[] = [
  {
    id: 'cls-2026-09-28',
    date: '2026-09-28',
    branchId: 'br-01',
    branchName: 'Bashundhara City Branch',
    openingCash: 50000,
    totalCashSales: 36000,
    totalCustomerCollection: 25000,
    otherCashIn: 0,
    totalExpenses: 4250,
    totalSupplierPayment: 20000,
    otherCashOut: 0,
    expectedClosingCash: 86750,
    actualPhysicalCash: 86750,
    variance: 0,
    closedBy: 'Arshad Ahamed (Owner)',
    notes: 'All physical cash counted and verified with day drawer.',
    closedAt: '2026-09-28 21:30'
  }
];

export const initialAuditLogs: AuditLog[] = [
  {
    id: 'log-001',
    timestamp: '2026-09-24 16:45:10',
    userName: 'Mahbubur Rahman',
    userRole: 'Manager',
    action: 'SALE_CREATED',
    module: 'Sales',
    recordId: 'INV-2026-002',
    details: 'Created sale for Rahman Telecom (৳1,66,500). Partial payment ৳66,500 received via City Bank. Due: ৳1,00,000.'
  },
  {
    id: 'log-002',
    timestamp: '2026-09-24 16:45:12',
    userName: 'System',
    userRole: 'Manager',
    action: 'JOURNAL_POSTED',
    module: 'Accounting',
    recordId: 'JRN-2026-002',
    details: 'Posted balanced entries for INV-2026-002. Revenue: ৳1,66,500, COGS: ৳1,62,250.'
  },
  {
    id: 'log-003',
    timestamp: '2026-09-26 11:20:00',
    userName: 'Sabbir Ahmed',
    userRole: 'Salesman',
    action: 'WARRANTY_CLAIM_OPENED',
    module: 'Warranty',
    recordId: 'WCL-2026-001',
    details: 'Registered claim for IMEI 864209061001242 (Samsung S24 FE) for customer Md. Tanvir Hossain.'
  }
];

export const initialQuotations: Quotation[] = [
  {
    id: 'q-2026-001',
    quoteNo: 'QT-2026-001',
    date: '2026-09-27',
    validUntil: '2026-10-05',
    customerId: 'cust-dlr-2',
    customerName: 'Chowdhury Gadgets (Uttara)',
    customerMobile: '01912-334455',
    customerType: 'Wholesale Dealer',
    branchId: 'br-01',
    branchName: 'Bashundhara City Branch',
    items: [
      {
        productId: 'prod-rn14',
        variantId: 'var-rn14-blk',
        productName: 'Xiaomi Redmi Note 14 Pro+ 5G',
        variantName: '8GB / 256GB - Midnight Black',
        imeiList: [],
        quantity: 5,
        unitPrice: 35200,
        unitCost: 33500,
        discount: 1000,
        total: 175000
      },
      {
        productId: 'prod-ank-20w',
        variantId: 'var-ank-wht',
        productName: 'Anker PowerPort III Nano 20W USB-C',
        variantName: 'White',
        imeiList: [],
        quantity: 10,
        unitPrice: 1300,
        unitCost: 1100,
        discount: 0,
        total: 13000
      }
    ],
    subtotal: 189000,
    discount: 1000,
    grandTotal: 188000,
    status: 'SENT',
    notes: 'Bulk order discount applied. Free courier delivery to Uttara.'
  }
];

export const initialSalesReturns: SalesReturn[] = [
  {
    id: 'sret-001',
    returnNo: 'SRT-2026-001',
    date: '2026-09-25',
    saleInvoiceNo: 'INV-2026-001',
    customerId: 'cust-ret-1',
    customerName: 'Md. Tanvir Hossain',
    branchId: 'br-01',
    branchName: 'Bashundhara City Branch',
    items: [
      {
        productId: 'prod-ank-20w',
        variantId: 'var-ank-wht',
        productName: 'Anker PowerPort III Nano 20W USB-C',
        variantName: 'White',
        quantity: 1,
        refundRate: 1650,
        imeiList: [],
        condition: 'RESTOCKABLE',
        total: 1650
      }
    ],
    totalRefund: 1650,
    refundMethod: 'Cash',
    accountId: 'cash-bc',
    notes: 'Customer bought extra adapter by mistake. Box sealed, returned to stock.'
  }
];

export const initialPurchaseReturns: PurchaseReturn[] = [];

export const initialStockAdjustments: StockAdjustment[] = [
  {
    id: 'stk-adj-001',
    adjustmentNo: 'ADJ-2026-001',
    date: '2026-09-20',
    branchId: 'br-01',
    branchName: 'Bashundhara City Branch',
    productId: 'prod-bas-encok',
    variantId: 'var-bas-blk',
    productName: 'Baseus Encok H19 3.5mm Earphone',
    adjustmentType: 'REMOVE',
    quantity: 2,
    imeis: [],
    reason: 'DAMAGED',
    costImpact: 840,
    approvedBy: 'Arshad Ahamed (Owner)',
    notes: 'Packaging crushed during showroom display shelf setup.'
  }
];


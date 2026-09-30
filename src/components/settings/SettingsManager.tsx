import React, { useState, useMemo } from 'react';
import { 
  Settings, Building2, Store, Check, Phone, MapPin, 
  Plus, Pencil, Trash2, Globe, Building, X, AlertCircle,
  Users, Lock, Shield, Star, Search, Filter, Mail, KeyRound, UserCheck
} from 'lucide-react';
import { useERP } from '../../services/erpStore';
import { Branch, User, UserRole, Brand } from '../../types/erp';
import { BackupRestoreManager } from './BackupRestoreManager';

const ROLE_BADGE_STYLES: Record<UserRole, { bg: string; text: string; border: string }> = {
  'Super Admin': { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-200' },
  'Business Owner': { bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-200' },
  'Manager': { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200' },
  'Accountant': { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-200' },
  'Salesman': { bg: 'bg-indigo-100', text: 'text-indigo-800', border: 'border-indigo-200' },
  'Store Keeper': { bg: 'bg-cyan-100', text: 'text-cyan-800', border: 'border-cyan-200' }
};

export const SettingsManager: React.FC = () => {
  const { 
    businessConfig, updateBusinessConfig, businessType, setBusinessType, 
    branches, addBranch, updateBranch, deleteBranch, setDefaultBranch,
    brands, addBrand, updateBrand, deleteBrand, resetToDemoData, language,
    users, addUser, updateUser, deleteUser, currentUser,
    imeis, products
  } = useERP();

  const [formConfig, setFormConfig] = useState(businessConfig);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setSaveSuccess(msg);
    setTimeout(() => setSaveSuccess(null), 3500);
  };

  // ================= BRANCH CRUD STATE =================
  const [showBranchModal, setShowBranchModal] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);
  const [branchName, setBranchName] = useState('');
  const [branchCode, setBranchCode] = useState('');
  const [branchType, setBranchType] = useState<'BRANCH' | 'WAREHOUSE' | 'HEAD_OFFICE'>('BRANCH');
  const [branchLocation, setBranchLocation] = useState('');
  const [branchContact, setBranchContact] = useState('');
  const [branchIsDefault, setBranchIsDefault] = useState(false);
  const [branchError, setBranchError] = useState('');

  // ================= BRAND CRUD STATE =================
  const [showAddBrandInput, setShowAddBrandInput] = useState(false);
  const [newBrandName, setNewBrandName] = useState('');
  const [newBrandCountry, setNewBrandCountry] = useState('International');
  const [brandError, setBrandError] = useState('');

  const [showEditBrandModal, setShowEditBrandModal] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [editBrandName, setEditBrandName] = useState('');
  const [editBrandCountry, setEditBrandCountry] = useState('');
  const [editBrandError, setEditBrandError] = useState('');

  // ================= USER CRUD STATE =================
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState<string>('ALL');
  const [userBranchFilter, setUserBranchFilter] = useState<string>('ALL');

  // Add User
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [userNameInput, setUserNameInput] = useState('');
  const [userUsernameInput, setUserUsernameInput] = useState('');
  const [userRoleInput, setUserRoleInput] = useState<UserRole>('Salesman');
  const [userBranchIdInput, setUserBranchIdInput] = useState(branches[0]?.id || 'br-01');
  const [userPasswordInput, setUserPasswordInput] = useState('password123');
  const [userPhoneInput, setUserPhoneInput] = useState('');
  const [userEmailInput, setUserEmailInput] = useState('');
  const [addUserError, setAddUserError] = useState('');

  // Edit User
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editUserName, setEditUserName] = useState('');
  const [editUserUsername, setEditUserUsername] = useState('');
  const [editUserRole, setEditUserRole] = useState<UserRole>('Salesman');
  const [editUserBranchId, setEditUserBranchId] = useState('');
  const [editUserPhone, setEditUserPhone] = useState('');
  const [editUserEmail, setEditUserEmail] = useState('');
  const [editUserNewPassword, setEditUserNewPassword] = useState('');
  const [editUserError, setEditUserError] = useState('');

  // ================= COMPANY PROFILE SUBMIT =================
  const handleConfigSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateBusinessConfig(formConfig);
    showNotification(language === 'bn' ? 'প্রতিষ্ঠান সেটিংস সফলভাবে সংরক্ষিত হয়েছে!' : 'Company profile settings successfully saved!');
  };

  // ================= BRANCH HANDLERS =================
  const handleOpenAddBranch = () => {
    setEditingBranch(null);
    setBranchName('');
    setBranchCode(`BR-0${branches.length + 1}`);
    setBranchType('BRANCH');
    setBranchLocation('');
    setBranchContact('01700-000000');
    setBranchIsDefault(branches.length === 0);
    setBranchError('');
    setShowBranchModal(true);
  };

  const handleOpenEditBranch = (b: Branch) => {
    setEditingBranch(b);
    setBranchName(b.name);
    setBranchCode(b.code);
    setBranchType(b.type);
    setBranchLocation(b.location);
    setBranchContact(b.contact);
    setBranchIsDefault(!!b.isDefault);
    setBranchError('');
    setShowBranchModal(true);
  };

  const handleSaveBranch = (e: React.FormEvent) => {
    e.preventDefault();
    setBranchError('');
    if (!branchName.trim() || !branchLocation.trim()) {
      setBranchError(language === 'bn' ? 'ব্রাঞ্চের নাম ও ঠিকানা আবশ্যক।' : 'Branch name and location address are required.');
      return;
    }

    if (editingBranch) {
      const res = updateBranch(editingBranch.id, {
        name: branchName.trim(),
        code: branchCode.trim() || editingBranch.code,
        type: branchType,
        location: branchLocation.trim(),
        contact: branchContact.trim(),
        isDefault: branchIsDefault
      });
      if (!res.success) {
        setBranchError(res.error || 'Failed to update branch');
        return;
      }
      showNotification(language === 'bn' ? `ব্রাঞ্চ "${branchName}" সফলভাবে আপডেট করা হয়েছে!` : `Branch "${branchName}" updated successfully!`);
    } else {
      const res = addBranch({
        name: branchName.trim(),
        code: branchCode.trim() || `BR-${Date.now().toString().slice(-3)}`,
        type: branchType,
        location: branchLocation.trim(),
        contact: branchContact.trim(),
        isDefault: branchIsDefault
      });
      if (!res.success) {
        setBranchError(res.error || 'Failed to create branch');
        return;
      }
      showNotification(language === 'bn' ? `নতুন ব্রাঞ্চ "${branchName}" যুক্ত হয়েছে!` : `New branch "${branchName}" created successfully!`);
    }

    setShowBranchModal(false);
  };

  const handleDeleteBranch = (id: string, name: string) => {
    const confirmMsg = language === 'bn'
      ? `আপনি কি নিশ্চিত যে আপনি "${name}" ব্রাঞ্চটি মুছে ফেলতে চান?`
      : `Are you sure you want to delete branch "${name}"?`;

    if (window.confirm(confirmMsg)) {
      const res = deleteBranch(id);
      if (!res.success) {
        alert(res.error || 'Cannot delete branch');
      } else {
        showNotification(language === 'bn' ? `ব্রাঞ্চ "${name}" সফলভাবে মুছে ফেলা হয়েছে।` : `Branch "${name}" deleted.`);
      }
    }
  };

  const handleSetDefaultBranch = (id: string, name: string) => {
    setDefaultBranch(id);
    showNotification(language === 'bn' ? `"${name}" ডিফল্ট শোরুম হিসেবে সেট করা হয়েছে।` : `"${name}" set as default primary showroom.`);
  };

  // ================= BRAND HANDLERS =================
  const handleAddBrand = (e: React.FormEvent) => {
    e.preventDefault();
    setBrandError('');
    if (!newBrandName.trim()) return;

    const res = addBrand(newBrandName.trim(), newBrandCountry.trim() || 'International');
    if (!res.success) {
      setBrandError(res.error || 'Failed to add brand');
      return;
    }

    showNotification(language === 'bn' ? `নতুন ব্র্যান্ড "${newBrandName.trim()}" যুক্ত করা হয়েছে!` : `Brand "${newBrandName.trim()}" added successfully!`);
    setNewBrandName('');
    setShowAddBrandInput(false);
  };

  const handleOpenEditBrand = (brand: Brand) => {
    setEditingBrand(brand);
    setEditBrandName(brand.name);
    setEditBrandCountry(brand.country);
    setEditBrandError('');
    setShowEditBrandModal(true);
  };

  const handleSaveEditBrand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBrand) return;
    setEditBrandError('');

    if (!editBrandName.trim()) {
      setEditBrandError('Brand name is required');
      return;
    }

    const res = updateBrand(editingBrand.id, {
      name: editBrandName.trim(),
      country: editBrandCountry.trim() || 'International'
    });

    if (!res.success) {
      setEditBrandError(res.error || 'Failed to update brand');
      return;
    }

    showNotification(language === 'bn' ? `ব্র্যান্ড "${editBrandName.trim()}" আপডেট করা হয়েছে!` : `Brand "${editBrandName.trim()}" updated successfully!`);
    setShowEditBrandModal(false);
  };

  const handleDeleteBrand = (id: string, name: string) => {
    const confirmMsg = language === 'bn'
      ? `আপনি কি নিশ্চিত যে আপনি "${name}" ব্র্যান্ডটি অপসারণ করতে চান?`
      : `Are you sure you want to remove brand "${name}"?`;

    if (window.confirm(confirmMsg)) {
      const res = deleteBrand(id);
      if (!res.success) {
        alert(res.error || 'Cannot delete brand');
      } else {
        showNotification(language === 'bn' ? `ব্র্যান্ড "${name}" সফলভাবে মুছে ফেলা হয়েছে।` : `Brand "${name}" removed.`);
      }
    }
  };

  // ================= USER HANDLERS =================
  const handleOpenAddUser = () => {
    setUserNameInput('');
    setUserUsernameInput('');
    setUserRoleInput('Salesman');
    setUserBranchIdInput(branches[0]?.id || 'br-01');
    setUserPasswordInput('password123');
    setUserPhoneInput('');
    setUserEmailInput('');
    setAddUserError('');
    setShowAddUserModal(true);
  };

  const handleSaveAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    setAddUserError('');
    if (!userNameInput.trim() || !userUsernameInput.trim()) {
      setAddUserError(language === 'bn' ? 'নাম এবং ইউজারনেম আবশ্যক।' : 'Name and username are required.');
      return;
    }

    const res = addUser({
      name: userNameInput.trim(),
      username: userUsernameInput.trim().toLowerCase(),
      password: userPasswordInput || 'password123',
      role: userRoleInput,
      branchId: userBranchIdInput,
      phone: userPhoneInput.trim() || '01700-000000',
      email: userEmailInput.trim().toLowerCase() || `${userUsernameInput.trim().toLowerCase()}@mobiled-erp.bd`
    });

    if (!res.success) {
      setAddUserError(res.error || 'Failed to create user');
      return;
    }

    showNotification(language === 'bn' ? `নতুন স্টাফ অ্যাকাউন্ট "${userNameInput.trim()}" (${userRoleInput}) তৈরি হয়েছে!` : `User account "${userNameInput.trim()}" created successfully!`);
    setShowAddUserModal(false);
  };

  const handleOpenEditUser = (u: User) => {
    setEditingUser(u);
    setEditUserName(u.name);
    setEditUserUsername(u.username);
    setEditUserRole(u.role);
    setEditUserBranchId(u.branchId || branches[0]?.id || '');
    setEditUserPhone(u.phone);
    setEditUserEmail(u.email);
    setEditUserNewPassword('');
    setEditUserError('');
    setShowEditUserModal(true);
  };

  const handleSaveEditUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setEditUserError('');

    if (!editUserName.trim() || !editUserUsername.trim()) {
      setEditUserError(language === 'bn' ? 'নাম এবং ইউজারনেম ফাঁকা রাখা যাবে না।' : 'Name and username cannot be blank.');
      return;
    }

    const res = updateUser(editingUser.id, {
      name: editUserName.trim(),
      username: editUserUsername.trim().toLowerCase(),
      role: editUserRole,
      branchId: editUserBranchId,
      phone: editUserPhone.trim(),
      email: editUserEmail.trim().toLowerCase(),
      ...(editUserNewPassword.trim() ? { password: editUserNewPassword.trim() } : {})
    });

    if (!res.success) {
      setEditUserError(res.error || 'Failed to update user');
      return;
    }

    showNotification(language === 'bn' ? `স্টাফ অ্যাকাউন্ট "${editUserName.trim()}" আপডেট করা হয়েছে!` : `User account "${editUserName.trim()}" updated successfully!`);
    setShowEditUserModal(false);
  };

  const handleDeleteUser = (id: string, name: string) => {
    const confirmMsg = language === 'bn' 
      ? `আপনি কি নিশ্চিত যে আপনি স্টাফ "${name}" অ্যাকাউন্টটি মুছে ফেলতে চান?` 
      : `Are you sure you want to remove user "${name}"?`;

    if (window.confirm(confirmMsg)) {
      const res = deleteUser(id);
      if (!res.success) {
        alert(res.error || 'Cannot delete user');
      } else {
        showNotification(language === 'bn' ? `ইউজার "${name}" সফলভাবে মুছে ফেলা হয়েছে।` : `User "${name}" removed.`);
      }
    }
  };

  // Filtered users for directory
  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const q = userSearchQuery.trim().toLowerCase();
      const matchesSearch = !q || 
        u.name.toLowerCase().includes(q) || 
        u.username.toLowerCase().includes(q) || 
        u.phone.includes(q) || 
        u.email.toLowerCase().includes(q);

      const matchesRole = userRoleFilter === 'ALL' || u.role === userRoleFilter;
      const matchesBranch = userBranchFilter === 'ALL' || u.branchId === userBranchFilter;

      return matchesSearch && matchesRole && matchesBranch;
    });
  }, [users, userSearchQuery, userRoleFilter, userBranchFilter]);

  return (
    <div className="space-y-6 max-w-5xl pb-12">
      {/* Top Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Settings className="w-5 h-5 text-emerald-600" />
          <span>{language === 'bn' ? 'সিস্টেম সেটিংস ও প্রতিষ্ঠান প্রোফাইল' : 'Business Settings & SaaS Configuration'}</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          {language === 'bn' 
            ? 'প্রতিষ্ঠান পরিচিতি, একাধিক ব্রাঞ্চ ও শোরুম, মোবাইল ব্র্যান্ড এবং স্টাফ একাউন্ট (RBAC) নিয়ন্ত্রণ' 
            : 'Configure your company profile, multi-branch showrooms, mobile brands directory, and staff user access control.'}
        </p>
      </div>

      {/* Save Success Banner */}
      {saveSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center justify-between shadow-xs animate-in fade-in-50">
          <div className="flex items-center gap-2 font-medium">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{saveSuccess}</span>
          </div>
          <button type="button" onClick={() => setSaveSuccess(null)} className="text-emerald-700 hover:text-emerald-950">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 1. Target Business Model */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Store className="w-4 h-4 text-emerald-600" />
          <span>{language === 'bn' ? 'ব্যবসার ধরন (Target Business Model)' : 'Target Business Model'}</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => {
              setBusinessType('RETAIL');
              showNotification(language === 'bn' ? 'মোবাইল রিটেল শপ মোড সক্রিয় হয়েছে।' : 'Retail Mobile Shop mode active.');
            }}
            className={`p-3.5 rounded-xl border text-left transition ${
              businessType === 'RETAIL' 
                ? 'bg-emerald-50 border-emerald-500 ring-1 ring-emerald-500' 
                : 'border-slate-200 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-slate-900">Retail Mobile Shop</p>
              {businessType === 'RETAIL' && <Check className="w-4 h-4 text-emerald-600" />}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Single phone POS, counter cash, customer warranties</p>
          </button>

          <button
            type="button"
            onClick={() => {
              setBusinessType('WHOLESALE');
              showNotification(language === 'bn' ? 'হোলসেল মোবাইল ডিলার মোড সক্রিয় হয়েছে।' : 'Wholesale Dealer mode active.');
            }}
            className={`p-3.5 rounded-xl border text-left transition ${
              businessType === 'WHOLESALE' 
                ? 'bg-emerald-50 border-emerald-500 ring-1 ring-emerald-500' 
                : 'border-slate-200 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-slate-900">Wholesale Mobile Dealer</p>
              {businessType === 'WHOLESALE' && <Check className="w-4 h-4 text-emerald-600" />}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Bulk cartons, dealer credit limits, multi-tier pricing</p>
          </button>

          <button
            type="button"
            onClick={() => {
              setBusinessType('RETAIL_WHOLESALE');
              showNotification(language === 'bn' ? 'রিটেল ও হোলসেল যৌথ মোড সক্রিয় হয়েছে।' : 'Retail + Wholesale mode active.');
            }}
            className={`p-3.5 rounded-xl border text-left transition ${
              businessType === 'RETAIL_WHOLESALE' 
                ? 'bg-emerald-50 border-emerald-500 ring-1 ring-emerald-500' 
                : 'border-slate-200 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-slate-900">Retail + Wholesale (Both)</p>
              {businessType === 'RETAIL_WHOLESALE' && <Check className="w-4 h-4 text-emerald-600" />}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Full enterprise ERP with both retail and dealer modules</p>
          </button>
        </div>
      </div>

      {/* 2. Company & Invoice Information */}
      <form onSubmit={handleConfigSubmit} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4 text-xs">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-emerald-600" />
            <span>{language === 'bn' ? 'প্রতিষ্ঠান ও ইনভয়েস তথ্য (Company & Invoice Profile)' : 'Company & Invoice Information'}</span>
          </h2>
          <span className="text-[11px] text-slate-500 font-mono">Invoice Template Data</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="font-semibold text-slate-700 mb-1 block">Business Name *</label>
            <input
              type="text"
              required
              value={formConfig.name}
              onChange={(e) => setFormConfig({ ...formConfig, name: e.target.value })}
              className="w-full p-2.5 border border-slate-300 rounded-lg text-slate-900 font-bold focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 mb-1 block">Bangla Tagline (স্লোগান)</label>
            <input
              type="text"
              value={formConfig.tagline}
              onChange={(e) => setFormConfig({ ...formConfig, tagline: e.target.value })}
              className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 mb-1 block">Official Contact Phone *</label>
            <input
              type="text"
              required
              value={formConfig.phone}
              onChange={(e) => setFormConfig({ ...formConfig, phone: e.target.value })}
              className="w-full p-2.5 font-mono border border-slate-300 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 mb-1 block">Trade License Number (ট্রেড লাইসেন্স)</label>
            <input
              type="text"
              value={formConfig.tradeLicense}
              onChange={(e) => setFormConfig({ ...formConfig, tradeLicense: e.target.value })}
              className="w-full p-2.5 font-mono border border-slate-300 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 mb-1 block">VAT / Tax BIN Number (ভ্যাট বিন)</label>
            <input
              type="text"
              value={formConfig.taxNumber}
              onChange={(e) => setFormConfig({ ...formConfig, taxNumber: e.target.value })}
              className="w-full p-2.5 font-mono border border-slate-300 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 mb-1 block">Main Showroom / Official Address</label>
            <input
              type="text"
              value={formConfig.address}
              onChange={(e) => setFormConfig({ ...formConfig, address: e.target.value })}
              className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
        </div>

        <div>
          <label className="font-semibold text-slate-700 mb-1 block">Warranty Terms (ইনভয়েসের নিচে মুদ্রিত ওয়ারেন্টি শর্তাবলী)</label>
          <textarea
            rows={2}
            value={formConfig.warrantyTerms}
            onChange={(e) => setFormConfig({ ...formConfig, warrantyTerms: e.target.value })}
            className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>

        <div>
          <label className="font-semibold text-slate-700 mb-1 block">Invoice Footer Note</label>
          <input
            type="text"
            value={formConfig.invoiceFooterNote}
            onChange={(e) => setFormConfig({ ...formConfig, invoiceFooterNote: e.target.value })}
            className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition shadow-xs flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            <span>Save Profile Settings</span>
          </button>
        </div>
      </form>

      {/* 3. Operational Branches & Showrooms (CRUD) */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Building className="w-4 h-4 text-blue-600" />
              <span>{language === 'bn' ? 'ব্রাঞ্চ ও শোরুম ব্যবস্থাপনা (Operational Branches & Showrooms)' : 'Operational Branches & Showrooms'}</span>
            </h2>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {language === 'bn' 
                ? 'মাল্টি-লোকেশন শোরুম, কেন্দ্রীয় গুদাম, নতুন ব্রাঞ্চ সংযোজন, এডিট এবং ডিফল্ট শোরুম নির্ধারণ' 
                : 'Manage multiple retail showrooms, warehouses, assigned staff, and in-stock devices.'}
            </p>
          </div>
          <button
            type="button"
            onClick={handleOpenAddBranch}
            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? '+ নতুন ব্রাঞ্চ / শোরুম' : '+ Add Branch'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {branches.map(b => {
            const inStockCount = imeis.filter(im => im.branchId === b.id && im.status === 'IN_STOCK').length;
            const staffCount = users.filter(u => u.branchId === b.id).length;

            return (
              <div 
                key={b.id} 
                className={`p-4 rounded-xl border transition flex flex-col justify-between space-y-3 ${
                  b.isDefault 
                    ? 'border-blue-300 bg-blue-50/30 ring-1 ring-blue-300' 
                    : 'border-slate-200 bg-slate-50/70 hover:bg-white'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-xs text-slate-900">{b.name}</h3>
                      {b.isDefault && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-0.5">
                          <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                          <span>Primary Default</span>
                        </span>
                      )}
                    </div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                      b.type === 'HEAD_OFFICE' 
                        ? 'bg-purple-100 text-purple-800' 
                        : b.type === 'WAREHOUSE' 
                        ? 'bg-orange-100 text-orange-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {b.type === 'HEAD_OFFICE' ? 'Head Office' : b.type === 'WAREHOUSE' ? 'Warehouse / Godown' : 'Retail Showroom'}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-600 mt-2 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{b.location}</span>
                  </p>
                  
                  <p className="text-[11px] text-slate-600 mt-1 flex items-center gap-1.5 font-mono">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{b.contact}</span>
                    <span className="text-slate-300">•</span>
                    <span className="text-slate-500">Code: <strong className="text-slate-700">{b.code}</strong></span>
                  </p>

                  {/* Branch Stats */}
                  <div className="mt-3 grid grid-cols-2 gap-2 text-[10px] pt-2 border-t border-slate-200/60 font-mono">
                    <div className="bg-white p-1.5 rounded-lg border border-slate-200/80">
                      <span className="text-slate-400 block text-[9px]">IN-STOCK PHONES</span>
                      <span className="font-bold text-slate-800 text-xs">{inStockCount} units</span>
                    </div>
                    <div className="bg-white p-1.5 rounded-lg border border-slate-200/80">
                      <span className="text-slate-400 block text-[9px]">ASSIGNED STAFF</span>
                      <span className="font-bold text-slate-800 text-xs">{staffCount} users</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-1.5 pt-2 border-t border-slate-200/60 text-xs">
                  <div>
                    {!b.isDefault && (
                      <button
                        type="button"
                        onClick={() => handleSetDefaultBranch(b.id, b.name)}
                        className="text-[11px] text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1 font-semibold"
                      >
                        <Star className="w-3 h-3" />
                        <span>Set as Default</span>
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleOpenEditBranch(b)}
                      className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-[11px] font-semibold transition flex items-center gap-1 shadow-2xs"
                    >
                      <Pencil className="w-3 h-3 text-blue-600" />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteBranch(b.id, b.name)}
                      disabled={branches.length <= 1}
                      className="px-2.5 py-1 bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 rounded-lg text-[11px] font-semibold transition flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs"
                      title={branches.length <= 1 ? "At least one branch is required" : "Delete branch"}
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Mobile Brands & Manufacturers (CRUD) */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Globe className="w-4 h-4 text-emerald-600" />
              <span>{language === 'bn' ? 'মোবাইল ব্র্যান্ড ও ম্যানুফ্যাকচারার (Mobile Brands & Manufacturers)' : 'Mobile Brands & Manufacturers'}</span>
            </h2>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {language === 'bn' 
                ? 'মোবাইল ব্র্যান্ড ডিরেক্টরি, প্রস্তুতকারক দেশ, নতুন ব্র্যান্ড সংযোজন, এডিট ও ক্যাটালগ সিঙ্ক' 
                : 'Mobile brand catalog, manufacturer origins, brand editing, and live model count.'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setBrandError('');
              setShowAddBrandInput(!showAddBrandInput);
            }}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? '+ নতুন ব্র্যান্ড' : '+ Add Brand'}</span>
          </button>
        </div>

        {/* Add Brand Form */}
        {showAddBrandInput && (
          <form onSubmit={handleAddBrand} className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-3 text-xs animate-in fade-in-50">
            {brandError && (
              <div className="p-2 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                <span>{brandError}</span>
              </div>
            )}
            <div className="flex flex-col sm:flex-row gap-3 items-end">
              <div className="w-full sm:flex-1">
                <label className="font-semibold text-emerald-950 mb-1 block">Brand Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Nothing, OnePlus, Vivo, Realme, Infinix"
                  value={newBrandName}
                  onChange={e => setNewBrandName(e.target.value)}
                  className="w-full p-2 bg-white border border-emerald-300 rounded-lg text-slate-900 focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              <div className="w-full sm:w-56">
                <label className="font-semibold text-emerald-950 mb-1 block">Country / Origin</label>
                <input
                  type="text"
                  placeholder="e.g. UK, South Korea, China, USA"
                  value={newBrandCountry}
                  onChange={e => setNewBrandCountry(e.target.value)}
                  className="w-full p-2 bg-white border border-emerald-300 rounded-lg text-slate-900 focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold shadow-xs flex items-center justify-center gap-1"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Save Brand</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddBrandInput(false)}
                  className="px-3 py-2 bg-white border border-slate-300 hover:bg-slate-100 text-slate-600 rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Brands List */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5">
          {brands.map(br => {
            const productCount = products.filter(p => p.brandId === br.id).length;

            return (
              <div 
                key={br.id}
                className="p-3 bg-slate-50 hover:bg-white border border-slate-200 rounded-xl transition flex flex-col justify-between group shadow-2xs"
              >
                <div>
                  <div className="flex items-start justify-between gap-1">
                    <span className="font-bold text-xs text-slate-900 group-hover:text-emerald-700 transition">
                      {br.name}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {br.country}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1 font-mono">
                    {productCount} {productCount === 1 ? 'model' : 'models'}
                  </p>
                </div>

                <div className="flex items-center justify-end gap-1 mt-2.5 pt-1.5 border-t border-slate-200/60">
                  <button
                    type="button"
                    onClick={() => handleOpenEditBrand(br)}
                    className="p-1 hover:bg-blue-50 text-slate-400 hover:text-blue-600 rounded transition"
                    title="Edit Brand"
                  >
                    <Pencil className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteBrand(br.id, br.name)}
                    className="p-1 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded transition"
                    title={productCount > 0 ? "Cannot delete brand with catalog products" : "Delete Brand"}
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 5. User Accounts & Staff Management (CRUD + RBAC) */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-600" />
              <span>{language === 'bn' ? 'স্টাফ ও ইউজার একাউন্ট ব্যবস্থাপনা (User Accounts & RBAC)' : 'User Accounts & Staff Management'}</span>
            </h2>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {language === 'bn' 
                ? 'নতুন স্টাফ তৈরি, রোল (Super Admin, Manager, Accountant, Salesman, Store Keeper) পরিবর্তন, ব্রাঞ্চ অ্যাসাইনমেন্ট ও পাসওয়ার্ড পরিবর্তন' 
                : 'Manage system users, login credentials, assigned branches, password resets, and access roles.'}
            </p>
          </div>
          <button
            type="button"
            onClick={handleOpenAddUser}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? '+ নতুন স্টাফ / ইউজার' : '+ Add User'}</span>
          </button>
        </div>

        {/* User Search & Filters */}
        <div className="flex flex-col sm:flex-row gap-2 text-xs">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={language === 'bn' ? 'স্টাফের নাম, ইউজারনেম, মোবাইল বা ইমেইল দিয়ে খুঁজুন...' : 'Search staff by name, username, phone, or email...'}
              value={userSearchQuery}
              onChange={e => setUserSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={userRoleFilter}
              onChange={e => setUserRoleFilter(e.target.value)}
              className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-xs focus:bg-white"
            >
              <option value="ALL">All Roles ({users.length})</option>
              <option value="Super Admin">Super Admin</option>
              <option value="Business Owner">Business Owner</option>
              <option value="Manager">Manager</option>
              <option value="Accountant">Accountant</option>
              <option value="Salesman">Salesman</option>
              <option value="Store Keeper">Store Keeper</option>
            </select>

            <select
              value={userBranchFilter}
              onChange={e => setUserBranchFilter(e.target.value)}
              className="p-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-xs focus:bg-white"
            >
              <option value="ALL">All Branches</option>
              {branches.map(b => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* User Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filteredUsers.map(u => {
            const branch = branches.find(b => b.id === u.branchId);
            const isCurrentUser = currentUser.id === u.id;
            const badge = ROLE_BADGE_STYLES[u.role] || { bg: 'bg-slate-100', text: 'text-slate-800', border: 'border-slate-200' };

            return (
              <div 
                key={u.id}
                className={`p-4 rounded-xl border transition flex flex-col justify-between space-y-3.5 ${
                  isCurrentUser 
                    ? 'border-emerald-300 bg-emerald-50/20 ring-1 ring-emerald-300' 
                    : 'border-slate-200 bg-slate-50/70 hover:bg-white'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-emerald-700 text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-xs">
                        {u.name.charAt(0)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-bold text-xs text-slate-900 truncate">{u.name}</h4>
                          {isCurrentUser && (
                            <span className="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold">
                              YOU
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400 font-mono">@{u.username}</p>
                      </div>
                    </div>

                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase border ${badge.bg} ${badge.text} ${badge.border} shrink-0`}>
                      {u.role}
                    </span>
                  </div>

                  <div className="mt-3 space-y-1.5 text-[11px] text-slate-600">
                    <p className="flex items-center gap-1.5 truncate">
                      <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{branch?.name || 'All Branches'}</span>
                    </p>
                    <p className="flex items-center gap-1.5 font-mono text-slate-600 truncate">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{u.phone}</span>
                    </p>
                    <p className="flex items-center gap-1.5 text-slate-500 truncate">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{u.email}</span>
                    </p>
                  </div>
                </div>

                <div className="pt-2.5 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                  <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                    <KeyRound className="w-3 h-3 text-slate-400" />
                    <span>Protected</span>
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleOpenEditUser(u)}
                      className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-[11px] font-semibold transition flex items-center gap-1 shadow-2xs"
                    >
                      <Pencil className="w-3 h-3 text-emerald-600" />
                      <span>Edit</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteUser(u.id, u.name)}
                      disabled={isCurrentUser || users.length <= 1}
                      className="px-2.5 py-1 bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 rounded-lg text-[11px] font-semibold transition flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs"
                      title={isCurrentUser ? "Cannot delete currently logged in account" : "Delete User"}
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ================= MODAL: ADD / EDIT BRANCH ================= */}
      {showBranchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in-50">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
            <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Building className="w-4 h-4 text-blue-400" />
                <span>{editingBranch ? (language === 'bn' ? 'ব্রাঞ্চ তথ্য এডিট করুন' : 'Edit Branch Details') : (language === 'bn' ? 'নতুন ব্রাঞ্চ বা শোরুম যুক্ত করুন' : 'Add New Branch / Showroom')}</span>
              </h3>
              <button type="button" onClick={() => setShowBranchModal(false)}>
                <X className="w-4 h-4 text-slate-400 hover:text-white" />
              </button>
            </div>

            <form onSubmit={handleSaveBranch} className="p-5 space-y-3.5 text-xs overflow-y-auto">
              {branchError && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{branchError}</span>
                </div>
              )}

              <div>
                <label className="font-bold text-slate-700 mb-1 block">Branch / Showroom Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Uttara Mega Mall Branch"
                  value={branchName}
                  onChange={e => setBranchName(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-slate-900 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 mb-1 block">Branch Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. BR-03"
                    value={branchCode}
                    onChange={e => setBranchCode(e.target.value.toUpperCase())}
                    className="w-full p-2.5 font-mono border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 mb-1 block">Type</label>
                  <select
                    value={branchType}
                    onChange={e => setBranchType(e.target.value as any)}
                    className="w-full p-2.5 border border-slate-300 rounded-lg"
                  >
                    <option value="BRANCH">Retail Showroom</option>
                    <option value="WAREHOUSE">Warehouse / Godown</option>
                    <option value="HEAD_OFFICE">Head Office</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 mb-1 block">Location / Address *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sector 3, Uttara, Dhaka"
                  value={branchLocation}
                  onChange={e => setBranchLocation(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 mb-1 block">Contact Phone Number</label>
                <input
                  type="text"
                  placeholder="01700-000000"
                  value={branchContact}
                  onChange={e => setBranchContact(e.target.value)}
                  className="w-full p-2.5 font-mono border border-slate-300 rounded-lg"
                />
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={branchIsDefault}
                    onChange={e => setBranchIsDefault(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span className="font-semibold text-slate-800">Set as Primary Default Showroom</span>
                </label>
                <p className="text-[10px] text-slate-500 mt-1 pl-5">
                  Default branch used for new transactions and initial logins.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowBranchModal(false)}
                  className="px-4 py-2 border rounded-lg text-slate-600 hover:bg-slate-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-xs"
                >
                  {editingBranch ? 'Update Branch' : 'Create Branch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: EDIT BRAND ================= */}
      {showEditBrandModal && editingBrand && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in-50">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
            <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Globe className="w-4 h-4 text-emerald-400" />
                <span>{language === 'bn' ? 'ব্র্যান্ড এডিট করুন' : 'Edit Brand Details'}</span>
              </h3>
              <button type="button" onClick={() => setShowEditBrandModal(false)}>
                <X className="w-4 h-4 text-slate-400 hover:text-white" />
              </button>
            </div>

            <form onSubmit={handleSaveEditBrand} className="p-5 space-y-3.5 text-xs">
              {editBrandError && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{editBrandError}</span>
                </div>
              )}

              <div>
                <label className="font-bold text-slate-700 mb-1 block">Brand Name *</label>
                <input
                  type="text"
                  required
                  value={editBrandName}
                  onChange={e => setEditBrandName(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-slate-900 font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 mb-1 block">Country / Origin</label>
                <input
                  type="text"
                  value={editBrandCountry}
                  onChange={e => setEditBrandCountry(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-slate-900"
                />
              </div>

              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-500">
                Saving will automatically update this brand name across all catalog phones.
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowEditBrandModal(false)}
                  className="px-4 py-2 border rounded-lg text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold shadow-xs"
                >
                  Update Brand
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: ADD USER ================= */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in-50">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
            <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-400" />
                <span>{language === 'bn' ? 'নতুন ইউজার / স্টাফ যুক্ত করুন' : 'Add New Staff / User Account'}</span>
              </h3>
              <button type="button" onClick={() => setShowAddUserModal(false)}>
                <X className="w-4 h-4 text-slate-400 hover:text-white" />
              </button>
            </div>

            <form onSubmit={handleSaveAddUser} className="p-5 space-y-3.5 text-xs overflow-y-auto">
              {addUserError && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{addUserError}</span>
                </div>
              )}

              <div>
                <label className="font-bold text-slate-700 mb-1 block">Staff / User Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Shakil Hossain"
                  value={userNameInput}
                  onChange={e => setUserNameInput(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-slate-900 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 mb-1 block">Username *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. shakil"
                    value={userUsernameInput}
                    onChange={e => setUserUsernameInput(e.target.value.toLowerCase())}
                    className="w-full p-2.5 font-mono border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 mb-1 block">System Role *</label>
                  <select
                    value={userRoleInput}
                    onChange={e => setUserRoleInput(e.target.value as UserRole)}
                    className="w-full p-2.5 border border-slate-300 rounded-lg"
                  >
                    <option value="Super Admin">Super Admin</option>
                    <option value="Business Owner">Business Owner</option>
                    <option value="Manager">Manager</option>
                    <option value="Accountant">Accountant</option>
                    <option value="Salesman">Salesman</option>
                    <option value="Store Keeper">Store Keeper</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 mb-1 block">Assigned Branch / Showroom *</label>
                <select
                  value={userBranchIdInput}
                  onChange={e => setUserBranchIdInput(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg"
                >
                  {branches.map(b => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.type})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 mb-1 block">Phone Number</label>
                  <input
                    type="text"
                    placeholder="01700-000000"
                    value={userPhoneInput}
                    onChange={e => setUserPhoneInput(e.target.value)}
                    className="w-full p-2.5 font-mono border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 mb-1 block">Initial Password *</label>
                  <input
                    type="text"
                    required
                    placeholder="password123"
                    value={userPasswordInput}
                    onChange={e => setUserPasswordInput(e.target.value)}
                    className="w-full p-2.5 font-mono border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 mb-1 block">Email Address</label>
                <input
                  type="email"
                  placeholder="staff@mobiled-erp.bd"
                  value={userEmailInput}
                  onChange={e => setUserEmailInput(e.target.value.toLowerCase())}
                  className="w-full p-2.5 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="px-4 py-2 border rounded-lg text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold shadow-xs"
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: EDIT USER ================= */}
      {showEditUserModal && editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in-50">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
            <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-400" />
                <span>{language === 'bn' ? 'স্টাফ অ্যাকাউন্ট এডিট করুন' : 'Edit Staff Account Details'}</span>
              </h3>
              <button type="button" onClick={() => setShowEditUserModal(false)}>
                <X className="w-4 h-4 text-slate-400 hover:text-white" />
              </button>
            </div>

            <form onSubmit={handleSaveEditUser} className="p-5 space-y-3.5 text-xs overflow-y-auto">
              {editUserError && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{editUserError}</span>
                </div>
              )}

              <div>
                <label className="font-bold text-slate-700 mb-1 block">Full Name *</label>
                <input
                  type="text"
                  required
                  value={editUserName}
                  onChange={e => setEditUserName(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg text-slate-900 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 mb-1 block">Username *</label>
                  <input
                    type="text"
                    required
                    value={editUserUsername}
                    onChange={e => setEditUserUsername(e.target.value.toLowerCase())}
                    className="w-full p-2.5 font-mono border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 mb-1 block">System Role *</label>
                  <select
                    value={editUserRole}
                    onChange={e => setEditUserRole(e.target.value as UserRole)}
                    className="w-full p-2.5 border border-slate-300 rounded-lg font-semibold"
                  >
                    <option value="Super Admin">Super Admin</option>
                    <option value="Business Owner">Business Owner</option>
                    <option value="Manager">Manager</option>
                    <option value="Accountant">Accountant</option>
                    <option value="Salesman">Salesman</option>
                    <option value="Store Keeper">Store Keeper</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 mb-1 block">Operating Branch *</label>
                <select
                  value={editUserBranchId}
                  onChange={e => setEditUserBranchId(e.target.value)}
                  className="w-full p-2.5 border border-slate-300 rounded-lg"
                >
                  {branches.map(b => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.type})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 mb-1 block">Phone Number</label>
                  <input
                    type="text"
                    value={editUserPhone}
                    onChange={e => setEditUserPhone(e.target.value)}
                    className="w-full p-2.5 font-mono border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 mb-1 block">Email Address</label>
                  <input
                    type="email"
                    value={editUserEmail}
                    onChange={e => setEditUserEmail(e.target.value.toLowerCase())}
                    className="w-full p-2.5 border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg space-y-1">
                <label className="font-bold text-amber-950 mb-0.5 block flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-amber-700" />
                  <span>Reset Password (Optional)</span>
                </label>
                <input
                  type="text"
                  placeholder={language === 'bn' ? 'বর্তমান পাসওয়ার্ড রাখতে ফাঁকা রাখুন' : 'Leave blank to keep existing password'}
                  value={editUserNewPassword}
                  onChange={e => setEditUserNewPassword(e.target.value)}
                  className="w-full p-2 bg-white border border-amber-300 rounded-lg font-mono text-slate-900 placeholder:text-slate-400"
                />
                <p className="text-[10px] text-amber-700">
                  Only enter a new password if you want to reset credentials for this staff member.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowEditUserModal(false)}
                  className="px-4 py-2 border rounded-lg text-slate-600 hover:bg-slate-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold shadow-xs"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 6. Full Backup, Restore & Reset Center */}
      <div className="pt-4 border-t border-slate-200">
        <BackupRestoreManager />
      </div>
    </div>
  );
};

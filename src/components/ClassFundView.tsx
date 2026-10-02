import React, { useState, useMemo } from 'react';
import {
  Wallet,
  ArrowDownRight,
  ArrowUpRight,
  Plus,
  Minus,
  Edit2,
  Trash2,
  Calendar,
  Printer,
  FileSpreadsheet,
  Search,
  CheckCircle2,
  AlertCircle,
  Receipt,
  UserCheck,
  ShieldCheck,
  Lock,
  Tag,
  Coins,
  DollarSign,
  TrendingDown,
  TrendingUp,
  Settings,
  Sparkles,
  Users,
  CheckSquare,
  Square,
  X,
  RotateCcw,
} from 'lucide-react';
import { FundTransaction, FundTransactionType, AppUserRole, TeacherSettings, Student } from '../types';
import { storageService } from '../services/storage';
import { permissionService, USER_ROLES, getRolePersonInfo } from '../services/permissionService';

interface ClassFundViewProps {
  transactions: FundTransaction[];
  students: Student[];
  activeRole?: AppUserRole | null;
  settings: TeacherSettings;
  onAddTransaction: (tx: Omit<FundTransaction, 'id' | 'createdAt'>) => void;
  onUpdateTransaction: (tx: FundTransaction) => void;
  onDeleteTransaction: (id: string) => void;
  onClearAllFund?: () => void;
  onUpdateSettings?: (settings: TeacherSettings) => void;
}

const CATEGORIES = [
  'Quỹ tuần (20.000đ/HS)',
  'Học tập & Sách vở',
  'Vệ sinh & Dụng cụ',
  'Liên hoan & Sinh nhật',
  'Khen thưởng & Thi đua',
  'Phong trào & Đoàn trường',
  'Ủng hộ & Từ thiện',
  'Khác',
];

export const ClassFundView: React.FC<ClassFundViewProps> = ({
  transactions,
  students,
  activeRole,
  settings,
  onAddTransaction,
  onUpdateTransaction,
  onDeleteTransaction,
  onClearAllFund,
  onUpdateSettings,
}) => {
  const canManage = permissionService.canManageFund(activeRole);
  const currentRoleInfo = activeRole ? (USER_ROLES[activeRole] || USER_ROLES.gvcn) : null;
  const rolePerson = getRolePersonInfo(activeRole, students, undefined, settings.teacherName);

  const weeklyFee = settings.weeklyFundFeePerStudent || 20000;
  const totalStudentCount = students.length || 40;

  const [filterType, setFilterType] = useState<'all' | 'thu' | 'chi'>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterWeek, setFilterWeek] = useState<number | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isWeeklyCollectModalOpen, setIsWeeklyCollectModalOpen] = useState(false);
  const [isChangeFeeModalOpen, setIsChangeFeeModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<FundTransaction | null>(null);

  // Form states for general transaction
  const [txType, setTxType] = useState<FundTransactionType>('thu');
  const [amount, setAmount] = useState<string>('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [txWeek, setTxWeek] = useState<number>(settings.currentWeek || 4);
  const [actor, setActor] = useState('');
  const [receiptNo, setReceiptNo] = useState('');
  const [hasReceipt, setHasReceipt] = useState(true);
  const [note, setNote] = useState('');

  // Form states for Weekly Collection modal
  const [collectWeek, setCollectWeek] = useState<number>(settings.currentWeek || 4);
  const [collectFeePerStudent, setCollectFeePerStudent] = useState<number>(weeklyFee);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>(() =>
    students.map((s) => s.id)
  );

  // Form state for Change Fee modal
  const [newFeeInput, setNewFeeInput] = useState<number>(weeklyFee);

  // Calculations
  const summary = useMemo(() => {
    return storageService.calculateFundSummary(transactions);
  }, [transactions]);

  // Format currency helper
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(val);
  };

  // Open modal for manual transaction
  const openAddModal = (type: 'thu' | 'chi') => {
    setEditingTx(null);
    setTxType(type);
    setAmount('');
    setTitle(type === 'thu' ? `Thu tiền tuần ${settings.currentWeek}...` : 'Chi mua...');
    setCategory(type === 'thu' ? CATEGORIES[0] : 'Vệ sinh & Dụng cụ');
    setDate(new Date().toISOString().split('T')[0]);
    setTxWeek(settings.currentWeek || 4);
    setActor(type === 'thu' ? 'Học sinh lớp 10A7' : 'Ban cán sự lớp');
    setReceiptNo('');
    setHasReceipt(true);
    setNote('');
    setIsModalOpen(true);
  };

  const openEditModal = (tx: FundTransaction) => {
    setEditingTx(tx);
    setTxType(tx.type);
    setAmount(tx.amount.toString());
    setTitle(tx.title);
    setCategory(tx.category);
    setDate(tx.date);
    setTxWeek(tx.week || settings.currentWeek || 4);
    setActor(tx.actor);
    setReceiptNo(tx.receiptNo || '');
    setHasReceipt(tx.hasReceipt);
    setNote(tx.note || '');
    setIsModalOpen(true);
  };

  // Open Weekly Collection modal
  const openWeeklyCollectModal = () => {
    setCollectWeek(settings.currentWeek || 4);
    setCollectFeePerStudent(weeklyFee);
    setSelectedStudentIds(students.map((s) => s.id));
    setIsWeeklyCollectModalOpen(true);
  };

  // Submit Weekly Collection
  const handleSaveWeeklyCollection = (e: React.FormEvent) => {
    e.preventDefault();
    const paidCount = selectedStudentIds.length;
    if (paidCount <= 0) return;

    const totalCollected = paidCount * collectFeePerStudent;
    const recorder =
      activeRole === 'gvcn'
        ? `GVCN Thầy ${settings.teacherName}`
        : 'Thủ quỹ 10A7';

    onAddTransaction({
      type: 'thu',
      amount: totalCollected,
      title: `Thu quỹ Tuần ${collectWeek} (${paidCount} học sinh x ${formatCurrency(collectFeePerStudent)}/HS)`,
      category: 'Quỹ tuần (20.000đ/HS)',
      date: new Date().toISOString().split('T')[0],
      week: collectWeek,
      studentCount: paidCount,
      feePerStudent: collectFeePerStudent,
      actor: `Tập thể ${paidCount} học sinh lớp 10A7`,
      receiptNo: `QT-T${collectWeek}`,
      hasReceipt: true,
      note: `Thu tiền quỹ hàng tuần theo định mức ${formatCurrency(collectFeePerStudent)}/HS. Đã thu ${paidCount}/${totalStudentCount} học sinh.`,
      recordedBy: recorder,
    });

    setIsWeeklyCollectModalOpen(false);
  };

  // Submit Change Fee
  const handleSaveFeeChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (newFeeInput <= 0) return;
    if (onUpdateSettings) {
      onUpdateSettings({
        ...settings,
        weeklyFundFeePerStudent: Number(newFeeInput),
      });
    }
    setIsChangeFeeModalOpen(false);
  };

  // Submit regular transaction
  const handleSubmitTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount.replace(/[^\d]/g, '')) || 0;
    if (numAmount <= 0 || !title.trim()) return;

    const recorder =
      activeRole === 'gvcn'
        ? `GVCN Thầy ${settings.teacherName}`
        : 'Thủ quỹ 10A7';

    if (editingTx) {
      onUpdateTransaction({
        ...editingTx,
        type: txType,
        amount: numAmount,
        title: title.trim(),
        category,
        date,
        week: txWeek,
        actor: actor.trim() || (txType === 'thu' ? 'Học sinh' : 'Lớp'),
        receiptNo: receiptNo.trim() || undefined,
        hasReceipt,
        note: note.trim() || undefined,
        recordedBy: recorder,
      });
    } else {
      onAddTransaction({
        type: txType,
        amount: numAmount,
        title: title.trim(),
        category,
        date,
        week: txWeek,
        actor: actor.trim() || (txType === 'thu' ? 'Học sinh' : 'Lớp'),
        receiptNo: receiptNo.trim() || undefined,
        hasReceipt,
        note: note.trim() || undefined,
        recordedBy: recorder,
      });
    }

    setIsModalOpen(false);
  };

  // Filtered list
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      if (filterType !== 'all' && tx.type !== filterType) return false;
      if (filterCategory !== 'all' && tx.category !== filterCategory) return false;
      if (filterWeek !== 'all' && tx.week !== filterWeek) return false;
      if (searchTerm) {
        const text = (tx.title + ' ' + tx.actor + ' ' + (tx.note || '')).toLowerCase();
        if (!text.includes(searchTerm.toLowerCase())) return false;
      }
      return true;
    });
  }, [transactions, filterType, filterCategory, filterWeek, searchTerm]);

  return (
    <div className="space-y-6">
      {/* Role permission banner */}
      {canManage ? (
        <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-blue-900 text-white rounded-2xl p-4 sm:p-5 shadow-lg border border-emerald-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center space-x-3.5">
            <div className="p-3 bg-emerald-400 text-emerald-950 rounded-xl font-bold shadow-md shrink-0">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold text-white">
                  Sổ Thu Chi Quỹ Lớp 10A7 — Thu Chi Hàng Tuần
                </h2>
                <span className="bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 text-xs px-2.5 py-0.5 rounded-full font-bold">
                  Quyền Thủ Quỹ
                </span>
                <span className="bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs px-2.5 py-0.5 rounded-full font-bold">
                  Định mức: {formatCurrency(weeklyFee)}/HS/Tuần
                </span>
              </div>
              <p className="text-xs sm:text-sm text-emerald-200 mt-0.5">
                Đang thao tác: <strong className="text-white">{rolePerson.roleTitle}</strong> — <strong className="text-amber-300 font-bold">{rolePerson.isTeacher ? 'GVCN:' : 'Học sinh:'} {rolePerson.personName}</strong>. Thủ quỹ nhập số tiền chi, tiền thu hàng tuần và theo dõi tổng tồn quỹ còn lại.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {/* Button: Thu Quỹ Hàng Tuần */}
            <button
              onClick={openWeeklyCollectModal}
              className="flex items-center gap-1.5 px-3.5 py-2.5 bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 text-xs sm:text-sm font-black rounded-xl shadow-md cursor-pointer transition-all hover:scale-102"
              title={`Thu quỹ hàng tuần (${formatCurrency(weeklyFee)}/HS)`}
            >
              <Sparkles className="w-4 h-4 text-amber-950" />
              <span>⚡ Thu Quỹ Hàng Tuần</span>
            </button>

            {/* Button: Đổi Số Tiền Thu/HS */}
            <button
              onClick={() => {
                setNewFeeInput(weeklyFee);
                setIsChangeFeeModalOpen(true);
              }}
              className="flex items-center gap-1.5 px-3 py-2.5 bg-emerald-700/80 hover:bg-emerald-600 text-white text-xs sm:text-sm font-bold rounded-xl border border-emerald-500/50 shadow-xs cursor-pointer transition-all"
              title="Thay đổi mức thu quỹ trên mỗi học sinh"
            >
              <Settings className="w-4 h-4 text-emerald-300" />
              <span>Đổi Mức Thu/HS</span>
            </button>

            {/* Button: + Thu thủ công */}
            <button
              onClick={() => openAddModal('thu')}
              className="flex items-center gap-1.5 px-3 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-emerald-950 text-xs sm:text-sm font-bold rounded-xl shadow-xs cursor-pointer transition-all"
            >
              <ArrowDownRight className="w-4 h-4 text-emerald-950" />
              <span>+ Thu Khác</span>
            </button>

            {/* Button: - Chi */}
            <button
              onClick={() => openAddModal('chi')}
              className="flex items-center gap-1.5 px-3 py-2.5 bg-rose-500 hover:bg-rose-400 text-white text-xs sm:text-sm font-bold rounded-xl shadow-xs cursor-pointer transition-all"
            >
              <ArrowUpRight className="w-4 h-4 text-white" />
              <span>- Nhập Tiền Chi</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 shadow-sm flex items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-amber-200 text-amber-900 rounded-xl shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-amber-950">
                Sổ Thu Chi Quỹ Lớp (Chế Độ Công Khai Minh Bạch)
              </h2>
              <p className="text-xs text-amber-800">
                Theo phân công quy định: Chỉ <strong>Thủ Quỹ</strong> và <strong>GVCN Thầy Trần Văn Dư</strong> có quyền nhập số tiền chi, tiền thu và cập nhật quỹ lớp. Mức thu quỹ hàng tuần: <strong>{formatCurrency(weeklyFee)}/học sinh</strong>.
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-amber-800 bg-amber-100 px-3 py-1 rounded-lg shrink-0">
            Minh bạch / Xem
          </span>
        </div>
      )}

      {/* 3 HIGHLIGHT METRIC CARDS: THU - CHI - TỒN LẠI */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* CARD 1: TỔNG THU */}
        <div className="bg-gradient-to-br from-emerald-50 via-white to-emerald-50/40 rounded-2xl p-5 border-2 border-emerald-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-xl bg-emerald-600 text-white font-bold shadow-xs">
              <ArrowDownRight className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full">
              {summary.incomeCount} phiếu thu
            </span>
          </div>
          <p className="text-xs font-bold uppercase tracking-wider text-emerald-700 mt-3">
            Tổng Tiền Đã Thu
          </p>
          <div className="text-2xl sm:text-3xl font-black text-emerald-700 mt-1">
            {formatCurrency(summary.totalIncome)}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Thu quỹ hàng tuần ({formatCurrency(weeklyFee)}/HS) & các nguồn thu khác
          </p>
        </div>

        {/* CARD 2: TỔNG CHI */}
        <div className="bg-gradient-to-br from-rose-50 via-white to-rose-50/40 rounded-2xl p-5 border-2 border-rose-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-xl bg-rose-600 text-white font-bold shadow-xs">
              <ArrowUpRight className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-rose-800 bg-rose-100 px-2.5 py-1 rounded-full">
              {summary.expenseCount} phiếu chi
            </span>
          </div>
          <p className="text-xs font-bold uppercase tracking-wider text-rose-700 mt-3">
            Tổng Tiền Đã Chi
          </p>
          <div className="text-2xl sm:text-3xl font-black text-rose-700 mt-1">
            {formatCurrency(summary.totalExpense)}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Chi dụng cụ trực nhật, photo tài liệu, liên hoan, khen thưởng
          </p>
        </div>

        {/* CARD 3: TỔNG TỒN LẠI (THU - CHI) */}
        <div
          className={`rounded-2xl p-5 border-2 shadow-md relative overflow-hidden transition-all ${
            summary.currentBalance >= 0
              ? 'bg-gradient-to-br from-blue-900 to-indigo-900 text-white border-blue-700'
              : 'bg-gradient-to-br from-amber-900 to-rose-900 text-white border-rose-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="p-2.5 rounded-xl bg-amber-400 text-amber-950 font-bold shadow-xs">
              <Coins className="w-6 h-6" />
            </div>
            <span className="text-xs font-extrabold text-amber-950 bg-amber-300 px-3 py-1 rounded-full shadow-xs">
              {summary.currentBalance >= 0 ? '✓ Tồn Quỹ Dương' : '⚠️ Thâm Hụt Quỹ'}
            </span>
          </div>
          <p className="text-xs font-bold uppercase tracking-wider text-blue-200 mt-3">
            Tổng Tồn Quỹ Hiện Tại (Còn Lại)
          </p>
          <div className="text-2xl sm:text-3xl font-black text-amber-300 mt-1">
            {formatCurrency(summary.currentBalance)}
          </div>
          <p className="text-xs text-blue-100/90 mt-1">
            Công thức: <strong>Tổng Thu - Tổng Chi = Số Tiền Tồn Còn Lại</strong>
          </p>
        </div>
      </div>

      {/* Main Filter & Action Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Type toggle buttons */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filterType === 'all'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tất cả ({transactions.length})
          </button>
          <button
            onClick={() => setFilterType('thu')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filterType === 'thu'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-emerald-700 hover:bg-emerald-50'
            }`}
          >
            <ArrowDownRight className="w-3.5 h-3.5" />
            <span>Tiền Thu ({summary.incomeCount})</span>
          </button>
          <button
            onClick={() => setFilterType('chi')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              filterType === 'chi'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-rose-700 hover:bg-rose-50'
            }`}
          >
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Tiền Chi ({summary.expenseCount})</span>
          </button>
        </div>

        {/* Week, Category & Search */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Week Filter */}
          <select
            value={filterWeek}
            onChange={(e) =>
              setFilterWeek(e.target.value === 'all' ? 'all' : Number(e.target.value))
            }
            className="text-xs font-semibold px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-600"
          >
            <option value="all">Tất cả tuần</option>
            {Array.from({ length: 35 }, (_, i) => i + 1).map((w) => (
              <option key={w} value={w}>
                Tuần {w}
              </option>
            ))}
          </select>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="text-xs font-semibold px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-600"
          >
            <option value="all">Tất cả danh mục</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Tìm theo nội dung..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="text-xs pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-600 w-40 sm:w-48"
            />
          </div>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer transition-colors"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>In Báo Cáo</span>
          </button>

          {canManage && transactions.length > 0 && (
            <button
              onClick={() => {
                if (
                  confirm(
                    'Bạn có chắc chắn muốn xóa toàn bộ các khoản thu chi hiện tại để bắt đầu lại sổ quỹ mới?'
                  )
                ) {
                  if (onClearAllFund) onClearAllFund();
                  else storageService.clearAllFundTransactions();
                }
              }}
              className="flex items-center gap-1 px-2.5 py-2 text-rose-600 hover:bg-rose-50 text-xs font-semibold rounded-xl border border-rose-200 transition-colors"
              title="Xóa hết các dữ liệu trong sổ quỹ"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Xóa Hết</span>
            </button>
          )}
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Receipt className="w-4 h-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-800">
              Nhật Ký Thu Chi Quỹ Lớp Hàng Tuần (Định mức {formatCurrency(weeklyFee)}/HS)
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Hiển thị {filteredTransactions.length} phiếu
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-3.5 w-12 text-center">STT</th>
                <th className="py-3 px-3.5 w-20 text-center">Tuần</th>
                <th className="py-3 px-3.5 w-24">Ngày</th>
                <th className="py-3 px-3.5 w-24 text-center">Loại</th>
                <th className="py-3 px-3.5 min-w-[240px]">Nội Dung Thu / Chi</th>
                <th className="py-3 px-3.5 w-32">Danh Mục</th>
                <th className="py-3 px-3.5 text-right font-extrabold w-36">Số Tiền (VNĐ)</th>
                <th className="py-3 px-3.5">Người Nộp / Chi</th>
                <th className="py-3 px-3.5 w-24 text-center">Chứng từ</th>
                <th className="py-3 px-3.5 w-28">Người Ghi</th>
                {canManage && <th className="py-3 px-3.5 w-20 text-center">Thao tác</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td
                    colSpan={canManage ? 11 : 10}
                    className="py-12 text-center text-slate-400 text-xs italic"
                  >
                    <div className="max-w-md mx-auto space-y-2">
                      <Wallet className="w-8 h-8 text-slate-300 mx-auto" />
                      <p className="font-semibold text-slate-600 text-sm">
                        Chưa có dữ liệu thu chi nào trong sổ quỹ
                      </p>
                      <p className="text-slate-400">
                        Thủ quỹ có thể bấm <strong>&quot;⚡ Thu Quỹ Hàng Tuần&quot;</strong> để tạo nhanh phiếu thu quỹ định mức {formatCurrency(weeklyFee)}/học sinh cho tuần hiện tại.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx, idx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3.5 font-bold text-center text-slate-400">
                      {idx + 1}
                    </td>
                    <td className="py-3 px-3.5 text-center">
                      {tx.week ? (
                        <span className="inline-block px-2 py-0.5 bg-blue-100 text-blue-800 rounded font-bold text-[11px]">
                          Tuần {tx.week}
                        </span>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="py-3 px-3.5 text-slate-600 font-mono text-xs">
                      {tx.date}
                    </td>
                    <td className="py-3 px-3.5 text-center">
                      {tx.type === 'thu' ? (
                        <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-0.5 rounded-full border border-emerald-300">
                          <ArrowDownRight className="w-3 h-3 text-emerald-700" />
                          Tiền Thu
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-rose-100 text-rose-800 text-xs font-bold px-2.5 py-0.5 rounded-full border border-rose-300">
                          <ArrowUpRight className="w-3 h-3 text-rose-700" />
                          Tiền Chi
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3.5 font-semibold text-slate-900">
                      <div className="leading-snug">{tx.title}</div>
                      {tx.note && (
                        <div className="text-[11px] text-slate-500 font-normal mt-0.5">
                          {tx.note}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-3.5">
                      <span className="inline-block bg-slate-100 text-slate-700 text-xs font-medium px-2 py-0.5 rounded">
                        {tx.category}
                      </span>
                    </td>
                    <td className="py-3 px-3.5 text-right font-extrabold text-sm">
                      <span
                        className={
                          tx.type === 'thu'
                            ? 'text-emerald-700 font-black'
                            : 'text-rose-700 font-black'
                        }
                      >
                        {tx.type === 'thu' ? '+' : '-'} {formatCurrency(tx.amount)}
                      </span>
                    </td>
                    <td className="py-3 px-3.5 text-xs text-slate-700">
                      {tx.actor}
                    </td>
                    <td className="py-3 px-3.5 text-center text-xs">
                      {tx.hasReceipt ? (
                        <span className="text-emerald-700 font-semibold flex items-center justify-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          {tx.receiptNo || 'Có HĐ'}
                        </span>
                      ) : (
                        <span className="text-slate-400">Không</span>
                      )}
                    </td>
                    <td className="py-3 px-3.5 text-xs text-slate-600 font-medium">
                      {tx.recordedBy}
                    </td>
                    {canManage && (
                      <td className="py-3 px-3.5 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => openEditModal(tx)}
                            title="Sửa phiếu"
                            className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-md cursor-pointer transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Xóa khoản "${tx.title}" (${formatCurrency(tx.amount)})?`)) {
                                onDeleteTransaction(tx.id);
                              }
                            }}
                            title="Xóa phiếu"
                            className="p-1.5 text-rose-600 hover:bg-rose-100 rounded-md cursor-pointer transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer calculation bar */}
        <div className="bg-slate-50 border-t border-slate-200 px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm">
          <div className="text-slate-600">
            Tổng cộng: <strong className="text-slate-900">{transactions.length}</strong> phiếu • Thu:{' '}
            <strong className="text-emerald-700">{formatCurrency(summary.totalIncome)}</strong> • Chi:{' '}
            <strong className="text-rose-700">{formatCurrency(summary.totalExpense)}</strong>
          </div>
          <div className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
            <span>TỒN QUỸ CÒN LẠI:</span>
            <span
              className={`px-3 py-1 rounded-lg text-base font-black ${
                summary.currentBalance >= 0
                  ? 'bg-emerald-600 text-white'
                  : 'bg-rose-600 text-white'
              }`}
            >
              {formatCurrency(summary.currentBalance)}
            </span>
          </div>
        </div>
      </div>

      {/* Modal 1: Thu Quỹ Hàng Tuần (Định mức 20.000đ/HS) */}
      {isWeeklyCollectModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 text-slate-950 flex items-center justify-between font-bold">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-white/20 text-slate-950 font-bold">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-950">
                    Thu Quỹ Lớp Hàng Tuần (Tuần {collectWeek})
                  </h3>
                  <p className="text-xs text-amber-950 font-medium">
                    Định mức: {formatCurrency(collectFeePerStudent)} / 1 học sinh
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsWeeklyCollectModalOpen(false)}
                className="text-slate-950 hover:bg-black/10 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveWeeklyCollection} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tuần thu quỹ:
                  </label>
                  <select
                    value={collectWeek}
                    onChange={(e) => setCollectWeek(Number(e.target.value))}
                    className="w-full text-xs sm:text-sm font-bold px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:border-amber-500"
                  >
                    {Array.from({ length: 35 }, (_, i) => i + 1).map((w) => (
                      <option key={w} value={w}>
                        Tuần {w}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Mức thu mỗi học sinh:
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      step="1000"
                      min="1000"
                      value={collectFeePerStudent}
                      onChange={(e) => setCollectFeePerStudent(Number(e.target.value))}
                      className="w-full text-xs sm:text-sm font-extrabold px-3 py-2 border border-slate-300 rounded-xl outline-none focus:border-amber-500 text-emerald-800"
                    />
                    <span className="text-xs font-bold text-slate-500">đ/HS</span>
                  </div>
                </div>
              </div>

              {/* Student checklist */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-slate-700">
                    Danh sách học sinh đóng quỹ ({selectedStudentIds.length} / {totalStudentCount} HS):
                  </label>
                  <div className="flex items-center gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => setSelectedStudentIds(students.map((s) => s.id))}
                      className="text-blue-600 hover:underline font-bold cursor-pointer"
                    >
                      Chọn tất cả
                    </button>
                    <span>•</span>
                    <button
                      type="button"
                      onClick={() => setSelectedStudentIds([])}
                      className="text-slate-500 hover:underline cursor-pointer"
                    >
                      Bỏ chọn
                    </button>
                  </div>
                </div>

                {students.length > 0 ? (
                  <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-xl p-2.5 bg-slate-50/50 grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs">
                    {students.map((s) => {
                      const isChecked = selectedStudentIds.includes(s.id);
                      return (
                        <div
                          key={s.id}
                          onClick={() => {
                            setSelectedStudentIds((prev) =>
                              isChecked
                                ? prev.filter((id) => id !== s.id)
                                : [...prev, s.id]
                            );
                          }}
                          className={`flex items-center gap-2 p-1.5 rounded-lg cursor-pointer transition-colors ${
                            isChecked
                              ? 'bg-amber-100/70 border border-amber-300 text-amber-950 font-bold'
                              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          <span className="w-5 text-center font-bold text-slate-400 text-[11px]">
                            {s.rollNumber}
                          </span>
                          <span className="flex-1 truncate">{s.name}</span>
                          <span className="text-[10px] text-slate-400">Tổ {s.group}</span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-3 bg-slate-100 rounded-xl text-xs text-slate-600 text-center">
                    (Chưa có danh sách chi tiết - Mặc định tính theo sĩ số 40 học sinh)
                  </div>
                )}
              </div>

              {/* Total Calculation Card */}
              <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-300 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-amber-800 font-medium">
                    Tổng tiền thu quỹ Tuần {collectWeek}:
                  </p>
                  <p className="text-xs text-slate-500">
                    {selectedStudentIds.length} học sinh × {formatCurrency(collectFeePerStudent)}
                  </p>
                </div>
                <div className="text-xl sm:text-2xl font-black text-amber-700">
                  {formatCurrency(selectedStudentIds.length * collectFeePerStudent)}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsWeeklyCollectModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-100 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-950 text-xs font-black rounded-xl shadow-md cursor-pointer transition-all"
                >
                  Xác Nhận Thu Quỹ Tuần {collectWeek}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Thay Đổi Mức Thu Quỹ / Học Sinh */}
      {isChangeFeeModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 bg-gradient-to-r from-emerald-800 to-teal-800 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-white/20 text-white font-bold">
                  <Settings className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Thay Đổi Mức Thu Quỹ Hàng Tuần
                  </h3>
                  <p className="text-xs text-emerald-200">
                    Mức thu áp dụng trên 1 học sinh / 1 tuần
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsChangeFeeModalOpen(false)}
                className="text-white/80 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveFeeChange} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mức thu mới (VNĐ/học sinh/tuần):
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="1000"
                    min="1000"
                    required
                    value={newFeeInput}
                    onChange={(e) => setNewFeeInput(Number(e.target.value))}
                    className="w-full text-lg font-black px-3 py-2.5 border border-slate-300 rounded-xl outline-none focus:border-emerald-600 text-emerald-800 pr-14"
                  />
                  <span className="absolute right-3 top-3 text-xs font-bold text-slate-500">
                    VNĐ
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Định dạng: <strong>{formatCurrency(newFeeInput)}</strong> / 1 học sinh
                </p>
              </div>

              {/* Quick Preset Buttons */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                  Chọn nhanh định mức phổ biến:
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[10000, 20000, 30000, 50000].map((val) => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setNewFeeInput(val)}
                      className={`py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                        newFeeInput === val
                          ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      {formatCurrency(val).replace('₫', '')}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-900 leading-relaxed">
                Khi thay đổi, mức thu này sẽ được áp dụng tự động cho nút <strong>&quot;⚡ Thu Quỹ Hàng Tuần&quot;</strong> của Thủ quỹ và GVCN.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsChangeFeeModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-100 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer transition-all"
                >
                  Lưu Mức Thu Mới
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: Thêm / Sửa Giao Dịch Thu Chi Thủ Công */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden">
            <div
              className={`px-5 py-4 text-white flex items-center justify-between ${
                txType === 'thu'
                  ? 'bg-gradient-to-r from-emerald-800 to-teal-800'
                  : 'bg-gradient-to-r from-rose-800 to-amber-900'
              }`}
            >
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-white/20 text-white font-bold">
                  {txType === 'thu' ? <ArrowDownRight className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {editingTx
                      ? 'Chỉnh Sửa Phiếu Thu Chi'
                      : txType === 'thu'
                      ? 'Ghi Nhận Khoản Thu Quỹ (+)'
                      : 'Ghi Nhận Khoản Chi Quỹ (-)'}
                  </h3>
                  <p className="text-xs text-white/80">
                    Người ghi sổ: {activeRole === 'gvcn' ? `GVCN Thầy ${settings.teacherName}` : 'Thủ Quỹ 10A7'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitTransaction} className="p-5 space-y-4">
              {/* Type Switcher */}
              <div className="flex rounded-xl bg-slate-100 p-1">
                <button
                  type="button"
                  onClick={() => setTxType('thu')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all ${
                    txType === 'thu'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <ArrowDownRight className="w-4 h-4" />
                  <span>Khoản Thu (+)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTxType('chi')}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all ${
                    txType === 'chi'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <ArrowUpRight className="w-4 h-4" />
                  <span>Khoản Chi (-)</span>
                </button>
              </div>

              {/* Số tiền VNĐ */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Số tiền (VNĐ): <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1000"
                    step="1000"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Ví dụ: 20000, 100000, 500000"
                    className="w-full text-base sm:text-lg font-black px-3 py-2.5 border border-slate-300 rounded-xl outline-none focus:border-emerald-600 text-slate-900 pr-14"
                  />
                  <span className="absolute right-3 top-3 text-xs font-bold text-slate-500">
                    VNĐ
                  </span>
                </div>
                {amount && (
                  <p className="text-xs text-emerald-700 font-bold mt-1">
                    Bằng chữ / Quy đổi: {formatCurrency(Number(amount))}
                  </p>
                )}
              </div>

              {/* Tên khoản thu chi */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nội dung khoản tiền: <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={
                    txType === 'thu'
                      ? 'Ví dụ: Thu quỹ Tuần 4, Tiền phụ huynh ủng hộ...'
                      : 'Ví dụ: Mua dụng cụ vệ sinh, Photo đề cương, Mua hoa...'
                  }
                  className="w-full text-xs sm:text-sm px-3 py-2.5 border border-slate-300 rounded-xl outline-none focus:border-emerald-600"
                />
              </div>

              {/* Tuần & Danh mục */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Thuộc Tuần:
                  </label>
                  <select
                    value={txWeek}
                    onChange={(e) => setTxWeek(Number(e.target.value))}
                    className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-300 rounded-xl outline-none focus:border-emerald-600 font-bold"
                  >
                    {Array.from({ length: 35 }, (_, i) => i + 1).map((w) => (
                      <option key={w} value={w}>
                        Tuần {w}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Danh mục:
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-300 rounded-xl outline-none focus:border-emerald-600"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Ngày & Người nộp/chi */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Ngày thực hiện:
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-300 rounded-xl outline-none focus:border-emerald-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {txType === 'thu' ? 'Người nộp tiền:' : 'Người nhận / Người chi:'}
                  </label>
                  <input
                    type="text"
                    value={actor}
                    onChange={(e) => setActor(e.target.value)}
                    placeholder={txType === 'thu' ? 'Học sinh 10A7' : 'Ban cán sự'}
                    className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-300 rounded-xl outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              {/* Số hóa đơn chứng từ */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Số phiếu / Hóa đơn chứng từ:
                </label>
                <input
                  type="text"
                  value={receiptNo}
                  onChange={(e) => setReceiptNo(e.target.value)}
                  placeholder="QT-01 / HD-001"
                  className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-300 rounded-xl outline-none focus:border-emerald-600 font-mono"
                />
              </div>

              {/* Ghi chú */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Ghi chú chi tiết:
                </label>
                <textarea
                  rows={2}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Chi tiết nội dung..."
                  className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-300 rounded-xl outline-none focus:border-emerald-600"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-100 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2.5 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer transition-all ${
                    txType === 'thu'
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : 'bg-rose-600 hover:bg-rose-700'
                  }`}
                >
                  {editingTx ? 'Lưu Cập Nhật' : txType === 'thu' ? 'Lưu Khoản Thu' : 'Lưu Khoản Chi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

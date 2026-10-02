import React, { useState } from 'react';
import { X, Check, Search, AlertCircle, PlusCircle, Sparkles, ShieldCheck, Lock } from 'lucide-react';
import { Student, Rule, IncidentRecord, TeacherSettings, AppUserRole } from '../types';
import { permissionService, USER_ROLES } from '../services/permissionService';

interface QuickRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  rules: Rule[];
  settings: TeacherSettings;
  activeRole?: AppUserRole | null;
  onSaveIncidents: (incidents: Omit<IncidentRecord, 'id' | 'createdAt'>[]) => void;
  preSelectedStudentId?: string;
}

export const QuickRecordModal: React.FC<QuickRecordModalProps> = ({
  isOpen,
  onClose,
  students,
  rules,
  settings,
  activeRole = null,
  onSaveIncidents,
  preSelectedStudentId,
}) => {
  const currentRoleInfo = activeRole ? (USER_ROLES[activeRole] || USER_ROLES.gvcn) : null;

  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>(
    preSelectedStudentId ? [preSelectedStudentId] : []
  );
  const [searchStudent, setSearchStudent] = useState('');
  const [groupFilter, setGroupFilter] = useState<number | 'all'>(
    currentRoleInfo?.allowedGroup !== undefined ? currentRoleInfo.allowedGroup : 'all'
  );
  const [activeCategory, setActiveCategory] = useState<'violation' | 'reward'>('violation');

  // Filter rules allowed for this role
  const roleAllowedRules = permissionService.filterRulesForRole(activeRole, rules);

  const [selectedRuleId, setSelectedRuleId] = useState<string>(
    roleAllowedRules.find((r) => r.category === 'violation')?.id || roleAllowedRules[0]?.id || ''
  );
  const [customPoints, setCustomPoints] = useState<number | ''>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [period, setPeriod] = useState('10 phút đầu giờ');
  const [reportedBy, setReportedBy] = useState(
    permissionService.getReporterName(activeRole, settings.teacherName)
  );
  const [note, setNote] = useState('');
  const [incidentDate, setIncidentDate] = useState(
    new Date().toISOString().split('T')[0]
  );

  const [severityFilter, setSeverityFilter] = useState<'all' | 'MĐ1' | 'MĐ2' | 'MĐ3'>('all');

  if (!isOpen) return null;

  // Filter students allowed for this role
  const roleAllowedStudents = permissionService.filterStudentsForRole(activeRole, students);

  const filteredStudents = roleAllowedStudents.filter((s) => {
    const matchGroup = groupFilter === 'all' || s.group === groupFilter;
    const matchSearch =
      s.name.toLowerCase().includes(searchStudent.toLowerCase()) ||
      s.rollNumber.toString().includes(searchStudent);
    return matchGroup && matchSearch;
  });

  const currentRules = roleAllowedRules.filter((r) => {
    if (r.category !== activeCategory) return false;
    if (activeCategory === 'violation' && severityFilter !== 'all') {
      return r.severityLevel === severityFilter;
    }
    return true;
  });
  const selectedRule = roleAllowedRules.find((r) => r.id === selectedRuleId) || currentRules[0];

  const toggleSelectStudent = (id: string) => {
    if (selectedStudentIds.includes(id)) {
      setSelectedStudentIds(selectedStudentIds.filter((item) => item !== id));
    } else {
      setSelectedStudentIds([...selectedStudentIds, id]);
    }
  };

  const selectAllFiltered = () => {
    const allFilteredIds = filteredStudents.map((s) => s.id);
    const combined = Array.from(new Set([...selectedStudentIds, ...allFilteredIds]));
    setSelectedStudentIds(combined);
  };

  const clearSelection = () => {
    setSelectedStudentIds([]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedStudentIds.length === 0 || !selectedRule) return;

    const basePts =
      customPoints !== '' ? Number(customPoints) : selectedRule.points;
    const validQty = quantity > 0 ? quantity : 1;
    const pointsToApply = basePts * validQty;

    const newIncidents: Omit<IncidentRecord, 'id' | 'createdAt'>[] = selectedStudentIds.map(
      (sId) => {
        const student = students.find((s) => s.id === sId)!;
        return {
          studentId: student.id,
          studentName: student.name,
          group: student.group,
          ruleId: selectedRule.id,
          ruleName: selectedRule.name,
          category: selectedRule.category,
          points: pointsToApply,
          quantity: validQty,
          date: incidentDate,
          week: settings.currentWeek,
          month: settings.currentMonth,
          period,
          reportedBy,
          note: note.trim() || undefined,
        };
      }
    );

    onSaveIncidents(newIncidents);
    onClose();
    // Reset selection
    setSelectedStudentIds([]);
    setQuantity(1);
    setNote('');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-blue-900 to-indigo-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-blue-500/20 text-amber-300">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                Ghi Nhận Nề Nếp & Chấm Điểm Lớp 10A7
              </h3>
              <p className="text-xs text-blue-200">
                Tuần {settings.currentWeek} • GVCN: Thầy Trần Văn Dư
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-blue-200 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Role Permission Badge Alert */}
        {!currentRoleInfo ? (
          <div className="mx-5 mt-4 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between text-xs text-rose-900">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-rose-600 shrink-0" />
              <div>
                <strong>Chưa Đăng Nhập:</strong> Bạn đã out hết tất cả các tài khoản.
                <div className="text-rose-700 text-[11px] mt-0.5">Hệ thống đang ở chế độ xem. Vui lòng đăng nhập để lưu điểm rèn luyện.</div>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-lg font-bold bg-rose-600 text-white shrink-0 text-[11px] shadow-xs">
              Đã out tài khoản
            </span>
          </div>
        ) : (
          <div className="mx-5 mt-4 p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between text-xs text-blue-900">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
              <div>
                <strong>Phân quyền thao tác:</strong> {currentRoleInfo.title}
                <div className="text-blue-700 text-[11px] mt-0.5">{currentRoleInfo.description}</div>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-lg font-bold bg-blue-600 text-white shrink-0 text-[11px] shadow-xs">
              {currentRoleInfo.shortTitle}
            </span>
          </div>
        )}

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Step 1: Category toggle & Rule Selection */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              1. Chọn Nội Dung Thi Đua (Khen Thưởng / Vi Phạm)
            </label>

            {/* Category tabs */}
            <div className="grid grid-cols-2 gap-2 mb-3">
              <button
                type="button"
                onClick={() => {
                  setActiveCategory('violation');
                  const firstV = rules.find((r) => r.category === 'violation');
                  if (firstV) setSelectedRuleId(firstV.id);
                }}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-sm font-semibold transition-all ${
                  activeCategory === 'violation'
                    ? 'bg-rose-50 border-rose-300 text-rose-700 ring-2 ring-rose-400/20'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <AlertCircle className="w-4 h-4 text-rose-600" />
                <span>Vi Phạm (Trừ Điểm)</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveCategory('reward');
                  const firstR = rules.find((r) => r.category === 'reward');
                  if (firstR) setSelectedRuleId(firstR.id);
                }}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-sm font-semibold transition-all ${
                  activeCategory === 'reward'
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-700 ring-2 ring-emerald-400/20'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <PlusCircle className="w-4 h-4 text-emerald-600" />
                <span>Khen Thưởng (Cộng Điểm)</span>
              </button>
            </div>

            {/* Sub-filter for violations */}
            {activeCategory === 'violation' && (
              <div className="flex items-center gap-1.5 mb-2 overflow-x-auto pb-1 text-xs">
                <span className="text-slate-500 font-semibold text-[11px]">Mức độ:</span>
                <button
                  type="button"
                  onClick={() => setSeverityFilter('all')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                    severityFilter === 'all'
                      ? 'bg-slate-800 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Tất cả ({rules.filter((r) => r.category === 'violation').length})
                </button>
                <button
                  type="button"
                  onClick={() => setSeverityFilter('MĐ1')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                    severityFilter === 'MĐ1'
                      ? 'bg-rose-600 text-white'
                      : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                  }`}
                >
                  MĐ1 (-2đ & -4đ)
                </button>
                <button
                  type="button"
                  onClick={() => setSeverityFilter('MĐ2')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                    severityFilter === 'MĐ2'
                      ? 'bg-rose-700 text-white'
                      : 'bg-rose-50 text-rose-800 hover:bg-rose-100'
                  }`}
                >
                  MĐ2 (-12đ)
                </button>
                <button
                  type="button"
                  onClick={() => setSeverityFilter('MĐ3')}
                  className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                    severityFilter === 'MĐ3'
                      ? 'bg-rose-900 text-white'
                      : 'bg-rose-50 text-rose-950 hover:bg-rose-100'
                  }`}
                >
                  MĐ3 (-32đ)
                </button>
              </div>
            )}

            {/* Rules Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1 border border-slate-200 rounded-xl bg-slate-50/50">
              {currentRules.map((r) => {
                const isSelected = selectedRuleId === r.id;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => {
                      setSelectedRuleId(r.id);
                      setCustomPoints('');
                    }}
                    className={`text-left p-2.5 rounded-lg border text-xs transition-all flex items-start justify-between gap-2 ${
                      isSelected
                        ? activeCategory === 'violation'
                          ? 'bg-rose-100/70 border-rose-300 text-rose-900 font-medium ring-1 ring-rose-400'
                          : 'bg-emerald-100/70 border-emerald-300 text-emerald-900 font-medium ring-1 ring-emerald-400'
                        : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <div>
                      <div className="font-semibold flex items-center gap-1">
                        {r.severityLevel && (
                          <span className={`text-[10px] font-bold px-1 rounded ${
                            r.severityLevel === 'MĐ3'
                              ? 'bg-rose-700 text-white'
                              : r.severityLevel === 'MĐ2'
                              ? 'bg-rose-200 text-rose-900'
                              : r.severityLevel === 'MĐ1'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {r.severityLevel}
                          </span>
                        )}
                        <span>{r.name}</span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                        {r.description}
                      </div>
                    </div>
                    <span
                      className={`font-bold px-2 py-0.5 rounded text-[11px] shrink-0 ${
                        r.points > 0
                          ? 'bg-emerald-200 text-emerald-800'
                          : 'bg-rose-200 text-rose-800'
                      }`}
                    >
                      {r.points > 0 ? `+${r.points}` : r.points}đ
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Quantity Selector: Số lượt điểm cộng / điểm trừ */}
            <div className="mt-2.5 bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700">
                  Số lượt {activeCategory === 'reward' ? 'điểm cộng (+)' : 'điểm trừ (-)'}:
                </span>
                <div className="flex items-center bg-white border border-slate-300 rounded-lg shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                    className="w-7 h-7 flex items-center justify-center font-bold text-slate-700 hover:bg-slate-100 rounded-l-lg cursor-pointer select-none"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-12 text-center text-xs font-extrabold outline-none text-slate-900"
                  />
                  <button
                    type="button"
                    onClick={() => setQuantity((prev) => prev + 1)}
                    className="w-7 h-7 flex items-center justify-center font-bold text-slate-700 hover:bg-slate-100 rounded-r-lg cursor-pointer select-none"
                  >
                    +
                  </button>
                </div>
                <span className="text-xs font-semibold text-slate-500">lượt</span>
              </div>

              {selectedRule && (
                <div className="text-xs font-bold">
                  <span
                    className={
                      activeCategory === 'reward' ? 'text-emerald-700' : 'text-rose-700'
                    }
                  >
                    {quantity} lượt × {customPoints !== '' ? customPoints : selectedRule.points}đ ={' '}
                    <strong className="text-sm underline">
                      {activeCategory === 'reward' ? '+' : ''}
                      {(Number(customPoints !== '' ? customPoints : selectedRule.points)) * quantity} điểm
                    </strong>
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Step 2: Select Student(s) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
                2. Chọn Học Sinh Áp Dụng ({selectedStudentIds.length} đã chọn)
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={selectAllFiltered}
                  className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                >
                  Chọn tất cả
                </button>
                <span className="text-slate-300">|</span>
                <button
                  type="button"
                  onClick={clearSelection}
                  className="text-xs text-slate-500 hover:text-slate-700 font-medium"
                >
                  Bỏ chọn
                </button>
              </div>
            </div>

            {/* Filter by group & search */}
            <div className="flex flex-col sm:flex-row gap-2 mb-2">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Tìm học sinh theo tên hoặc số thứ tự..."
                  value={searchStudent}
                  onChange={(e) => setSearchStudent(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-1 overflow-x-auto pb-1 sm:pb-0">
                <button
                  type="button"
                  onClick={() => setGroupFilter('all')}
                  className={`px-2.5 py-1 text-xs rounded-md border font-medium ${
                    groupFilter === 'all'
                      ? 'bg-blue-600 border-blue-600 text-white'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Tất cả
                </button>
                {[1, 2, 3, 4].map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGroupFilter(g)}
                    className={`px-2.5 py-1 text-xs rounded-md border font-medium whitespace-nowrap ${
                      groupFilter === g
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Tổ {g}
                  </button>
                ))}
              </div>
            </div>

            {/* Students Selection Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 max-h-44 overflow-y-auto p-2 border border-slate-200 rounded-xl bg-slate-50/50">
              {filteredStudents.map((s) => {
                const isSelected = selectedStudentIds.includes(s.id);
                return (
                  <div
                    key={s.id}
                    onClick={() => toggleSelectStudent(s.id)}
                    className={`cursor-pointer p-2 rounded-lg border text-xs flex items-center justify-between transition-all select-none ${
                      isSelected
                        ? 'bg-blue-100 border-blue-400 text-blue-900 font-semibold shadow-xs'
                        : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <div className="truncate pr-1">
                      <span className="text-[10px] text-slate-400 mr-1">#{s.rollNumber}</span>
                      <span>{s.name}</span>
                      <div className="text-[10px] text-slate-400 font-normal">
                        Tổ {s.group} {s.role !== 'Học sinh' && `• ${s.role}`}
                      </div>
                    </div>
                    {isSelected && (
                      <div className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">
                        <Check className="w-2.5 h-2.5" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step 3: Additional details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Ngày ghi nhận
              </label>
              <input
                type="date"
                value={incidentDate}
                onChange={(e) => setIncidentDate(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Tiết học / Thời điểm
              </label>
              <select
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg outline-none focus:border-blue-500"
              >
                <option value="10 phút đầu giờ">10 phút đầu giờ</option>
                <option value="Chào cờ đầu tuần">Chào cờ đầu tuần</option>
                <option value="Tiết 1">Tiết 1</option>
                <option value="Tiết 2">Tiết 2</option>
                <option value="Tiết 3">Tiết 3</option>
                <option value="Tiết 4">Tiết 4</option>
                <option value="Tiết 5">Tiết 5</option>
                <option value="Giờ ra chơi">Giờ ra chơi</option>
                <option value="Sinh hoạt lớp 10A7">Sinh hoạt lớp 10A7</option>
                <option value="Sau giờ học / Trực nhật">Sau giờ học / Trực nhật</option>
                <option value="Hoạt động ngoài giờ">Hoạt động ngoài giờ</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Người báo cáo / Ghi nhận
              </label>
              <input
                type="text"
                value={reportedBy}
                onChange={(e) => setReportedBy(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-lg outline-none focus:border-blue-500"
                placeholder="Thầy Dư / Cán bộ Cờ đỏ..."
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Ghi chú chi tiết (nếu có)
              </label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Ví dụ: Chưa làm bài tập môn Toán trang 45; Trả lại tiền nhặt được..."
                className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-100 border-t border-slate-200 flex items-center justify-between">
          <div className="text-xs text-slate-600">
            {selectedStudentIds.length === 0 ? (
              <span className="text-rose-600 font-medium">
                Vui lòng chọn ít nhất 1 học sinh
              </span>
            ) : (
              <span>
                Đang chọn: <strong className="text-blue-700">{selectedStudentIds.length}</strong> HS • Số lượt: <strong className="text-purple-700">{quantity} lượt</strong> ({activeCategory === 'reward' ? '+' : ''}{(Number(customPoints !== '' ? customPoints : selectedRule?.points || 0)) * quantity}đ/HS)
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Hủy
            </button>
            <button
              onClick={handleSubmit}
              disabled={!activeRole || selectedStudentIds.length === 0 || !selectedRule}
              className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all"
            >
              {!activeRole ? 'Cần Đăng Nhập Để Lưu' : `Lưu Ghi Nhận (${selectedStudentIds.length} HS)`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

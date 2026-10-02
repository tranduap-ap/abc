import React, { useState, useEffect } from 'react';
import {
  Settings,
  Plus,
  Trash2,
  Download,
  Upload,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Save,
  BookOpen,
  Lock,
} from 'lucide-react';
import { Rule, TeacherSettings, AppUserRole } from '../types';
import { storageService } from '../services/storage';

interface RulesSettingsViewProps {
  settings: TeacherSettings;
  rules: Rule[];
  activeRole?: AppUserRole | null;
  onSaveSettings: (settings: TeacherSettings) => void;
  onSaveRules: (rules: Rule[]) => void;
  onResetData: () => void;
  onReloadAllData: () => void;
}

export const RulesSettingsView: React.FC<RulesSettingsViewProps> = ({
  settings,
  rules,
  activeRole,
  onSaveSettings,
  onSaveRules,
  onResetData,
  onReloadAllData,
}) => {
  const isGvcn = activeRole === 'gvcn';
  // Settings form state
  const [teacherName, setTeacherName] = useState(settings.teacherName);
  const [className, setClassName] = useState(settings.className);
  const [schoolName, setSchoolName] = useState(settings.schoolName);
  const [academicYear, setAcademicYear] = useState(settings.academicYear);
  const [academicYearsList, setAcademicYearsList] = useState<string[]>(
    settings.academicYearsList && settings.academicYearsList.length > 0
      ? settings.academicYearsList
      : ['2023 - 2024', '2024 - 2025', '2025 - 2026', '2026 - 2027', '2027 - 2028', '2028 - 2029', '2029 - 2030']
  );
  const [newYearInput, setNewYearInput] = useState('');
  const [showManageYears, setShowManageYears] = useState(false);
  const [teacherPhone, setTeacherPhone] = useState(settings.teacherPhone);
  const [baseScore, setBaseScore] = useState(settings.baseScore);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    setTeacherName(settings.teacherName);
    setClassName(settings.className);
    setSchoolName(settings.schoolName);
    setAcademicYear(settings.academicYear);
    if (settings.academicYearsList && settings.academicYearsList.length > 0) {
      setAcademicYearsList(settings.academicYearsList);
    }
    setTeacherPhone(settings.teacherPhone);
    setBaseScore(settings.baseScore);
  }, [settings]);

  // Filter for rules list
  const [rulesFilter, setRulesFilter] = useState<'all' | 'MĐ1' | 'MĐ2' | 'MĐ3' | 'reward'>('all');

  // New rule state
  const [isAddingRule, setIsAddingRule] = useState(false);
  const [newRuleCode, setNewRuleCode] = useState('');
  const [newRuleName, setNewRuleName] = useState('');
  const [newRuleCategory, setNewRuleCategory] = useState<'violation' | 'reward'>('violation');
  const [newRulePoints, setNewRulePoints] = useState<number>(-2);
  const [newRuleDesc, setNewRuleDesc] = useState('');

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isGvcn) {
      alert('Quyền hạn bị từ chối: Chỉ Giáo viên chủ nhiệm mới có quyền thay đổi thông tin cài đặt trường và lớp!');
      return;
    }
    onSaveSettings({
      ...settings,
      teacherName,
      className,
      schoolName,
      academicYear,
      academicYearsList,
      teacherPhone,
      baseScore: Number(baseScore),
    });
    setToastMsg('Đã lưu thông tin cài đặt và danh sách năm học thành công!');
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleAddNewYear = () => {
    if (!isGvcn) {
      alert('Quyền hạn bị từ chối: Chỉ Giáo viên chủ nhiệm mới có quyền thêm năm học!');
      return;
    }
    const trimmed = newYearInput.trim();
    if (!trimmed) return;
    if (academicYearsList.includes(trimmed)) {
      alert('Năm học này đã có trong danh sách!');
      return;
    }
    const updated = [...academicYearsList, trimmed];
    setAcademicYearsList(updated);
    setAcademicYear(trimmed);
    setNewYearInput('');
    onSaveSettings({
      ...settings,
      academicYear: trimmed,
      academicYearsList: updated,
    });
    setToastMsg(`Đã thêm và kích hoạt năm học ${trimmed}!`);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleDeleteYear = (yearToDelete: string) => {
    if (!isGvcn) {
      alert('Quyền hạn bị từ chối: Chỉ Giáo viên chủ nhiệm mới có quyền xóa năm học!');
      return;
    }
    if (academicYearsList.length <= 1) {
      alert('Danh sách cần có ít nhất 1 năm học!');
      return;
    }
    const updated = academicYearsList.filter((y) => y !== yearToDelete);
    setAcademicYearsList(updated);
    let nextActive = academicYear;
    if (academicYear === yearToDelete) {
      nextActive = updated[0];
      setAcademicYear(nextActive);
    }
    onSaveSettings({
      ...settings,
      academicYear: nextActive,
      academicYearsList: updated,
    });
    setToastMsg(`Đã xóa năm học ${yearToDelete}`);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleAddRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isGvcn) {
      alert('Quyền hạn bị từ chối: Chỉ Giáo viên chủ nhiệm mới có quyền thêm quy định!');
      return;
    }
    if (!newRuleName.trim()) return;

    const newRule: Rule = {
      id: `rule-${Date.now()}`,
      code: newRuleCode.trim() || `R${rules.length + 1}`,
      name: newRuleName.trim(),
      category: newRuleCategory,
      points: Number(newRulePoints),
      description: newRuleDesc.trim(),
    };

    onSaveRules([...rules, newRule]);
    setIsAddingRule(false);
    setNewRuleCode('');
    setNewRuleName('');
    setNewRuleDesc('');
    setToastMsg('Đã thêm quy định mới thành công!');
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleDeleteRule = (id: string) => {
    if (!isGvcn) {
      alert('Quyền hạn bị từ chối: Chỉ Giáo viên chủ nhiệm mới có quyền xóa quy định!');
      return;
    }
    if (confirm('Bạn có chắc chắn muốn xóa quy định này?')) {
      onSaveRules(rules.filter((r) => r.id !== id));
      setToastMsg('Đã xóa quy định!');
      setTimeout(() => setToastMsg(null), 3000);
    }
  };

  const handleExport = () => {
    const jsonStr = storageService.exportAllData();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `DuLieu_NeNep_Lop10A7_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setToastMsg('Đã tải xuống tệp sao lưu dữ liệu!');
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isGvcn) {
      alert('Quyền hạn bị từ chối: Chỉ Giáo viên chủ nhiệm mới có quyền khôi phục dữ liệu!');
      return;
    }
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const ok = storageService.importAllData(text);
        if (ok) {
          onReloadAllData();
          setToastMsg('Khôi phục dữ liệu từ tệp thành công!');
        } else {
          alert('Tệp dữ liệu không đúng định dạng!');
        }
      } catch (err) {
        alert('Lỗi đọc tệp!');
      }
    };
    reader.readAsText(file);
  };

  const handleReset = () => {
    if (!isGvcn) {
      alert('Quyền hạn bị từ chối: Chỉ Giáo viên chủ nhiệm mới có quyền đặt lại dữ liệu gốc!');
      return;
    }
    if (
      confirm(
        'Bạn có chắc chắn muốn đặt lại dữ liệu về trạng thái mẫu ban đầu của Lớp 10A7?'
      )
    ) {
      onResetData();
      setToastMsg('Đã đặt lại dữ liệu mẫu gốc lớp 10A7!');
      setTimeout(() => setToastMsg(null), 3000);
    }
  };

  return (
    <div className="space-y-6">
      {toastMsg && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 px-4 py-2.5 rounded-xl shadow-xs text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{toastMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Homeroom Teacher Settings */}
        <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100 mb-4">
            <Settings className="w-5 h-5 text-blue-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Thông Tin Giáo Viên Chủ Nhiệm & Lớp Học
            </h3>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-3.5 text-xs">
            {!isGvcn && (
              <div className="bg-amber-50 border border-amber-300 text-amber-900 p-3 rounded-xl flex items-center gap-2.5 text-xs font-semibold">
                <Lock className="w-4 h-4 text-amber-700 shrink-0" />
                <span>
                  Chế độ chỉ xem: Chỉ Giáo viên chủ nhiệm mới có quyền thay đổi Tên trường, Tên lớp, Năm học và Cài đặt quy chế.
                </span>
              </div>
            )}

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Giáo viên chủ nhiệm (GVCN) *
              </label>
              <input
                type="text"
                required
                disabled={!isGvcn}
                value={teacherName}
                onChange={(e) => setTeacherName(e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg outline-none ${
                  !isGvcn
                    ? 'bg-slate-100 border-slate-200 text-slate-600 cursor-not-allowed'
                    : 'bg-slate-50 border-slate-200 focus:border-blue-500'
                }`}
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Lớp chủ nhiệm
                </label>
                <input
                  type="text"
                  required
                  disabled={!isGvcn}
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg outline-none ${
                    !isGvcn
                      ? 'bg-slate-100 border-slate-200 text-slate-600 cursor-not-allowed'
                      : 'bg-slate-50 border-slate-200 focus:border-blue-500'
                  }`}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-slate-700">Năm học</label>
                  {isGvcn && (
                    <button
                      type="button"
                      onClick={() => setShowManageYears(!showManageYears)}
                      className="text-[10px] text-blue-600 hover:text-blue-800 font-bold underline cursor-pointer"
                    >
                      {showManageYears ? 'Đóng DS' : 'Quản lý list'}
                    </button>
                  )}
                </div>
                <select
                  disabled={!isGvcn}
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg outline-none font-bold text-slate-900 ${
                    !isGvcn
                      ? 'bg-slate-100 border-slate-200 cursor-not-allowed'
                      : 'bg-slate-50 border-slate-200 focus:border-blue-500 cursor-pointer'
                  }`}
                >
                  {academicYearsList.map((yr) => (
                    <option key={yr} value={yr}>
                      {yr}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Expandable Manage Academic Years List */}
            {showManageYears && (
              <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2">
                <div className="font-bold text-amber-950 text-[11px] flex justify-between items-center">
                  <span>Danh sách các năm học ({academicYearsList.length} năm)</span>
                </div>
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    placeholder="Ví dụ: 2027 - 2028"
                    value={newYearInput}
                    onChange={(e) => setNewYearInput(e.target.value)}
                    className="flex-1 px-2.5 py-1 text-xs bg-white border border-amber-300 rounded outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddNewYear}
                    className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded text-xs"
                  >
                    Thêm & Chọn
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {academicYearsList.map((yr) => (
                    <div
                      key={yr}
                      className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] border font-medium ${
                        yr === academicYear
                          ? 'bg-amber-500 text-white border-amber-600'
                          : 'bg-white text-slate-700 border-slate-200'
                      }`}
                    >
                      <span
                        onClick={() => setAcademicYear(yr)}
                        className="cursor-pointer"
                        title="Bấm để chọn năm học này"
                      >
                        {yr} {yr === academicYear && '✓'}
                      </span>
                      {academicYearsList.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleDeleteYear(yr)}
                          className="text-slate-400 hover:text-rose-600 ml-0.5"
                          title="Xóa khỏi danh sách"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <label className="block font-semibold text-slate-700 mb-1 flex items-center justify-between">
                <span>Tên trường THPT / Trường học:</span>
                <span className="text-[10px] text-blue-600 font-normal">Đồng bộ toàn bộ báo cáo, in ấn & Zalo</span>
              </label>
              <input
                type="text"
                required
                disabled={!isGvcn}
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                placeholder="Ví dụ: Trường THPT An Phú"
                className={`w-full px-3 py-2 border rounded-lg outline-none font-bold text-slate-900 ${
                  !isGvcn
                    ? 'bg-slate-100 border-slate-200 text-slate-600 cursor-not-allowed'
                    : 'bg-slate-50 border-slate-200 focus:border-blue-500'
                }`}
              />
              {isGvcn && (
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {['Trường THPT An Phú', 'Trường THPT Quốc Thái', 'Trường THPT Chuyên Thoại Ngọc Hầu', 'Trường THPT Chu Văn An'].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setSchoolName(preset)}
                      className={`px-2 py-0.5 rounded text-[10px] font-medium border transition-colors cursor-pointer ${
                        schoolName === preset
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  SĐT / Zalo của GVCN
                </label>
                <input
                  type="text"
                  required
                  disabled={!isGvcn}
                  value={teacherPhone}
                  onChange={(e) => setTeacherPhone(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg outline-none ${
                    !isGvcn
                      ? 'bg-slate-100 border-slate-200 text-slate-600 cursor-not-allowed'
                      : 'bg-slate-50 border-slate-200 focus:border-blue-500'
                  }`}
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Điểm chuẩn ban đầu mỗi tuần
                </label>
                <input
                  type="number"
                  required
                  disabled={!isGvcn}
                  value={baseScore}
                  onChange={(e) => setBaseScore(Number(e.target.value))}
                  className={`w-full px-3 py-2 border rounded-lg outline-none ${
                    !isGvcn
                      ? 'bg-slate-100 border-slate-200 text-slate-600 cursor-not-allowed'
                      : 'bg-slate-50 border-slate-200 focus:border-blue-500'
                  }`}
                />
              </div>
            </div>

            {isGvcn && (
              <div className="pt-2">
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-xs transition-colors cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Lưu Thay Đổi Cài Đặt</span>
                </button>
              </div>
            )}
          </form>

          {/* Backup & Data Controls */}
          <div className="mt-8 pt-5 border-t border-slate-200">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
              Sao Lưu & Quản Lý Dữ Liệu
            </h4>
            <div className="flex flex-wrap gap-2 text-xs">
              <button
                onClick={handleExport}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg border border-slate-300 transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Tải Tệp Sao Lưu (JSON)</span>
              </button>

              {isGvcn && (
                <>
                  <label className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg border border-slate-300 transition-colors cursor-pointer">
                    <Upload className="w-4 h-4" />
                    <span>Khôi Phục Từ Tệp</span>
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImport}
                      className="hidden"
                    />
                  </label>

                  <button
                    onClick={handleReset}
                    className="flex items-center gap-1.5 px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold rounded-lg border border-rose-200 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Đặt Lại Dữ Liệu Mẫu Lớp 10A7</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right: Disciplinary Rules Table */}
        <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-900">
                Bảng Quy Định Điểm Nề Nếp Lớp 10A7
              </h3>
            </div>
            {isGvcn && (
              <button
                onClick={() => setIsAddingRule(!isAddingRule)}
                className="text-xs font-semibold px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Thêm Quy Định</span>
              </button>
            )}
          </div>

          {/* Add Rule Form */}
          {isAddingRule && (
            <form onSubmit={handleAddRule} className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-200 space-y-2 text-xs">
              <div className="font-bold text-indigo-950">Thêm quy định thi đua mới</div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Tên quy định / lỗi</label>
                  <input
                    type="text"
                    required
                    value={newRuleName}
                    onChange={(e) => setNewRuleName(e.target.value)}
                    placeholder="Ví dụ: Thiếu ghế chào cờ..."
                    className="w-full px-2 py-1 bg-white border border-slate-300 rounded outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Phân loại</label>
                  <select
                    value={newRuleCategory}
                    onChange={(e) => {
                      const cat = e.target.value as 'violation' | 'reward';
                      setNewRuleCategory(cat);
                      setNewRulePoints(cat === 'violation' ? -2 : 2);
                    }}
                    className="w-full px-2 py-1 bg-white border border-slate-300 rounded outline-none"
                  >
                    <option value="violation">Vi phạm (Trừ điểm)</option>
                    <option value="reward">Khen thưởng (Cộng điểm)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Mã quy định</label>
                  <input
                    type="text"
                    value={newRuleCode}
                    onChange={(e) => setNewRuleCode(e.target.value)}
                    placeholder="V11 / R06"
                    className="w-full px-2 py-1 bg-white border border-slate-300 rounded outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-0.5">Số điểm áp dụng</label>
                  <input
                    type="number"
                    required
                    value={newRulePoints}
                    onChange={(e) => setNewRulePoints(Number(e.target.value))}
                    className="w-full px-2 py-1 bg-white border border-slate-300 rounded outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-1.5 pt-1">
                <button
                  type="button"
                  onClick={() => setIsAddingRule(false)}
                  className="px-2.5 py-1 text-slate-600 hover:bg-slate-200 rounded"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-3 py-1 bg-indigo-600 text-white font-semibold rounded hover:bg-indigo-700"
                >
                  Lưu
                </button>
              </div>
            </form>
          )}

          {/* Filter Rules Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 text-xs">
            <button
              type="button"
              onClick={() => setRulesFilter('all')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                rulesFilter === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Tất cả ({rules.length})
            </button>
            <button
              type="button"
              onClick={() => setRulesFilter('MĐ1')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                rulesFilter === 'MĐ1'
                  ? 'bg-rose-600 text-white'
                  : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
              }`}
            >
              MĐ1 (-2đ & -4đ)
            </button>
            <button
              type="button"
              onClick={() => setRulesFilter('MĐ2')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                rulesFilter === 'MĐ2'
                  ? 'bg-rose-700 text-white'
                  : 'bg-rose-50 text-rose-800 hover:bg-rose-100'
              }`}
            >
              MĐ2 (-12đ)
            </button>
            <button
              type="button"
              onClick={() => setRulesFilter('MĐ3')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                rulesFilter === 'MĐ3'
                  ? 'bg-rose-900 text-white'
                  : 'bg-rose-50 text-rose-950 hover:bg-rose-100'
              }`}
            >
              MĐ3 (-32đ)
            </button>
            <button
              type="button"
              onClick={() => setRulesFilter('reward')}
              className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                rulesFilter === 'reward'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
              }`}
            >
              Khen thưởng
            </button>
          </div>

          {/* Rules List */}
          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {rules
              .filter((r) => {
                if (rulesFilter === 'all') return true;
                if (rulesFilter === 'reward') return r.category === 'reward';
                return r.severityLevel === rulesFilter;
              })
              .map((r) => {
                const isReward = r.category === 'reward';
                return (
                  <div
                    key={r.id}
                    className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 hover:border-slate-300 bg-slate-50/50 text-xs transition-colors"
                  >
                    <div className="pr-2 truncate">
                      <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                        <span className="text-[10px] text-slate-400 font-bold">[{r.code}]</span>
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
                        <span className="truncate">{r.name}</span>
                      </div>
                      {r.description && (
                        <div className="text-[11px] text-slate-500 truncate mt-0.5">
                          {r.description}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`font-black px-2 py-0.5 rounded text-[11px] ${
                          isReward
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {r.points > 0 ? `+${r.points}` : r.points}đ
                      </span>
                      {isGvcn && (
                        <button
                          onClick={() => handleDeleteRule(r.id)}
                          className="text-slate-400 hover:text-rose-600 p-1 rounded cursor-pointer"
                          title="Chỉ GVCN: Xóa quy định"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
};

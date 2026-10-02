import React, { useState, useEffect } from 'react';
import {
  School,
  Save,
  X,
  CheckCircle2,
  Sparkles,
  Building2,
  FileSpreadsheet,
  Printer,
  MessageCircle,
  Plus,
  Trash2,
  Lock,
  ShieldAlert,
} from 'lucide-react';
import { TeacherSettings, AppUserRole } from '../types';
import { DEFAULT_SCHOOL_NAMES } from '../data/defaultData';

interface SchoolNameModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: TeacherSettings;
  onSaveSettings: (settings: TeacherSettings) => void;
  activeRole?: AppUserRole | null;
  onOpenLoginModal?: () => void;
}

export const SchoolNameModal: React.FC<SchoolNameModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  activeRole,
  onOpenLoginModal,
}) => {
  const isGvcn = activeRole === 'gvcn';
  const [schoolName, setSchoolName] = useState(settings.schoolName);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [customList, setCustomList] = useState<string[]>(() => {
    return settings.schoolNamesList && settings.schoolNamesList.length > 0
      ? settings.schoolNamesList
      : DEFAULT_SCHOOL_NAMES;
  });

  useEffect(() => {
    if (isOpen) {
      setSchoolName(settings.schoolName);
      if (settings.schoolNamesList && settings.schoolNamesList.length > 0) {
        setCustomList(settings.schoolNamesList);
      }
      setSavedSuccess(false);
    }
  }, [isOpen, settings]);

  if (!isOpen) return null;

  const handleSelectPreset = (name: string) => {
    setSchoolName(name);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isGvcn) {
      alert('Quyền hạn bị từ chối: Chỉ Giáo viên chủ nhiệm mới có quyền thay đổi tên trường!');
      return;
    }
    const trimmed = schoolName.trim();
    if (!trimmed) return;

    // Add to list if not present
    let updatedList = [...customList];
    if (!updatedList.includes(trimmed)) {
      updatedList = [trimmed, ...updatedList];
    }

    const updatedSettings: TeacherSettings = {
      ...settings,
      schoolName: trimmed,
      schoolNamesList: updatedList,
    };

    onSaveSettings(updatedSettings);
    setCustomList(updatedList);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  const handleRemoveFromList = (nameToRemove: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = customList.filter((n) => n !== nameToRemove);
    setCustomList(updated);
    onSaveSettings({
      ...settings,
      schoolNamesList: updated,
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden transform transition-all animate-fadeIn">
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-blue-900 via-indigo-900 to-sky-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-amber-400 text-amber-950 font-bold shadow-xs">
              <School className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Thay Đổi Tên Trường Học
              </h3>
              <p className="text-xs text-blue-200">
                Đồng bộ tên trường trên giao diện, báo cáo in ấn, Excel & Zalo
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        {!isGvcn ? (
          <div className="p-6 text-center space-y-4">
            <div className="w-14 h-14 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto border border-rose-200 shadow-inner">
              <Lock className="w-7 h-7" />
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-900">
                Quyền Hạn Bị Giới Hạn: Chỉ Dành Cho GVCN
              </h4>
              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed max-w-sm mx-auto">
                Chức năng thay đổi tên trường, tên lớp và các thông tin cài đặt hệ thống chỉ giao cho <strong>Giáo viên chủ nhiệm (GVCN)</strong>. Các tài khoản học sinh và ban cán sự không được phép thực hiện thao tác này.
              </p>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-700">
              Trường học hiện tại: <strong className="text-blue-900 font-bold">{settings.schoolName}</strong>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-slate-300 text-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-100 cursor-pointer"
              >
                Đóng
              </button>
              {onOpenLoginModal && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenLoginModal();
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
                >
                  Đăng Nhập Tài Khoản GVCN
                </button>
              )}
            </div>
          </div>
        ) : (
          <form onSubmit={handleSave} className="p-5 space-y-4">
            {savedSuccess && (
              <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 p-3 rounded-xl flex items-center gap-2 text-xs font-bold animate-fadeIn">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Đã cập nhật tên trường thành công thành: &ldquo;{schoolName}&rdquo;!</span>
              </div>
            )}

            {/* School Name Input */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-blue-600" />
                  <span>Tên trường hiển thị:</span>
                  <span className="text-rose-500">*</span>
                </span>
                <span className="text-[11px] font-normal text-slate-500">
                  Ví dụ: Trường THPT An Phú
                </span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <School className="w-4 h-4 text-blue-600" />
                </div>
                <input
                  type="text"
                  required
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  placeholder="Nhập tên trường học..."
                  className="w-full text-sm font-bold pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:border-blue-600 focus:bg-white transition-all text-blue-950 focus:ring-2 focus:ring-blue-100"
                />
              </div>
            </div>

            {/* Quick Preset Suggestions */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  <span>Gợi ý tên trường nhanh / Danh sách đã lưu:</span>
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-1 bg-slate-50 rounded-xl border border-slate-200">
                {customList.map((preset) => {
                  const isSelected = preset.trim().toLowerCase() === schoolName.trim().toLowerCase();
                  return (
                    <div
                      key={preset}
                      onClick={() => handleSelectPreset(preset)}
                      className={`group flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-white text-slate-700 hover:bg-blue-50 hover:text-blue-700 border border-slate-200'
                      }`}
                    >
                      <span>{preset}</span>
                      {isSelected ? (
                        <span className="text-[10px] bg-white/20 px-1 rounded">Đang chọn</span>
                      ) : (
                        customList.length > 1 && (
                          <button
                            type="button"
                            onClick={(e) => handleRemoveFromList(preset, e)}
                            className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-600 ml-0.5"
                            title="Xóa khỏi danh sách gợi ý"
                          >
                            ×
                          </button>
                        )
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Real-time Preview */}
            <div className="bg-gradient-to-br from-blue-50 via-indigo-50/50 to-sky-50 border border-blue-200 rounded-xl p-3.5 space-y-2.5 text-xs">
              <span className="font-bold text-blue-900 block flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>Xem trước vị trí áp dụng:</span>
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                <div className="bg-white p-2 rounded-lg border border-blue-100 flex items-start gap-2 shadow-2xs">
                  <School className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-slate-500 font-medium">Header hệ thống:</div>
                    <div className="font-bold text-blue-950 truncate max-w-[180px]">
                      {schoolName.trim() || '...'}
                    </div>
                  </div>
                </div>

                <div className="bg-white p-2 rounded-lg border border-blue-100 flex items-start gap-2 shadow-2xs">
                  <Printer className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-slate-500 font-medium">Báo cáo in ấn A4:</div>
                    <div className="font-bold text-purple-950 uppercase truncate max-w-[180px]">
                      {schoolName.trim() || '...'}
                    </div>
                  </div>
                </div>

                <div className="bg-white p-2 rounded-lg border border-blue-100 flex items-start gap-2 shadow-2xs">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-slate-500 font-medium">Xuất file Excel (.xlsx):</div>
                    <div className="font-bold text-emerald-950 truncate max-w-[180px]">
                      {schoolName.trim() || '...'}
                    </div>
                  </div>
                </div>

                <div className="bg-white p-2 rounded-lg border border-blue-100 flex items-start gap-2 shadow-2xs">
                  <MessageCircle className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-slate-500 font-medium">Tin nhắn Zalo & SMS:</div>
                    <div className="font-bold text-sky-950 truncate max-w-[180px]">
                      {schoolName.trim() || '...'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-slate-300 text-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-100 cursor-pointer transition-colors"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={!schoolName.trim()}
                className="flex items-center gap-1.5 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer transition-all hover:scale-102"
              >
                <Save className="w-4 h-4 text-white" />
                <span>Lưu Tên Trường Mới</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

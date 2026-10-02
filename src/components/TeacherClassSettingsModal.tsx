import React, { useState, useEffect } from 'react';
import {
  Settings,
  User,
  GraduationCap,
  Phone,
  MessageSquare,
  School,
  Calendar,
  Save,
  X,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { TeacherSettings, AppUserRole } from '../types';

interface TeacherClassSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: TeacherSettings;
  onSaveSettings: (settings: TeacherSettings) => void;
  activeRole?: AppUserRole | null;
}

export const TeacherClassSettingsModal: React.FC<TeacherClassSettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  activeRole,
}) => {
  const isGvcn = activeRole === 'gvcn';
  const [teacherName, setTeacherName] = useState(settings.teacherName);
  const [className, setClassName] = useState(settings.className);
  const [teacherPhone, setTeacherPhone] = useState(settings.teacherPhone);
  const [teacherZalo, setTeacherZalo] = useState(settings.teacherZalo || settings.teacherPhone);
  const [schoolName, setSchoolName] = useState(settings.schoolName);
  const [academicYear, setAcademicYear] = useState(settings.academicYear);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTeacherName(settings.teacherName);
      setClassName(settings.className);
      setTeacherPhone(settings.teacherPhone);
      setTeacherZalo(settings.teacherZalo || settings.teacherPhone);
      setSchoolName(settings.schoolName);
      setAcademicYear(settings.academicYear);
      setSavedSuccess(false);
    }
  }, [isOpen, settings]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isGvcn) {
      alert('Quyền hạn bị từ chối: Chỉ Giáo viên chủ nhiệm mới có quyền thay đổi thông tin cài đặt trường và lớp!');
      return;
    }
    if (!teacherName.trim() || !className.trim() || !teacherPhone.trim()) {
      return;
    }

    const updated: TeacherSettings = {
      ...settings,
      teacherName: teacherName.trim(),
      className: className.trim(),
      teacherPhone: teacherPhone.trim(),
      teacherZalo: (teacherZalo.trim() || teacherPhone.trim()),
      schoolName: schoolName.trim() || settings.schoolName,
      academicYear: academicYear.trim() || settings.academicYear,
    };

    onSaveSettings(updated);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden transform transition-all">
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-blue-900 via-indigo-900 to-sky-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2.5 rounded-xl bg-amber-400 text-amber-950 font-bold shadow-xs">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Cài Đặt Thông Tin Trường Học, Lớp & GVCN
              </h3>
              <p className="text-xs text-blue-200">
                Thay đổi Tên trường, Giáo viên chủ nhiệm, Tên lớp và Số điện thoại liên hệ
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {savedSuccess && (
            <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 p-3 rounded-xl flex items-center gap-2 text-xs font-bold animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Đã lưu thành công thông tin GVCN, Lớp và Số điện thoại mới!</span>
            </div>
          )}

          {/* 1. Tên GVCN */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-blue-600" />
              <span>Tên Giáo Viên Chủ Nhiệm (GVCN):</span>
              <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={teacherName}
              onChange={(e) => setTeacherName(e.target.value)}
              placeholder="Ví dụ: Trần Văn Dư"
              className="w-full text-sm font-semibold px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:border-blue-600 focus:bg-white transition-all text-slate-900"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Tên thầy/cô sẽ hiển thị trên tiêu đề hệ thống, các báo cáo in ấn và chữ ký tin nhắn Zalo/SMS.
            </p>
          </div>

          {/* 2. Tên Lớp */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
              <span>Tên Lớp Học:</span>
              <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              placeholder="Ví dụ: 10A7, 11A1, 12A3..."
              className="w-full text-sm font-bold px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:border-blue-600 focus:bg-white transition-all text-blue-900"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Tên lớp sẽ được cập nhật đồng bộ trong danh sách học sinh, sổ quỹ, sổ thi đua toàn trường.
            </p>
          </div>

          {/* 3. Số Điện Thoại & Zalo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                <span>Số Điện Thoại GVCN:</span>
                <span className="text-rose-500">*</span>
              </label>
              <input
                type="tel"
                required
                value={teacherPhone}
                onChange={(e) => {
                  setTeacherPhone(e.target.value);
                  if (!teacherZalo || teacherZalo === teacherPhone) {
                    setTeacherZalo(e.target.value);
                  }
                }}
                placeholder="Ví dụ: 0912.345.678"
                className="w-full text-sm font-semibold px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:border-emerald-600 focus:bg-white transition-all text-slate-900"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Số hotline liên lạc cho phụ huynh học sinh
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                <span>Số Zalo GVCN:</span>
              </label>
              <input
                type="tel"
                value={teacherZalo}
                onChange={(e) => setTeacherZalo(e.target.value)}
                placeholder="Ví dụ: 0912.345.678"
                className="w-full text-sm font-semibold px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:border-blue-600 focus:bg-white transition-all text-slate-900"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Số Zalo gửi tin nhắn phản ánh nề nếp
              </p>
            </div>
          </div>

          {/* 4. Trường học & Năm học */}
          <div className="pt-2 border-t border-slate-100 space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <School className="w-3.5 h-3.5 text-blue-600" />
                  <span>Tên Trường Học:</span>
                  <span className="text-rose-500">*</span>
                </span>
                <span className="text-[11px] font-normal text-slate-500">
                  Hiển thị trên toàn bộ báo cáo & tin nhắn
                </span>
              </label>
              <input
                type="text"
                required
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                placeholder="Ví dụ: Trường THPT An Phú"
                className="w-full text-sm font-bold px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:border-blue-600 focus:bg-white text-slate-900 transition-all"
              />
              {/* Quick suggestions pills */}
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {['Trường THPT An Phú', 'Trường THPT Quốc Thái', 'Trường THPT Chuyên Thoại Ngọc Hầu', 'Trường THPT Chu Văn An'].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setSchoolName(preset)}
                    className={`px-2 py-0.5 rounded text-[11px] font-medium border transition-colors cursor-pointer ${
                      schoolName === preset
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                <span>Năm Học:</span>
              </label>
              <input
                type="text"
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                placeholder="Ví dụ: 2026 - 2027"
                className="w-full text-sm font-semibold px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl outline-none focus:border-blue-600 focus:bg-white text-slate-800 transition-all"
              />
            </div>
          </div>

          {/* Quick Preview Card */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-3 text-xs">
            <span className="font-bold text-blue-900 block mb-1">Xem trước thông tin hiển thị:</span>
            <div className="text-slate-700 leading-relaxed space-y-0.5">
              <div>
                Trường: <strong className="text-blue-900 font-bold">{schoolName || '...'}</strong>
              </div>
              <div>
                Lớp: <strong className="text-blue-700">{className || '...'}</strong> • GVCN:{' '}
                <strong className="text-slate-900">{teacherName || '...'}</strong> • SĐT:{' '}
                <strong className="text-emerald-700">{teacherPhone || '...'}</strong>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 text-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-100 cursor-pointer transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer transition-all hover:scale-102"
            >
              <Save className="w-4 h-4 text-white" />
              <span>Lưu Cài Đặt Thay Đổi</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

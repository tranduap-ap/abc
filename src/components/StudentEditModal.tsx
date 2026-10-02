import React, { useState, useEffect } from 'react';
import {
  X,
  UserCheck,
  Phone,
  Users,
  Check,
  AlertCircle,
  Sparkles,
  ChevronDown,
} from 'lucide-react';
import { Student, StudentRole, Gender } from '../types';

interface StudentEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: Student | null;
  students: Student[];
  onSaveStudent: (student: Student) => void;
}

export const StudentEditModal: React.FC<StudentEditModalProps> = ({
  isOpen,
  onClose,
  student,
  students,
  onSaveStudent,
}) => {
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [name, setName] = useState('');
  const [rollNumber, setRollNumber] = useState<number>(1);
  const [gender, setGender] = useState<Gender>('Nam');
  const [group, setGroup] = useState<number>(1);
  const [role, setRole] = useState<StudentRole>('Học sinh');
  const [parentName, setParentName] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [note, setNote] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Sync form when student prop changes or modal opens
  useEffect(() => {
    if (student) {
      setSelectedStudentId(student.id);
      populateForm(student);
    } else if (students.length > 0) {
      const first = students[0];
      setSelectedStudentId(first.id);
      populateForm(first);
    }
    setSuccessMessage(null);
  }, [student, isOpen]);

  const populateForm = (s: Student) => {
    setName(s.name);
    setRollNumber(s.rollNumber);
    setGender(s.gender);
    setGroup(s.group);
    setRole(s.role);
    setParentName(s.parentName || '');
    setParentPhone(s.parentPhone || '');
    setNote(s.note || '');
  };

  const handleSelectStudent = (id: string) => {
    setSelectedStudentId(id);
    const found = students.find((s) => s.id === id);
    if (found) {
      populateForm(found);
      setSuccessMessage(null);
    }
  };

  if (!isOpen) return null;

  const currentSelectedStudent =
    students.find((s) => s.id === selectedStudentId) || student || students[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    if (!currentSelectedStudent) return;

    const updated: Student = {
      ...currentSelectedStudent,
      name: name.trim(),
      rollNumber: Number(rollNumber),
      gender,
      group: Number(group),
      role,
      parentName: parentName.trim(),
      parentPhone: parentPhone.trim(),
      note: note.trim() || undefined,
    };

    onSaveStudent(updated);
    setSuccessMessage(`Đã lưu cập nhật thông tin học sinh ${name.trim()} thành công!`);
    setTimeout(() => {
      setSuccessMessage(null);
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-blue-900 to-indigo-900 text-white flex items-center justify-between shrink-0 shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold tracking-tight">
                Chỉnh Sửa Thông Tin Học Sinh
              </h3>
              <p className="text-xs text-blue-200">
                Lớp 10A7 • GVCN Thầy Trần Văn Dư
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-300 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Student Selector Bar */}
        <div className="bg-slate-50 px-5 py-3 border-b border-slate-200 shrink-0">
          <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-blue-600" />
              Chọn học sinh cần chỉnh sửa:
            </span>
            <span className="text-[11px] font-normal text-slate-500">
              Tổng số {students.length} học sinh
            </span>
          </label>
          <div className="relative">
            <select
              value={selectedStudentId}
              onChange={(e) => handleSelectStudent(e.target.value)}
              className="w-full pl-3 pr-8 py-2 bg-white border border-blue-300 rounded-xl text-xs font-bold text-slate-900 shadow-xs appearance-none outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  STT #{s.rollNumber} - {s.name} (Tổ {s.group} • {s.role})
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-500 absolute right-2.5 top-2.5 pointer-events-none" />
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs overflow-y-auto flex-1">
          {successMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl flex items-center gap-2 font-bold text-xs animate-pulse">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Name & Roll Number */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">
                Họ và tên học sinh <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ví dụ: Nguyễn Văn A"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl outline-none font-semibold text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                STT (Số thứ tự) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                required
                min={1}
                max={100}
                value={rollNumber}
                onChange={(e) => setRollNumber(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl outline-none font-bold text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Gender, Group, Role */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Giới tính</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as Gender)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl outline-none font-semibold text-slate-900 focus:bg-white focus:border-blue-500 cursor-pointer"
              >
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Thuộc Tổ</label>
              <select
                value={group}
                onChange={(e) => setGroup(Number(e.target.value))}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl outline-none font-bold text-blue-700 focus:bg-white focus:border-blue-500 cursor-pointer"
              >
                <option value={1}>Tổ 1</option>
                <option value={2}>Tổ 2</option>
                <option value={3}>Tổ 3</option>
                <option value={4}>Tổ 4</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Chức vụ trong lớp</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as StudentRole)}
                className="w-full px-2.5 py-2 bg-slate-50 border border-slate-300 rounded-xl outline-none font-bold text-amber-800 focus:bg-white focus:border-blue-500 cursor-pointer"
              >
                <option value="Học sinh">Học sinh</option>
                <option value="Lớp trưởng">Lớp trưởng (Toàn quyền)</option>
                <option value="Thủ quỹ">Thủ quỹ (Sổ quỹ lớp)</option>
                <option value="Lớp phó học tập">Lớp phó học tập</option>
                <option value="Lớp phó lao động">Lớp phó lao động</option>
                <option value="Lớp phó trật tự">Lớp phó trật tự</option>
                <option value="Lớp phó">Lớp phó</option>
                <option value="Bí thư">Bí thư</option>
                <option value="Tổ trưởng">Tổ trưởng</option>
                <option value="Cờ đỏ">Cờ đỏ</option>
              </select>
            </div>
          </div>

          {/* Parent Name & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Họ tên Phụ huynh
              </label>
              <input
                type="text"
                value={parentName}
                onChange={(e) => setParentName(e.target.value)}
                placeholder="Ví dụ: Nguyễn Văn B"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl outline-none text-slate-900 focus:bg-white focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1 flex items-center justify-between">
                <span>
                  Số điện thoại Phụ huynh <span className="text-rose-500">*</span>
                </span>
                {parentPhone && (
                  <a
                    href={`tel:${parentPhone}`}
                    className="text-emerald-700 font-semibold text-[11px] flex items-center gap-0.5 hover:underline"
                  >
                    <Phone className="w-3 h-3" /> Gọi thử
                  </a>
                )}
              </label>
              <input
                type="tel"
                required
                value={parentPhone}
                onChange={(e) => setParentPhone(e.target.value)}
                placeholder="Ví dụ: 0912345678"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl outline-none font-bold text-blue-700 focus:bg-white focus:border-blue-500"
              />
            </div>
          </div>

          {/* Student Note */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Ghi chú đặc điểm học sinh (tùy chọn)
            </label>
            <textarea
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ví dụ: Học tốt môn Toán, hay quên mang vở bài tập, ngồi bàn 2 dãy giữa..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl outline-none text-slate-900 focus:bg-white focus:border-blue-500 resize-none"
            />
          </div>

          <div className="bg-amber-50 p-2.5 rounded-xl border border-amber-200 flex items-start gap-2 text-amber-900 text-[11px]">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              Thông tin học sinh được cập nhật đồng bộ ngay trên bảng điểm, danh sách gửi Zalo và xếp loại thi đua 4 Tổ.
            </span>
          </div>

          {/* Action buttons */}
          <div className="pt-3 border-t border-slate-200 flex justify-end gap-2.5 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 rounded-xl shadow-md transition-all cursor-pointer hover:shadow-lg flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Lưu Thay Đổi Thông Tin</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Edit2,
  Trash2,
  Search,
  Phone,
  MessageCircle,
  Sparkles,
  ShieldAlert,
  Award,
  Check,
  X,
  FileSpreadsheet,
  Download,
  Upload,
} from 'lucide-react';
import { Student, StudentRole, Gender, StudentScoreSummary, AppUserRole, TeacherSettings } from '../types';
import { excelService } from '../services/excelService';

interface StudentRosterViewProps {
  students: Student[];
  summaries: StudentScoreSummary[];
  settings?: TeacherSettings;
  activeRole?: AppUserRole | null;
  onAddStudent: (student: Omit<Student, 'id'>) => void;
  onUpdateStudent: (student: Student) => void;
  onDeleteStudent: (id: string) => void;
  onClearAllStudents?: () => void;
  onOpenRecordForStudent: (studentId: string) => void;
  onOpenZaloForStudent: (studentId: string) => void;
  onOpenExcelModal: () => void;
  onOpenRoleAssignmentModal?: () => void;
  onExportExcel?: () => void;
}

export const StudentRosterView: React.FC<StudentRosterViewProps> = ({
  students,
  summaries,
  settings,
  activeRole = null,
  onAddStudent,
  onUpdateStudent,
  onDeleteStudent,
  onClearAllStudents,
  onOpenRecordForStudent,
  onOpenZaloForStudent,
  onOpenExcelModal,
  onOpenRoleAssignmentModal,
  onExportExcel,
}) => {
  const [search, setSearch] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<number | 'all'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [rollNumber, setRollNumber] = useState<number>(students.length + 1);
  const [gender, setGender] = useState<Gender>('Nam');
  const [group, setGroup] = useState<number>(1);
  const [role, setRole] = useState<StudentRole>('Học sinh');
  const [parentName, setParentName] = useState('');
  const [parentPhone, setParentPhone] = useState('');
  const [note, setNote] = useState('');

  const openAddModal = () => {
    setEditingStudent(null);
    setName('');
    setRollNumber(students.length + 1);
    setGender('Nam');
    setGroup(1);
    setRole('Học sinh');
    setParentName('');
    setParentPhone('');
    setNote('');
    setIsModalOpen(true);
  };

  const openEditModal = (s: Student) => {
    setEditingStudent(s);
    setName(s.name);
    setRollNumber(s.rollNumber);
    setGender(s.gender);
    setGroup(s.group);
    setRole(s.role);
    setParentName(s.parentName);
    setParentPhone(s.parentPhone);
    setNote(s.note || '');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingStudent) {
      onUpdateStudent({
        ...editingStudent,
        name: name.trim(),
        rollNumber: Number(rollNumber),
        gender,
        group: Number(group),
        role,
        parentName: parentName.trim(),
        parentPhone: parentPhone.trim(),
        note: note.trim() || undefined,
      });
    } else {
      onAddStudent({
        name: name.trim(),
        rollNumber: Number(rollNumber),
        gender,
        group: Number(group),
        role,
        parentName: parentName.trim(),
        parentPhone: parentPhone.trim(),
        note: note.trim() || undefined,
      });
    }

    setIsModalOpen(false);
  };

  const filteredStudents = students.filter((s) => {
    const matchGroup = selectedGroup === 'all' || s.group === selectedGroup;
    const matchSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.rollNumber.toString().includes(search) ||
      s.parentPhone.includes(search);
    return matchGroup && matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600" />
              <span>Danh Sách Học Sinh Lớp {settings?.className || '10A7'} ({students.length} Học Sinh)</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {settings?.schoolName || 'Trường THPT An Phú'} • Quản lý thông tin học sinh theo 4 Tổ và liên lạc phụ huynh
            </p>
          </div>

          {/* Action Buttons: Add from Excel, Add manually, Download template */}
          <div className="flex flex-wrap items-center gap-2">
            {activeRole === 'gvcn' && onOpenRoleAssignmentModal && (
              <button
                onClick={onOpenRoleAssignmentModal}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer hover:shadow-md"
                title="Chỉ GVCN: Phân quyền ban cán sự: Lớp trưởng, Thủ quỹ, Lớp phó, Tổ trưởng"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>⚡ Phân Quyền Ban Cán Sự</span>
              </button>
            )}

            {/* Prominent Edit Student Info Button */}
            {students.length > 0 && (
              <button
                onClick={() => {
                  const target = students[0];
                  if (target) openEditModal(target);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-950 text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer hover:shadow-md"
                title="Chỉnh sửa thông tin chi tiết học sinh trong lớp 10A7 (họ tên, STT, tổ, chức vụ, SĐT phụ huynh...)"
              >
                <Edit2 className="w-4 h-4 text-slate-950" />
                <span>Chỉnh Sửa Thông Tin HS</span>
              </button>
            )}

            <button
              onClick={() => excelService.downloadTemplate()}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl border border-slate-300 transition-colors cursor-pointer"
              title="Tải file mẫu Excel chuẩn để điền danh sách học sinh"
            >
              <Download className="w-4 h-4 text-emerald-600" />
              <span>Tải File Mẫu Excel</span>
            </button>

            {students.length > 0 && onExportExcel && (
              <button
                onClick={onExportExcel}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-teal-700 to-emerald-700 hover:from-teal-800 hover:to-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer hover:shadow-md"
                title="Xuất danh sách học sinh lớp 10A7 và phân 4 tổ ra file Excel (.xlsx)"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-200" />
                <span>Xuất Excel Danh Sách</span>
              </button>
            )}

            <button
              onClick={onOpenExcelModal}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Thêm Học Sinh Từ Excel</span>
            </button>

            <button
              onClick={openAddModal}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Thêm Thủ Công</span>
            </button>

            {students.length > 0 && onClearAllStudents && (
              <button
                onClick={() => {
                  if (confirm('Bạn có chắc chắn muốn xóa toàn bộ danh sách học sinh hiện tại?')) {
                    onClearAllStudents();
                  }
                }}
                className="inline-flex items-center gap-1 px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold rounded-xl border border-rose-200 transition-colors"
                title="Xóa hết danh sách học sinh"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Xóa Hết</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter & Search Bar */}
        {students.length > 0 && (
          <div className="flex flex-col sm:flex-row gap-3 pt-3 border-t border-slate-100">
            <div className="relative flex-1">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm theo tên học sinh, số thứ tự hoặc SĐT phụ huynh..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:bg-white focus:border-blue-500"
              />
            </div>

            <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
              <button
                onClick={() => setSelectedGroup('all')}
                className={`px-3 py-1.5 text-xs rounded-lg font-semibold border transition-all ${
                  selectedGroup === 'all'
                    ? 'bg-slate-900 border-slate-900 text-white'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Tất cả ({students.length})
              </button>
              {[1, 2, 3, 4].map((g) => {
                const countInGroup = students.filter((s) => s.group === g).length;
                return (
                  <button
                    key={g}
                    onClick={() => setSelectedGroup(g)}
                    className={`px-3 py-1.5 text-xs rounded-lg font-semibold border whitespace-nowrap transition-all ${
                      selectedGroup === g
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Tổ {g} ({countInGroup})
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Empty State when no students */}
      {students.length === 0 ? (
        <div className="bg-white rounded-2xl border-2 border-dashed border-slate-300 p-8 sm:p-12 text-center max-w-2xl mx-auto shadow-xs">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FileSpreadsheet className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-1">
            Danh Sách Học Sinh Lớp 10A7 Đang Trống
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mb-6">
            Thầy Dư có thể tải file mẫu Excel (.xlsx) để điền danh sách lớp hoặc tải file Excel có sẵn lên để hệ thống tự động nhận diện danh sách học sinh.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => excelService.downloadTemplate()}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl border border-slate-300 transition-colors"
            >
              <Download className="w-4 h-4 text-emerald-600" />
              <span>Tải File Mẫu Excel</span>
            </button>
            <button
              onClick={onOpenExcelModal}
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition-all"
            >
              <Upload className="w-4 h-4" />
              <span>Tải Lên File Excel Của Lớp</span>
            </button>
            <button
              onClick={openAddModal}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              <span>Thêm Thủ Công</span>
            </button>
          </div>
        </div>
      ) : (
        /* Student Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStudents.map((s) => {
            const summary = summaries.find((sum) => sum.student.id === s.id);
            const totalScore = summary?.totalScore ?? 100;
            const rankTitle = summary?.rankTitle ?? 'Tốt';

            return (
              <div
                key={s.id}
                className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs hover:border-blue-300 hover:shadow-sm transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Header of Card */}
                  <div className="flex items-start justify-between gap-2 pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-lg bg-blue-100 text-blue-800 font-bold text-xs flex items-center justify-center shrink-0">
                        {s.rollNumber}
                      </span>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 leading-tight">
                          {s.name}
                        </h4>
                        <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-slate-500">
                          <span>{s.gender}</span>
                          <span>•</span>
                          <span className="font-semibold text-blue-700">Tổ {s.group}</span>
                          {s.role !== 'Học sinh' && (
                            <>
                              <span>•</span>
                              <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 font-semibold text-[10px]">
                                {s.role}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-sm font-black text-slate-900">{totalScore}đ</div>
                      <span className="text-[10px] text-slate-500 font-medium">
                        {rankTitle}
                      </span>
                    </div>
                  </div>

                  {/* Summary of turns and points */}
                  <div className="flex items-center justify-between pt-2 pb-1 text-[11px]">
                    <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-medium border border-emerald-200">
                      Cộng: <strong>+{summary?.rewardPoints || 0}đ</strong> ({summary?.rewardCount || 0} lượt)
                    </span>
                    <span className="text-rose-700 bg-rose-50 px-2 py-0.5 rounded font-medium border border-rose-200">
                      Trừ: <strong>-{summary?.violationPoints || 0}đ</strong> ({summary?.violationCount || 0} lượt)
                    </span>
                  </div>

                  {/* Parent Contact Info */}
                  <div className="py-2.5 space-y-1 text-xs text-slate-600">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Phụ huynh:</span>
                      <span className="font-medium text-slate-800">
                        {s.parentName || 'Chưa cập nhật'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Số điện thoại:</span>
                      <span className="font-bold text-blue-600">{s.parentPhone}</span>
                    </div>
                    {s.note && (
                      <div className="text-[11px] text-slate-500 italic bg-slate-50 p-1.5 rounded mt-1">
                        {s.note}
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onOpenZaloForStudent(s.id)}
                      className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors"
                      title="Gửi Zalo"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                    </button>
                    <a
                      href={`tel:${s.parentPhone}`}
                      className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg transition-colors"
                      title="Gọi phụ huynh"
                    >
                      <Phone className="w-3.5 h-3.5" />
                    </a>
                    <button
                      onClick={() => onOpenRecordForStudent(s.id)}
                      className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold rounded-lg transition-colors"
                      title="Chấm điểm / Vi phạm"
                    >
                      Chấm điểm
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => openEditModal(s)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold text-xs rounded-lg transition-all cursor-pointer shadow-2xs hover:shadow-xs"
                      title="Chỉnh sửa thông tin học sinh này (họ tên, STT, tổ, chức vụ, SĐT phụ huynh)"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-amber-700" />
                      <span>Sửa Thông Tin</span>
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`Bạn có chắc muốn xóa học sinh ${s.name} khỏi danh sách lớp 10A7?`)) {
                          onDeleteStudent(s.id);
                        }
                      }}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Xóa học sinh"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Student Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="text-base font-bold">
                {editingStudent ? 'Chỉnh Sửa Thông Tin Học Sinh' : 'Thêm Học Sinh Mới — Lớp 10A7'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick student switcher dropdown when in edit mode */}
            {editingStudent && students.length > 1 && (
              <div className="bg-amber-50/80 px-5 py-2.5 border-b border-amber-200">
                <label className="block text-[11px] font-bold text-amber-900 mb-1 flex items-center justify-between">
                  <span>Chuyển sang học sinh khác cần sửa:</span>
                  <span className="font-normal text-slate-500 text-[10px]">Tự động tải thông tin</span>
                </label>
                <select
                  value={editingStudent.id}
                  onChange={(e) => {
                    const target = students.find((st) => st.id === e.target.value);
                    if (target) openEditModal(target);
                  }}
                  className="w-full px-2.5 py-1.5 bg-white border border-amber-300 rounded-lg text-xs font-bold text-slate-800 outline-none cursor-pointer"
                >
                  {students.map((st) => (
                    <option key={st.id} value={st.id}>
                      #{st.rollNumber} - {st.name} (Tổ {st.group} • {st.role})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs">
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="block font-semibold text-slate-700 mb-1">
                    Họ và tên học sinh *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nguyễn Văn A"
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">STT</label>
                  <input
                    type="number"
                    required
                    value={rollNumber}
                    onChange={(e) => setRollNumber(Number(e.target.value))}
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Giới tính</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as Gender)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg outline-none focus:border-blue-500"
                  >
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tổ</label>
                  <select
                    value={group}
                    onChange={(e) => setGroup(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg outline-none focus:border-blue-500"
                  >
                    <option value={1}>Tổ 1</option>
                    <option value={2}>Tổ 2</option>
                    <option value={3}>Tổ 3</option>
                    <option value={4}>Tổ 4</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Chức vụ</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as StudentRole)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-300 rounded-lg outline-none focus:border-blue-500"
                  >
                    <option value="Học sinh">Học sinh</option>
                    <option value="Lớp trưởng">Lớp trưởng</option>
                    <option value="Thủ quỹ">Thủ quỹ (Nhập Quỹ Lớp)</option>
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

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Họ tên Phụ huynh
                  </label>
                  <input
                    type="text"
                    value={parentName}
                    onChange={(e) => setParentName(e.target.value)}
                    placeholder="Nguyễn Văn B"
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Số điện thoại PH *
                  </label>
                  <input
                    type="text"
                    required
                    value={parentPhone}
                    onChange={(e) => setParentPhone(e.target.value)}
                    placeholder="0912345678"
                    className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Ghi chú đặc điểm học sinh
                </label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Học tốt Toán, hay quên mang sách vở..."
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg outline-none focus:border-blue-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
                >
                  {editingStudent ? 'Cập Nhật' : 'Thêm Mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

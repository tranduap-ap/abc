import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  UserCheck,
  KeyRound,
  Save,
  CheckCircle2,
  Users,
  Award,
  Wallet,
  Sparkles,
  Info,
} from 'lucide-react';
import { Student, StudentRole, AppUserRole } from '../types';
import { authService } from '../services/authService';
import { USER_ROLES } from '../services/permissionService';

interface StudentRoleAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  onSaveRoleAssignments: (updatedStudents: Student[]) => void;
  onAccountsUpdated: () => void;
}

interface OfficerRoleConfig {
  appRole: AppUserRole;
  studentRole: StudentRole;
  title: string;
  shortDesc: string;
  badgeColor: string;
  defaultGroup?: number;
  permissionsList: string[];
}

const OFFICER_ROLES: OfficerRoleConfig[] = [
  {
    appRole: 'lop_truong',
    studentRole: 'Lớp trưởng',
    title: 'Lớp Trưởng',
    shortDesc: 'Bao quát toàn diện nề nếp, học tập, trật tự, vệ sinh',
    badgeColor: 'bg-blue-600 text-white',
    permissionsList: [
      'Nhập sổ điểm & hạng thi đua toàn trường của lớp',
      'Được quyền gửi thông báo Zalo/SMS phụ huynh',
      'Nhập chấm điểm rèn luyện tất cả học sinh',
    ],
  },
  {
    appRole: 'thu_quy',
    studentRole: 'Thủ quỹ',
    title: 'Thủ Quỹ Lớp',
    shortDesc: 'Quản lý thu chi quỹ lớp, tính tổng thu, chi và tồn lại',
    badgeColor: 'bg-emerald-600 text-white',
    permissionsList: [
      'Nhập số tiền thu (quỹ lớp, liên hoan, phong trào)',
      'Nhập số tiền chi (dụng cụ, photo, khen thưởng)',
      'Theo dõi tổng thu, tổng chi và số tiền còn tồn lại',
    ],
  },
  {
    appRole: 'pho_hoc_tap',
    studentRole: 'Lớp phó học tập',
    title: 'Lớp Phó Học Tập',
    shortDesc: 'Chuyên trách bài vở, kiểm tra, thi cử, phát biểu, điểm hồng',
    badgeColor: 'bg-amber-600 text-white',
    permissionsList: [
      'Nhập vi phạm & điểm cộng chuyên môn Học Tập',
      'Theo dõi giờ học tốt, tiết tốt của lớp',
    ],
  },
  {
    appRole: 'pho_lao_dong',
    studentRole: 'Lớp phó lao động',
    title: 'Lớp Phó Lao Động',
    shortDesc: 'Chuyên trách vệ sinh, trực nhật lớp, hành lang, cầu thang',
    badgeColor: 'bg-lime-700 text-white',
    permissionsList: [
      'Nhập vi phạm & tuyên dương Vệ sinh - Lao động',
      'Theo dõi phân công trực nhật 4 Tổ',
    ],
  },
  {
    appRole: 'pho_trat_tu',
    studentRole: 'Lớp phó trật tự',
    title: 'Lớp Phó Trật Tự',
    shortDesc: 'Chuyên trách nề nếp, tác phong, đồng phục, trật tự chỗ ngồi',
    badgeColor: 'bg-purple-600 text-white',
    permissionsList: [
      'Nhập vi phạm mất trật tự, ngủ gục, vào trễ, điện thoại',
      'Theo dõi đồng phục, sơ mi, phù hiệu của lớp',
    ],
  },
  {
    appRole: 'to_truong_1',
    studentRole: 'Tổ trưởng',
    title: 'Tổ Trưởng Tổ 1',
    shortDesc: 'Theo dõi và ghi nhận nề nếp thành viên Tổ 1',
    badgeColor: 'bg-teal-600 text-white',
    defaultGroup: 1,
    permissionsList: [
      'Nhập điểm rèn luyện các bạn thuộc Tổ 1',
      'Báo cáo tình hình tổ trong giờ sinh hoạt',
    ],
  },
  {
    appRole: 'to_truong_2',
    studentRole: 'Tổ trưởng',
    title: 'Tổ Trưởng Tổ 2',
    shortDesc: 'Theo dõi và ghi nhận nề nếp thành viên Tổ 2',
    badgeColor: 'bg-teal-600 text-white',
    defaultGroup: 2,
    permissionsList: [
      'Nhập điểm rèn luyện các bạn thuộc Tổ 2',
      'Báo cáo tình hình tổ trong giờ sinh hoạt',
    ],
  },
  {
    appRole: 'to_truong_3',
    studentRole: 'Tổ trưởng',
    title: 'Tổ Trưởng Tổ 3',
    shortDesc: 'Theo dõi và ghi nhận nề nếp thành viên Tổ 3',
    badgeColor: 'bg-teal-600 text-white',
    defaultGroup: 3,
    permissionsList: [
      'Nhập điểm rèn luyện các bạn thuộc Tổ 3',
      'Báo cáo tình hình tổ trong giờ sinh hoạt',
    ],
  },
  {
    appRole: 'to_truong_4',
    studentRole: 'Tổ trưởng',
    title: 'Tổ Trưởng Tổ 4',
    shortDesc: 'Theo dõi và ghi nhận nề nếp thành viên Tổ 4',
    badgeColor: 'bg-teal-600 text-white',
    defaultGroup: 4,
    permissionsList: [
      'Nhập điểm rèn luyện các bạn thuộc Tổ 4',
      'Báo cáo tình hình tổ trong giờ sinh hoạt',
    ],
  },
];

export const StudentRoleAssignmentModal: React.FC<StudentRoleAssignmentModalProps> = ({
  isOpen,
  onClose,
  students,
  onSaveRoleAssignments,
  onAccountsUpdated,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'officers' | 'allStudents'>('officers');
  const [localStudents, setLocalStudents] = useState<Student[]>(students);
  const [searchTerm, setSearchTerm] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync when prop changes
  React.useEffect(() => {
    setLocalStudents(students);
  }, [students]);

  if (!isOpen) return null;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Find currently assigned student for a role
  const getAssignedStudent = (role: OfficerRoleConfig): Student | undefined => {
    if (role.defaultGroup) {
      return localStudents.find(
        (s) => s.group === role.defaultGroup && s.role === 'Tổ trưởng'
      );
    }
    return localStudents.find((s) => s.role === role.studentRole);
  };

  // Change assignment for an officer role
  const handleAssignOfficer = (role: OfficerRoleConfig, studentId: string) => {
    setLocalStudents((prev) => {
      return prev.map((s) => {
        // If this student was selected
        if (s.id === studentId) {
          return {
            ...s,
            role: role.studentRole,
            group: role.defaultGroup !== undefined ? role.defaultGroup : s.group,
          };
        }
        // If someone else previously had this exclusive role, demote to 'Học sinh'
        if (
          role.studentRole !== 'Tổ trưởng' &&
          s.role === role.studentRole &&
          s.id !== studentId
        ) {
          return { ...s, role: 'Học sinh' };
        }
        if (
          role.studentRole === 'Tổ trưởng' &&
          s.group === role.defaultGroup &&
          s.role === 'Tổ trưởng' &&
          s.id !== studentId
        ) {
          return { ...s, role: 'Học sinh' };
        }
        return s;
      });
    });
  };

  // Change individual student role in table
  const handleUpdateSingleRole = (studentId: string, newRole: StudentRole) => {
    setLocalStudents((prev) =>
      prev.map((s) => (s.id === studentId ? { ...s, role: newRole } : s))
    );
  };

  // Save changes & sync accounts
  const handleSave = () => {
    onSaveRoleAssignments(localStudents);

    // Sync auth accounts display names
    const accounts = authService.getAccounts();
    OFFICER_ROLES.forEach((officer) => {
      const assigned = getAssignedStudent(officer);
      if (assigned) {
        authService.updateAccount(officer.appRole, {
          displayName: assigned.name,
        });
      }
    });

    onAccountsUpdated();
    showToast('Đã lưu phân quyền học sinh và đồng bộ tài khoản thành công!');
    setTimeout(() => {
      onClose();
    }, 800);
  };

  const filteredStudents = localStudents.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.rollNumber.toString().includes(searchTerm)
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-blue-900 via-indigo-900 to-sky-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-amber-400/20 text-amber-300 border border-amber-400/30">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                Phân Quyền Ban Cán Sự & Học Sinh (Lớp 10A7)
              </h3>
              <p className="text-xs text-blue-200">
                Chỉ định học sinh nắm giữ các chức vụ, phân quyền nề nếp, thi đua và sổ quỹ
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-blue-200 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sub-navigation tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-5 pt-3 gap-2">
          <button
            onClick={() => setActiveSubTab('officers')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer ${
              activeSubTab === 'officers'
                ? 'border-blue-600 text-blue-700 bg-white rounded-t-lg shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <UserCheck className="w-4 h-4 text-blue-600" />
            <span>Phân Quyền Ban Cán Sự ({OFFICER_ROLES.length} chức vụ)</span>
          </button>
          <button
            onClick={() => setActiveSubTab('allStudents')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer ${
              activeSubTab === 'allStudents'
                ? 'border-blue-600 text-blue-700 bg-white rounded-t-lg shadow-xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className="w-4 h-4 text-indigo-600" />
            <span>Danh Sách Toàn Lớp ({localStudents.length} học sinh)</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto flex-1 bg-slate-50/50">
          {toastMessage && (
            <div className="mb-4 bg-emerald-600 text-white px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-between shadow-md">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                {toastMessage}
              </span>
            </div>
          )}

          {activeSubTab === 'officers' && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3.5 flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div className="text-xs text-blue-900 leading-relaxed">
                  <strong>Hướng dẫn phân quyền:</strong> Thầy/Cô chọn học sinh tương ứng với từng chức vụ dưới đây. Khi lưu, hệ thống sẽ tự động cập nhật vai trò học sinh trong danh sách lớp và đồng bộ tài khoản đăng nhập cho ban cán sự.
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {OFFICER_ROLES.map((officer) => {
                  const assigned = getAssignedStudent(officer);
                  const roleAccounts = authService.getAccounts();
                  const acc = roleAccounts.find((a) => a.role === officer.appRole);

                  return (
                    <div
                      key={officer.appRole}
                      className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs hover:border-blue-400 hover:shadow-md transition-all flex flex-col justify-between"
                    >
                      <div>
                        {/* Title & Badge */}
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2.5 py-1 text-xs font-bold rounded-lg ${officer.badgeColor}`}
                            >
                              {officer.title}
                            </span>
                            {officer.appRole === 'lop_truong' && (
                              <span className="bg-amber-100 text-amber-800 text-[11px] font-bold px-2 py-0.5 rounded-full border border-amber-300">
                                Nhập thi đua & Zalo
                              </span>
                            )}
                            {officer.appRole === 'thu_quy' && (
                              <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2 py-0.5 rounded-full border border-emerald-300">
                                Nhập Thu & Chi Quỹ
                              </span>
                            )}
                          </div>
                        </div>

                        <p className="text-xs text-slate-500 mb-3">{officer.shortDesc}</p>

                        {/* Student Selector */}
                        <div className="mb-3">
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Học sinh đảm nhiệm:
                          </label>
                          <select
                            value={assigned?.id || ''}
                            onChange={(e) => handleAssignOfficer(officer, e.target.value)}
                            className="w-full text-xs sm:text-sm font-semibold bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-none"
                          >
                            <option value="">-- Chưa chỉ định (Chọn học sinh) --</option>
                            {localStudents.map((s) => (
                              <option key={s.id} value={s.id}>
                                STT {s.rollNumber} - {s.name} (Tổ {s.group} - {s.role})
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Assigned student card */}
                        {assigned ? (
                          <div className="bg-emerald-50/70 border border-emerald-200 rounded-lg p-2.5 mb-3 flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                              <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-[11px]">
                                {assigned.rollNumber}
                              </span>
                              <div>
                                <p className="font-bold text-emerald-950">{assigned.name}</p>
                                <p className="text-[11px] text-emerald-700">
                                  Tổ {assigned.group} • PH: {assigned.parentName} ({assigned.parentPhone})
                                </p>
                              </div>
                            </div>
                            <span className="text-[11px] font-bold text-emerald-800 bg-white px-2 py-0.5 rounded-md border border-emerald-300 shadow-xs">
                              Đang giữ chức
                            </span>
                          </div>
                        ) : (
                          <div className="bg-slate-100 rounded-lg p-2.5 mb-3 text-xs text-slate-500 italic">
                            Chưa phân công học sinh nào cho chức vụ này
                          </div>
                        )}

                        {/* Rights list */}
                        <div className="space-y-1 mb-3">
                          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                            Quyền hạn được cấp:
                          </p>
                          {officer.permissionsList.map((p, idx) => (
                            <div
                              key={idx}
                              className="flex items-center gap-1.5 text-xs text-slate-600"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span>{p}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Login credential badge */}
                      {acc && (
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 bg-slate-50 -mx-4 -mb-4 p-2.5 px-4 rounded-b-xl">
                          <span className="flex items-center gap-1 font-mono">
                            <KeyRound className="w-3 h-3 text-amber-500" />
                            TK: <strong>{acc.username}</strong> | MK: <strong>{acc.password}</strong>
                          </span>
                          <span className="text-[10px] text-slate-400">Đăng nhập riêng</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeSubTab === 'allStudents' && (
            <div className="space-y-3">
              {/* Search bar */}
              <div className="flex items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200">
                <input
                  type="text"
                  placeholder="Tìm học sinh theo tên hoặc STT..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-blue-600"
                />
                <span className="text-xs text-slate-500 shrink-0 font-medium">
                  {filteredStudents.length} / {localStudents.length} học sinh
                </span>
              </div>

              {/* Table of students with role assignment */}
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3 w-12 text-center">STT</th>
                      <th className="py-2.5 px-3">Họ và Tên</th>
                      <th className="py-2.5 px-3 w-20 text-center">Tổ</th>
                      <th className="py-2.5 px-3 w-20 text-center">Giới tính</th>
                      <th className="py-2.5 px-3">Chức vụ / Phân quyền</th>
                      <th className="py-2.5 px-3">Số điện thoại PH</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredStudents.map((s) => (
                      <tr key={s.id} className="hover:bg-blue-50/40 transition-colors">
                        <td className="py-2 px-3 font-bold text-center text-slate-500">
                          {s.rollNumber}
                        </td>
                        <td className="py-2 px-3 font-semibold text-slate-900">
                          {s.name}
                        </td>
                        <td className="py-2 px-3 text-center">
                          <span className="inline-block bg-slate-100 px-2 py-0.5 rounded text-xs font-bold text-slate-700">
                            Tổ {s.group}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-center text-xs text-slate-500">
                          {s.gender}
                        </td>
                        <td className="py-2 px-3">
                          <select
                            value={s.role}
                            onChange={(e) =>
                              handleUpdateSingleRole(s.id, e.target.value as StudentRole)
                            }
                            className={`text-xs font-bold px-2 py-1 rounded-md border outline-none cursor-pointer ${
                              s.role === 'Lớp trưởng'
                                ? 'bg-blue-100 text-blue-800 border-blue-300'
                                : s.role === 'Thủ quỹ'
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                : s.role.includes('Lớp phó')
                                ? 'bg-amber-100 text-amber-800 border-amber-300'
                                : s.role === 'Tổ trưởng'
                                ? 'bg-teal-100 text-teal-800 border-teal-300'
                                : 'bg-slate-50 text-slate-700 border-slate-300'
                            }`}
                          >
                            <option value="Học sinh">Học sinh</option>
                            <option value="Lớp trưởng">Lớp trưởng (Nhập thi đua + Zalo)</option>
                            <option value="Thủ quỹ">Thủ quỹ (Nhập Quỹ Lớp Thu Chi)</option>
                            <option value="Lớp phó học tập">Lớp phó học tập</option>
                            <option value="Lớp phó lao động">Lớp phó lao động</option>
                            <option value="Lớp phó trật tự">Lớp phó trật tự</option>
                            <option value="Tổ trưởng">Tổ trưởng</option>
                            <option value="Bí thư">Bí thư</option>
                            <option value="Cờ đỏ">Cờ đỏ</option>
                          </select>
                        </td>
                        <td className="py-2 px-3 font-mono text-xs text-slate-600">
                          {s.parentPhone || '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="px-5 py-3.5 bg-slate-100 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 hover:bg-slate-200 text-slate-700 text-xs sm:text-sm font-semibold rounded-xl cursor-pointer transition-colors"
          >
            Đóng
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md cursor-pointer transition-all hover:shadow-lg"
          >
            <Save className="w-4 h-4" />
            <span>Lưu Phân Quyền & Đồng Bộ Tài Khoản</span>
          </button>
        </div>
      </div>
    </div>
  );
};

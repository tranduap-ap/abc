import React, { useState } from 'react';
import {
  GraduationCap,
  Calendar,
  Award,
  AlertTriangle,
  Users,
  Printer,
  Sparkles,
  Phone,
  ShieldCheck,
  UserCheck,
  KeyRound,
  Lock,
  Settings,
  LogOut,
  FileSpreadsheet,
  School,
  Pencil,
} from 'lucide-react';
import { TeacherSettings, StudentScoreSummary, AppUserRole, RoleAccount } from '../types';
import { USER_ROLES, getRolePersonInfo } from '../services/permissionService';
import { TeacherClassSettingsModal } from './TeacherClassSettingsModal';
import { SchoolNameModal } from './SchoolNameModal';

interface HeaderProps {
  settings: TeacherSettings;
  onUpdateSettings: (settings: TeacherSettings) => void;
  summaries: StudentScoreSummary[];
  activeRole: AppUserRole | null;
  currentAccount?: RoleAccount | null;
  onSelectRole: (role: AppUserRole) => void;
  onOpenLoginModal: () => void;
  onLogout: () => void;
  onOpenAccountsModal: () => void;
  onOpenRoleAssignmentModal?: () => void;
  onOpenQuickRecord: () => void;
  onOpenPrint: () => void;
  onOpenExcelModal?: () => void;
  onOpenExportExcelModal?: () => void;
  filterType: 'week' | 'month';
  setFilterType: (type: 'week' | 'month') => void;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  onUpdateSettings,
  summaries,
  activeRole,
  currentAccount,
  onSelectRole,
  onOpenLoginModal,
  onLogout,
  onOpenAccountsModal,
  onOpenRoleAssignmentModal,
  onOpenQuickRecord,
  onOpenPrint,
  onOpenExcelModal,
  onOpenExportExcelModal,
  filterType,
  setFilterType,
}) => {
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isSchoolModalOpen, setIsSchoolModalOpen] = useState(false);
  const currentRoleInfo = activeRole ? (USER_ROLES[activeRole] || USER_ROLES.gvcn) : null;
  const students = summaries.map((s) => s.student);
  const rolePerson = getRolePersonInfo(activeRole, students, currentAccount, settings.teacherName);
  const isLoggedIn = !!activeRole && !!currentAccount;
  const totalStudents = summaries.length;
  const totalViolations = summaries.reduce((acc, s) => acc + s.violationCount, 0);
  const totalRewards = summaries.reduce((acc, s) => acc + s.rewardCount, 0);
  const avgScore = totalStudents
    ? Math.round(
        (summaries.reduce((acc, s) => acc + s.totalScore, 0) / totalStudents) * 10
      ) / 10
    : 100;

  const academicYears = settings.academicYearsList && settings.academicYearsList.length > 0
    ? settings.academicYearsList
    : ['2024 - 2025', '2025 - 2026', '2026 - 2027', '2027 - 2028', '2028 - 2029'];

  return (
    <header className="bg-gradient-to-r from-blue-900 via-indigo-900 to-sky-900 text-white shadow-xl border-b border-blue-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
        {/* Top bar: School brand & Teacher info */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-blue-800/60">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-xl bg-blue-600/30 border border-blue-400/30 flex items-center justify-center text-amber-300 shadow-inner backdrop-blur-sm">
              <GraduationCap className="w-7 h-7" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                {/* Academic Year List Selector - ONLY GVCN can change */}
                <div className="flex items-center bg-amber-400/20 text-amber-300 border border-amber-400/30 px-2 py-0.5 rounded-md text-xs font-semibold">
                  <span className="mr-1">Năm học:</span>
                  {activeRole === 'gvcn' ? (
                    <select
                      value={settings.academicYear}
                      onChange={(e) =>
                        onUpdateSettings({
                          ...settings,
                          academicYear: e.target.value,
                        })
                      }
                      className="bg-transparent text-amber-200 font-bold outline-none cursor-pointer"
                      title="Chỉ GVCN: Chọn năm học áp dụng"
                    >
                      {academicYears.map((year) => (
                        <option key={year} value={year} className="bg-slate-900 text-white">
                          {year}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span className="font-bold text-amber-200" title="Chỉ GVCN mới có quyền thay đổi năm học">
                      {settings.academicYear}
                    </span>
                  )}
                </div>

                {/* School Name Button / Badge */}
                {activeRole === 'gvcn' ? (
                  <button
                    type="button"
                    onClick={() => setIsSchoolModalOpen(true)}
                    className="group flex items-center gap-1.5 bg-blue-800/70 hover:bg-blue-700 active:scale-95 text-blue-100 hover:text-white border border-blue-600/60 hover:border-amber-400/80 px-2.5 py-0.5 rounded-md text-xs font-semibold shadow-xs transition-all cursor-pointer"
                    title="Chỉ GVCN: Bấm để thay đổi tên trường học"
                  >
                    <School className="w-3.5 h-3.5 text-sky-300 group-hover:text-amber-300 transition-colors" />
                    <span className="font-bold text-white tracking-tight">{settings.schoolName}</span>
                    <span className="flex items-center gap-0.5 text-[10px] text-blue-200 group-hover:text-amber-300 bg-blue-900/60 px-1 py-0.2 rounded transition-colors">
                      <Pencil className="w-2.5 h-2.5" />
                      <span>Đổi</span>
                    </span>
                  </button>
                ) : (
                  <div
                    onClick={() => setIsSchoolModalOpen(true)}
                    className="flex items-center gap-1.5 bg-blue-800/50 text-blue-200 border border-blue-600/40 px-2.5 py-0.5 rounded-md text-xs font-semibold cursor-pointer hover:border-blue-400/60 transition-colors"
                    title="Chỉ GVCN mới có quyền thay đổi tên trường"
                  >
                    <School className="w-3.5 h-3.5 text-sky-300" />
                    <span className="font-bold text-white tracking-tight">{settings.schoolName}</span>
                  </div>
                )}

                {/* GVCN Phone Number badge */}
                <div className="flex items-center gap-1 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 rounded-md text-xs font-semibold">
                  <Phone className="w-3 h-3 text-emerald-300" />
                  <span>SĐT GVCN: <strong>{settings.teacherPhone}</strong></span>
                </div>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex flex-wrap items-center gap-2 mt-0.5">
                Quản Lý Nề Nếp Lớp {settings.className}
                <span className="text-sm sm:text-base font-medium text-blue-200 font-normal">
                  — GVCN: <strong className="text-amber-300 font-semibold">{settings.teacherName}</strong>
                </span>
              </h1>
            </div>
          </div>

          {/* Role & Logged in User Controls */}
          <div className="flex flex-wrap items-center gap-2">
            {!isLoggedIn ? (
              /* Trạng thái ĐÃ ĐĂNG XUẤT - OUT HẾT TẤT CẢ TÀI KHOẢN */
              <div className="flex items-center gap-2 px-3 py-1.5 bg-rose-950/80 border border-rose-500/50 rounded-xl shadow-inner text-xs">
                <div className="w-8 h-8 rounded-lg bg-rose-500/20 border border-rose-400/30 flex items-center justify-center text-sm shadow-2xs text-rose-300">
                  <Lock className="w-4 h-4" />
                </div>
                <div className="leading-tight text-left">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] uppercase font-black px-1.5 py-0.2 rounded bg-rose-500/30 text-rose-200 border border-rose-400/30">
                      Chưa Đăng Nhập
                    </span>
                  </div>
                  <div className="text-rose-100 font-bold text-xs mt-0.5">
                    Đã out hết tài khoản
                  </div>
                </div>
              </div>
            ) : (
              /* Trạng thái ĐÃ ĐĂNG NHẬP */
              <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-950/90 border border-emerald-400/60 rounded-xl shadow-inner text-xs">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-sm shadow-2xs">
                  {rolePerson.avatarIcon}
                </div>
                <div className="leading-tight text-left">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] uppercase font-black px-1.5 py-0.2 rounded bg-emerald-500/25 text-emerald-300 border border-emerald-400/30">
                      Đã Đăng Nhập
                    </span>
                    <span className="font-extrabold text-amber-300 text-xs">
                      {rolePerson.roleTitle}
                    </span>
                  </div>
                  <div className="text-white font-extrabold text-xs sm:text-sm mt-0.5 flex items-center gap-1">
                    <span className="text-blue-200 font-medium text-[11px]">
                      {rolePerson.isTeacher ? 'GVCN:' : 'Học sinh:'}
                    </span>
                    <span className="text-emerald-300 font-black">
                      {rolePerson.personName}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Role Assignment Modal Button - ONLY logged-in GVCN */}
            {activeRole === 'gvcn' && onOpenRoleAssignmentModal && (
              <button
                onClick={onOpenRoleAssignmentModal}
                className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer"
                title="Chỉ GVCN: Phân quyền chức vụ cán sự cho học sinh trong lớp"
              >
                <UserCheck className="w-3.5 h-3.5 text-white" />
                <span>Phân Quyền</span>
              </button>
            )}

            {/* Login / Switch Account Button */}
            <button
              onClick={onOpenLoginModal}
              className={`flex items-center gap-1.5 px-3.5 py-2 font-black text-xs rounded-xl shadow-md transition-all cursor-pointer ${
                !isLoggedIn
                  ? 'bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 ring-2 ring-amber-300 shadow-amber-400/20'
                  : 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-950 font-bold'
              }`}
              title={!isLoggedIn ? 'Đăng nhập tài khoản & mật khẩu' : 'Đổi sang tài khoản vai trò khác'}
            >
              <KeyRound className="w-3.5 h-3.5 text-slate-950" />
              <span>{!isLoggedIn ? 'ĐĂNG NHẬP NGAY' : 'Đổi Tài Khoản'}</span>
            </button>

            {/* Logout Button - ONLY shown when logged in */}
            {isLoggedIn && (
              <button
                onClick={onLogout}
                className="flex items-center gap-1.5 px-3 py-2 bg-rose-600/90 hover:bg-rose-600 text-white font-bold text-xs rounded-xl border border-rose-500/50 shadow-sm transition-all cursor-pointer hover:shadow"
                title="Đăng xuất khỏi tất cả tài khoản"
              >
                <LogOut className="w-3.5 h-3.5 text-white" />
                <span>Đăng Xuất</span>
              </button>
            )}

            {/* Account List & Passwords Handout Button - ONLY logged-in GVCN CAN SEE */}
            {activeRole === 'gvcn' && (
              <button
                onClick={onOpenAccountsModal}
                className="flex items-center gap-1.5 px-3 py-2 bg-blue-800/80 hover:bg-blue-700 text-white font-medium text-xs rounded-xl border border-blue-600/50 shadow-sm transition-all cursor-pointer"
                title="Chỉ GVCN: Xem danh sách tài khoản & mật khẩu cấp cho học sinh"
              >
                <Lock className="w-3.5 h-3.5 text-amber-300" />
                <span className="hidden sm:inline">DS Mật Khẩu</span>
              </button>
            )}

            {/* Change School Name button - ONLY logged-in GVCN */}
            {activeRole === 'gvcn' && (
              <button
                onClick={() => setIsSchoolModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-sky-700 to-blue-700 hover:from-sky-600 hover:to-blue-600 text-white font-bold text-xs rounded-xl border border-sky-400/40 shadow-sm transition-all cursor-pointer hover:shadow"
                title="Chỉ GVCN: Thay đổi tên trường học trên hệ thống, báo cáo và tin nhắn"
              >
                <School className="w-3.5 h-3.5 text-amber-300" />
                <span>Đổi Tên Trường</span>
              </button>
            )}

            {/* Settings Modal Button - ONLY logged-in GVCN */}
            {activeRole === 'gvcn' && (
              <button
                onClick={() => setIsSettingsModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-600 hover:to-indigo-600 text-white font-bold text-xs rounded-xl border border-purple-400/40 shadow-sm transition-all cursor-pointer"
                title="Chỉ GVCN: Cài đặt thay đổi GVCN, Tên lớp, Số điện thoại"
              >
                <Settings className="w-3.5 h-3.5 text-amber-300" />
                <span>Cài Đặt Lớp/GVCN</span>
              </button>
            )}
          </div>
        </div>

        {/* Role authority explanation banner */}
        <div className="mt-2.5 py-2 px-3.5 rounded-xl bg-blue-950/70 border border-blue-700/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            {!isLoggedIn ? (
              <span className="flex items-center gap-1.5 font-bold text-xs bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2.5 py-1 rounded-lg">
                <Lock className="w-3.5 h-3.5 text-rose-400" />
                <span>Chế độ an toàn: Đã đăng xuất hoàn toàn khỏi tất cả tài khoản</span>
              </span>
            ) : (
              <>
                <span className="flex items-center gap-1.5 font-bold text-xs bg-amber-400/20 text-amber-300 border border-amber-400/30 px-2.5 py-1 rounded-lg">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                  <span>Vai trò: {rolePerson.roleTitle}</span>
                </span>
                <span className="font-bold text-white bg-emerald-950/90 border border-emerald-500/50 px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                  <span className="text-blue-200 font-normal">
                    {rolePerson.isTeacher ? 'Giáo viên:' : 'Học sinh đảm nhiệm:'}
                  </span>
                  <strong className="text-emerald-300 text-xs sm:text-sm font-black">
                    {rolePerson.personName}
                  </strong>
                </span>
              </>
            )}
            <span className="hidden lg:inline text-blue-200 text-[11px]">
              {currentRoleInfo ? `— ${currentRoleInfo.description}` : '— Bấm nút "ĐĂNG NHẬP NGAY" để được cấp quyền ghi điểm, nhập thi đua, quản lý quỹ hoặc gửi tin nhắn.'}
            </span>
          </div>
          <div className="text-[11px] text-blue-300 font-medium shrink-0">
            Zalo/SMS GVCN: <strong>{settings.teacherPhone}</strong>
          </div>
        </div>

        {/* Action Controls & KPI */}
        <div className="flex flex-wrap items-center justify-between gap-3 mt-4">
          <div className="flex items-center gap-2">
            {/* Week/Month toggle */}
            <div className="flex items-center bg-blue-950/60 p-1 rounded-lg border border-blue-700/50 backdrop-blur-sm">
              <button
                onClick={() => setFilterType('week')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  filterType === 'week'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-blue-200 hover:text-white'
                }`}
              >
                Theo Tuần
              </button>
              <button
                onClick={() => setFilterType('month')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                  filterType === 'month'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-blue-200 hover:text-white'
                }`}
              >
                Theo Tháng
              </button>
            </div>

            {/* Selector dropdown */}
            <div className="flex items-center bg-blue-950/60 px-3 py-1.5 rounded-lg border border-blue-700/50 text-xs">
              <Calendar className="w-3.5 h-3.5 mr-1.5 text-blue-300" />
              {filterType === 'week' ? (
                <div className="flex items-center gap-1.5">
                  <span className="text-blue-200">Tuần:</span>
                  <select
                    value={settings.currentWeek}
                    onChange={(e) =>
                      onUpdateSettings({
                        ...settings,
                        currentWeek: Number(e.target.value),
                      })
                    }
                    className="bg-transparent text-white font-semibold outline-none cursor-pointer"
                  >
                    {Array.from({ length: 35 }, (_, i) => i + 1).map((w) => (
                      <option key={w} value={w} className="bg-slate-900 text-white">
                        Tuần {w}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <span className="text-blue-200">Tháng:</span>
                  <select
                    value={settings.currentMonth}
                    onChange={(e) =>
                      onUpdateSettings({
                        ...settings,
                        currentMonth: Number(e.target.value),
                      })
                    }
                    className="bg-transparent text-white font-semibold outline-none cursor-pointer"
                  >
                    {[9, 10, 11, 12, 1, 2, 3, 4, 5].map((m) => (
                      <option key={m} value={m} className="bg-slate-900 text-white">
                        Tháng {m}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Excel Export Button */}
            {onOpenExportExcelModal && (
              <button
                onClick={onOpenExportExcelModal}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white text-xs font-bold rounded-lg shadow-sm transition-all cursor-pointer"
                title="Xuất dữ liệu thi đua, danh sách học sinh và báo cáo nề nếp sang file Excel (.xlsx)"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-200" />
                <span>Xuất Excel</span>
              </button>
            )}

            {/* Excel Import Button */}
            {onOpenExcelModal && (
              <button
                onClick={onOpenExcelModal}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-all"
                title="Nhập danh sách học sinh từ file Excel (.xlsx / .csv)"
              >
                <span>Nhập Excel</span>
              </button>
            )}

            {/* Quick Record Button */}
            <button
              onClick={onOpenQuickRecord}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs font-semibold rounded-lg shadow-md hover:shadow-lg transition-all"
            >
              <Sparkles className="w-4 h-4 text-emerald-100" />
              <span>Chấm Điểm Nhanh</span>
            </button>

            {/* Print Report Button */}
            <button
              onClick={onOpenPrint}
              className="flex items-center gap-1 px-3 py-1.5 bg-blue-700/60 hover:bg-blue-600/80 text-blue-100 hover:text-white text-xs font-medium rounded-lg border border-blue-500/30 transition-all"
              title="In phiếu báo cáo A4"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">In Báo Cáo</span>
            </button>
          </div>
        </div>

        {/* Realtime KPI metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
          <div className="bg-blue-800/40 rounded-xl p-3 border border-blue-700/40 backdrop-blur-sm flex items-center justify-between">
            <div>
              <div className="text-xs text-blue-300 font-medium">Sĩ số Lớp 10A7</div>
              <div className="text-xl font-bold text-white mt-0.5">{totalStudents} <span className="text-xs font-normal text-blue-200">HS (4 Tổ)</span></div>
            </div>
            <div className="p-2 rounded-lg bg-blue-500/20 text-blue-300">
              <Users className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-blue-800/40 rounded-xl p-3 border border-blue-700/40 backdrop-blur-sm flex items-center justify-between">
            <div>
              <div className="text-xs text-blue-300 font-medium">Điểm TB Nề Nếp</div>
              <div className="text-xl font-bold text-amber-300 mt-0.5">
                {avgScore} <span className="text-xs font-normal text-blue-200">/ 100đ</span>
              </div>
            </div>
            <div className="p-2 rounded-lg bg-amber-500/20 text-amber-300">
              <Award className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-blue-800/40 rounded-xl p-3 border border-blue-700/40 backdrop-blur-sm flex items-center justify-between">
            <div>
              <div className="text-xs text-blue-300 font-medium">Lượt Khen Thưởng</div>
              <div className="text-xl font-bold text-emerald-400 mt-0.5">
                +{totalRewards} <span className="text-xs font-normal text-emerald-200">lượt</span>
              </div>
            </div>
            <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-300">
              <Sparkles className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-blue-800/40 rounded-xl p-3 border border-blue-700/40 backdrop-blur-sm flex items-center justify-between">
            <div>
              <div className="text-xs text-blue-300 font-medium">Lượt Vi Phạm</div>
              <div className="text-xl font-bold text-rose-400 mt-0.5">
                {totalViolations} <span className="text-xs font-normal text-rose-200">lỗi ghi nhận</span>
              </div>
            </div>
            <div className="p-2 rounded-lg bg-rose-500/20 text-rose-300">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Modal Thay Đổi Tên Trường */}
      <SchoolNameModal
        isOpen={isSchoolModalOpen}
        onClose={() => setIsSchoolModalOpen(false)}
        settings={settings}
        onSaveSettings={onUpdateSettings}
        activeRole={activeRole}
        onOpenLoginModal={onOpenLoginModal}
      />

      {/* Modal Cài Đặt Thay Đổi GVCN, Lớp, Số Điện Thoại */}
      <TeacherClassSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        settings={settings}
        onSaveSettings={onUpdateSettings}
        activeRole={activeRole}
      />
    </header>
  );
};


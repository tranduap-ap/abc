import React, { useState } from 'react';
import {
  Plus,
  Minus,
  Trash2,
  Search,
  Filter,
  Sparkles,
  AlertCircle,
  Clock,
  Shirt,
  Smartphone,
  Award,
  BookOpen,
  CheckCircle2,
  ShieldCheck,
  Volume2,
  Moon,
  Trash,
  Coffee,
  HelpCircle,
  Armchair,
  Edit2,
  Lock,
} from 'lucide-react';
import { Student, Rule, IncidentRecord, TeacherSettings, StudentScoreSummary, AppUserRole } from '../types';
import { permissionService, USER_ROLES, getRolePersonInfo } from '../services/permissionService';

interface QuickRecordViewProps {
  students: Student[];
  rules: Rule[];
  incidents: IncidentRecord[];
  summaries: StudentScoreSummary[];
  settings: TeacherSettings;
  activeRole?: AppUserRole | null;
  onSelectRole?: (role: AppUserRole) => void;
  onOpenModal: (preSelectedStudentId?: string) => void;
  onOpenExcelModal?: () => void;
  onQuickAdd: (student: Student, rule: Rule) => void;
  onDeleteIncident: (id: string) => void;
  onOpenEditStudent?: (student: Student) => void;
  onOpenLoginModal?: () => void;
}

export const QuickRecordView: React.FC<QuickRecordViewProps> = ({
  students,
  rules,
  incidents,
  summaries,
  settings,
  activeRole = null,
  onSelectRole,
  onOpenModal,
  onOpenExcelModal,
  onQuickAdd,
  onDeleteIncident,
  onOpenEditStudent,
  onOpenLoginModal,
}) => {
  const currentRoleInfo = activeRole ? (USER_ROLES[activeRole] || USER_ROLES.gvcn) : null;
  const rolePerson = getRolePersonInfo(activeRole, students, undefined, settings.teacherName);

  const [search, setSearch] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<number | 'all'>(
    currentRoleInfo?.allowedGroup !== undefined ? currentRoleInfo.allowedGroup : 'all'
  );
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Discipline & Conduct rules (Trật tự & Nề nếp)
  const ruleSeat = rules.find((r) => r.code === 'MĐ1-07b' || r.name.includes('đổi chỗ') || r.name.includes('sơ đồ lớp'));
  const ruleNoisy = rules.find((r) => r.code === 'MĐ1-07' || r.name.includes('Mất trật tự') || r.name.includes('nói chuyện'));
  const ruleSleep = rules.find((r) => r.code === 'MĐ1-09' || r.name.includes('Ngủ gục'));
  const ruleLate = rules.find((r) => r.code === 'MĐ1-04' || r.name.includes('Vào học trễ'));
  const ruleUniform = rules.find((r) => r.code === 'MĐ1-08' || r.name.includes('đồng phục'));
  const rulePhone = rules.find((r) => r.code === 'MĐ2-03' || r.name.includes('điện thoại'));
  const ruleNoPerm = rules.find((r) => r.code === 'MĐ1-20' || r.name.includes('không xin phép'));

  // Academics rules (Học tập)
  const ruleSpeech = rules.find((r) => r.code === 'R05' || r.name.includes('phát biểu'));
  const rulePinkGrade = rules.find((r) => r.code === 'R06' || r.name.includes('điểm hồng'));
  const ruleHardExercise = rules.find((r) => r.code === 'R07' || r.name.includes('bài tập khó'));
  const rulePresentation = rules.find((r) => r.code === 'R08' || r.name.includes('Thuyết trình'));
  const ruleNoLesson = rules.find((r) => r.code === 'MĐ1-06' || r.name.includes('Không thuộc bài') || r.name.includes('không soạn bài'));
  const ruleNoTask = rules.find((r) => r.code === 'MĐ1-03' || r.name.includes('nhiệm vụ học tập'));

  // Hygiene & Labor rules (Vệ sinh & Lao động)
  const ruleCleanSkip = rules.find((r) => r.code === 'MĐ1-10' || r.name.includes('Không trực vệ sinh'));
  const ruleCleanLate = rules.find((r) => r.code === 'MĐ1-11' || r.name.includes('trực nhật') && r.name.includes('trễ'));
  const ruleLaborSkip = rules.find((r) => r.code === 'MĐ1-12' || r.name.includes('lao động tập thể'));
  const ruleTrash = rules.find((r) => r.code === 'MĐ1-18' || r.name.includes('Xả rác'));
  const rulePlasticCup = rules.find((r) => r.code === 'MĐ1-19' || r.name.includes('hộp xốp') || r.name.includes('ly nhựa'));

  const filteredSummaries = summaries.filter((item) => {
    const matchGroup = selectedGroup === 'all' || item.student.group === selectedGroup;
    const matchSearch =
      item.student.name.toLowerCase().includes(search.toLowerCase()) ||
      item.student.rollNumber.toString().includes(search);
    return matchGroup && matchSearch;
  });

  // Incidents in current week
  const currentWeekIncidents = incidents
    .filter((inc) => inc.week === settings.currentWeek)
    .slice(0, 15);

  const handleQuickAction = (student: Student, rule?: Rule) => {
    if (!rule) return;

    if (!activeRole) {
      setStatusMessage('⚠️ Bạn đang ở trạng thái Chưa Đăng Nhập. Vui lòng bấm "ĐĂNG NHẬP" trên góc phải để được cấp quyền chấm điểm.');
      setTimeout(() => setStatusMessage(null), 4000);
      return;
    }

    // Check student group permission (Tổ trưởng)
    if (!permissionService.canRecordForStudent(activeRole, student)) {
      setStatusMessage(
        `⚠️ Giới hạn phân quyền: ${currentRoleInfo?.title || 'Cán sự'} chỉ được chấm điểm cho thành viên thuộc Tổ ${currentRoleInfo?.allowedGroup}.`
      );
      setTimeout(() => setStatusMessage(null), 4000);
      return;
    }

    // Check rule domain permission (Phó học tập, Phó lao động, Phó trật tự)
    if (!permissionService.canRecordRule(activeRole, rule)) {
      setStatusMessage(
        `⚠️ Giới hạn phân quyền: ${currentRoleInfo?.title || 'Cán sự'} chỉ được chấm các nội dung chuyên trách thuộc lĩnh vực của mình.`
      );
      setTimeout(() => setStatusMessage(null), 4000);
      return;
    }

    onQuickAdd(student, rule);
    setStatusMessage(`Đã ghi nhận: ${student.name} - ${rule.name} (${rule.points > 0 ? '+' : ''}${rule.points}đ)`);
    setTimeout(() => setStatusMessage(null), 3500);
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {statusMessage && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-800 px-4 py-2.5 rounded-xl shadow-md flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2 text-xs sm:text-sm font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{statusMessage}</span>
          </div>
          <button
            onClick={() => setStatusMessage(null)}
            className="text-emerald-700 hover:text-emerald-950 text-xs font-semibold"
          >
            Đóng
          </button>
        </div>
      )}

      {/* Role Authority Banner on Recording Screen */}
      <div className="bg-white p-4 rounded-2xl shadow-xs border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${!activeRole ? 'bg-rose-50 border border-rose-200 text-rose-700' : 'bg-blue-50 border border-blue-200 text-blue-700'}`}>
            {!activeRole ? <Lock className="w-6 h-6" /> : <ShieldCheck className="w-6 h-6" />}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Người chấm điểm:
              </span>
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold shadow-2xs ${currentRoleInfo ? currentRoleInfo.badgeColor : 'bg-rose-100 text-rose-800 border border-rose-300'}`}>
                {rolePerson.roleTitle}
              </span>
              <span className={`text-xs px-2.5 py-0.5 rounded-lg font-black ${!activeRole ? 'bg-rose-50 text-rose-800 border border-rose-200' : 'bg-emerald-100 text-emerald-900 border border-emerald-300'}`}>
                {rolePerson.isTeacher ? 'GVCN:' : 'Học sinh:'} {rolePerson.personName}
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              {currentRoleInfo ? currentRoleInfo.description : 'Hệ thống đang ở trạng thái đã đăng xuất hết tài khoản. Vui lòng bấm Đăng Nhập để bắt đầu chấm điểm rèn luyện.'}
            </p>
          </div>
        </div>

        {!activeRole && onOpenLoginModal && (
          <button
            onClick={onOpenLoginModal}
            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black text-xs rounded-xl shadow-xs cursor-pointer shrink-0 transition-all hover:scale-102"
          >
            <span>ĐĂNG NHẬP NGAY</span>
          </button>
        )}

        {onSelectRole && activeRole === 'gvcn' && (
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs font-semibold text-slate-500">GVCN xem vai trò:</span>
            <select
              value={activeRole}
              onChange={(e) => onSelectRole(e.target.value as AppUserRole)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-bold text-slate-800 outline-none cursor-pointer hover:bg-slate-100"
            >
              <option value="gvcn">👑 GVCN: Thầy {settings.teacherName}</option>
              <option value="lop_truong">🛡️ Lớp Trưởng: {getRolePersonInfo('lop_truong', students).personName}</option>
              <option value="thu_quy">💰 Thủ Quỹ: {getRolePersonInfo('thu_quy', students).personName}</option>
              <option value="pho_hoc_tap">📚 LP Học Tập: {getRolePersonInfo('pho_hoc_tap', students).personName}</option>
              <option value="pho_lao_dong">🧹 LP Lao Động: {getRolePersonInfo('pho_lao_dong', students).personName}</option>
              <option value="pho_trat_tu">🎯 LP Trật Tự: {getRolePersonInfo('pho_trat_tu', students).personName}</option>
              <option value="to_truong_1">🚩 Tổ Trưởng Tổ 1: {getRolePersonInfo('to_truong_1', students).personName}</option>
              <option value="to_truong_2">🚩 Tổ Trưởng Tổ 2: {getRolePersonInfo('to_truong_2', students).personName}</option>
              <option value="to_truong_3">🚩 Tổ Trưởng Tổ 3: {getRolePersonInfo('to_truong_3', students).personName}</option>
              <option value="to_truong_4">🚩 Tổ Trưởng Tổ 4: {getRolePersonInfo('to_truong_4', students).personName}</option>
            </select>
          </div>
        )}
      </div>

      {/* Main Grid: Student List with Quick Action Buttons & Side Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Student Matrix */}
        <div className="lg:col-span-2 space-y-4">
          {/* Action Header & Search */}
          <div className="bg-white p-4 rounded-2xl shadow-xs border border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
              <div>
                <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                  <span>Chấm Điểm & Ghi Nhận Nề Nếp Lớp 10A7</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-semibold">
                    Tuần {settings.currentWeek}
                  </span>
                </h2>
                <p className="text-xs text-slate-500">
                  Bấm trực tiếp vào các nút tắt để trừ điểm hoặc cộng điểm ngay cho từng học sinh.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {onOpenEditStudent && students.length > 0 && (
                  <button
                    onClick={() => onOpenEditStudent(students[0])}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-950 text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer hover:shadow-md"
                    title="Chỉnh sửa thông tin học sinh (họ tên, STT, tổ, chức vụ, SĐT phụ huynh)"
                  >
                    <Edit2 className="w-4 h-4 text-slate-950" />
                    <span>Sửa Thông Tin HS</span>
                  </button>
                )}

                <button
                  onClick={() => onOpenModal()}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span>Ghi Nhận Đầy Đủ / Nhiều HS</span>
                </button>
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-slate-100">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Tìm học sinh theo họ tên hoặc STT..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:bg-white focus:border-blue-500"
                />
              </div>

              <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
                <button
                  onClick={() => setSelectedGroup('all')}
                  className={`px-3 py-1.5 text-xs rounded-lg font-medium transition-all ${
                    selectedGroup === 'all'
                      ? 'bg-slate-800 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Tất cả ({students.length})
                </button>
                {[1, 2, 3, 4].map((g) => (
                  <button
                    key={g}
                    onClick={() => setSelectedGroup(g)}
                    className={`px-3 py-1.5 text-xs rounded-lg font-medium whitespace-nowrap transition-all ${
                      selectedGroup === g
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Tổ {g}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Student Cards Grid */}
          {filteredSummaries.length === 0 ? (
            <div className="bg-white rounded-2xl border-2 border-dashed border-slate-300 p-8 text-center">
              <div className="text-slate-400 font-bold mb-2">Chưa có học sinh nào trong danh sách lớp 10A7</div>
              <p className="text-xs text-slate-500 mb-4">
                Vui lòng nhập danh sách học sinh từ file Excel hoặc thêm học sinh mới để bắt đầu chấm điểm nề nếp.
              </p>
              {onOpenExcelModal && (
                <button
                  onClick={onOpenExcelModal}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
                >
                  Nhập Học Sinh Từ File Excel
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filteredSummaries.map(({ student, totalScore, rankTitle, violationCount, rewardCount, rewardPoints, violationPoints }) => {
                const rankColor =
                  totalScore >= 90
                    ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                    : totalScore >= 80
                    ? 'text-blue-700 bg-blue-50 border-blue-200'
                    : totalScore >= 70
                    ? 'text-amber-700 bg-amber-50 border-amber-200'
                    : 'text-rose-700 bg-rose-50 border-rose-200';

                return (
                  <div
                    key={student.id}
                    className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-xs hover:border-blue-300 transition-all flex flex-col justify-between"
                  >
                    {/* Top: Student Info & Current Score */}
                    <div className="flex items-start justify-between gap-2 pb-2 border-b border-slate-100">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] font-bold text-slate-400">
                            #{student.rollNumber}
                          </span>
                          <h4 className="text-sm font-bold text-slate-900 truncate">
                            {student.name}
                          </h4>
                          {student.role !== 'Học sinh' && (
                            <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800">
                              {student.role}
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5 mt-0.5 text-[11px] text-slate-500">
                          <span>Tổ {student.group} • {student.gender} • PH: {student.parentPhone}</span>
                          {onOpenEditStudent && (
                            <button
                              onClick={() => onOpenEditStudent(student)}
                              className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold text-[10px] rounded transition-colors cursor-pointer"
                              title="Chỉnh sửa thông tin học sinh này (họ tên, STT, tổ, chức vụ, SĐT phụ huynh)"
                            >
                              <Edit2 className="w-2.5 h-2.5 text-amber-700" />
                              <span>Sửa TT</span>
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-base font-extrabold text-blue-900">
                          {totalScore} <span className="text-[10px] font-normal text-slate-500">đ</span>
                        </div>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${rankColor}`}>
                          {rankTitle}
                        </span>
                      </div>
                    </div>

                    {/* Summary badges: Số lượt điểm cộng & điểm trừ */}
                    <div className="flex flex-wrap items-center gap-2 py-2 text-[11px]">
                      <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-medium border border-emerald-200">
                        Cộng: <strong>+{rewardPoints}đ</strong> ({rewardCount} lượt)
                      </span>
                      <span className="text-rose-700 bg-rose-50 px-2 py-0.5 rounded font-medium border border-rose-200">
                        Trừ: <strong>-{violationPoints}đ</strong> ({violationCount} lượt)
                      </span>
                    </div>

                    {/* Quick Action Buttons */}
                    <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-1.5">
                      {/* Check if student is allowed for this role */}
                      {!permissionService.canRecordForStudent(activeRole, student) ? (
                        <div className="text-[11px] text-amber-700 italic flex items-center gap-1 py-1">
                          <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span>Chỉ chấm Tổ {currentRoleInfo?.allowedGroup || 'được phân công'}</span>
                        </div>
                      ) : (
                        <>
                          <div className="flex flex-wrap items-center gap-1">
                            {/* Phân quyền: Lớp phó trật tự -> đổi chỗ, mất trật tự, ngủ gục, trễ, đồng phục, điện thoại */}
                            {!!activeRole && (activeRole === 'pho_trat_tu' || activeRole === 'lop_truong' || activeRole === 'gvcn' || activeRole.startsWith('to_truong')) && (
                              <>
                                {ruleSeat && (
                                  <button
                                    onClick={() => handleQuickAction(student, ruleSeat)}
                                    title="Tự ý đổi chỗ ngồi, ngồi sai sơ đồ lớp (-2đ)"
                                    className="px-2 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-md text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                                  >
                                    <Armchair className="w-3 h-3 text-purple-600" />
                                    <span>Đổi chỗ -2đ</span>
                                  </button>
                                )}
                                {ruleNoisy && (
                                  <button
                                    onClick={() => handleQuickAction(student, ruleNoisy)}
                                    title="Mất trật tự trong giờ học, nói chuyện nhiều (-2đ)"
                                    className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-md text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                                  >
                                    <Volume2 className="w-3 h-3 text-rose-600" />
                                    <span>Nói chuyện -2đ</span>
                                  </button>
                                )}
                                {ruleSleep && (
                                  <button
                                    onClick={() => handleQuickAction(student, ruleSleep)}
                                    title="Ngủ gục trong giờ học (-2đ)"
                                    className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-md text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                                  >
                                    <Moon className="w-3 h-3 text-amber-600" />
                                    <span>Ngủ -2đ</span>
                                  </button>
                                )}
                                {ruleLate && (
                                  <button
                                    onClick={() => handleQuickAction(student, ruleLate)}
                                    title="Vào học trễ (-2đ)"
                                    className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-md text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                                  >
                                    <Clock className="w-3 h-3 text-rose-600" />
                                    <span>Trễ -2đ</span>
                                  </button>
                                )}
                                {ruleUniform && (
                                  <button
                                    onClick={() => handleQuickAction(student, ruleUniform)}
                                    title="Không đúng đồng phục (-2đ)"
                                    className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-md text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                                  >
                                    <Shirt className="w-3 h-3 text-rose-600" />
                                    <span>Đ.Phục -2đ</span>
                                  </button>
                                )}
                                {rulePhone && (
                                  <button
                                    onClick={() => handleQuickAction(student, rulePhone)}
                                    title="Sử dụng điện thoại trái phép (-12đ)"
                                    className="px-2 py-1 bg-rose-100 hover:bg-rose-200 text-rose-800 border border-rose-300 rounded-md text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                                  >
                                    <Smartphone className="w-3 h-3 text-rose-700" />
                                    <span>Đ.Thoại -12đ</span>
                                  </button>
                                )}
                              </>
                            )}

                            {/* Phân quyền: Lớp phó lao động -> trực nhật, vệ sinh, xả rác, ly nhựa */}
                            {activeRole === 'pho_lao_dong' && (
                              <>
                                {ruleCleanSkip && (
                                  <button
                                    onClick={() => handleQuickAction(student, ruleCleanSkip)}
                                    title="Không trực vệ sinh lớp/cầu thang (-2đ)"
                                    className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-md text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                                  >
                                    <Trash className="w-3 h-3 text-rose-600" />
                                    <span>Bỏ trực nhật -2đ</span>
                                  </button>
                                )}
                                {ruleCleanLate && (
                                  <button
                                    onClick={() => handleQuickAction(student, ruleCleanLate)}
                                    title="Trực nhật vệ sinh trễ giờ (-1đ)"
                                    className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-md text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                                  >
                                    <Clock className="w-3 h-3 text-amber-600" />
                                    <span>Trực trễ -1đ</span>
                                  </button>
                                )}
                                {ruleLaborSkip && (
                                  <button
                                    onClick={() => handleQuickAction(student, ruleLaborSkip)}
                                    title="Trốn tránh hoặc không tham gia lao động tập thể (-2đ)"
                                    className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-md text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                                  >
                                    <span>Trốn LĐ -2đ</span>
                                  </button>
                                )}
                                {ruleTrash && (
                                  <button
                                    onClick={() => handleQuickAction(student, ruleTrash)}
                                    title="Xả rác bừa bãi (-2đ)"
                                    className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-md text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                                  >
                                    <span>Xả rác -2đ</span>
                                  </button>
                                )}
                                {rulePlasticCup && (
                                  <button
                                    onClick={() => handleQuickAction(student, rulePlasticCup)}
                                    title="Mang thức ăn, nước uống hộp xốp, ly nhựa vào phòng học (-2đ)"
                                    className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-md text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                                  >
                                    <Coffee className="w-3 h-3 text-rose-600" />
                                    <span>Ly nhựa/xốp -2đ</span>
                                  </button>
                                )}
                              </>
                            )}

                            {/* Phân quyền: Lớp phó học tập -> bài vở, phát biểu, điểm hồng, bài khó, dự án */}
                            {activeRole === 'pho_hoc_tap' && (
                              <>
                                {ruleNoLesson && (
                                  <button
                                    onClick={() => handleQuickAction(student, ruleNoLesson)}
                                    title="Không thuộc bài, không soạn bài (-2đ)"
                                    className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-md text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                                  >
                                    <BookOpen className="w-3 h-3 text-rose-600" />
                                    <span>Chưa bài -2đ</span>
                                  </button>
                                )}
                                {ruleNoTask && (
                                  <button
                                    onClick={() => handleQuickAction(student, ruleNoTask)}
                                    title="Không hoàn thành đầy đủ nhiệm vụ học tập (-2đ)"
                                    className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-md text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                                  >
                                    <span>Bỏ bài -2đ</span>
                                  </button>
                                )}
                                {rulePinkGrade && (
                                  <button
                                    onClick={() => handleQuickAction(student, rulePinkGrade)}
                                    title="Trả bài, làm bài được điểm hồng (8-10đ) (+1đ)"
                                    className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-md text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                                  >
                                    <Award className="w-3 h-3 text-emerald-600" />
                                    <span>Điểm hồng +1đ</span>
                                  </button>
                                )}
                                {ruleSpeech && (
                                  <button
                                    onClick={() => handleQuickAction(student, ruleSpeech)}
                                    title="Phát biểu xây dựng bài đúng (+1đ)"
                                    className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-md text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                                  >
                                    <span>Phát biểu +1đ</span>
                                  </button>
                                )}
                                {ruleHardExercise && (
                                  <button
                                    onClick={() => handleQuickAction(student, ruleHardExercise)}
                                    title="Xung phong làm bài tập khó được điểm hồng (+2đ)"
                                    className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-md text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                                  >
                                    <span>Bài khó +2đ</span>
                                  </button>
                                )}
                                {rulePresentation && (
                                  <button
                                    onClick={() => handleQuickAction(student, rulePresentation)}
                                    title="Hoạt động nhóm và thuyết trình (+2đ)"
                                    className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-md text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                                  >
                                    <span>Thuyết trình +2đ</span>
                                  </button>
                                )}
                              </>
                            )}
                          </div>

                          {/* Quick Rewards & Detail Modal */}
                          <div className="flex items-center gap-1">
                            {activeRole !== 'pho_hoc_tap' && activeRole !== 'pho_lao_dong' && (
                              <>
                                {rulePinkGrade && (
                                  <button
                                    onClick={() => handleQuickAction(student, rulePinkGrade)}
                                    title="Điểm hồng từ 8đ-10đ (+1đ)"
                                    className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-md text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                                  >
                                    <Award className="w-3 h-3 text-emerald-600" />
                                    <span>+1đ</span>
                                  </button>
                                )}

                                {ruleSpeech && (
                                  <button
                                    onClick={() => handleQuickAction(student, ruleSpeech)}
                                    title="Phát biểu đúng (+1đ)"
                                    className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-md text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                                  >
                                    <span>Phát biểu +1đ</span>
                                  </button>
                                )}
                              </>
                            )}

                            <button
                              onClick={() => onOpenModal(student.id)}
                              className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-[11px] font-medium transition-colors cursor-pointer"
                              title="Mở bảng ghi nhận đầy đủ tất cả quy định"
                            >
                              Khác...
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Col: Live Activity Feed (Current Week Incidents) */}
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl shadow-xs border border-slate-200">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-800">
                  Nhật Ký Nề Nếp Tuần {settings.currentWeek}
                </h3>
              </div>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                {currentWeekIncidents.length} lượt
              </span>
            </div>

            {currentWeekIncidents.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">
                Chưa có ghi nhận nào trong tuần này.
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[640px] overflow-y-auto pr-1">
                {currentWeekIncidents.map((inc) => {
                  const isReward = inc.category === 'reward';
                  return (
                    <div
                      key={inc.id}
                      className={`p-3 rounded-xl border text-xs relative group transition-all ${
                        isReward
                          ? 'bg-emerald-50/50 border-emerald-200/80 hover:bg-emerald-50'
                          : 'bg-rose-50/50 border-rose-200/80 hover:bg-rose-50'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-bold text-slate-900 flex items-center gap-1.5">
                            <span>{inc.studentName}</span>
                            <span className="text-[10px] font-medium px-1 rounded bg-slate-200 text-slate-700">
                              Tổ {inc.group}
                            </span>
                          </div>
                          <div className={`font-semibold mt-0.5 ${isReward ? 'text-emerald-700' : 'text-rose-700'}`}>
                            {inc.ruleName}
                          </div>
                          <div className="text-[11px] text-slate-500 mt-1">
                            {inc.date} • {inc.period || '10 phút đầu giờ'} • {inc.reportedBy}
                          </div>
                          {inc.note && (
                            <div className="text-[11px] text-slate-600 italic mt-0.5 bg-white/60 px-2 py-0.5 rounded">
                              "{inc.note}"
                            </div>
                          )}
                        </div>

                        <div className="flex flex-col items-end gap-1.5">
                          <span
                            className={`font-black px-2 py-0.5 rounded text-xs shrink-0 ${
                              isReward
                                ? 'bg-emerald-200 text-emerald-800'
                                : 'bg-rose-200 text-rose-800'
                            }`}
                          >
                            {inc.points > 0 ? `+${inc.points}` : inc.points}đ
                          </span>
                          {inc.quantity && inc.quantity > 1 && (
                            <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded">
                              {inc.quantity} lượt
                            </span>
                          )}

                          <button
                            onClick={() => onDeleteIncident(inc.id)}
                            className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-600 p-1 rounded transition-opacity"
                            title="Xóa bản ghi này"
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
          </div>
        </div>
      </div>
    </div>
  );
};

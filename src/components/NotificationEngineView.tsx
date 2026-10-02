import React, { useState, useEffect } from 'react';
import {
  MessageSquareShare,
  Send,
  Copy,
  Phone,
  CheckCircle2,
  AlertCircle,
  Users,
  Search,
  ExternalLink,
  MessageCircle,
  FileText,
  RotateCcw,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import {
  StudentScoreSummary,
  TeacherSettings,
  MessageLog,
  AppUserRole,
} from '../types';
import {
  notificationService,
  NotificationTemplateType,
} from '../services/notificationService';
import { USER_ROLES, getRolePersonInfo } from '../services/permissionService';
import { SendNotificationModal } from './SendNotificationModal';

interface NotificationEngineViewProps {
  summaries: StudentScoreSummary[];
  settings: TeacherSettings;
  messageLogs: MessageLog[];
  activeRole?: AppUserRole | null;
  onLogSent: (log: Omit<MessageLog, 'id' | 'sentAt'>) => void;
  selectedStudentIdFromParent?: string | null;
}

export const NotificationEngineView: React.FC<NotificationEngineViewProps> = ({
  summaries,
  settings,
  messageLogs,
  activeRole = null,
  onLogSent,
  selectedStudentIdFromParent,
}) => {
  const currentRoleInfo = activeRole ? (USER_ROLES[activeRole] || USER_ROLES.gvcn) : null;
  const canSend = !!currentRoleInfo && currentRoleInfo.canSendNotifications;
  const students = summaries.map((s) => s.student);
  const rolePerson = getRolePersonInfo(activeRole, students, undefined, settings.teacherName);
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    selectedStudentIdFromParent || summaries[0]?.student.id || ''
  );
  const [templateType, setTemplateType] =
    useState<NotificationTemplateType>('weekly_report');
  const [filterMode, setFilterMode] = useState<
    'all' | 'violations' | 'warning' | 'rewards'
  >('all');
  const [search, setSearch] = useState('');
  const [customTeacherNote, setCustomTeacherNote] = useState('');
  const [copiedToast, setCopiedToast] = useState(false);
  const [autoSentMap, setAutoSentMap] = useState<Record<string, boolean>>({});
  const [modalSummary, setModalSummary] = useState<StudentScoreSummary | null>(null);

  useEffect(() => {
    if (selectedStudentIdFromParent) {
      setSelectedStudentId(selectedStudentIdFromParent);
    }
  }, [selectedStudentIdFromParent]);

  // Filter list of students for sending
  const filteredSummaries = summaries.filter((s) => {
    const matchSearch =
      s.student.name.toLowerCase().includes(search.toLowerCase()) ||
      s.student.rollNumber.toString().includes(search) ||
      s.student.parentPhone.includes(search);

    if (!matchSearch) return false;

    if (filterMode === 'violations') return s.violationCount > 0;
    if (filterMode === 'warning') return s.totalScore < 80;
    if (filterMode === 'rewards') return s.rewardCount > 0;
    return true;
  });

  const selectedSummary =
    summaries.find((s) => s.student.id === selectedStudentId) || summaries[0];

  // Auto-switch template if needed based on student situation
  const currentMessageText = selectedSummary
    ? notificationService.generateMessage(
        selectedSummary,
        settings,
        templateType,
        customTeacherNote
      )
    : '';

  const handleCopy = async () => {
    const success = await notificationService.copyToClipboard(currentMessageText);
    if (success) {
      setCopiedToast(true);
      setTimeout(() => setCopiedToast(false), 3000);
      if (selectedSummary) {
        onLogSent({
          studentId: selectedSummary.student.id,
          studentName: selectedSummary.student.name,
          parentPhone: selectedSummary.student.parentPhone,
          channel: 'clipboard',
          content: currentMessageText,
          status: 'sent',
        });
      }
    }
  };

  const handleOpenZalo = async (studentSummary: StudentScoreSummary) => {
    const msg = notificationService.generateMessage(
      studentSummary,
      settings,
      templateType,
      customTeacherNote
    );
    await notificationService.copyToClipboard(msg);
    setCopiedToast(true);
    setTimeout(() => setCopiedToast(false), 4000);

    onLogSent({
      studentId: studentSummary.student.id,
      studentName: studentSummary.student.name,
      parentPhone: studentSummary.student.parentPhone,
      channel: 'zalo',
      content: msg,
      status: 'sent',
    });

    setAutoSentMap((prev) => ({ ...prev, [studentSummary.student.id]: true }));
    setModalSummary(studentSummary);
  };

  const handleOpenSms = async (studentSummary: StudentScoreSummary) => {
    const msg = notificationService.generateMessage(
      studentSummary,
      settings,
      templateType,
      customTeacherNote
    );
    await notificationService.copyToClipboard(msg);

    onLogSent({
      studentId: studentSummary.student.id,
      studentName: studentSummary.student.name,
      parentPhone: studentSummary.student.parentPhone,
      channel: 'sms',
      content: msg,
      status: 'sent',
    });

    setAutoSentMap((prev) => ({ ...prev, [studentSummary.student.id]: true }));
    setModalSummary(studentSummary);
  };

  const countSent = Object.keys(autoSentMap).length;
  const progressPercent = Math.round(
    (countSent / (filteredSummaries.length || 1)) * 100
  );

  return (
    <div className="space-y-6">
      {/* Toast notification */}
      {copiedToast && (
        <div className="bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-lg flex items-center justify-between text-xs sm:text-sm font-semibold animate-bounce">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            <span>
              Đã sao chép nội dung tin nhắn! Bạn có thể dán (Paste) ngay vào Zalo hoặc SMS.
            </span>
          </div>
          <button
            onClick={() => setCopiedToast(false)}
            className="text-emerald-100 hover:text-white underline text-xs"
          >
            Đóng
          </button>
        </div>
      )}

      {/* Top Banner Guide */}
      <div className="bg-gradient-to-r from-blue-700 via-sky-700 to-indigo-800 text-white rounded-2xl p-5 shadow-sm border border-blue-600">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <MessageSquareShare className="w-6 h-6 text-amber-300" />
              <h2 className="text-lg sm:text-xl font-bold">
                Hệ Thống Gửi Thông Báo Tự Động Qua Zalo / SMS
              </h2>
            </div>
            <p className="text-xs text-blue-100 mt-1 max-w-2xl">
              Cá nhân hóa nội dung cho từng phụ huynh lớp 10A7: Điểm thi đua tuần, chi tiết vi phạm, thành tích tuyên dương và lời dặn dò của GVCN Thầy Trần Văn Dư.
            </p>
          </div>

          <div className="bg-blue-900/60 p-3 rounded-xl border border-blue-400/30 text-xs text-right shrink-0">
            <div className="text-blue-200">Tiến độ gửi đợt này</div>
            <div className="text-lg font-bold text-amber-300">
              {countSent} / {filteredSummaries.length} Phụ huynh
            </div>
            <div className="w-32 bg-blue-950/60 h-2 rounded-full overflow-hidden mt-1">
              <div
                className="bg-amber-400 h-full rounded-full transition-all"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main 2-column layout: Queue list on left, Message preview & Send actions on right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Student Filter & Queue List (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-4 rounded-2xl shadow-xs border border-slate-200">
            {/* Filter buttons */}
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Chọn nhóm phụ huynh
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {filteredSummaries.length} học sinh
              </span>
            </div>

            <div className="grid grid-cols-2 gap-1.5 mb-3">
              <button
                onClick={() => setFilterMode('all')}
                className={`px-3 py-1.5 text-xs rounded-lg font-semibold border transition-all ${
                  filterMode === 'all'
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                Tất cả ({summaries.length} HS)
              </button>
              <button
                onClick={() => {
                  setFilterMode('violations');
                  setTemplateType('urgent_violation');
                }}
                className={`px-3 py-1.5 text-xs rounded-lg font-semibold border transition-all ${
                  filterMode === 'violations'
                    ? 'bg-rose-600 border-rose-600 text-white'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                Có Vi Phạm ({summaries.filter((s) => s.violationCount > 0).length})
              </button>
              <button
                onClick={() => {
                  setFilterMode('warning');
                  setTemplateType('urgent_violation');
                }}
                className={`px-3 py-1.5 text-xs rounded-lg font-semibold border transition-all ${
                  filterMode === 'warning'
                    ? 'bg-amber-600 border-amber-600 text-white'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                Điểm Dưới 80 ({summaries.filter((s) => s.totalScore < 80).length})
              </button>
              <button
                onClick={() => {
                  setFilterMode('rewards');
                  setTemplateType('commendation');
                }}
                className={`px-3 py-1.5 text-xs rounded-lg font-semibold border transition-all ${
                  filterMode === 'rewards'
                    ? 'bg-emerald-600 border-emerald-600 text-white'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                Được Khen ({summaries.filter((s) => s.rewardCount > 0).length})
              </button>
            </div>

            {/* Search Input */}
            <div className="relative mb-3">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm tên học sinh hoặc SĐT phụ huynh..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:bg-white focus:border-blue-500"
              />
            </div>

            {/* Scrollable list */}
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {filteredSummaries.map((s) => {
                const isSelected = selectedStudentId === s.student.id;
                const isSent = autoSentMap[s.student.id];

                return (
                  <div
                    key={s.student.id}
                    onClick={() => setSelectedStudentId(s.student.id)}
                    className={`p-3 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between gap-2 ${
                      isSelected
                        ? 'bg-blue-50/80 border-blue-400 ring-2 ring-blue-400/20'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="truncate">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-900">{s.student.name}</span>
                        <span className="text-[10px] text-slate-500 font-medium">
                          (Tổ {s.student.group})
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        PH: <strong className="text-slate-700">{s.student.parentPhone}</strong>
                      </div>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="font-extrabold text-blue-900">{s.totalScore}đ</span>
                        <span className="text-[10px] px-1 rounded bg-slate-100 text-slate-600">
                          {s.rankTitle}
                        </span>
                        {s.violationCount > 0 && (
                          <span className="text-[10px] text-rose-600 font-bold">
                            {s.violationCount} lỗi
                          </span>
                        )}
                        {s.rewardCount > 0 && (
                          <span className="text-[10px] text-emerald-600 font-bold">
                            +{s.rewardCount} khen
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      {isSent ? (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Đã gửi
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                          Chưa gửi
                        </span>
                      )}

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setModalSummary(s);
                        }}
                        className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-[11px] font-bold flex items-center gap-1 shadow-2xs cursor-pointer"
                        title="Mở gửi Zalo / SMS cho học sinh này"
                      >
                        <MessageCircle className="w-3 h-3 text-amber-300" />
                        <span>Gửi Zalo</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Live Message Preview, Customization & Actions (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {selectedSummary ? (
            <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200 space-y-4">
              {/* Header of Preview */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900">
                      Bản Tin Nhắn Phụ Huynh: {selectedSummary.student.name}
                    </h3>
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Học sinh lớp 10A7 • Phụ huynh: {selectedSummary.student.parentName || 'Quý PH'} ({selectedSummary.student.parentPhone})
                  </div>
                </div>

                {/* Template Selector */}
                <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl">
                  <button
                    onClick={() => setTemplateType('weekly_report')}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                      templateType === 'weekly_report'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Báo cáo tuần
                  </button>
                  <button
                    onClick={() => setTemplateType('urgent_violation')}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                      templateType === 'urgent_violation'
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Vi phạm
                  </button>
                  <button
                    onClick={() => setTemplateType('commendation')}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                      templateType === 'commendation'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Khen ngợi
                  </button>
                </div>
              </div>

              {/* Optional Custom note by GVCN Tran Van Du */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Lời dặn riêng từ Thầy Dư (tùy chọn chèn vào tin nhắn):
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: Nhờ Bác nhắc cháu chuẩn bị vở bài tập Hình học; Tuần này cháu tiến bộ rõ..."
                  value={customTeacherNote}
                  onChange={(e) => setCustomTeacherNote(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:bg-white focus:border-blue-500"
                />
              </div>

              {/* Live Preview Box */}
              <div>
                <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">
                  <span>Nội dung tin nhắn xem trước</span>
                  <span className="text-[11px] font-normal text-slate-400">
                    Định dạng chuẩn Zalo & SMS
                  </span>
                </div>
                <div className="bg-slate-900 text-slate-100 p-4 rounded-xl font-mono text-xs whitespace-pre-wrap leading-relaxed border border-slate-800 shadow-inner max-h-72 overflow-y-auto">
                  {currentMessageText}
                </div>
              </div>

              {/* Role Permission Alert */}
              {activeRole === 'lop_truong' && (
                <div className="p-3 bg-blue-50 border border-blue-300 rounded-xl text-xs text-blue-900 flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <strong>Phân quyền Lớp Trưởng:</strong> Bạn đang đăng nhập với vai trò <strong>Lớp Trưởng</strong>.
                    <p className="mt-0.5 text-blue-800">
                      Theo phân quyền của GVCN Thầy Trần Văn Dư, <strong>Lớp trưởng có quyền bao quát nhập điểm mọi mặt và ĐƯỢC PHÂN QUYỀN gửi thông báo Zalo / SMS</strong> trực tiếp cho phụ huynh học sinh.
                    </p>
                  </div>
                </div>
              )}

              {!canSend && (
                <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl text-xs text-amber-900 flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <strong>Phân quyền gửi thông báo:</strong> Đang đăng nhập vai trò <strong className="text-amber-900">{rolePerson.roleTitle}</strong> — <strong className="text-blue-900">{rolePerson.isTeacher ? 'GVCN:' : 'Học sinh:'} {rolePerson.personName}</strong>.
                    <p className="mt-0.5 text-amber-800">
                      Theo phân quyền lớp 10A7, chỉ <strong>Giáo viên chủ nhiệm (Thầy Trần Văn Dư)</strong> và <strong>Lớp Trưởng</strong> mới có quyền gửi tin nhắn Zalo/SMS đến phụ huynh học sinh. Các chức danh chuyên trách và tổ trưởng tập trung ghi nhận vi phạm/khen thưởng. Bạn vẫn có thể sao chép lời nhắn để đối chiếu.
                    </p>
                  </div>
                </div>
              )}

              {/* Action Buttons: Zalo, SMS, Copy, Call */}
              <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2.5">
                <div className="flex flex-wrap items-center gap-2">
                  {canSend ? (
                    <>
                      {/* Main Modal Trigger Button */}
                      <button
                        onClick={() => setModalSummary(selectedSummary)}
                        className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md transition-all cursor-pointer hover:shadow-lg"
                        title="Mở hộp thoại gửi Zalo & SMS có hỗ trợ sao chép và sửa SĐT nhanh"
                      >
                        <MessageCircle className="w-4 h-4 text-amber-300" />
                        <span>Hộp Thoại Gửi Zalo / SMS</span>
                        <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                      </button>

                      {/* Direct Zalo Link */}
                      <a
                        href={notificationService.getZaloChatUrl(selectedSummary.student.parentPhone)}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => handleOpenZalo(selectedSummary)}
                        className="flex items-center gap-1.5 px-3.5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md transition-all cursor-pointer"
                        title="Mở Zalo chat trực tiếp (tự động sao chép tin nhắn)"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-sky-200" />
                        <span>Mở Chat Zalo</span>
                      </a>

                      {/* Direct SMS Link */}
                      <a
                        href={notificationService.getSmsUrl(selectedSummary.student.parentPhone, currentMessageText)}
                        onClick={() => handleOpenSms(selectedSummary)}
                        className="flex items-center gap-1.5 px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md transition-all cursor-pointer"
                        title="Gửi tin nhắn SMS"
                      >
                        <Send className="w-4 h-4 text-emerald-200" />
                        <span>Gửi SMS</span>
                      </a>
                    </>
                  ) : (
                    <div className="px-3.5 py-2.5 bg-slate-100 border border-slate-300 rounded-xl text-slate-600 text-xs font-bold flex items-center gap-1.5">
                      <span>🔒 Nút gửi Zalo & SMS bị khóa (Dành riêng cho GVCN & Lớp Trưởng)</span>
                    </div>
                  )}

                  {/* Copy Button */}
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs sm:text-sm font-semibold rounded-xl border border-slate-300 transition-colors cursor-pointer"
                  >
                    <Copy className="w-4 h-4 text-slate-600" />
                    <span>Sao Chép Lời Nhắn</span>
                  </button>
                </div>

                {/* Call Direct */}
                <a
                  href={`tel:${notificationService.cleanPhoneNumber(selectedSummary.student.parentPhone)}`}
                  className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Gọi {selectedSummary.student.parentPhone}</span>
                </a>
              </div>
            </div>
          ) : (
            <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-400 text-xs">
              Vui lòng chọn một học sinh để xem và gửi thông báo.
            </div>
          )}

          {/* Quick Guide on how Zalo works */}
          <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3.5 text-xs text-amber-900 flex items-start gap-2.5">
            <Sparkles className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold">Mẹo gửi Zalo siêu tốc cho Thầy Trần Văn Dư:</div>
              <p className="mt-0.5 text-amber-800 leading-normal">
                Khi bấm <strong>"Mở Chat Zalo"</strong> hoặc <strong>"Hộp Thoại Gửi Zalo / SMS"</strong>, hệ thống tự động copy toàn bộ nội dung tin nhắn đã cá nhân hóa vào khay nhớ tạm và mở ngay cửa sổ chat với số điện thoại của phụ huynh. Thầy chỉ việc nhấn <strong>Ctrl + V</strong> (hoặc Dán) và nhấn <strong>Gửi</strong> là xong!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Send Notification Modal */}
      <SendNotificationModal
        isOpen={!!modalSummary}
        onClose={() => setModalSummary(null)}
        summary={modalSummary}
        settings={settings}
        onLogSent={onLogSent}
      />
    </div>
  );
};

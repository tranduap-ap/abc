import React, { useState, useEffect } from 'react';
import {
  X,
  MessageCircle,
  Send,
  Copy,
  Phone,
  Check,
  AlertCircle,
  ExternalLink,
  Sparkles,
  FileText,
  User,
  ShieldAlert,
} from 'lucide-react';
import {
  StudentScoreSummary,
  TeacherSettings,
  MessageLog,
} from '../types';
import {
  notificationService,
  NotificationTemplateType,
} from '../services/notificationService';

interface SendNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  summary: StudentScoreSummary | null;
  settings: TeacherSettings;
  onLogSent: (log: Omit<MessageLog, 'id' | 'sentAt'>) => void;
  onUpdateParentPhone?: (studentId: string, newPhone: string) => void;
}

export const SendNotificationModal: React.FC<SendNotificationModalProps> = ({
  isOpen,
  onClose,
  summary,
  settings,
  onLogSent,
  onUpdateParentPhone,
}) => {
  const [templateType, setTemplateType] =
    useState<NotificationTemplateType>('weekly_report');
  const [customNote, setCustomNote] = useState('');
  const [copied, setCopied] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [statusFeedback, setStatusFeedback] = useState<string | null>(null);

  // Phone editing inline if phone is missing or wrong
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [phoneInput, setPhoneInput] = useState('');

  useEffect(() => {
    if (summary) {
      setPhoneInput(summary.student.parentPhone || '');
      setIsEditingPhone(false);
      setStatusFeedback(null);
      setCopied(false);
      setCopiedPhone(false);

      // Auto pick best template
      if (summary.violationCount >= 2 || summary.totalScore < 80) {
        setTemplateType('urgent_violation');
      } else if (summary.rewardCount > 0 && summary.totalScore >= 95) {
        setTemplateType('commendation');
      } else {
        setTemplateType('weekly_report');
      }
    }
  }, [summary, isOpen]);

  if (!isOpen || !summary) return null;

  const { student, totalScore, rankTitle } = summary;
  const currentPhone = phoneInput.trim();
  const cleanPhone = notificationService.cleanPhoneNumber(currentPhone);
  const isValidPhone = notificationService.isValidPhoneNumber(currentPhone);

  const messageText = notificationService.generateMessage(
    summary,
    settings,
    templateType,
    customNote
  );

  const zaloUrl = notificationService.getZaloChatUrl(cleanPhone);
  const smsUrl = notificationService.getSmsUrl(cleanPhone, messageText);
  const zaloWebUrl = notificationService.getZaloWebUrl();

  const handleCopyMessage = async () => {
    const success = await notificationService.copyToClipboard(messageText);
    if (success) {
      setCopied(true);
      setStatusFeedback('Đã sao chép nội dung tin nhắn vào bộ nhớ đệm!');
      setTimeout(() => setCopied(false), 2500);

      onLogSent({
        studentId: student.id,
        studentName: student.name,
        parentPhone: currentPhone,
        channel: 'clipboard',
        content: messageText,
        status: 'sent',
      });
    }
  };

  const handleCopyPhone = async () => {
    if (!cleanPhone) return;
    const success = await notificationService.copyToClipboard(cleanPhone);
    if (success) {
      setCopiedPhone(true);
      setTimeout(() => setCopiedPhone(false), 2000);
    }
  };

  const handleZaloClick = async () => {
    // Copy message to clipboard automatically so user just needs to Ctrl+V into Zalo
    await notificationService.copyToClipboard(messageText);
    setStatusFeedback(
      `✅ Đã sao chép tin nhắn! Khi cửa sổ Zalo mở ra, Thầy chỉ cần bấm Ctrl+V (hoặc Dán) rồi nhấn Gửi.`
    );

    onLogSent({
      studentId: student.id,
      studentName: student.name,
      parentPhone: currentPhone,
      channel: 'zalo',
      content: messageText,
      status: 'sent',
    });
  };

  const handleSmsClick = async () => {
    await notificationService.copyToClipboard(messageText);
    setStatusFeedback(
      `📱 Đã mở ứng dụng SMS trên thiết bị và sao chép sẵn nội dung tin nhắn!`
    );

    onLogSent({
      studentId: student.id,
      studentName: student.name,
      parentPhone: currentPhone,
      channel: 'sms',
      content: messageText,
      status: 'sent',
    });
  };

  const handleSavePhone = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdateParentPhone && cleanPhone) {
      onUpdateParentPhone(student.id, cleanPhone);
      student.parentPhone = cleanPhone;
    }
    setIsEditingPhone(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[94vh]">
        {/* Header */}
        <div className="px-5 py-3.5 bg-gradient-to-r from-blue-900 via-indigo-900 to-sky-900 text-white flex items-center justify-between shrink-0 shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-amber-300">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold">
                Gửi Thông Báo Phụ Huynh Qua Zalo & SMS
              </h3>
              <p className="text-xs text-blue-200">
                Lớp {settings.className} • GVCN Thầy {settings.teacherName}
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

        {/* Content body */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* Recipient summary banner */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-slate-900">
                  {student.name}
                </span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                  STT #{student.rollNumber} • Tổ {student.group}
                </span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300">
                  {totalScore}đ ({rankTitle})
                </span>
              </div>

              {/* Parent & Phone line */}
              <div className="flex flex-wrap items-center gap-2 mt-1.5 text-slate-600">
                <span className="flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  PH: <strong>{student.parentName || 'Chưa cập nhật'}</strong>
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  SĐT: <strong className="text-blue-700 font-mono text-sm">{currentPhone || 'Trống'}</strong>
                </span>

                {cleanPhone && (
                  <button
                    onClick={handleCopyPhone}
                    className="inline-flex items-center gap-1 text-[11px] text-slate-500 hover:text-blue-600 ml-1 cursor-pointer"
                    title="Sao chép số điện thoại"
                  >
                    {copiedPhone ? (
                      <Check className="w-3 h-3 text-emerald-600" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                    <span>{copiedPhone ? 'Đã chép SĐT' : 'Chép SĐT'}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Validation indicator / inline phone edit button */}
            <div className="shrink-0 flex items-center gap-2">
              {!isValidPhone ? (
                <button
                  onClick={() => setIsEditingPhone(!isEditingPhone)}
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-xs transition-colors cursor-pointer"
                >
                  {isEditingPhone ? 'Đóng' : '✏️ Nhập lại SĐT'}
                </button>
              ) : (
                <button
                  onClick={() => setIsEditingPhone(!isEditingPhone)}
                  className="px-2.5 py-1 text-slate-600 hover:text-blue-600 hover:bg-slate-200 rounded-lg text-[11px] font-medium transition-colors cursor-pointer"
                >
                  {isEditingPhone ? 'Đóng sửa' : 'Đổi SĐT'}
                </button>
              )}
            </div>
          </div>

          {/* Inline Phone Edit Form */}
          {isEditingPhone && (
            <form onSubmit={handleSavePhone} className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-2">
              <label className="block font-bold text-amber-900 text-xs">
                Cập nhật số điện thoại phụ huynh:
              </label>
              <div className="flex gap-2">
                <input
                  type="tel"
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  placeholder="Ví dụ: 0912345678"
                  className="flex-1 px-3 py-1.5 bg-white border border-amber-300 rounded-lg font-bold text-slate-900 outline-none focus:ring-1 focus:ring-amber-500"
                />
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg"
                >
                  Lưu SĐT
                </button>
              </div>
            </form>
          )}

          {/* Invalid phone warning */}
          {!isValidPhone && (
            <div className="p-3 bg-rose-50 border border-rose-300 text-rose-900 rounded-xl flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <strong>Số điện thoại chưa hợp lệ:</strong> Số điện thoại phụ huynh hiện tại ({currentPhone || 'chưa có'}) không đúng chuẩn 10 số. Vui lòng bấm <strong>Nhập lại SĐT</strong> ở trên để gửi được qua Zalo & SMS.
              </div>
            </div>
          )}

          {/* Status feedback banner */}
          {statusFeedback && (
            <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl flex items-start gap-2 font-medium">
              <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{statusFeedback}</span>
            </div>
          )}

          {/* Template Selector */}
          <div>
            <label className="block font-bold text-slate-700 mb-1.5">
              Chọn mẫu thông báo:
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setTemplateType('weekly_report')}
                className={`p-2 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                  templateType === 'weekly_report'
                    ? 'bg-blue-600 border-blue-600 text-white shadow-xs'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                📋 Báo Cáo Tuần
              </button>
              <button
                type="button"
                onClick={() => setTemplateType('urgent_violation')}
                className={`p-2 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                  templateType === 'urgent_violation'
                    ? 'bg-rose-600 border-rose-600 text-white shadow-xs'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                ⚠️ Nhắc Nhở Vi Phạm
              </button>
              <button
                type="button"
                onClick={() => setTemplateType('commendation')}
                className={`p-2 rounded-xl border text-center font-bold transition-all cursor-pointer ${
                  templateType === 'commendation'
                    ? 'bg-emerald-600 border-emerald-600 text-white shadow-xs'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                🎉 Thư Tuyên Dương
              </button>
            </div>
          </div>

          {/* Custom Note input */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Lời dặn thêm của Thầy Dư (tùy chọn):
            </label>
            <input
              type="text"
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}
              placeholder="Ví dụ: Kính nhờ gia đình đôn đốc con xem lại bài vở môn Toán trước khi đến lớp..."
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl outline-none text-slate-900 focus:bg-white focus:border-blue-500"
            />
          </div>

          {/* Live Message Preview & Copy */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-bold text-slate-700">
                Nội dung tin nhắn sẽ gửi ({messageText.length} ký tự):
              </label>
              <button
                type="button"
                onClick={handleCopyMessage}
                className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-bold cursor-pointer"
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                <span>{copied ? 'Đã sao chép!' : 'Sao chép tin nhắn'}</span>
              </button>
            </div>
            <textarea
              readOnly
              rows={8}
              value={messageText}
              className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl font-mono text-[11px] text-slate-800 outline-none leading-relaxed select-all"
            />
          </div>

          {/* Instruction guide */}
          <div className="bg-sky-50 border border-sky-200 text-sky-950 p-3 rounded-xl space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-xs text-blue-900">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              Cách gửi tin nhắn nhanh & không bao giờ bị lỗi:
            </div>
            <ol className="list-decimal list-inside space-y-0.5 text-[11px] text-slate-700 pl-1">
              <li>
                Bấm nút <strong>"Mở Chat Zalo"</strong> bên dưới: Hệ thống sẽ tự động sao chép toàn bộ nội dung tin nhắn và mở liên kết trực tiếp.
              </li>
              <li>
                Trong khung trò chuyện Zalo với phụ huynh, Thầy chỉ cần bấm <strong>Ctrl + V</strong> (hoặc nhấn giữ chọn Dán) rồi nhấn Gửi.
              </li>
              <li>
                Nếu dùng điện thoại / máy tính bảng, Thầy có thể bấm nút <strong>"Gửi Tin Nhắn SMS"</strong> để mở thẳng ứng dụng nhắn tin của máy.
              </li>
            </ol>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2.5 shrink-0">
          <div className="flex items-center gap-2">
            {/* Copy button */}
            <button
              type="button"
              onClick={handleCopyMessage}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl transition-colors cursor-pointer"
            >
              <Copy className="w-4 h-4 text-slate-700" />
              <span>{copied ? 'Đã Chép Xong!' : 'Sao Chép Tin Nhắn'}</span>
            </button>

            {/* Direct Call */}
            {cleanPhone && (
              <a
                href={`tel:${cleanPhone}`}
                className="inline-flex items-center gap-1 px-3 py-2.5 bg-slate-100 hover:bg-emerald-50 text-emerald-800 border border-emerald-300 text-xs font-semibold rounded-xl transition-colors"
                title="Gọi điện thoại trực tiếp cho phụ huynh"
              >
                <Phone className="w-3.5 h-3.5 text-emerald-700" />
                <span>Gọi PH</span>
              </a>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* SMS Button: Real HTML anchor that never gets blocked */}
            <a
              href={smsUrl}
              onClick={handleSmsClick}
              className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold shadow-md transition-all ${
                isValidPhone
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white cursor-pointer'
                  : 'bg-slate-300 text-slate-500 pointer-events-none'
              }`}
            >
              <Send className="w-4 h-4" />
              <span>Gửi Tin Nhắn SMS</span>
            </a>

            {/* Zalo Button: Real HTML anchor with target="_blank" that never gets blocked */}
            <a
              href={zaloUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleZaloClick}
              className={`inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-md transition-all ${
                isValidPhone
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white cursor-pointer hover:shadow-lg'
                  : 'bg-slate-300 text-slate-500 pointer-events-none'
              }`}
            >
              <MessageCircle className="w-4 h-4 text-amber-300" />
              <span>Mở Chat Zalo (zalo.me)</span>
              <ExternalLink className="w-3.5 h-3.5 text-blue-200" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

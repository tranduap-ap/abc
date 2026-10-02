import React, { useState } from 'react';
import {
  Sparkles,
  Bot,
  Copy,
  CheckCircle2,
  Users,
  FileText,
  Lightbulb,
  MessageSquare,
  BookOpen,
} from 'lucide-react';
import { StudentScoreSummary, TeacherSettings } from '../types';
import { aiAssistantService } from '../services/aiAssistantService';
import { notificationService } from '../services/notificationService';

interface AiAssistantViewProps {
  summaries: StudentScoreSummary[];
  settings: TeacherSettings;
  onOpenZalo: (studentId: string) => void;
}

export const AiAssistantView: React.FC<AiAssistantViewProps> = ({
  summaries,
  settings,
  onOpenZalo,
}) => {
  const [selectedStudentId, setSelectedStudentId] = useState<string>(
    summaries[0]?.student.id || ''
  );
  const [loading, setLoading] = useState(false);
  const [studentAssessment, setStudentAssessment] = useState<{
    assessment: string;
    suggestedAction: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  // Overall class report
  const classReport = aiAssistantService.generateClassOverviewReport(
    summaries,
    settings
  );

  const selectedSummary = summaries.find(
    (s) => s.student.id === selectedStudentId
  );

  const handleGenerateStudentAssessment = async () => {
    if (!selectedSummary) return;
    setLoading(true);
    try {
      const res = await aiAssistantService.generateStudentAssessment(
        selectedSummary,
        settings
      );
      setStudentAssessment(res);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyText = async (text: string) => {
    const ok = await notificationService.copyToClipboard(text);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-blue-900 text-white p-6 rounded-2xl shadow-md border border-purple-800">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-500/20 text-purple-300 rounded-xl border border-purple-400/30">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight">
              Trợ Lý Sư Phạm GVCN Thầy Trần Văn Dư (AI Assistant)
            </h2>
            <p className="text-xs text-purple-200 mt-1">
              Tự động phân tích dữ liệu nề nếp lớp 10A7, soạn lời nhận xét sinh hoạt lớp, đề xuất biện pháp giáo dục và gợi ý nội dung họp phụ huynh.
            </p>
          </div>
        </div>
      </div>

      {copied && (
        <div className="bg-emerald-600 text-white px-4 py-2.5 rounded-xl shadow-md text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>Đã sao chép nội dung vào khay nhớ tạm!</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Overall Class Assessment */}
        <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-800">
                  Nhận Xét Chung Sinh Hoạt Lớp (Tuần {settings.currentWeek})
                </h3>
              </div>
              <button
                onClick={() => handleCopyText(classReport)}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Sao chép</span>
              </button>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl text-xs text-slate-700 leading-relaxed font-sans mt-3 whitespace-pre-wrap border border-slate-200">
              {classReport}
            </div>
          </div>

          <div className="bg-purple-50 p-3.5 rounded-xl border border-purple-200 text-xs text-purple-900 flex items-start gap-2.5">
            <Lightbulb className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold">Định hướng tiết Sinh hoạt cuối tuần:</div>
              <p className="mt-0.5 text-purple-800">
                Thầy Dư nên biểu dương Tổ 1 hoặc Tổ dẫn đầu trong 10 phút đầu; dành 15 phút cho Ban cán sự nhắc nhở các lỗi nề nếp và giao chỉ tiêu thi đua tuần tới.
              </p>
            </div>
          </div>
        </div>

        {/* Right: Individual Student Pedagogical Generator */}
        <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-purple-600" />
                <h3 className="text-sm font-bold text-slate-800">
                  Soạn Lời Nhận Xét Riêng Từng Học Sinh
                </h3>
              </div>
            </div>

            {/* Select student */}
            <div className="mt-3 flex gap-2">
              <select
                value={selectedStudentId}
                onChange={(e) => {
                  setSelectedStudentId(e.target.value);
                  setStudentAssessment(null);
                }}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none font-medium focus:border-purple-500"
              >
                {summaries.map((s) => (
                  <option key={s.student.id} value={s.student.id}>
                    #{s.student.rollNumber} - {s.student.name} (Tổ {s.student.group}) — {s.totalScore}đ [{s.rankTitle}]
                  </option>
                ))}
              </select>

              <button
                onClick={handleGenerateStudentAssessment}
                disabled={loading}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold whitespace-nowrap shadow-xs transition-colors shrink-0"
              >
                {loading ? 'Đang tạo...' : 'Tạo Nhận Xét'}
              </button>
            </div>

            {/* Assessment display */}
            {studentAssessment ? (
              <div className="mt-4 space-y-3">
                <div className="bg-purple-50/70 p-3.5 rounded-xl border border-purple-200">
                  <div className="text-[11px] font-bold text-purple-800 uppercase tracking-wider mb-1 flex justify-between items-center">
                    <span>Lời nhận xét học bạ / sổ theo dõi:</span>
                    <button
                      onClick={() => handleCopyText(studentAssessment.assessment)}
                      className="text-purple-700 hover:text-purple-900"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-xs text-slate-800 leading-relaxed font-medium">
                    {studentAssessment.assessment}
                  </p>
                </div>

                <div className="bg-blue-50/70 p-3.5 rounded-xl border border-blue-200">
                  <div className="text-[11px] font-bold text-blue-800 uppercase tracking-wider mb-1">
                    Gợi ý hướng xử lý sư phạm cho Thầy Dư:
                  </div>
                  <p className="text-xs text-slate-800 leading-relaxed">
                    {studentAssessment.suggestedAction}
                  </p>
                </div>
              </div>
            ) : (
              <div className="mt-4 p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 text-xs text-slate-500">
                Bấm <strong>"Tạo Nhận Xét"</strong> để xem phân tích nề nếp và hướng giáo dục cho học sinh này.
              </div>
            )}
          </div>

          {selectedSummary && (
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                PH: {selectedSummary.student.parentName} ({selectedSummary.student.parentPhone})
              </span>
              <button
                onClick={() => onOpenZalo(selectedSummary.student.id)}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Nhắn Zalo Cho Phụ Huynh</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

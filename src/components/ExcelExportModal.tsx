import React from 'react';
import {
  X,
  FileSpreadsheet,
  Download,
  Users,
  Trophy,
  ClipboardList,
  CheckCircle2,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react';
import {
  Student,
  StudentScoreSummary,
  GroupScoreSummary,
  IncidentRecord,
  SchoolCompetitionRecord,
  TeacherSettings,
} from '../types';
import { excelService } from '../services/excelService';

interface ExcelExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  summaries: StudentScoreSummary[];
  groupSummaries: GroupScoreSummary[];
  incidents: IncidentRecord[];
  competitions: SchoolCompetitionRecord[];
  settings: TeacherSettings;
  filterType: 'week' | 'month';
}

export const ExcelExportModal: React.FC<ExcelExportModalProps> = ({
  isOpen,
  onClose,
  students,
  summaries,
  groupSummaries,
  incidents,
  competitions,
  settings,
  filterType,
}) => {
  if (!isOpen) return null;

  const filterValue = filterType === 'week' ? settings.currentWeek : settings.currentMonth;
  const periodLabel = filterType === 'week' ? `Tuần ${filterValue}` : `Tháng ${filterValue}`;

  const handleExportRoster = () => {
    excelService.exportStudentRosterToExcel(students, summaries, settings);
  };

  const handleExportCompetition = () => {
    excelService.exportCompetitionToExcel(competitions, groupSummaries, settings);
  };

  const handleExportDiscipline = () => {
    excelService.exportDisciplineReportToExcel(
      summaries,
      groupSummaries,
      incidents,
      filterType,
      filterValue,
      settings
    );
  };

  const handleExportMaster = () => {
    excelService.exportMasterAllDataPackageToExcel(
      students,
      summaries,
      groupSummaries,
      incidents,
      competitions,
      filterType,
      filterValue,
      settings
    );
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                Xuất Dữ Liệu Sang File Excel (.xlsx)
              </h3>
              <p className="text-xs text-emerald-200">
                Lớp {settings.className} • GVCN: Thầy {settings.teacherName} • Lưu trữ & in ấn bên ngoài
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-emerald-200 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="p-5 overflow-y-auto space-y-4">
          <p className="text-xs text-slate-600">
            Hệ thống hỗ trợ xuất dữ liệu chuẩn định dạng Microsoft Excel (.xlsx), tự động căn chỉnh độ rộng cột và phân tách nhiều trang tính (Sheets) rõ ràng:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {/* Card 1: Báo cáo nề nếp */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-blue-50/50 hover:border-blue-300 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 rounded-lg bg-blue-100 text-blue-700">
                    <ClipboardList className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                    {periodLabel}
                  </span>
                </div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                  Báo Cáo Nề Nếp & Vi Phạm
                </h4>
                <ul className="text-[11px] text-slate-600 mt-2 space-y-1">
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Sheet 1: Bảng tổng kết điểm nề nếp ({summaries.length} HS)</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Sheet 2: Nhật ký chi tiết lỗi vi phạm & khen</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Sheet 3: Xếp loại thi đua 4 Tổ</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={handleExportDiscipline}
                className="mt-4 w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-xs transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Tải Báo Cáo Nề Nếp</span>
              </button>
            </div>

            {/* Card 2: Danh sách học sinh */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-emerald-50/50 hover:border-emerald-300 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700">
                    <Users className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                    {students.length} Học Sinh
                  </span>
                </div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                  Danh Sách Học Sinh Lớp 10A7
                </h4>
                <ul className="text-[11px] text-slate-600 mt-2 space-y-1">
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Sheet 1: DS đầy đủ, chức vụ, SĐT phụ huynh</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Sheet 2: Bảng phân công thành viên theo 4 Tổ</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Điểm rèn luyện hiện tại & xếp loại</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={handleExportRoster}
                className="mt-4 w-full flex items-center justify-center gap-2 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-xs transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Tải Danh Sách Học Sinh</span>
              </button>
            </div>

            {/* Card 3: Thi đua toàn trường */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-amber-50/50 hover:border-amber-300 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 rounded-lg bg-amber-100 text-amber-800">
                    <Trophy className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                    {competitions.length} Tuần Thi Đua
                  </span>
                </div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                  Sổ Điểm & Thi Đua Toàn Trường
                </h4>
                <ul className="text-[11px] text-slate-600 mt-2 space-y-1">
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Sheet 1: ĐTB sổ đầu bài, chấm thi đua, hạng tuần</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Sheet 2: Xếp hạng thi đua nội bộ 4 Tổ</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Đánh giá, nhận xét và chữ ký người ghi</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={handleExportCompetition}
                className="mt-4 w-full flex items-center justify-center gap-2 px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg shadow-xs transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Tải Sổ Điểm Thi Đua</span>
              </button>
            </div>

            {/* Card 4: Gói tổng hợp 5 Sheets */}
            <div className="p-4 rounded-xl border border-indigo-200 bg-gradient-to-br from-indigo-50/70 to-purple-50/70 hover:border-indigo-400 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 rounded-lg bg-indigo-600 text-white shadow-xs">
                    <Layers className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Trọn Gói 5 Sheet
                  </span>
                </div>
                <h4 className="text-xs sm:text-sm font-bold text-indigo-950">
                  Gói Báo Cáo Tổng Hợp Đầy Đủ
                </h4>
                <ul className="text-[11px] text-slate-600 mt-2 space-y-1">
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <span>Bao gồm: Nề nếp + Vi phạm + 4 Tổ</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <span>Kèm: Thi đua trường + Danh sách học sinh</span>
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <span>Lý tưởng cho lưu trữ và in sổ chủ nhiệm</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={handleExportMaster}
                className="mt-4 w-full flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all cursor-pointer"
              >
                <Download className="w-4 h-4 text-amber-300" />
                <span>Xuất Trọn Gói 5 Sheets</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-100 border-t border-slate-200 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            Định dạng tệp: <strong>Microsoft Excel Worksheet (.xlsx)</strong>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-700 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

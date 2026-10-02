import React from 'react';
import { X, Printer } from 'lucide-react';
import {
  StudentScoreSummary,
  GroupScoreSummary,
  TeacherSettings,
} from '../types';

interface PrintableReportProps {
  isOpen: boolean;
  onClose: () => void;
  summaries: StudentScoreSummary[];
  groupSummaries: GroupScoreSummary[];
  settings: TeacherSettings;
  filterType: 'week' | 'month';
}

export const PrintableReport: React.FC<PrintableReportProps> = ({
  isOpen,
  onClose,
  summaries,
  groupSummaries,
  settings,
  filterType,
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const sortedGroups = [...groupSummaries].sort((a, b) => a.rank - b.rank);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      {/* Container */}
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full border border-slate-300 max-h-[96vh] flex flex-col overflow-hidden">
        {/* Actions bar (hidden during print) */}
        <div className="px-5 py-3 bg-slate-900 text-white flex items-center justify-between print:hidden">
          <div className="text-xs sm:text-sm font-semibold">
            Bản In Báo Cáo Nề Nếp Lớp 10A7 (Khổ A4)
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>In Ngay (Print)</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-white rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Paper Canvas */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-10 font-serif text-slate-900 bg-white">
          {/* Header Vietnamese Administrative Format */}
          <div className="grid grid-cols-2 text-center text-xs border-b pb-4 mb-5">
            <div>
              <div className="uppercase font-bold">{settings.schoolName}</div>
              <div className="font-bold uppercase tracking-wider text-blue-900">
                LỚP CHỦ NHIỆM: {settings.className}
              </div>
              <div className="text-[11px] italic mt-0.5">
                GVCN: Thầy {settings.teacherName} - ĐT: {settings.teacherPhone}
              </div>
            </div>
            <div>
              <div className="font-bold uppercase">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
              <div className="font-semibold underline">Độc lập - Tự do - Hạnh phúc</div>
              <div className="text-[11px] italic mt-1">
                Ngày {new Date().getDate()} tháng {new Date().getMonth() + 1} năm {new Date().getFullYear()}
              </div>
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-6">
            <h1 className="text-lg sm:text-xl font-bold uppercase tracking-wide text-slate-900">
              BẢNG TỔNG HỢP NỀ NẾP & THI ĐUA HỌC SINH
            </h1>
            <div className="text-xs font-semibold text-slate-700 mt-1">
              {filterType === 'week' ? `TUẦN ${settings.currentWeek}` : `THÁNG ${settings.currentMonth}`} • NĂM HỌC {settings.academicYear}
            </div>
          </div>

          {/* 1. Group Ranking Table */}
          <div className="mb-6">
            <h2 className="text-xs font-bold uppercase mb-2 border-l-4 border-slate-800 pl-2">
              I. BẢNG XẾP HẠNG THI ĐUA 4 TỔ
            </h2>
            <table className="w-full text-left text-xs border-collapse border border-slate-400">
              <thead>
                <tr className="bg-slate-100 text-center font-bold">
                  <th className="border border-slate-300 p-1.5">Hạng</th>
                  <th className="border border-slate-300 p-1.5">Tổ Thi Đua</th>
                  <th className="border border-slate-300 p-1.5">Sĩ Số</th>
                  <th className="border border-slate-300 p-1.5">Lượt Khen (+)</th>
                  <th className="border border-slate-300 p-1.5">Lượt Vi Phạm (-)</th>
                  <th className="border border-slate-300 p-1.5">Điểm Trung Bình</th>
                </tr>
              </thead>
              <tbody>
                {sortedGroups.map((grp) => (
                  <tr key={grp.group} className="text-center">
                    <td className="border border-slate-300 p-1.5 font-bold">
                      {grp.rank === 1 ? '🥇 Hạng 1' : `Hạng ${grp.rank}`}
                    </td>
                    <td className="border border-slate-300 p-1.5 font-semibold">Tổ {grp.group}</td>
                    <td className="border border-slate-300 p-1.5">{grp.studentCount} HS</td>
                    <td className="border border-slate-300 p-1.5 text-emerald-800 font-bold">+{grp.totalRewards}</td>
                    <td className="border border-slate-300 p-1.5 text-rose-800 font-bold">-{grp.totalViolations}</td>
                    <td className="border border-slate-300 p-1.5 font-black text-blue-900">{grp.averageScore}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* 2. Students Ranking Table */}
          <div className="mb-6">
            <h2 className="text-xs font-bold uppercase mb-2 border-l-4 border-slate-800 pl-2">
              II. DANH SÁCH CHI TIẾT TỪNG HỌC SINH LỚP 10A7 ({summaries.length} HS)
            </h2>
            <table className="w-full text-left text-[11px] border-collapse border border-slate-400">
              <thead>
                <tr className="bg-slate-100 text-center font-bold">
                  <th className="border border-slate-300 p-1 w-8">STT</th>
                  <th className="border border-slate-300 p-1 text-left">Họ và tên</th>
                  <th className="border border-slate-300 p-1 w-10">Tổ</th>
                  <th className="border border-slate-300 p-1 w-12 text-center">Gốc</th>
                  <th className="border border-slate-300 p-1 w-12 text-center">Cộng</th>
                  <th className="border border-slate-300 p-1 w-12 text-center">Trừ</th>
                  <th className="border border-slate-300 p-1 w-14 text-center">Tổng Điểm</th>
                  <th className="border border-slate-300 p-1 w-20 text-center">Xếp Loại</th>
                  <th className="border border-slate-300 p-1 text-left">Ghi chú vi phạm / khen</th>
                </tr>
              </thead>
              <tbody>
                {summaries.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="border border-slate-300 p-4 text-center text-slate-500 italic">
                      Chưa có học sinh trong danh sách lớp 10A7.
                    </td>
                  </tr>
                ) : (
                  summaries.map((s) => (
                    <tr key={s.student.id}>
                      <td className="border border-slate-300 p-1 text-center font-semibold">{s.student.rollNumber}</td>
                      <td className="border border-slate-300 p-1 font-bold">{s.student.name}</td>
                      <td className="border border-slate-300 p-1 text-center">Tổ {s.student.group}</td>
                      <td className="border border-slate-300 p-1 text-center text-slate-500">{s.baseScore}</td>
                      <td className="border border-slate-300 p-1 text-center font-bold text-emerald-800">
                        {s.rewardPoints > 0 ? `+${s.rewardPoints}` : '0'}
                      </td>
                      <td className="border border-slate-300 p-1 text-center font-bold text-rose-800">
                        {s.violationPoints > 0 ? `-${s.violationPoints}` : '0'}
                      </td>
                      <td className="border border-slate-300 p-1 text-center font-black text-slate-900">{s.totalScore}</td>
                      <td className="border border-slate-300 p-1 text-center font-semibold">{s.rankTitle}</td>
                      <td className="border border-slate-300 p-1 text-[10px] text-slate-600 truncate max-w-[140px]">
                        {s.incidents.length > 0
                          ? s.incidents.map((i) => i.ruleName).join('; ')
                          : 'Không vi phạm'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* 3. Signatures */}
          <div className="grid grid-cols-3 text-center text-xs pt-8 mt-6">
            <div>
              <div className="font-bold uppercase">LỚP TRƯỞNG 10A7</div>
              <div className="text-[10px] italic">(Ký và ghi rõ họ tên)</div>
              <div className="mt-14 font-bold">Nguyễn Hoàng An</div>
            </div>
            <div>
              <div className="font-bold uppercase">CỜ ĐỎ THEO DÕI</div>
              <div className="text-[10px] italic">(Ký và ghi rõ họ tên)</div>
              <div className="mt-14 font-bold">Đỗ Thùy Dung</div>
            </div>
            <div>
              <div className="font-bold uppercase">GIÁO VIÊN CHỦ NHIỆM</div>
              <div className="text-[10px] italic">(Ký và ghi rõ họ tên)</div>
              <div className="mt-14 font-bold">Thầy {settings.teacherName}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

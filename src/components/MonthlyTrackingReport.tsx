import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Printer,
  Search,
  Calendar,
  Info,
  CheckCircle2,
  Users,
} from 'lucide-react';
import {
  Student,
  StudentScoreSummary,
  TeacherSettings,
  Rule,
} from '../types';
import { excelService } from '../services/excelService';

// Standard 23 criteria titles from school regulations
export const CRITERIA_23_TITLES: Record<number, string> = {
  1: '(1) Rèn luyện phẩm chất yêu nước',
  2: '(2) Rèn luyện phẩm chất yêu nước',
  3: '(3) Rèn luyện phẩm chất nhân ái',
  4: '(4) Rèn luyện phẩm chất nhân ái',
  5: '(5) Rèn luyện phẩm chất nhân ái',
  6: '(6) Nhiệm vụ học tập, vào trễ, nghỉ học, không thuộc bài, đồng phục, trực nhật',
  7: '(7) Hoạt động trải nghiệm, hướng nghiệp',
  8: '(8) Gian lận trong học tập, kiểm tra, thi cử',
  9: '(9) Lấy cắp đồ của người khác hoặc tham của rơi',
  10: '(10) Không trung thực trong cung cấp thông tin',
  11: '(11) Xúc phạm nhân phẩm, danh dự, thân thể giáo viên/học sinh',
  12: '(12) Đánh bạc, rượu bia, thuốc lá điện tử, chất kích thích, pháo',
  13: '(13) Sử dụng điện thoại di động, thiết bị khác trên lớp không được phép',
  14: '(14) Đánh nhau, gây rối trật tự an ninh',
  15: '(15) Sử dụng, trao đổi sản phẩm kích động bạo lực, đồi trụy',
  16: '(16) Hành vi nghiêm cấm khác theo quy định pháp luật',
  17: '(17) Không thương yêu, kính trọng ông bà, cha mẹ',
  18: '(18) Không tham gia tuyên truyền, hoạt động công ích',
  19: '(19) Không chấp hành luật an toàn giao thông, trật tự xã hội',
  20: '(20) Vi phạm nội quy, quy định, quy tắc ứng xử nhà trường',
  21: '(21) Lãng phí điện, nước, dụng cụ học tập',
  22: '(22) Xả rác bừa bãi hoặc bỏ rác không đúng nơi quy định',
  23: '(23) Mang thức ăn, nước uống hộp xốp, ly nhựa vào phòng học',
};

interface MonthlyTrackingReportProps {
  students: Student[];
  summaries: StudentScoreSummary[];
  settings: TeacherSettings;
  rules: Rule[];
  selectedMonth: number;
  onSelectMonth: (month: number) => void;
}

export const MonthlyTrackingReport: React.FC<MonthlyTrackingReportProps> = ({
  students,
  summaries,
  settings,
  rules,
  selectedMonth,
  onSelectMonth,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [hoveredCriterion, setHoveredCriterion] = useState<number | null>(null);

  const monthsList = [9, 10, 11, 12, 1, 2, 3, 4, 5];

  const filteredSummaries = summaries.filter((s) => {
    return (
      s.student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.student.rollNumber.toString().includes(searchTerm)
    );
  });

  // Calculate statistics according to user's exact specification:
  // + Loại Tốt: Từ 90 đến 100 điểm
  // + Loại Khá: Từ 80 đến dưới 90 điểm
  // + Loại Đạt: Từ 70 đến dưới 80 điểm
  // + Loại Chưa đạt: Dưới 70 điểm
  const totalCount = summaries.length || 1;
  const countTot = summaries.filter((s) => s.totalScore >= 90).length;
  const countKha = summaries.filter((s) => s.totalScore >= 80 && s.totalScore < 90).length;
  const countDat = summaries.filter((s) => s.totalScore >= 70 && s.totalScore < 80).length;
  const countChuaDat = summaries.filter((s) => s.totalScore < 70).length;

  const handleExportExcel = () => {
    excelService.exportMonthlyTrackingToExcel(
      students,
      summaries,
      selectedMonth,
      settings.academicYear,
      rules,
      settings.className,
      settings.teacherName
    );
  };

  const handlePrint = () => {
    window.print();
  };

  // Helper to get violation points for student under criterion i (1..23)
  const getCriterionViolation = (s: StudentScoreSummary, criterionNum: number) => {
    const matched = s.incidents.filter((inc) => {
      const rule = rules.find((r) => r.id === inc.ruleId || r.name === inc.ruleName);
      if (rule && rule.criterionNumber) {
        return rule.criterionNumber === criterionNum;
      }
      return inc.ruleName.includes(`(${criterionNum})`);
    });

    if (matched.length === 0) return null;
    const totalPts = matched.reduce((sum, item) => sum + item.points, 0);
    return {
      points: totalPts,
      count: matched.length,
      details: matched.map((m) => `${m.ruleName}: ${m.points}đ`).join('\n'),
    };
  };

  // Column background colors matching template screenshot:
  const getColHeaderBg = (num: number) => {
    if (num >= 1 && num <= 9) return 'bg-[#ecf5e6] text-slate-800'; // Light greenish
    if (num === 10) return 'bg-[#fef3c7] text-slate-800'; // Light yellow
    if (num >= 11 && num <= 13) return 'bg-[#ffedd5] text-slate-800'; // Light peach
    if (num === 14) return 'bg-[#fee2e2] text-rose-900 font-bold'; // Rose/coral
    if (num >= 15 && num <= 18) return 'bg-[#ffedd5] text-slate-800'; // Light peach
    return 'bg-[#e0f2fe] text-sky-900'; // 19-23: Light blue
  };

  const getColCellBg = (num: number) => {
    if (num >= 1 && num <= 9) return 'bg-[#f8fcf4]';
    if (num === 10) return 'bg-[#fffbeb]';
    if (num >= 11 && num <= 13) return 'bg-[#fff7ed]';
    if (num === 14) return 'bg-[#fef2f2]';
    if (num >= 15 && num <= 18) return 'bg-[#fff7ed]';
    return 'bg-[#f0f9ff]';
  };

  return (
    <div className="space-y-6">
      {/* Control Card (hidden on print) */}
      <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200 print:hidden space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              <span>BẢNG THEO DÕI KẾT QUẢ RÈN LUYỆN HÀNG THÁNG</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Lớp {settings.className} • {settings.schoolName} • GVCN: Thầy {settings.teacherName}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Month selector */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              <span className="text-xs font-bold text-slate-600 px-2">Tháng:</span>
              {monthsList.map((m) => (
                <button
                  key={m}
                  onClick={() => onSelectMonth(m)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                    selectedMonth === m
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  T{m}
                </button>
              ))}
            </div>

            <button
              onClick={handleExportExcel}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
              title="Xuất bảng ma trận tháng đúng định dạng mẫu sang Excel"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Xuất Excel Mẫu Này</span>
            </button>

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
              title="In bản theo dõi tháng"
            >
              <Printer className="w-4 h-4" />
              <span>In Bản Này</span>
            </button>
          </div>
        </div>

        {/* Search & Grading Rules Banner */}
        <div className="pt-3 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative w-full md:w-72">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm học sinh trong bảng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:bg-white focus:border-blue-500"
            />
          </div>

          {/* Official Grading Criteria Legend */}
          <div className="flex flex-wrap items-center gap-2 text-[11px]">
            <span className="font-bold text-slate-700">Quy chuẩn xếp loại:</span>
            <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 border border-amber-300 font-semibold">
              Tốt: 90 - 100đ
            </span>
            <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-900 border border-blue-300 font-semibold">
              Khá: 80 - dưới 90đ
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-800 border border-slate-300 font-semibold">
              Đạt: 70 - dưới 80đ
            </span>
            <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-900 border border-rose-300 font-semibold">
              Chưa đạt: Dưới 70đ
            </span>
          </div>
        </div>

        {/* Hovered criterion tooltip information */}
        {hoveredCriterion && (
          <div className="bg-blue-50 border border-blue-200 text-blue-950 p-2.5 rounded-xl text-xs flex items-center gap-2 animate-fadeIn">
            <Info className="w-4 h-4 text-blue-600 shrink-0" />
            <span>
              <strong>Cột {hoveredCriterion}:</strong> {CRITERIA_23_TITLES[hoveredCriterion]}
            </span>
          </div>
        )}
      </div>

      {/* Printable / Display Matrix Table */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-300 overflow-hidden print:border-none print:shadow-none">
        {/* Document Header in Table */}
        <div className="p-6 border-b border-slate-200 bg-white">
          <div className="grid grid-cols-2 text-center text-xs pb-4 border-b border-slate-200 mb-4">
            <div>
              <div className="font-bold uppercase text-slate-800">SỞ GD&ĐT AN GIANG</div>
              <div className="font-bold uppercase text-blue-900">{settings.schoolName}</div>
              <div className="text-[11px] font-semibold text-slate-700 mt-0.5">
                Lớp: <strong className="text-blue-900">{settings.className}</strong> • GVCN: <strong>Thầy {settings.teacherName}</strong>
              </div>
            </div>
            <div>
              <div className="font-bold uppercase text-slate-800">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
              <div className="font-semibold underline text-slate-700">Độc lập - Tự do - Hạnh phúc</div>
              <div className="text-[11px] italic text-slate-500 mt-1">
                Năm học {settings.academicYear}
              </div>
            </div>
          </div>

          <div className="text-center">
            <h1 className="text-xl sm:text-2xl font-bold uppercase tracking-wide text-blue-900">
              BẢNG THEO DÕI KẾT QUẢ RÈN LUYỆN
            </h1>
            <div className="text-sm font-extrabold uppercase text-slate-800 mt-1">
              THÁNG {selectedMonth}
            </div>
            <div className="text-xs text-slate-500 mt-0.5">
              Lớp {settings.className} • Năm học {settings.academicYear} • GVCN: Thầy {settings.teacherName}
            </div>
          </div>
        </div>

        {/* Scrollable Container for Matrix */}
        <div className="overflow-x-auto">
          <table className="w-full text-center text-xs border-collapse border border-slate-300 select-none">
            <thead>
              <tr className="border-b border-slate-300 font-bold text-[11px]">
                <th className="border border-slate-300 px-2 py-2 w-10 bg-slate-100 text-slate-800">
                  Stt
                </th>
                <th className="border border-slate-300 px-3 py-2 min-w-[170px] text-left bg-slate-100 text-slate-800">
                  Họ tên học sinh
                </th>

                {/* Columns 1 to 23 with distinct section colors */}
                {Array.from({ length: 23 }, (_, idx) => idx + 1).map((num) => (
                  <th
                    key={num}
                    onMouseEnter={() => setHoveredCriterion(num)}
                    onMouseLeave={() => setHoveredCriterion(null)}
                    title={CRITERIA_23_TITLES[num]}
                    className={`border border-slate-300 px-1 py-1.5 w-7.5 cursor-pointer font-bold transition-colors ${getColHeaderBg(num)}`}
                  >
                    {num}
                  </th>
                ))}

                {/* Score Column */}
                <th className="border border-slate-300 px-3 py-2 w-16 bg-[#fef08a] text-slate-900 font-extrabold">
                  Điểm
                </th>

                {/* Rank Column */}
                <th className="border border-slate-300 px-3 py-2 w-20 bg-[#fed7aa] text-amber-950 font-extrabold">
                  Loại
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredSummaries.length === 0 ? (
                <tr>
                  <td
                    colSpan={27}
                    className="p-8 text-center text-slate-400 italic font-medium"
                  >
                    Chưa có học sinh trong danh sách. Vui lòng thêm học sinh hoặc nhập từ file Excel.
                  </td>
                </tr>
              ) : (
                filteredSummaries.map((s, index) => {
                  const score = s.totalScore;
                  const rank = s.rankTitle;

                  return (
                    <tr
                      key={s.student.id}
                      className="border-b border-slate-200 hover:bg-amber-50/30 transition-colors"
                    >
                      {/* Stt */}
                      <td className="border border-slate-300 px-1 py-1.5 font-semibold text-slate-600 bg-white">
                        {s.student.rollNumber || index + 1}
                      </td>

                      {/* Name */}
                      <td className="border border-slate-300 px-3 py-1.5 text-left font-bold text-slate-900 truncate max-w-[200px] bg-white">
                        {s.student.name}
                      </td>

                      {/* 23 Criteria cells */}
                      {Array.from({ length: 23 }, (_, idx) => idx + 1).map((num) => {
                        const violation = getCriterionViolation(s, num);

                        return (
                          <td
                            key={num}
                            onMouseEnter={() => setHoveredCriterion(num)}
                            onMouseLeave={() => setHoveredCriterion(null)}
                            title={
                              violation
                                ? `${CRITERIA_23_TITLES[num]}\n${violation.details}`
                                : CRITERIA_23_TITLES[num]
                            }
                            className={`border border-slate-300 px-0.5 py-1 text-[11px] font-bold ${getColCellBg(num)} ${
                              violation
                                ? 'text-rose-700 bg-rose-100 font-black'
                                : 'text-slate-300'
                            }`}
                          >
                            {violation ? (
                              <span className="inline-block px-0.5 rounded text-rose-700 font-black">
                                {violation.points}
                              </span>
                            ) : null}
                          </td>
                        );
                      })}

                      {/* Điểm (Score) Column */}
                      <td className="border border-slate-300 px-2 py-1.5 font-black text-slate-900 bg-[#fef9c3] text-sm">
                        {score}
                      </td>

                      {/* Loại (Classification) Column */}
                      <td className="border border-slate-300 px-2 py-1.5 font-extrabold bg-[#ffedd5] text-xs">
                        <span
                          className={
                            rank === 'Tốt'
                              ? 'text-amber-800'
                              : rank === 'Khá'
                              ? 'text-blue-800'
                              : rank === 'Đạt'
                              ? 'text-slate-800'
                              : 'text-rose-800 font-black'
                          }
                        >
                          {rank}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Statistics & Classification Breakdown */}
        {summaries.length > 0 && (
          <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200">
            <div className="text-xs font-bold uppercase text-slate-700 mb-2">
              Tổng kết rèn luyện Tháng {selectedMonth} (Sĩ số: {summaries.length} học sinh):
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl">
                <div className="text-amber-800 font-semibold">Loại Tốt (90 - 100đ):</div>
                <div className="text-lg font-black text-amber-900 mt-0.5">
                  {countTot} HS{' '}
                  <span className="text-xs font-normal text-amber-700">
                    ({Math.round((countTot / totalCount) * 100)}%)
                  </span>
                </div>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
                <div className="text-blue-800 font-semibold">Loại Khá (80 - dưới 90đ):</div>
                <div className="text-lg font-black text-blue-900 mt-0.5">
                  {countKha} HS{' '}
                  <span className="text-xs font-normal text-blue-700">
                    ({Math.round((countKha / totalCount) * 100)}%)
                  </span>
                </div>
              </div>

              <div className="p-3 bg-slate-100 border border-slate-300 rounded-xl">
                <div className="text-slate-800 font-semibold">Loại Đạt (70 - dưới 80đ):</div>
                <div className="text-lg font-black text-slate-900 mt-0.5">
                  {countDat} HS{' '}
                  <span className="text-xs font-normal text-slate-700">
                    ({Math.round((countDat / totalCount) * 100)}%)
                  </span>
                </div>
              </div>

              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl">
                <div className="text-rose-800 font-semibold">Loại Chưa Đạt (Dưới 70đ):</div>
                <div className="text-lg font-black text-rose-900 mt-0.5">
                  {countChuaDat} HS{' '}
                  <span className="text-xs font-normal text-rose-700">
                    ({Math.round((countChuaDat / totalCount) * 100)}%)
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Official Signatures for Monthly Report */}
        <div className="p-6 bg-white border-t border-slate-200 grid grid-cols-2 text-center text-xs">
          <div>
            <div className="font-bold uppercase tracking-wider text-slate-900">LỚP TRƯỞNG</div>
            <div className="text-[11px] italic text-slate-500">(Ký và ghi rõ họ tên)</div>
            <div className="mt-14 font-bold text-slate-800">Nguyễn Hoàng An</div>
          </div>
          <div>
            <div className="text-[11px] italic text-slate-500 mb-0.5">
              {settings.schoolName.replace(/^Trường\s+(THPT|THCS|Tiểu học|Đại học|Cao đẳng)\s+/i, '') || 'Ngày'}, ngày {new Date().getDate()} tháng {selectedMonth} năm {new Date().getFullYear()}
            </div>
            <div className="font-bold uppercase tracking-wider text-slate-900">GIÁO VIÊN CHỦ NHIỆM</div>
            <div className="text-[11px] italic text-slate-500">(Ký và ghi rõ họ tên)</div>
            <div className="mt-14 font-bold text-blue-950 text-sm">Thầy {settings.teacherName}</div>
          </div>
        </div>
      </div>

      {/* Legend of 23 Criteria below for easy teacher reference (hidden on print) */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs print:hidden space-y-3">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
          <Info className="w-4 h-4 text-blue-600" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
            CHÚ THÍCH CÁC CỘT NỘI DUNG RÈN LUYỆN (1 ĐẾN 23) THEO QUY CHẾ
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-[11px] text-slate-600">
          {Object.entries(CRITERIA_23_TITLES).map(([num, title]) => (
            <div
              key={num}
              className="p-1.5 rounded-lg bg-slate-50 border border-slate-100 hover:border-blue-200 transition-colors"
            >
              <strong className="text-blue-900">Cột {num}:</strong> {title}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

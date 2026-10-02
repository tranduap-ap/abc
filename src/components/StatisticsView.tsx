import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Trophy,
  Medal,
  Award,
  AlertTriangle,
  TrendingUp,
  Users,
  Search,
  MessageSquare,
  Sparkles,
  ArrowUpDown,
  CheckCircle,
  FileSpreadsheet,
  LayoutGrid,
  Edit2,
} from 'lucide-react';
import {
  Student,
  StudentScoreSummary,
  GroupScoreSummary,
  TeacherSettings,
  IncidentRecord,
  Rule,
} from '../types';
import { MonthlyTrackingReport } from './MonthlyTrackingReport';

interface StatisticsViewProps {
  students: Student[];
  rules: Rule[];
  summaries: StudentScoreSummary[];
  groupSummaries: GroupScoreSummary[];
  settings: TeacherSettings;
  incidents: IncidentRecord[];
  filterType: 'week' | 'month';
  onSelectMonth: (month: number) => void;
  onSelectStudentForZalo: (studentId: string) => void;
  onOpenPrint: () => void;
  onOpenEditStudent?: (student: Student) => void;
  onExportExcel?: () => void;
}

export const StatisticsView: React.FC<StatisticsViewProps> = ({
  students,
  rules,
  summaries,
  groupSummaries,
  settings,
  incidents,
  filterType,
  onSelectMonth,
  onSelectStudentForZalo,
  onOpenPrint,
  onOpenEditStudent,
  onExportExcel,
}) => {
  const [tableSearch, setTableSearch] = useState('');
  const [selectedGroupFilter, setSelectedGroupFilter] = useState<number | 'all'>('all');
  const [sortField, setSortField] = useState<'totalScore' | 'rollNumber' | 'name'>('totalScore');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [monthlyViewMode, setMonthlyViewMode] = useState<'matrix' | 'overview'>('matrix');

  // Trigger celebration confetti for leading group
  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  // Top 5 students
  const topStudents = [...summaries]
    .sort((a, b) => b.totalScore - a.totalScore)
    .slice(0, 5);

  // Warning students (score < 80)
  const warningStudents = summaries.filter(
    (s) => s.totalScore < 80 || s.violationCount >= 2
  );

  // Group sorted by rank
  const sortedGroups = [...groupSummaries].sort((a, b) => a.rank - b.rank);
  const leadingGroup = sortedGroups[0];

  // Violation breakdown calculation
  const periodIncidents = incidents.filter((i) =>
    filterType === 'week' ? i.week === settings.currentWeek : i.month === settings.currentMonth
  );

  const violationStatsMap = new Map<string, number>();
  periodIncidents
    .filter((i) => i.category === 'violation')
    .forEach((v) => {
      violationStatsMap.set(v.ruleName, (violationStatsMap.get(v.ruleName) || 0) + 1);
    });

  const sortedViolationStats = Array.from(violationStatsMap.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Official Rank distribution requested:
  // + Loại Tốt: Từ 90 đến 100 điểm
  // + Loại Khá: Từ 80 đến dưới 90 điểm
  // + Loại Đạt: Từ 70 đến dưới 80 điểm
  // + Loại Chưa đạt: Dưới 70 điểm
  const totalStudents = summaries.length || 1;
  const countTot = summaries.filter((s) => s.totalScore >= 90).length;
  const countKha = summaries.filter((s) => s.totalScore >= 80 && s.totalScore < 90).length;
  const countDat = summaries.filter((s) => s.totalScore >= 70 && s.totalScore < 80).length;
  const countChuaDat = summaries.filter((s) => s.totalScore < 70).length;

  // Filtered & sorted summaries for table
  const displayedSummaries = summaries
    .filter((s) => {
      const matchGroup =
        selectedGroupFilter === 'all' || s.student.group === selectedGroupFilter;
      const matchSearch =
        s.student.name.toLowerCase().includes(tableSearch.toLowerCase()) ||
        s.student.rollNumber.toString().includes(tableSearch);
      return matchGroup && matchSearch;
    })
    .sort((a, b) => {
      if (sortField === 'totalScore') {
        return sortDirection === 'desc'
          ? b.totalScore - a.totalScore
          : a.totalScore - b.totalScore;
      }
      if (sortField === 'rollNumber') {
        return sortDirection === 'desc'
          ? b.student.rollNumber - a.student.rollNumber
          : a.student.rollNumber - b.student.rollNumber;
      }
      return sortDirection === 'desc'
        ? b.student.name.localeCompare(a.student.name)
        : a.student.name.localeCompare(b.student.name);
    });

  const toggleSort = (field: 'totalScore' | 'rollNumber' | 'name') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  return (
    <div className="space-y-6">
      {/* Sub-view toggle when viewing by Month */}
      {filterType === 'month' && (
        <div className="flex items-center justify-between bg-white p-2.5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700 px-2">Giao diện thống kê tháng:</span>
            <button
              onClick={() => setMonthlyViewMode('matrix')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                monthlyViewMode === 'matrix'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Bảng Theo Dõi Tháng (Mẫu 23 Cột Chuẩn)</span>
            </button>
            <button
              onClick={() => setMonthlyViewMode('overview')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                monthlyViewMode === 'overview'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              <span>Tổng Hợp Thi Đua 4 Tổ</span>
            </button>
          </div>

          <div className="text-xs text-slate-500 font-medium hidden sm:block pr-2">
            Tháng {settings.currentMonth} • Lớp {settings.className}
          </div>
        </div>
      )}

      {/* Render Official Monthly 23-column Matrix when filterType is month and mode is matrix */}
      {filterType === 'month' && monthlyViewMode === 'matrix' ? (
        <MonthlyTrackingReport
          students={students}
          summaries={summaries}
          settings={settings}
          rules={rules}
          selectedMonth={settings.currentMonth}
          onSelectMonth={onSelectMonth}
        />
      ) : (
        <>
          {/* Top Banner: Group Competition Podium */}
          <div className="bg-gradient-to-br from-indigo-900 via-blue-900 to-slate-900 rounded-2xl p-5 text-white shadow-lg border border-blue-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <div>
                <div className="flex items-center gap-2">
                  <Trophy className="w-6 h-6 text-amber-300" />
                  <h2 className="text-lg sm:text-xl font-bold tracking-tight">
                    Bảng Xếp Hạng Thi Đua 4 Tổ — Lớp 10A7
                  </h2>
                </div>
                <p className="text-xs text-blue-200 mt-1">
                  Thống kê {filterType === 'week' ? `Tuần ${settings.currentWeek}` : `Tháng ${settings.currentMonth}`} • Điểm trung bình nề nếp tính trên 100 điểm chuẩn
                </p>
              </div>

              <button
                onClick={triggerConfetti}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-slate-900 text-xs font-bold rounded-xl shadow-md transition-all self-start sm:self-auto cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-slate-900" />
                <span>Vinh Danh Tổ Dẫn Đầu (Tổ {leadingGroup?.group || 1})</span>
              </button>
            </div>

            {/* 4 Groups Podium Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {sortedGroups.map((grp) => {
                const isFirst = grp.rank === 1;
                const isSecond = grp.rank === 2;
                const isThird = grp.rank === 3;

                let badgeBg = 'bg-slate-700/60 text-slate-300 border-slate-600';
                let medalColor = 'text-slate-400';
                if (isFirst) {
                  badgeBg = 'bg-amber-400/20 text-amber-300 border-amber-400/40 ring-2 ring-amber-400/30';
                  medalColor = 'text-amber-400';
                } else if (isSecond) {
                  badgeBg = 'bg-slate-300/20 text-slate-200 border-slate-300/40';
                  medalColor = 'text-slate-300';
                } else if (isThird) {
                  badgeBg = 'bg-amber-700/20 text-amber-400 border-amber-700/40';
                  medalColor = 'text-amber-600';
                }

                return (
                  <div
                    key={grp.group}
                    className={`rounded-xl p-4 border backdrop-blur-sm transition-all flex flex-col justify-between ${
                      isFirst
                        ? 'bg-blue-800/60 border-amber-400/50 shadow-xl'
                        : 'bg-blue-950/40 border-blue-800/60'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-blue-200">
                          TỔ {grp.group} ({grp.studentCount} HS)
                        </span>
                        <div className={`px-2 py-0.5 rounded-full border text-[11px] font-bold flex items-center gap-1 ${badgeBg}`}>
                          <Medal className={`w-3 h-3 ${medalColor}`} />
                          <span>Hạng {grp.rank}</span>
                        </div>
                      </div>

                      <div className="mt-3 flex items-baseline gap-1">
                        <span className="text-3xl font-black text-white">
                          {grp.averageScore}
                        </span>
                        <span className="text-xs text-blue-300">điểm TB</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-blue-800/60 text-[11px]">
                      <div>
                        <span className="text-blue-300">Khen thưởng:</span>
                        <div className="font-bold text-emerald-400">+{grp.totalRewards} lượt</div>
                      </div>
                      <div>
                        <span className="text-blue-300">Vi phạm:</span>
                        <div className="font-bold text-rose-400">{grp.totalViolations} lượt</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Row 2: Top Students, Warnings & Violations analytics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Top 5 Honors */}
            <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-amber-500" />
                    <h3 className="text-sm font-bold text-slate-800">
                      Gương Sáng Nề Nếp 10A7
                    </h3>
                  </div>
                  <span className="text-[10px] uppercase font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                    Top 5
                  </span>
                </div>

                <div className="space-y-2.5">
                  {topStudents.map((s, idx) => (
                    <div
                      key={s.student.id}
                      className="flex items-center justify-between p-2 rounded-xl bg-slate-50 hover:bg-blue-50/60 transition-colors text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                            idx === 0
                              ? 'bg-amber-400 text-slate-900 ring-2 ring-amber-300'
                              : idx === 1
                              ? 'bg-slate-300 text-slate-800'
                              : idx === 2
                              ? 'bg-amber-700 text-white'
                              : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {idx + 1}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{s.student.name}</div>
                          <div className="text-[10px] text-slate-500">
                            Tổ {s.student.group} • {s.student.role}
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-extrabold text-blue-900">{s.totalScore}đ</div>
                        <span className="text-[10px] text-emerald-600 font-semibold">
                          +{s.rewardPoints}đ khen
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Warning / Focus Students with 1-click Zalo */}
            <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-rose-500" />
                    <h3 className="text-sm font-bold text-slate-800">
                      Cần Phối Hợp Gia Đình
                    </h3>
                  </div>
                  <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
                    {warningStudents.length} HS
                  </span>
                </div>

                {warningStudents.length === 0 ? (
                  <div className="text-center py-8 text-emerald-600 text-xs font-medium">
                    <CheckCircle className="w-8 h-8 mx-auto mb-2 text-emerald-500" />
                    Tuyệt vời! Không có học sinh nào bị điểm nề nếp dưới mức quy định.
                  </div>
                ) : (
                  <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                    {warningStudents.map((s) => (
                      <div
                        key={s.student.id}
                        className="p-2.5 rounded-xl border border-rose-200 bg-rose-50/40 text-xs flex items-center justify-between gap-2"
                      >
                        <div>
                          <div className="font-bold text-slate-900 flex items-center gap-1.5">
                            <span>{s.student.name}</span>
                            <span className="text-[10px] font-semibold text-rose-700 bg-rose-100 px-1 rounded">
                              {s.totalScore}đ
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-600 mt-0.5">
                            Tổ {s.student.group} • {s.violationCount} lỗi vi phạm
                          </div>
                        </div>

                        <button
                          onClick={() => onSelectStudentForZalo(s.student.id)}
                          className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-all shrink-0"
                          title="Gửi tin nhắn Zalo cảnh báo cho phụ huynh"
                        >
                          <MessageSquare className="w-3 h-3" />
                          <span>Nhắn PH</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Violations Breakdown */}
            <div className="bg-white p-5 rounded-2xl shadow-xs border border-slate-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-indigo-600" />
                    <h3 className="text-sm font-bold text-slate-800">
                      Lỗi Vi Phạm Phổ Biến
                    </h3>
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium">Thống kê</span>
                </div>

                {sortedViolationStats.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-xs">
                    Chưa ghi nhận vi phạm trong khoảng thời gian này.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {sortedViolationStats.map(([ruleName, count]) => {
                      const maxCount = sortedViolationStats[0][1] || 1;
                      const percent = Math.round((count / maxCount) * 100);
                      return (
                        <div key={ruleName} className="text-xs">
                          <div className="flex justify-between font-medium text-slate-700 mb-1">
                            <span className="truncate pr-2">{ruleName}</span>
                            <span className="font-bold text-rose-600 shrink-0">{count} lượt</span>
                          </div>
                          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div
                              className="bg-rose-500 h-full rounded-full transition-all"
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Classification breakdown bar (Tốt, Khá, Đạt, Chưa đạt) */}
              <div className="mt-4 pt-3 border-t border-slate-100 text-[11px]">
                <div className="flex justify-between text-slate-600 mb-1 font-semibold">
                  <span>Phân loại ({summaries.length} HS):</span>
                  <span className="text-amber-800 font-bold">
                    {countTot} Tốt ({Math.round((countTot / totalStudents) * 100)}%)
                  </span>
                </div>
                <div className="w-full h-2.5 rounded-full overflow-hidden flex bg-slate-100">
                  <div
                    style={{ width: `${(countTot / totalStudents) * 100}%` }}
                    className="bg-amber-400"
                    title={`Loại Tốt (90-100đ): ${countTot}`}
                  />
                  <div
                    style={{ width: `${(countKha / totalStudents) * 100}%` }}
                    className="bg-blue-500"
                    title={`Loại Khá (80-dưới 90đ): ${countKha}`}
                  />
                  <div
                    style={{ width: `${(countDat / totalStudents) * 100}%` }}
                    className="bg-slate-400"
                    title={`Loại Đạt (70-dưới 80đ): ${countDat}`}
                  />
                  <div
                    style={{ width: `${(countChuaDat / totalStudents) * 100}%` }}
                    className="bg-rose-500"
                    title={`Loại Chưa đạt (<70đ): ${countChuaDat}`}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                  <span>Tốt: {countTot}</span>
                  <span>Khá: {countKha}</span>
                  <span>Đạt: {countDat}</span>
                  <span>Chưa đạt: {countChuaDat}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Full Class Disciplinary Summary Table */}
          <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
            {/* Table header & filters */}
            <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Bảng Tổng Kết Điểm Thi Đua Từng Học Sinh — Lớp 10A7
                </h3>
                <p className="text-xs text-slate-500">
                  GVCN: Thầy {settings.teacherName} • Thang điểm chuẩn: 100đ • Xếp loại: Tốt (90-100đ), Khá (80-89đ), Đạt (70-79đ), Chưa đạt (&lt;70đ)
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm học sinh..."
                    value={tableSearch}
                    onChange={(e) => setTableSearch(e.target.value)}
                    className="pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg outline-none focus:border-blue-500"
                  />
                </div>

                <div className="flex gap-1">
                  <button
                    onClick={() => setSelectedGroupFilter('all')}
                    className={`px-2.5 py-1.5 text-xs rounded-md border font-medium ${
                      selectedGroupFilter === 'all'
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Tất cả
                  </button>
                  {[1, 2, 3, 4].map((g) => (
                    <button
                      key={g}
                      onClick={() => setSelectedGroupFilter(g)}
                      className={`px-2.5 py-1.5 text-xs rounded-md border font-medium ${
                        selectedGroupFilter === g
                          ? 'bg-blue-600 border-blue-600 text-white'
                          : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      Tổ {g}
                    </button>
                  ))}
                </div>

                {onExportExcel && (
                  <button
                    onClick={onExportExcel}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-all shadow-xs cursor-pointer"
                    title="Xuất bảng tổng hợp nề nếp, nhật ký vi phạm và xếp hạng 4 tổ sang file Excel (.xlsx)"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5" />
                    <span>Xuất Excel Nề Nếp</span>
                  </button>
                )}

                <button
                  onClick={onOpenPrint}
                  className="px-3 py-1.5 text-xs font-semibold bg-slate-800 text-white hover:bg-slate-900 rounded-lg transition-colors"
                >
                  In Phiếu Tổng Hợp
                </button>
              </div>
            </div>

            {/* Responsive Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-100 text-slate-700 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th
                      onClick={() => toggleSort('rollNumber')}
                      className="px-4 py-3 cursor-pointer hover:bg-slate-200/80 transition-colors"
                    >
                      <div className="flex items-center gap-1">
                        <span>STT</span>
                        <ArrowUpDown className="w-3 h-3 text-slate-400" />
                      </div>
                    </th>
                    <th
                      onClick={() => toggleSort('name')}
                      className="px-4 py-3 cursor-pointer hover:bg-slate-200/80 transition-colors"
                    >
                      <div className="flex items-center gap-1">
                        <span>Họ Và Tên Học Sinh</span>
                        <ArrowUpDown className="w-3 h-3 text-slate-400" />
                      </div>
                    </th>
                    <th className="px-3 py-3">Tổ</th>
                    <th className="px-3 py-3">Chức vụ</th>
                    <th className="px-3 py-3 text-center">Điểm Gốc</th>
                    <th className="px-3 py-3 text-center text-emerald-600">Điểm Cộng (+)</th>
                    <th className="px-3 py-3 text-center text-emerald-700">Lượt Cộng</th>
                    <th className="px-3 py-3 text-center text-rose-600">Điểm Trừ (-)</th>
                    <th className="px-3 py-3 text-center text-rose-700">Lượt Trừ</th>
                    <th
                      onClick={() => toggleSort('totalScore')}
                      className="px-4 py-3 cursor-pointer hover:bg-slate-200/80 transition-colors text-right"
                    >
                      <div className="flex items-center justify-end gap-1">
                        <span>Tổng Điểm</span>
                        <ArrowUpDown className="w-3 h-3 text-slate-400" />
                      </div>
                    </th>
                    <th className="px-3 py-3 text-center">Xếp Loại</th>
                    <th className="px-4 py-3 text-right">Gửi Thông Báo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {displayedSummaries.length === 0 ? (
                    <tr>
                      <td colSpan={12} className="px-4 py-8 text-center text-slate-400">
                        Chưa có học sinh trong danh sách. Vui lòng thêm học sinh hoặc nhập từ file Excel.
                      </td>
                    </tr>
                  ) : (
                    displayedSummaries.map(({ student, baseScore, rewardPoints, violationPoints, rewardCount, violationCount, totalScore, rankTitle }) => {
                      const rankBadge =
                        rankTitle === 'Tốt'
                          ? 'bg-amber-100 text-amber-900 border-amber-300'
                          : rankTitle === 'Khá'
                          ? 'bg-blue-100 text-blue-900 border-blue-300'
                          : rankTitle === 'Đạt'
                          ? 'bg-slate-100 text-slate-800 border-slate-300'
                          : 'bg-rose-100 text-rose-800 border-rose-300';

                      return (
                        <tr key={student.id} className="hover:bg-blue-50/40 transition-colors">
                          <td className="px-4 py-3 font-semibold text-slate-500">
                            #{student.rollNumber}
                          </td>
                          <td className="px-4 py-3 font-bold text-slate-900">
                            <div>{student.name}</div>
                            <div className="text-[10px] text-slate-400 font-normal">
                              SĐT PH: {student.parentPhone}
                            </div>
                          </td>
                          <td className="px-3 py-3 font-medium">Tổ {student.group}</td>
                          <td className="px-3 py-3">
                            <span className="text-[10px] px-1.5 py-0.5 rounded font-medium bg-slate-100 text-slate-700">
                              {student.role}
                            </span>
                          </td>
                          <td className="px-3 py-3 text-center text-slate-400 font-medium">
                            {baseScore}
                          </td>
                          <td className="px-3 py-3 text-center font-bold text-emerald-600">
                            {rewardPoints > 0 ? `+${rewardPoints}` : '0'}
                          </td>
                          <td className="px-3 py-3 text-center font-semibold text-emerald-800 bg-emerald-50/30">
                            {rewardCount} lượt
                          </td>
                          <td className="px-3 py-3 text-center font-bold text-rose-600">
                            {violationPoints > 0 ? `-${violationPoints}` : '0'}
                          </td>
                          <td className="px-3 py-3 text-center font-semibold text-rose-800 bg-rose-50/30">
                            {violationCount} lượt
                          </td>
                          <td className="px-4 py-3 text-right font-black text-slate-900 text-sm">
                            {totalScore}
                          </td>
                          <td className="px-3 py-3 text-center">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${rankBadge}`}>
                              {rankTitle}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {onOpenEditStudent && (
                                <button
                                  onClick={() => onOpenEditStudent(student)}
                                  className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-300 rounded-lg transition-colors cursor-pointer"
                                  title="Chỉnh sửa thông tin học sinh này"
                                >
                                  <Edit2 className="w-3 h-3 text-amber-700" />
                                  <span>Sửa TT</span>
                                </button>
                              )}
                              <button
                                onClick={() => onSelectStudentForZalo(student.id)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors cursor-pointer"
                              >
                                <MessageSquare className="w-3 h-3 text-blue-600" />
                                <span>Gửi Zalo</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};


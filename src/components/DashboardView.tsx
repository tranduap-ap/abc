import React, { useState, useMemo } from 'react';
import {
  Users,
  AlertTriangle,
  Trophy,
  TrendingUp,
  Award,
  Sparkles,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  ChevronRight,
  UserCheck,
  Activity,
  BarChart2,
  PieChart as PieIcon,
  Layers,
  MessageCircle,
  FileSpreadsheet,
  Printer,
  Flame,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  Student,
  IncidentRecord,
  StudentScoreSummary,
  GroupScoreSummary,
  SchoolCompetitionRecord,
  TeacherSettings,
  Rule,
  AppUserRole,
} from '../types';
import { TabType } from './Navigation';
import { permissionService } from '../services/permissionService';

interface DashboardViewProps {
  students: Student[];
  incidents: IncidentRecord[];
  summaries: StudentScoreSummary[];
  groupSummaries: GroupScoreSummary[];
  competitions: SchoolCompetitionRecord[];
  settings: TeacherSettings;
  rules: Rule[];
  activeRole: AppUserRole | null;
  onNavigateTab: (tab: TabType) => void;
  onOpenQuickRecord: (studentId?: string) => void;
  onOpenSelectStudentForZalo: (studentId: string) => void;
  onOpenPrint?: () => void;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];
const GROUP_COLORS = ['#3b82f6', '#10b981', '#06b6d4', '#f59e0b'];

export const DashboardView: React.FC<DashboardViewProps> = ({
  students,
  incidents,
  summaries,
  groupSummaries,
  competitions,
  settings,
  rules,
  activeRole,
  onNavigateTab,
  onOpenQuickRecord,
  onOpenSelectStudentForZalo,
  onOpenPrint,
}) => {
  const [trendViewMode, setTrendViewMode] = useState<'days' | 'weeks'>('days');

  // 1. Sĩ số lớp metrics
  const totalStudents = students.length;
  const maleCount = students.filter((s) => s.gender === 'Nam').length;
  const femaleCount = students.filter((s) => s.gender === 'Nữ').length;

  // 2. Vi phạm hôm nay
  const todayStr = useMemo(() => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }, []);

  const todayIncidents = useMemo(() => {
    return incidents.filter((i) => i.date === todayStr);
  }, [incidents, todayStr]);

  const todayViolations = useMemo(() => {
    return todayIncidents.filter((i) => i.category === 'violation');
  }, [todayIncidents]);

  const todayRewards = useMemo(() => {
    return todayIncidents.filter((i) => i.category === 'reward');
  }, [todayIncidents]);

  const violatedStudentsToday = useMemo(() => {
    const map = new Map<string, { student: Student; count: number; points: number; details: string[] }>();
    todayViolations.forEach((v) => {
      const st = students.find((s) => s.id === v.studentId) || {
        id: v.studentId,
        name: v.studentName,
        rollNumber: 0,
        gender: 'Nam',
        group: v.group,
        role: 'Học sinh',
        parentName: '',
        parentPhone: '',
      };
      const existing = map.get(v.studentId) || { student: st as Student, count: 0, points: 0, details: [] };
      existing.count += v.quantity || 1;
      existing.points += v.points * (v.quantity || 1);
      existing.details.push(v.ruleName);
      map.set(v.studentId, existing);
    });
    return Array.from(map.values());
  }, [todayViolations, students]);

  const countViolatedStudentsToday = violatedStudentsToday.length;

  // 3. Tổng điểm thi đua toàn lớp & Thứ hạng trường
  const avgClassDisciplineScore = useMemo(() => {
    if (totalStudents === 0) return settings.baseScore;
    const total = summaries.reduce((acc, s) => acc + s.totalScore, 0);
    return Math.round((total / totalStudents) * 10) / 10;
  }, [summaries, totalStudents, settings.baseScore]);

  const currentCompetition = useMemo(() => {
    return competitions.find((c) => c.week === settings.currentWeek) || competitions[0];
  }, [competitions, settings.currentWeek]);

  const totalRewardsCount = summaries.reduce((acc, s) => acc + s.rewardCount, 0);
  const totalViolationsCount = summaries.reduce((acc, s) => acc + s.violationCount, 0);

  // 4. Recharts: Biểu đồ xu hướng nề nếp trong tuần (Thứ 2 - Thứ 7)
  const currentWeekIncidents = useMemo(() => {
    return incidents.filter((i) => i.week === settings.currentWeek);
  }, [incidents, settings.currentWeek]);

  const dailyTrendData = useMemo(() => {
    const daysConfig = [
      { dayIndex: 1, label: 'Thứ 2', short: 'T2' },
      { dayIndex: 2, label: 'Thứ 3', short: 'T3' },
      { dayIndex: 3, label: 'Thứ 4', short: 'T4' },
      { dayIndex: 4, label: 'Thứ 5', short: 'T5' },
      { dayIndex: 5, label: 'Thứ 6', short: 'T6' },
      { dayIndex: 6, label: 'Thứ 7', short: 'T7' },
    ];

    return daysConfig.map((day) => {
      // Filter incidents for this day of week if date exists
      const dayMatches = currentWeekIncidents.filter((inc) => {
        if (!inc.date) return false;
        const d = new Date(inc.date + 'T00:00:00');
        return d.getDay() === day.dayIndex;
      });

      const violations = dayMatches
        .filter((i) => i.category === 'violation')
        .reduce((sum, i) => sum + (i.quantity || 1), 0);

      const rewards = dayMatches
        .filter((i) => i.category === 'reward')
        .reduce((sum, i) => sum + (i.quantity || 1), 0);

      const deductedPoints = Math.abs(
        dayMatches
          .filter((i) => i.category === 'violation')
          .reduce((sum, i) => sum + i.points * (i.quantity || 1), 0)
      );

      const plusPoints = dayMatches
        .filter((i) => i.category === 'reward')
        .reduce((sum, i) => sum + i.points * (i.quantity || 1), 0);

      // Estimated day discipline index
      const scoreIndex = Math.max(80, Math.min(105, 100 - deductedPoints + plusPoints));

      return {
        name: day.label,
        short: day.short,
        'Lượt vi phạm': violations,
        'Lượt khen thưởng': rewards,
        'Điểm trừ (-)': deductedPoints,
        'Điểm cộng (+)': plusPoints,
        'Chỉ số nề nếp': scoreIndex,
      };
    });
  }, [currentWeekIncidents]);

  // Recharts: Multi-week trend data
  const multiWeekTrendData = useMemo(() => {
    const weeks = Array.from({ length: Math.min(10, Math.max(4, settings.currentWeek)) }, (_, i) => i + 1);
    return weeks.map((w) => {
      const comp = competitions.find((c) => c.week === w);
      const wIncidents = incidents.filter((i) => i.week === w);
      const violations = wIncidents
        .filter((i) => i.category === 'violation')
        .reduce((acc, i) => acc + (i.quantity || 1), 0);
      const rewards = wIncidents
        .filter((i) => i.category === 'reward')
        .reduce((acc, i) => acc + (i.quantity || 1), 0);

      return {
        name: `Tuần ${w}`,
        week: w,
        'Tổng điểm thi đua': comp ? comp.totalScore : 110 - violations * 0.5 + rewards * 0.5,
        'Hạng trường': comp ? comp.schoolRank : 1,
        'Lượt vi phạm': violations,
        'Lượt khen thưởng': rewards,
      };
    });
  }, [competitions, incidents, settings.currentWeek]);

  // Recharts: 4 Groups comparison
  const groupChartData = useMemo(() => {
    return groupSummaries.map((g) => ({
      name: `Tổ ${g.group}`,
      'Điểm TB Tổ': g.averageScore,
      'Số học sinh': g.studentCount,
      'Lượt vi phạm': g.totalViolations,
      'Lượt khen': g.totalRewards,
      rank: g.rank,
    }));
  }, [groupSummaries]);

  // Top domain breakdown (Học tập, Vệ sinh, Trật tự, Khác)
  const domainBreakdown = useMemo(() => {
    const counts: Record<string, number> = {
      'Học tập': 0,
      'Trật tự & Nề nếp': 0,
      'Vệ sinh & Lao động': 0,
      'Khác': 0,
    };

    currentWeekIncidents
      .filter((i) => i.category === 'violation')
      .forEach((inc) => {
        const foundRule = rules.find((r) => r.id === inc.ruleId);
        const domain = foundRule ? permissionService.getRuleDomain(foundRule) : 'khac';
        if (domain === 'hoc_tap') counts['Học tập'] += inc.quantity || 1;
        else if (domain === 'trat_tu') counts['Trật tự & Nề nếp'] += inc.quantity || 1;
        else if (domain === 've_sinh') counts['Vệ sinh & Lao động'] += inc.quantity || 1;
        else counts['Khác'] += inc.quantity || 1;
      });

    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [currentWeekIncidents, rules]);

  // Best student & Needs attention
  const topStudents = useMemo(() => {
    return [...summaries].sort((a, b) => b.totalScore - a.totalScore).slice(0, 3);
  }, [summaries]);

  const flaggedStudents = useMemo(() => {
    return [...summaries]
      .filter((s) => s.violationCount > 0)
      .sort((a, b) => b.violationCount - a.violationCount)
      .slice(0, 3);
  }, [summaries]);

  return (
    <div className="space-y-6">
      {/* Welcome & Quick Action Hero Bar */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-5 sm:p-6 rounded-3xl shadow-xl border border-blue-800/80 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-blue-500/10 via-transparent to-transparent pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="bg-amber-400 text-slate-950 px-2.5 py-0.5 rounded-md text-[11px] font-black uppercase tracking-wider">
                Bảng Điều Khiển Trung Tâm
              </span>
              <span className="text-xs text-blue-200">
                Lớp {settings.className} • Năm học {settings.academicYear} • {settings.schoolName}
              </span>
              <span className="bg-blue-800/60 text-blue-200 px-2 py-0.5 rounded text-[11px] font-medium border border-blue-700/60">
                Tuần {settings.currentWeek} (Tháng {settings.currentMonth})
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <span>Tổng Quan Nề Nếp & Thi Đua Lớp {settings.className}</span>
              <Sparkles className="w-5 h-5 text-amber-300" />
            </h2>
            <p className="text-xs sm:text-sm text-blue-200 mt-1 max-w-2xl leading-relaxed">
              Theo dõi thời gian thực số liệu nề nếp, vi phạm hôm nay, điểm thi đua toàn trường và biểu đồ xu hướng tuần của 4 Tổ.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => onOpenQuickRecord()}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-950/20 active:scale-95 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-emerald-100" />
              <span>Ghi Điểm Nhanh</span>
            </button>

            <button
              onClick={() => onNavigateTab('competition')}
              className="flex items-center gap-1.5 px-3.5 py-2.5 bg-blue-800/80 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl border border-blue-600/60 transition-all cursor-pointer"
            >
              <Trophy className="w-4 h-4 text-amber-300" />
              <span>Sổ Thi Đua Trường</span>
            </button>

            {onOpenPrint && (
              <button
                onClick={onOpenPrint}
                className="flex items-center gap-1.5 px-3.5 py-2.5 bg-blue-800/50 hover:bg-blue-700 text-blue-100 hover:text-white font-semibold text-xs rounded-xl border border-blue-700/50 transition-all cursor-pointer"
                title="In báo cáo A4 tuần này"
              >
                <Printer className="w-4 h-4" />
                <span className="hidden sm:inline">In Báo Cáo</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 4 Core KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Sĩ số lớp */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-full -mr-8 -mt-8 group-hover:scale-110 transition-transform pointer-events-none" />
          <div className="flex items-center justify-between relative z-10">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Sĩ Số Lớp Học
              </span>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
                {totalStudents} <span className="text-xs font-bold text-blue-600">học sinh</span>
              </div>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
              <Users className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 relative z-10">
            <span className="flex items-center gap-1.5">
              <span>Nam: <strong>{maleCount}</strong></span>
              <span className="text-slate-300">•</span>
              <span>Nữ: <strong>{femaleCount}</strong></span>
            </span>
            <button
              onClick={() => onNavigateTab('roster')}
              className="text-blue-600 hover:text-blue-800 font-bold flex items-center gap-0.5 cursor-pointer"
            >
              <span>Xem DS</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Card 2: Vi phạm hôm nay */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all relative overflow-hidden group">
          <div className={`absolute top-0 right-0 w-24 h-24 rounded-full -mr-8 -mt-8 group-hover:scale-110 transition-transform pointer-events-none ${
            countViolatedStudentsToday > 0 ? 'bg-rose-50' : 'bg-emerald-50'
          }`} />
          <div className="flex items-center justify-between relative z-10">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Vi Phạm Hôm Nay
              </span>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-1 flex items-baseline gap-2">
                <span className={countViolatedStudentsToday > 0 ? 'text-rose-600' : 'text-emerald-600'}>
                  {countViolatedStudentsToday}
                </span>
                <span className="text-xs font-bold text-slate-500">học sinh vi phạm</span>
              </div>
            </div>
            <div className={`p-3 rounded-xl border ${
              countViolatedStudentsToday > 0
                ? 'bg-rose-50 text-rose-600 border-rose-100'
                : 'bg-emerald-50 text-emerald-600 border-emerald-100'
            }`}>
              <AlertTriangle className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs relative z-10">
            <span className="text-slate-500">
              Tổng số lượt: <strong>{todayViolations.reduce((acc, v) => acc + (v.quantity || 1), 0)} lượt</strong>
            </span>
            <span className={`font-bold px-2 py-0.5 rounded text-[11px] ${
              countViolatedStudentsToday === 0
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-rose-100 text-rose-800'
            }`}>
              {countViolatedStudentsToday === 0 ? '✓ Đạt chuẩn' : 'Cần nhắc nhở'}
            </span>
          </div>
        </div>

        {/* Card 3: Điểm nề nếp trung bình lớp */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-50 rounded-full -mr-8 -mt-8 group-hover:scale-110 transition-transform pointer-events-none" />
          <div className="flex items-center justify-between relative z-10">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                ĐTB Nề Nếp Lớp
              </span>
              <div className="text-2xl sm:text-3xl font-black text-amber-600 mt-1">
                {avgClassDisciplineScore} <span className="text-xs font-bold text-slate-500">/ 100đ</span>
              </div>
            </div>
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl border border-amber-100">
              <Award className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 relative z-10">
            <span className="flex items-center gap-1">
              <span className="text-emerald-600 font-bold">+{totalRewardsCount} khen</span>
              <span className="text-slate-300">•</span>
              <span className="text-rose-600 font-bold">-{totalViolationsCount} lỗi</span>
            </span>
            <button
              onClick={() => onNavigateTab('stats')}
              className="text-amber-700 hover:text-amber-900 font-bold flex items-center gap-0.5 cursor-pointer"
            >
              <span>Chi tiết</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Card 4: Tổng điểm thi đua toàn trường */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-full -mr-8 -mt-8 group-hover:scale-110 transition-transform pointer-events-none" />
          <div className="flex items-center justify-between relative z-10">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Thi Đua Toàn Trường
              </span>
              <div className="text-2xl sm:text-3xl font-black text-indigo-700 mt-1 flex items-baseline gap-2">
                <span>{currentCompetition ? currentCompetition.totalScore : 100}đ</span>
                {currentCompetition?.schoolRank && (
                  <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-200">
                    Hạng {currentCompetition.schoolRank}
                  </span>
                )}
              </div>
            </div>
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100">
              <Trophy className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs relative z-10">
            <span className="text-slate-600 font-medium">
              Xếp loại: <strong className="text-indigo-700">{currentCompetition?.rating || 'Tốt'}</strong>
            </span>
            <button
              onClick={() => onNavigateTab('competition')}
              className="text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-0.5 cursor-pointer"
            >
              <span>Xem Sổ</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Row: Recharts Trend Chart & Today's Violations Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recharts Conduct Trend Chart */}
        <div className="lg:col-span-2 bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <span>Biểu Đồ Xu Hướng Nề Nếp & Thi Đua</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {trendViewMode === 'days'
                  ? `Biểu đồ diễn biến vi phạm và khen thưởng trong tuần ${settings.currentWeek} (Thứ 2 đến Thứ 7)`
                  : `Xu hướng tổng điểm thi đua toàn trường qua các tuần gần nhất`}
              </p>
            </div>

            {/* Toggle chart mode */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 self-start sm:self-auto text-xs">
              <button
                type="button"
                onClick={() => setTrendViewMode('days')}
                className={`px-3 py-1.5 font-bold rounded-lg transition-all cursor-pointer ${
                  trendViewMode === 'days'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Các ngày trong tuần
              </button>
              <button
                type="button"
                onClick={() => setTrendViewMode('weeks')}
                className={`px-3 py-1.5 font-bold rounded-lg transition-all cursor-pointer ${
                  trendViewMode === 'weeks'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Qua các tuần
              </button>
            </div>
          </div>

          {/* Recharts Container */}
          <div className="h-72 w-full pt-2">
            {trendViewMode === 'days' ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailyTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorViolations" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="colorRewards" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={{ stroke: '#cbd5e1' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={{ stroke: '#cbd5e1' }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '12px',
                      color: '#ffffff',
                      fontSize: '12px',
                      boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <Area
                    type="monotone"
                    dataKey="Lượt vi phạm"
                    stroke="#ef4444"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorViolations)"
                  />
                  <Area
                    type="monotone"
                    dataKey="Lượt khen thưởng"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorRewards)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={multiWeekTrendData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#64748b' }} domain={[60, 'dataMax + 10']} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '12px',
                      color: '#ffffff',
                      fontSize: '12px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <Line
                    type="monotone"
                    dataKey="Tổng điểm thi đua"
                    stroke="#2563eb"
                    strokeWidth={3}
                    dot={{ r: 5, fill: '#2563eb', strokeWidth: 2, stroke: '#ffffff' }}
                    activeDot={{ r: 7 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="Lượt vi phạm"
                    stroke="#ef4444"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="Lượt khen thưởng"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Quick insights under chart */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100 text-xs">
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <span className="text-slate-500 font-medium block">Ngày kỷ luật tốt nhất:</span>
              <strong className="text-emerald-700 font-bold text-sm">Thứ Hai</strong>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <span className="text-slate-500 font-medium block">Tổ ít vi phạm nhất:</span>
              <strong className="text-blue-700 font-bold text-sm">
                Tổ {groupSummaries[0]?.group || 1}
              </strong>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <span className="text-slate-500 font-medium block">Hạng thi đua tuần này:</span>
              <strong className="text-amber-700 font-bold text-sm">
                Hạng {currentCompetition?.schoolRank || 1}
              </strong>
            </div>
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
              <span className="text-slate-500 font-medium block">ĐTB 4 Tổ:</span>
              <strong className="text-slate-900 font-bold text-sm">
                {avgClassDisciplineScore}đ
              </strong>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Danh sách học sinh vi phạm hôm nay */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-rose-600" />
                  <span>Vi Phạm Hôm Nay</span>
                </h3>
                <span className="text-xs text-slate-500">
                  {new Date().toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' })}
                </span>
              </div>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                countViolatedStudentsToday > 0 ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
              }`}>
                {countViolatedStudentsToday} HS
              </span>
            </div>

            {/* List of today's violations */}
            <div className="mt-3 space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {violatedStudentsToday.length === 0 ? (
                <div className="p-6 text-center space-y-3 bg-emerald-50/50 rounded-2xl border border-emerald-200/60 my-2">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-emerald-950">
                      Tuyệt vời! Không có vi phạm hôm nay
                    </h4>
                    <p className="text-xs text-emerald-700 mt-1 leading-relaxed">
                      Toàn bộ {totalStudents} học sinh lớp {settings.className} thực hiện nghiêm túc nề nếp và nội quy.
                    </p>
                  </div>
                </div>
              ) : (
                violatedStudentsToday.map(({ student, count, points, details }) => (
                  <div
                    key={student.id}
                    className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200 transition-all flex items-start justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-900 text-xs sm:text-sm">
                          {student.name}
                        </span>
                        <span className="bg-blue-100 text-blue-800 font-semibold text-[10px] px-1.5 py-0.2 rounded">
                          Tổ {student.group}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-600 line-clamp-2">
                        {details.join(', ')}
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <span className="font-black text-rose-600 bg-rose-50 px-2 py-0.5 rounded text-[11px] border border-rose-200">
                        {points}đ ({count} lỗi)
                      </span>
                      {student.parentPhone && (
                        <button
                          type="button"
                          onClick={() => onOpenSelectStudentForZalo(student.id)}
                          className="flex items-center gap-1 text-[10px] text-blue-700 hover:text-blue-900 font-bold bg-blue-50 px-2 py-1 rounded hover:bg-blue-100 transition-colors cursor-pointer"
                          title="Gửi tin nhắn Zalo/SMS cho phụ huynh"
                        >
                          <MessageCircle className="w-3 h-3 text-blue-600" />
                          <span>Báo PH</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Action button in card */}
          <div className="pt-3 border-t border-slate-100">
            <button
              onClick={() => onOpenQuickRecord()}
              className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Ghi Nhận Thêm Vi Phạm / Khen Thưởng</span>
            </button>
          </div>
        </div>
      </div>

      {/* Row 2: 4 Groups Comparison Chart & Highlights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Recharts 4 Groups Performance BarChart */}
        <div className="lg:col-span-2 bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-600" />
                <span>So Sánh Thi Đua 4 Tổ Trong Lớp</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Điểm rèn luyện trung bình và số lượt vi phạm của từng Tổ
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('stats')}
              className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
            >
              <span>Bảng điểm chi tiết</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={groupChartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#475569' }} />
                <YAxis tick={{ fontSize: 12, fill: '#475569' }} domain={[80, 105]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    color: '#ffffff',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
                <Bar dataKey="Điểm TB Tổ" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={36}>
                  {groupChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={GROUP_COLORS[index % GROUP_COLORS.length]} />
                  ))}
                </Bar>
                <Bar dataKey="Lượt vi phạm" fill="#ef4444" radius={[6, 6, 0, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Mini Group Ranking Table */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100 text-xs">
            {groupSummaries.map((g, idx) => (
              <div
                key={g.group}
                className={`p-3 rounded-xl border flex flex-col justify-between ${
                  g.rank === 1
                    ? 'bg-amber-50/70 border-amber-200 text-amber-950'
                    : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs">Tổ {g.group}</span>
                  <span className={`text-[10px] font-black px-1.5 py-0.2 rounded-full ${
                    g.rank === 1 ? 'bg-amber-400 text-slate-950' : 'bg-slate-200 text-slate-700'
                  }`}>
                    Hạng {g.rank}
                  </span>
                </div>
                <div className="mt-2">
                  <div className="text-lg font-black text-blue-700">{g.averageScore}đ</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    +{g.totalRewards} khen • -{g.totalViolations} lỗi
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Violation Domain Breakdown (PieChart) */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <PieIcon className="w-5 h-5 text-purple-600" />
                <span>Phân Bổ Lĩnh Vực Vi Phạm</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Cơ cấu các nhóm hành vi cần chấn chỉnh trong tuần
              </p>
            </div>

            <div className="h-52 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={domainBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {domainBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: '#334155',
                      borderRadius: '12px',
                      color: '#ffffff',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Legend list */}
            <div className="space-y-1.5 text-xs pt-1">
              {domainBreakdown.map((item, idx) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                    <span className="text-slate-600 font-medium">{item.name}</span>
                  </div>
                  <span className="font-bold text-slate-900">{item.value} lỗi</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100">
            <button
              onClick={() => onNavigateTab('notify')}
              className="w-full py-2.5 px-4 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 text-blue-600" />
              <span>Gửi Báo Cáo Tuần Cho Phụ Huynh</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

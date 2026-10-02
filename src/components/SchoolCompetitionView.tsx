import React, { useState } from 'react';
import {
  Award,
  Trophy,
  Plus,
  Edit2,
  Trash2,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Printer,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  Lock,
  User,
  Medal,
  Star,
  FileText,
  ChevronDown,
  X,
} from 'lucide-react';
import { SchoolCompetitionRecord, AppUserRole, TeacherSettings, Student } from '../types';
import { permissionService, USER_ROLES, getRolePersonInfo } from '../services/permissionService';

interface SchoolCompetitionViewProps {
  records: SchoolCompetitionRecord[];
  activeRole?: AppUserRole | null;
  settings: TeacherSettings;
  students?: Student[];
  onAddRecord: (record: Omit<SchoolCompetitionRecord, 'id' | 'updatedAt'>) => void;
  onUpdateRecord: (record: SchoolCompetitionRecord) => void;
  onDeleteRecord: (id: string) => void;
  onExportExcel?: () => void;
}

export const SchoolCompetitionView: React.FC<SchoolCompetitionViewProps> = ({
  records,
  activeRole,
  settings,
  students = [],
  onAddRecord,
  onUpdateRecord,
  onDeleteRecord,
  onExportExcel,
}) => {
  const canInput = permissionService.canInputCompetitionScore(activeRole);
  const currentRoleInfo = activeRole ? (USER_ROLES[activeRole] || USER_ROLES.gvcn) : null;
  const rolePerson = getRolePersonInfo(activeRole, students, undefined, settings.teacherName);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<SchoolCompetitionRecord | null>(null);

  // Form states
  const [week, setWeek] = useState<number>(settings.currentWeek || 4);
  const [semester, setSemester] = useState<1 | 2>(1);
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [lessonLogScore, setLessonLogScore] = useState<number>(20.0); // ĐTB Sổ đầu bài (tối đa 20đ)
  const [competitionAuditScore, setCompetitionAuditScore] = useState<number>(100.0); // Sổ chấm điểm thi đua (thang 100đ)
  const [disciplineDeductionScore, setDisciplineDeductionScore] = useState<number>(0.0); // Sổ ghi nhận nề nếp (Điểm trừ)
  const [otherViolationDeductionScore, setOtherViolationDeductionScore] = useState<number>(0.0); // Vi phạm khác (Điểm trừ)
  const [schoolRank, setSchoolRank] = useState<number>(1);
  const [totalClasses, setTotalClasses] = useState<number>(32);
  const [rating, setRating] = useState<string>('Xuất sắc');
  const [evaluation, setEvaluation] = useState<string>('');
  const [note, setNote] = useState<string>('');

  // Auto calculate total according to user rule:
  // Tổng điểm = DTB Sổ đầu bài + Sổ chấm điểm thi đua - sổ ghi nhận nề nếp - vi phạm khác
  const calculatedTotal =
    Math.round(
      ((Number(lessonLogScore) || 0) +
        (Number(competitionAuditScore) || 0) -
        (Number(disciplineDeductionScore) || 0) -
        (Number(otherViolationDeductionScore) || 0)) *
        10
    ) / 10;

  // Sorting records by week descending
  const sortedRecords = [...records].sort((a, b) => b.week - a.week);
  const latestRecord = sortedRecords[0];

  const firstPlaceCount = records.filter((r) => r.schoolRank === 1).length;
  const topThreeCount = records.filter((r) => r.schoolRank <= 3).length;
  const avgRank = records.length
    ? Math.round(
        (records.reduce((acc, r) => acc + r.schoolRank, 0) / records.length) * 10
      ) / 10
    : 1;

  const openAddModal = () => {
    setEditingRecord(null);
    const nextWeek = records.length ? Math.max(...records.map((r) => r.week)) + 1 : 1;
    setWeek(nextWeek);
    setSemester(1);
    setDate(new Date().toISOString().split('T')[0]);
    setLessonLogScore(20.0);
    setCompetitionAuditScore(100.0);
    setDisciplineDeductionScore(0.0);
    setOtherViolationDeductionScore(0.0);
    setSchoolRank(1);
    setTotalClasses(32);
    setRating('Xuất sắc');
    setEvaluation('');
    setNote('');
    setIsModalOpen(true);
  };

  const openEditModal = (rec: SchoolCompetitionRecord) => {
    setEditingRecord(rec);
    setWeek(rec.week);
    setSemester(rec.semester);
    setDate(rec.date);
    setLessonLogScore(rec.lessonLogScore ?? 20.0);
    setCompetitionAuditScore(rec.competitionAuditScore ?? 100.0);
    setDisciplineDeductionScore(rec.disciplineDeductionScore ?? 0.0);
    setOtherViolationDeductionScore(rec.otherViolationDeductionScore ?? 0.0);
    setSchoolRank(rec.schoolRank);
    setTotalClasses(rec.totalClasses || 32);
    setRating(rec.rating);
    setEvaluation(rec.evaluation || '');
    setNote(rec.note || '');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const reporterName = `${rolePerson.roleTitle}: ${rolePerson.personName}`;

    if (editingRecord) {
      onUpdateRecord({
        ...editingRecord,
        week: Number(week),
        semester,
        date,
        lessonLogScore: Number(lessonLogScore),
        competitionAuditScore: Number(competitionAuditScore),
        disciplineDeductionScore: Number(disciplineDeductionScore),
        otherViolationDeductionScore: Number(otherViolationDeductionScore),
        totalScore: calculatedTotal,
        schoolRank: Number(schoolRank),
        totalClasses: Number(totalClasses),
        rating,
        evaluation: evaluation.trim() || undefined,
        note: note.trim() || undefined,
        recordedBy: reporterName,
        updatedAt: new Date().toISOString(),
      });
    } else {
      onAddRecord({
        week: Number(week),
        semester,
        date,
        lessonLogScore: Number(lessonLogScore),
        competitionAuditScore: Number(competitionAuditScore),
        disciplineDeductionScore: Number(disciplineDeductionScore),
        otherViolationDeductionScore: Number(otherViolationDeductionScore),
        totalScore: calculatedTotal,
        schoolRank: Number(schoolRank),
        totalClasses: Number(totalClasses),
        rating,
        evaluation: evaluation.trim() || undefined,
        note: note.trim() || undefined,
        recordedBy: reporterName,
      });
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Role permission status banner */}
      {canInput ? (
        <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-2xl p-4 sm:p-5 shadow-lg border border-blue-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center space-x-3.5">
            <div className="p-3 bg-amber-400 text-amber-950 rounded-xl font-bold shadow-md shrink-0">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold text-white">
                  Sổ Điểm & Thứ Hạng Thi Đua Toàn Trường (Lớp 10A7)
                </h2>
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs px-2.5 py-0.5 rounded-full font-bold">
                  Có quyền nhập điểm
                </span>
              </div>
              <p className="text-xs sm:text-sm text-blue-200 mt-0.5">
                Đang thao tác: <strong className="text-white">{rolePerson.roleTitle}</strong> — <strong className="text-amber-300">{rolePerson.isTeacher ? 'GVCN:' : 'Học sinh:'} {rolePerson.personName}</strong>. Công thức: <strong>Tổng điểm = ĐTB Sổ đầu bài + Sổ chấm thi đua - Sổ nề nếp - Vi phạm khác</strong>.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {onExportExcel && (
              <button
                onClick={onExportExcel}
                className="flex items-center justify-center gap-2 px-3.5 py-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md cursor-pointer transition-all shrink-0"
                title="Xuất bảng thi đua toàn trường và xếp hạng 4 tổ sang file Excel (.xlsx)"
              >
                <FileText className="w-4 h-4 text-emerald-200" />
                <span>Xuất Excel Thi Đua</span>
              </button>
            )}
            <button
              onClick={openAddModal}
              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-amber-950 text-xs sm:text-sm font-bold rounded-xl shadow-md cursor-pointer transition-all hover:scale-102 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Nhập Điểm & Hạng Tuần Mới</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 shadow-sm flex items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-amber-200 text-amber-900 rounded-xl shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-amber-950">
                Sổ Điểm & Thứ Hạng Thi Đua Toàn Trường (Chế Độ Xem)
              </h2>
              <p className="text-xs text-amber-800">
                Theo phân công quy định: Chỉ <strong>Lớp Trưởng</strong> và <strong>GVCN Thầy Trần Văn Dư</strong> có quyền nhập sổ điểm và cập nhật thứ hạng của lớp thi đua toàn trường.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {onExportExcel && (
              <button
                onClick={onExportExcel}
                className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-xs cursor-pointer transition-all"
                title="Xuất bảng thi đua toàn trường và xếp hạng 4 tổ sang file Excel (.xlsx)"
              >
                <FileText className="w-3.5 h-3.5 text-emerald-200" />
                <span>Xuất Excel</span>
              </button>
            )}
            <span className="text-xs font-bold text-amber-800 bg-amber-100 px-3 py-1 rounded-lg">
              Chỉ xem
            </span>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Hạng tuần gần nhất */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Hạng Tuần Gần Nhất
            </p>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-2xl sm:text-3xl font-extrabold text-blue-600">
                {latestRecord ? `Hạng ${latestRecord.schoolRank}` : '—'}
              </span>
              <span className="text-xs text-slate-500 font-medium">
                / {latestRecord?.totalClasses || 32} lớp
              </span>
            </div>
            <p className="text-xs text-emerald-600 font-semibold mt-1">
              {latestRecord?.rating || 'Chưa cập nhật'} (Tuần {latestRecord?.week || '—'})
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Trophy className="w-6 h-6 text-amber-500" />
          </div>
        </div>

        {/* Card 2: Điểm thi đua gần nhất */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Điểm Thi Đua Tuần Mới
            </p>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl sm:text-3xl font-extrabold text-emerald-600">
                {latestRecord ? latestRecord.totalScore : '—'}
              </span>
              <span className="text-xs text-slate-500 font-medium">điểm</span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Cờ đỏ & Đoàn trường chấm
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Medal className="w-6 h-6 text-emerald-600" />
          </div>
        </div>

        {/* Card 3: Số tuần Nhất Toàn Trường */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Đạt Cờ Nhất Toàn Trường
            </p>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl sm:text-3xl font-extrabold text-amber-500">
                {firstPlaceCount}
              </span>
              <span className="text-xs text-slate-500 font-medium">tuần</span>
            </div>
            <p className="text-xs text-amber-700 font-semibold mt-1">
              Top 3: {topThreeCount} tuần
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Star className="w-6 h-6 text-amber-500 fill-amber-500" />
          </div>
        </div>

        {/* Card 4: Thứ hạng trung bình */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Thứ Hạng Bình Quân
            </p>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl sm:text-3xl font-extrabold text-purple-600">
                Top {avgRank}
              </span>
            </div>
            <p className="text-xs text-purple-700 font-medium mt-1">
              Duy trì trong khối 10
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
            <TrendingUp className="w-6 h-6 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Main Table of Weeks */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              Sổ Theo Dõi Điểm & Hạng Thi Đua Toàn Trường Từng Tuần
            </h3>
            <p className="text-xs text-slate-500">
              Tổng điểm = ĐTB Sổ đầu bài (/20) + Sổ thi đua (/100) - Sổ nề nếp (-) - Vi phạm khác (-) • {settings.schoolName}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-lg cursor-pointer transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>In Sổ Thi Đua</span>
            </button>
            {canInput && (
              <button
                onClick={openAddModal}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg cursor-pointer transition-colors shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Thêm Tuần</span>
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="py-3 px-3.5 w-16 text-center">Tuần</th>
                <th className="py-3 px-3.5 w-28">Ngày ghi</th>
                <th className="py-3 px-3.5 text-center font-bold text-indigo-700 bg-indigo-50/50">
                  ĐTB Sổ Đầu Bài (/20)
                </th>
                <th className="py-3 px-3.5 text-center font-bold text-teal-700 bg-teal-50/50">
                  Sổ Thi Đua (/100)
                </th>
                <th className="py-3 px-3.5 text-center font-bold text-rose-700 bg-rose-50/50">
                  Sổ Nề Nếp (-)
                </th>
                <th className="py-3 px-3.5 text-center font-bold text-amber-800 bg-amber-50/50">
                  Vi Phạm Khác (-)
                </th>
                <th className="py-3 px-3.5 text-center font-extrabold text-blue-700 bg-blue-50">
                  Tổng Điểm
                </th>
                <th className="py-3 px-3.5 text-center font-extrabold text-amber-700">
                  Hạng Toàn Trường
                </th>
                <th className="py-3 px-3.5 text-center">Xếp Loại</th>
                <th className="py-3 px-3.5 min-w-[200px]">Nhận Xét Đoàn Trường</th>
                <th className="py-3 px-3.5 w-32">Người Ghi</th>
                {canInput && <th className="py-3 px-3.5 w-20 text-center">Thao tác</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedRecords.length === 0 ? (
                <tr>
                  <td
                    colSpan={canInput ? 12 : 11}
                    className="py-8 text-center text-slate-400 text-xs italic"
                  >
                    Chưa có dữ liệu thi đua tuần nào. Lớp trưởng hoặc GVCN hãy bấm &quot;Nhập Điểm & Hạng Tuần Mới&quot; để ghi nhận.
                  </td>
                </tr>
              ) : (
                sortedRecords.map((rec) => (
                  <tr key={rec.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="py-3 px-3.5 font-bold text-center text-slate-800">
                      <span className="inline-block w-8 h-8 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-bold">
                        T{rec.week}
                      </span>
                    </td>
                    <td className="py-3 px-3.5 text-slate-600 font-mono text-xs">
                      {rec.date}
                    </td>
                    <td className="py-3 px-3.5 text-center font-bold text-indigo-900 bg-indigo-50/30">
                      {rec.lessonLogScore ?? 20}đ
                    </td>
                    <td className="py-3 px-3.5 text-center font-bold text-teal-900 bg-teal-50/30">
                      {rec.competitionAuditScore ?? 100}đ
                    </td>
                    <td className="py-3 px-3.5 text-center font-bold text-rose-600 bg-rose-50/30">
                      {rec.disciplineDeductionScore ? `-${rec.disciplineDeductionScore}đ` : '0đ'}
                    </td>
                    <td className="py-3 px-3.5 text-center font-bold text-amber-700 bg-amber-50/30">
                      {rec.otherViolationDeductionScore ? `-${rec.otherViolationDeductionScore}đ` : '0đ'}
                    </td>
                    <td className="py-3 px-3.5 text-center font-extrabold text-blue-700 text-sm bg-blue-50/30">
                      {rec.totalScore}
                    </td>
                    <td className="py-3 px-3.5 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black shadow-xs ${
                          rec.schoolRank === 1
                            ? 'bg-amber-400 text-amber-950 border border-amber-500 scale-105'
                            : rec.schoolRank <= 3
                            ? 'bg-blue-100 text-blue-800 border border-blue-300'
                            : 'bg-slate-100 text-slate-700 border border-slate-300'
                        }`}
                      >
                        {rec.schoolRank === 1 && <Trophy className="w-3.5 h-3.5 text-amber-950" />}
                        Hạng {rec.schoolRank} / {rec.totalClasses || 32}
                      </span>
                    </td>
                    <td className="py-3 px-3.5 text-center">
                      <span
                        className={`px-2.5 py-0.5 rounded-md text-xs font-bold ${
                          rec.rating === 'Nhất tuần'
                            ? 'bg-amber-100 text-amber-800 border border-amber-300'
                            : rec.rating === 'Xuất sắc'
                            ? 'bg-emerald-100 text-emerald-800'
                            : rec.rating === 'Tốt'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {rec.rating}
                      </span>
                    </td>
                    <td className="py-3 px-3.5 text-xs text-slate-600 leading-relaxed">
                      {rec.evaluation || '—'}
                    </td>
                    <td className="py-3 px-3.5 text-xs font-medium text-slate-600">
                      {rec.recordedBy}
                    </td>
                    {canInput && (
                      <td className="py-3 px-3.5 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => openEditModal(rec)}
                            title="Sửa điểm/hạng"
                            className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-md cursor-pointer transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Xóa điểm thi đua Tuần ${rec.week}?`)) {
                                onDeleteRecord(rec.id);
                              }
                            }}
                            title="Xóa tuần"
                            className="p-1.5 text-rose-600 hover:bg-rose-100 rounded-md cursor-pointer transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add/Edit Competition Record */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden">
            <div className="px-5 py-4 bg-gradient-to-r from-blue-900 to-indigo-900 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-amber-400 text-amber-950 font-bold">
                  <Trophy className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    {editingRecord ? `Chỉnh Sửa Thi Đua Tuần ${editingRecord.week}` : 'Nhập Điểm & Hạng Thi Đua Toàn Trường'}
                  </h3>
                  <p className="text-xs text-blue-200">
                    Người nhập: {activeRole === 'gvcn' ? `GVCN Thầy ${settings.teacherName}` : 'Lớp Trưởng'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-blue-200 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tuần thi đua:
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="35"
                    required
                    value={week}
                    onChange={(e) => setWeek(Number(e.target.value))}
                    className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-blue-600 font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Ngày công bố / ghi nhận:
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-blue-600"
                  />
                </div>
              </div>

              {/* Điểm Sổ Đầu Bài & Sổ Thi Đua & Các Khoản Trừ */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 pb-2 border-b border-slate-200">
                  <span>Cơ cấu tính điểm thi đua tuần:</span>
                  <span className="text-blue-700 font-extrabold">
                    Tổng điểm = ĐTB Sổ đầu bài + Sổ thi đua - Sổ nề nếp - Vi phạm khác
                  </span>
                </div>

                {/* 2 Cột Cộng: Sổ đầu bài & Sổ thi đua */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Sổ Đầu Bài: Thang 20 */}
                  <div className="bg-indigo-50/70 p-3 rounded-xl border border-indigo-200">
                    <label className="block text-xs font-bold text-indigo-950 mb-1">
                      1. ĐTB Sổ Đầu Bài (Tối đa 20đ): <span className="text-rose-600">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        max="20"
                        step="0.1"
                        required
                        value={lessonLogScore}
                        onChange={(e) => setLessonLogScore(Number(e.target.value))}
                        className="w-full text-base font-extrabold px-3 py-2 border border-indigo-300 rounded-lg outline-none focus:border-indigo-600 bg-white text-indigo-950 pr-12"
                      />
                      <span className="absolute right-3 top-2.5 text-xs font-bold text-indigo-600">
                        / 20đ
                      </span>
                    </div>
                    <p className="text-[11px] text-indigo-700 mt-1">
                      Điểm trung bình các tiết học trong tuần ghi trong sổ đầu bài
                    </p>
                  </div>

                  {/* Sổ Thi Đua: Thang 100 */}
                  <div className="bg-teal-50/70 p-3 rounded-xl border border-teal-200">
                    <label className="block text-xs font-bold text-teal-950 mb-1">
                      2. Sổ Chấm Điểm Thi Đua (Thang 100đ): <span className="text-rose-600">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.5"
                        required
                        value={competitionAuditScore}
                        onChange={(e) => setCompetitionAuditScore(Number(e.target.value))}
                        className="w-full text-base font-extrabold px-3 py-2 border border-teal-300 rounded-lg outline-none focus:border-teal-600 bg-white text-teal-950 pr-14"
                      />
                      <span className="absolute right-3 top-2.5 text-xs font-bold text-teal-600">
                        / 100đ
                      </span>
                    </div>
                    <p className="text-[11px] text-teal-700 mt-1">
                      Điểm thi đua nề nếp cờ đỏ & Đoàn trường chấm
                    </p>
                  </div>
                </div>

                {/* 2 Cột Trừ: Sổ nề nếp & Vi phạm khác */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {/* Sổ ghi nhận nề nếp */}
                  <div className="bg-rose-50/70 p-3 rounded-xl border border-rose-200">
                    <label className="block text-xs font-bold text-rose-950 mb-1">
                      3. Sổ Ghi Nhận Nề Nếp (Điểm trừ):
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        value={disciplineDeductionScore}
                        onChange={(e) => setDisciplineDeductionScore(Number(e.target.value))}
                        className="w-full text-base font-extrabold px-3 py-2 border border-rose-300 rounded-lg outline-none focus:border-rose-600 bg-white text-rose-950 pr-14"
                        placeholder="0"
                      />
                      <span className="absolute right-3 top-2.5 text-xs font-bold text-rose-600">
                        - điểm
                      </span>
                    </div>
                    <p className="text-[11px] text-rose-700 mt-1">
                      Các lỗi nề nếp vi phạm trong tuần (đi trễ, đồng phục, vệ sinh...)
                    </p>
                  </div>

                  {/* Vi phạm khác */}
                  <div className="bg-amber-50/70 p-3 rounded-xl border border-amber-200">
                    <label className="block text-xs font-bold text-amber-950 mb-1">
                      4. Vi Phạm Khác (Điểm trừ):
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        value={otherViolationDeductionScore}
                        onChange={(e) => setOtherViolationDeductionScore(Number(e.target.value))}
                        className="w-full text-base font-extrabold px-3 py-2 border border-amber-300 rounded-lg outline-none focus:border-amber-600 bg-white text-amber-950 pr-14"
                        placeholder="0"
                      />
                      <span className="absolute right-3 top-2.5 text-xs font-bold text-amber-600">
                        - điểm
                      </span>
                    </div>
                    <p className="text-[11px] text-amber-700 mt-1">
                      Các vi phạm đột xuất hoặc nhắc nhở khác từ ban thi đua
                    </p>
                  </div>
                </div>

                {/* Kết quả tổng điểm live */}
                <div className="bg-blue-100/80 border border-blue-300 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                  <div className="text-blue-950 font-medium">
                    Công thức: <strong>{lessonLogScore || 0}đ</strong> (Sổ đầu bài) + <strong>{competitionAuditScore || 0}đ</strong> (Sổ thi đua)
                    {disciplineDeductionScore > 0 && (
                      <span className="text-rose-700 font-bold"> - {disciplineDeductionScore}đ (Nề nếp)</span>
                    )}
                    {otherViolationDeductionScore > 0 && (
                      <span className="text-amber-800 font-bold"> - {otherViolationDeductionScore}đ (Khác)</span>
                    )}
                  </div>
                  <div className="text-sm font-black text-blue-900">
                    Tổng điểm = <span className="text-lg text-blue-700">{calculatedTotal}</span> điểm
                  </div>
                </div>
              </div>

              {/* Hạng toàn trường & Xếp loại */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Hạng Toàn Trường:
                  </label>
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-bold text-slate-600">Hạng</span>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      required
                      value={schoolRank}
                      onChange={(e) => setSchoolRank(Number(e.target.value))}
                      className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-blue-600 font-extrabold text-amber-700"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tổng số lớp trường:
                  </label>
                  <input
                    type="number"
                    value={totalClasses}
                    onChange={(e) => setTotalClasses(Number(e.target.value))}
                    className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Xếp loại tuần:
                  </label>
                  <select
                    value={rating}
                    onChange={(e) => setRating(e.target.value)}
                    className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-blue-600 font-bold"
                  >
                    <option value="Nhất tuần">Nhất tuần (Cờ thi đua)</option>
                    <option value="Xuất sắc">Xuất sắc</option>
                    <option value="Tốt">Tốt</option>
                    <option value="Khá">Khá</option>
                    <option value="Trung bình">Trung bình</option>
                  </select>
                </div>
              </div>

              {/* Nhận xét đoàn trường */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Lời phê / Nhận xét của Đoàn trường / Ban thi đua:
                </label>
                <textarea
                  rows={2}
                  value={evaluation}
                  onChange={(e) => setEvaluation(e.target.value)}
                  placeholder="Ví dụ: Giữ vững nề nếp tốt, vệ sinh lớp sạch sẽ, tham gia phong trào đầy đủ..."
                  className="w-full text-xs sm:text-sm px-3 py-2 border border-slate-300 rounded-lg outline-none focus:border-blue-600"
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 flex items-center justify-between text-xs text-blue-950 font-bold">
                <span>Tổng Điểm Thi Đua Tính Toán:</span>
                <span className="text-base text-blue-700 font-extrabold">{calculatedTotal} điểm</span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-100"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md"
                >
                  {editingRecord ? 'Lưu Cập Nhật' : 'Lưu Điểm & Hạng Tuần'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

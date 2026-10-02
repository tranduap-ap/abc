import * as XLSX from 'xlsx';
import {
  Student,
  Gender,
  StudentRole,
  StudentScoreSummary,
  GroupScoreSummary,
  IncidentRecord,
  SchoolCompetitionRecord,
  TeacherSettings,
} from '../types';

export interface ParsedStudentRow {
  rollNumber: number;
  name: string;
  gender: Gender;
  group: number;
  role: StudentRole;
  parentName: string;
  parentPhone: string;
  note?: string;
  isValid: boolean;
  error?: string;
}

export const excelService = {
  /**
   * Generates a template Excel file (.xlsx) for importing students
   */
  downloadTemplate(): void {
    const templateData = [
      {
        'STT': 1,
        'Họ và tên': 'Nguyễn Hoàng An',
        'Giới tính': 'Nam',
        'Tổ': 1,
        'Chức vụ': 'Lớp trưởng',
        'Họ tên phụ huynh': 'Nguyễn Văn Tuấn',
        'Số điện thoại phụ huynh': '0981234501',
        'Ghi chú': 'Gương mẫu, tích cực',
      },
      {
        'STT': 2,
        'Họ và tên': 'Trần Thị Ngọc Ánh',
        'Giới tính': 'Nữ',
        'Tổ': 1,
        'Chức vụ': 'Tổ trưởng',
        'Họ tên phụ huynh': 'Trần Văn Bình',
        'Số điện thoại phụ huynh': '0972345602',
        'Ghi chú': 'Học tốt môn Toán',
      },
      {
        'STT': 3,
        'Họ và tên': 'Lê Gia Bảo',
        'Giới tính': 'Nam',
        'Tổ': 2,
        'Chức vụ': 'Học sinh',
        'Họ tên phụ huynh': 'Lê Minh Khang',
        'Số điện thoại phụ huynh': '0913456703',
        'Ghi chú': '',
      },
      {
        'STT': 4,
        'Họ và tên': 'Phạm Quỳnh Chi',
        'Giới tính': 'Nữ',
        'Tổ': 3,
        'Chức vụ': 'Bí thư',
        'Họ tên phụ huynh': 'Phạm Quốc Hưng',
        'Số điện thoại phụ huynh': '0964567804',
        'Ghi chú': 'Bí thư chi đoàn 10A7',
      },
      {
        'STT': 5,
        'Họ và tên': 'Võ Minh Đăng',
        'Giới tính': 'Nam',
        'Tổ': 4,
        'Chức vụ': 'Cờ đỏ',
        'Họ tên phụ huynh': 'Võ Thành Đạt',
        'Số điện thoại phụ huynh': '0935678905',
        'Ghi chú': '',
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(templateData);

    // Set columns width
    worksheet['!cols'] = [
      { wch: 6 },  // STT
      { wch: 25 }, // Họ và tên
      { wch: 12 }, // Giới tính
      { wch: 8 },  // Tổ
      { wch: 16 }, // Chức vụ
      { wch: 24 }, // Họ tên phụ huynh
      { wch: 20 }, // Số điện thoại phụ huynh
      { wch: 26 }, // Ghi chú
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'DanhSachHocSinh_10A7');

    XLSX.writeFile(workbook, 'Mau_Danh_Sach_Hoc_Sinh_Lop_10A7.xlsx');
  },

  /**
   * Parses an Excel or CSV file uploaded by the user
   */
  async parseExcelFile(file: File): Promise<ParsedStudentRow[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];

          // Convert sheet to JSON array of objects
          const rawRows: any[] = XLSX.utils.sheet_to_json(worksheet, {
            defval: '',
            raw: false,
          });

          if (!rawRows || rawRows.length === 0) {
            resolve([]);
            return;
          }

          const parsedList: ParsedStudentRow[] = rawRows.map((row, index) => {
            // Flexible column resolution (case-insensitive & accent friendly)
            const getVal = (keys: string[]): string => {
              for (const k of Object.keys(row)) {
                const normK = k.toLowerCase().trim();
                for (const target of keys) {
                  if (normK === target.toLowerCase() || normK.includes(target.toLowerCase())) {
                    return String(row[k]).trim();
                  }
                }
              }
              return '';
            };

            const rawName = getVal(['họ và tên', 'họ tên', 'tên học sinh', 'tên', 'hoten', 'name']);
            const rawRoll = getVal(['stt', 'số thứ tự', 'mã số', 'no']);
            const rawGender = getVal(['giới tính', 'gioi tinh', 'gender', 'phái']);
            const rawGroup = getVal(['tổ', 'to', 'nhóm', 'group']);
            const rawRole = getVal(['chức vụ', 'chuc vu', 'vai trò', 'role']);
            const rawParentName = getVal(['họ tên phụ huynh', 'phụ huynh', 'tên cha mẹ', 'cha mẹ', 'parent']);
            const rawParentPhone = getVal(['số điện thoại phụ huynh', 'sđt phụ huynh', 'sđt', 'điện thoại', 'sdt', 'phone']);
            const rawNote = getVal(['ghi chú', 'ghi chu', 'note', 'nhận xét']);

            let isValid = true;
            let error = '';

            if (!rawName) {
              isValid = false;
              error = 'Thiếu họ tên học sinh';
            }

            // Parse STT
            const rollNum = parseInt(rawRoll, 10);
            const rollNumber = !isNaN(rollNum) && rollNum > 0 ? rollNum : index + 1;

            // Parse Gender
            let gender: Gender = 'Nam';
            const normGender = rawGender.toLowerCase();
            if (normGender.includes('nữ') || normGender === 'nu' || normGender === 'female' || normGender === 'f') {
              gender = 'Nữ';
            }

            // Parse Group (1, 2, 3, 4)
            let group = 1;
            const matchGroup = rawGroup.match(/\d+/);
            if (matchGroup) {
              const parsedG = parseInt(matchGroup[0], 10);
              if (parsedG >= 1 && parsedG <= 4) {
                group = parsedG;
              } else {
                group = ((index % 4) + 1);
              }
            } else {
              group = ((index % 4) + 1);
            }

            // Parse Role
            let role: StudentRole = 'Học sinh';
            const normRole = rawRole.toLowerCase();
            if (normRole.includes('lớp trưởng') || normRole.includes('lop truong')) {
              role = 'Lớp trưởng';
            } else if (normRole.includes('học tập') || normRole.includes('hoc tap')) {
              role = 'Lớp phó học tập';
            } else if (normRole.includes('lao động') || normRole.includes('lao dong') || normRole.includes('vệ sinh')) {
              role = 'Lớp phó lao động';
            } else if (normRole.includes('trật tự') || normRole.includes('trat tu') || normRole.includes('kỷ luật')) {
              role = 'Lớp phó trật tự';
            } else if (normRole.includes('lớp phó') || normRole.includes('lop pho')) {
              role = 'Lớp phó';
            } else if (normRole.includes('bí thư') || normRole.includes('bi thu')) {
              role = 'Bí thư';
            } else if (normRole.includes('tổ trưởng') || normRole.includes('to truong')) {
              role = 'Tổ trưởng';
            } else if (normRole.includes('cờ đỏ') || normRole.includes('co do')) {
              role = 'Cờ đỏ';
            }

            // Format phone number (preserve leading zero if numeric)
            let cleanPhone = rawParentPhone.replace(/[^0-9]/g, '');
            if (cleanPhone.length > 0 && !cleanPhone.startsWith('0')) {
              cleanPhone = '0' + cleanPhone;
            }

            return {
              rollNumber,
              name: rawName,
              gender,
              group,
              role,
              parentName: rawParentName,
              parentPhone: cleanPhone || 'Chưa cập nhật',
              note: rawNote,
              isValid,
              error,
            };
          });

          resolve(parsedList);
        } catch (error) {
          console.error('Error parsing Excel file:', error);
          reject(error);
        }
      };

      reader.onerror = (error) => reject(error);
      reader.readAsArrayBuffer(file);
    });
  },

  /**
   * Export the complete Student Roster to Excel with full details and group divisions
   */
  exportStudentRosterToExcel(
    students: Student[],
    summaries: StudentScoreSummary[] = [],
    settings: { className: string; teacherName: string; schoolName: string; academicYear: string }
  ): void {
    const summaryMap = new Map<string, StudentScoreSummary>();
    summaries.forEach((s) => summaryMap.set(s.student.id, s));

    const workbook = XLSX.utils.book_new();

    // Sheet 1: Danh Sách Lớp
    const rosterRows = students.map((st, idx) => {
      const sum = summaryMap.get(st.id);
      return {
        'STT': st.rollNumber || idx + 1,
        'Họ và tên học sinh': st.name,
        'Giới tính': st.gender,
        'Tổ': `Tổ ${st.group}`,
        'Chức vụ': st.role,
        'Điểm rèn luyện': sum ? sum.totalScore : 100,
        'Xếp loại': sum ? sum.rankTitle : 'Tốt',
        'Lượt khen (+)': sum ? sum.rewardCount : 0,
        'Lượt vi phạm (-)': sum ? sum.violationCount : 0,
        'Họ tên phụ huynh': st.parentName || 'Chưa cập nhật',
        'Số điện thoại phụ huynh': st.parentPhone || 'Chưa cập nhật',
        'Ghi chú': st.note || '',
      };
    });

    const wsRoster = XLSX.utils.json_to_sheet(rosterRows);
    wsRoster['!cols'] = [
      { wch: 6 },
      { wch: 25 },
      { wch: 10 },
      { wch: 8 },
      { wch: 16 },
      { wch: 16 },
      { wch: 14 },
      { wch: 14 },
      { wch: 16 },
      { wch: 24 },
      { wch: 20 },
      { wch: 25 },
    ];
    XLSX.utils.book_append_sheet(workbook, wsRoster, `DS_HocSinh_${settings.className}`);

    // Sheet 2: Danh Sách Phân Theo 4 Tổ
    const groupRows: any[] = [];
    for (let g = 1; g <= 4; g++) {
      const inGroup = students.filter((s) => s.group === g);
      groupRows.push({
        'Tổ': `=== TỔ ${g} (Sĩ số: ${inGroup.length} học sinh) ===`,
        'STT': '',
        'Họ và tên': '',
        'Giới tính': '',
        'Chức vụ': '',
        'SĐT Phụ Huynh': '',
        'Điểm Rèn Luyện': '',
      });

      inGroup.forEach((st, gIdx) => {
        const sum = summaryMap.get(st.id);
        groupRows.push({
          'Tổ': `Tổ ${g}`,
          'STT': st.rollNumber || gIdx + 1,
          'Họ và tên': st.name,
          'Giới tính': st.gender,
          'Chức vụ': st.role,
          'SĐT Phụ Huynh': st.parentPhone,
          'Điểm Rèn Luyện': sum ? sum.totalScore : 100,
        });
      });
    }

    const wsGroups = XLSX.utils.json_to_sheet(groupRows);
    wsGroups['!cols'] = [
      { wch: 30 },
      { wch: 6 },
      { wch: 25 },
      { wch: 10 },
      { wch: 16 },
      { wch: 18 },
      { wch: 16 },
    ];
    XLSX.utils.book_append_sheet(workbook, wsGroups, 'Phan_Theo_4_To');

    const safeDate = new Date().toISOString().split('T')[0];
    XLSX.writeFile(
      workbook,
      `Danh_Sach_Hoc_Sinh_Lop_${settings.className}_${safeDate}.xlsx`
    );
  },

  /**
   * Export the School Competition Records and 4-Group Competition to Excel
   */
  exportCompetitionToExcel(
    records: SchoolCompetitionRecord[],
    groupSummaries: GroupScoreSummary[],
    settings: { className: string; teacherName: string; schoolName: string; academicYear: string }
  ): void {
    const workbook = XLSX.utils.book_new();

    // Sheet 1: Thi Đua Toàn Trường
    const compRows = records.map((r, idx) => ({
      'STT': idx + 1,
      'Tuần': `Tuần ${r.week}`,
      'Học kỳ': `Học kỳ ${r.semester}`,
      'Ngày đánh giá': r.date,
      'ĐTB Sổ đầu bài (20đ)': r.lessonLogScore,
      'Sổ chấm thi đua (100đ)': r.competitionAuditScore,
      'Điểm trừ nề nếp': r.disciplineDeductionScore,
      'Vi phạm khác': r.otherViolationDeductionScore,
      'Tổng điểm thi đua': r.totalScore,
      'Hạng toàn trường': `${r.schoolRank} / ${r.totalClasses} lớp`,
      'Xếp loại': r.rating,
      'Đánh giá & Nhận xét': r.evaluation || '',
      'Ghi chú': r.note || '',
      'Người ghi nhận': r.recordedBy,
    }));

    const wsComp = XLSX.utils.json_to_sheet(compRows);
    wsComp['!cols'] = [
      { wch: 6 },
      { wch: 10 },
      { wch: 10 },
      { wch: 14 },
      { wch: 22 },
      { wch: 22 },
      { wch: 16 },
      { wch: 14 },
      { wch: 18 },
      { wch: 18 },
      { wch: 14 },
      { wch: 35 },
      { wch: 20 },
      { wch: 25 },
    ];
    XLSX.utils.book_append_sheet(workbook, wsComp, 'Thi_Dua_Toan_Truong');

    // Sheet 2: Bảng Xếp Hạng 4 Tổ Trong Lớp
    const groupRows = groupSummaries.map((g) => ({
      'Hạng': `Hạng ${g.rank}`,
      'Tổ': `Tổ ${g.group}`,
      'Sĩ số': `${g.studentCount} HS`,
      'Điểm TB Tổ': g.averageScore,
      'Tổng điểm cộng (+)': g.totalRewardPoints,
      'Tổng điểm trừ (-)': g.totalViolationPoints,
      'Lượt khen': g.totalRewardCount,
      'Lượt vi phạm': g.totalViolationCount,
      'Xếp loại Tổ': g.rankTitle,
    }));

    const wsGroup = XLSX.utils.json_to_sheet(groupRows);
    wsGroup['!cols'] = [
      { wch: 10 },
      { wch: 10 },
      { wch: 12 },
      { wch: 14 },
      { wch: 18 },
      { wch: 18 },
      { wch: 14 },
      { wch: 14 },
      { wch: 16 },
    ];
    XLSX.utils.book_append_sheet(workbook, wsGroup, 'Xep_Hang_4_To');

    const safeDate = new Date().toISOString().split('T')[0];
    XLSX.writeFile(
      workbook,
      `Ket_Qua_Thi_Dua_Lop_${settings.className}_${safeDate}.xlsx`
    );
  },

  /**
   * Export the Comprehensive Discipline Report (Summaries, Incident Log, Group Standings) to Excel
   */
  exportDisciplineReportToExcel(
    summaries: StudentScoreSummary[],
    groupSummaries: GroupScoreSummary[],
    incidents: IncidentRecord[],
    filterType: 'week' | 'month',
    filterValue: number,
    settings: { className: string; teacherName: string; schoolName: string; academicYear: string }
  ): void {
    const workbook = XLSX.utils.book_new();

    // Sheet 1: Bảng Điểm Nề Nếp Từng Học Sinh
    const reportRows = summaries.map((s) => ({
      'STT': s.student.rollNumber,
      'Họ và tên': s.student.name,
      'Giới tính': s.student.gender,
      'Tổ': `Tổ ${s.student.group}`,
      'Chức vụ': s.student.role,
      'Điểm khởi điểm': s.baseScore,
      'Điểm cộng (+)': s.rewardPoints,
      'Điểm trừ (-)': s.violationPoints,
      'Tổng điểm nề nếp': s.totalScore,
      'Xếp loại': s.rankTitle,
      'Lượt khen': s.rewardCount,
      'Lượt vi phạm': s.violationCount,
      'Phụ huynh': s.student.parentName,
      'SĐT phụ huynh': s.student.parentPhone,
      'Chi tiết vi phạm / khen': s.incidents.map((i) => `${i.ruleName} (${i.points > 0 ? '+' : ''}${i.points}đ)`).join('; '),
    }));

    const wsSummary = XLSX.utils.json_to_sheet(reportRows);
    wsSummary['!cols'] = [
      { wch: 6 },
      { wch: 25 },
      { wch: 10 },
      { wch: 8 },
      { wch: 14 },
      { wch: 14 },
      { wch: 14 },
      { wch: 14 },
      { wch: 18 },
      { wch: 16 },
      { wch: 12 },
      { wch: 14 },
      { wch: 22 },
      { wch: 18 },
      { wch: 45 },
    ];
    XLSX.utils.book_append_sheet(workbook, wsSummary, 'Tong_Hop_Ne_Nep');

    // Sheet 2: Nhật Ký Chi Tiết Vi Phạm & Khen Thưởng
    const filteredIncidents = incidents.filter((inc) =>
      filterType === 'week' ? inc.week === filterValue : inc.month === filterValue
    );

    const incidentRows = filteredIncidents.map((inc, idx) => ({
      'STT': idx + 1,
      'Ngày ghi': inc.date,
      'Thời điểm': inc.period || '10 phút đầu giờ',
      'Học sinh': inc.studentName,
      'Tổ': `Tổ ${inc.group}`,
      'Nội dung vi phạm / Khen thưởng': inc.ruleName,
      'Phân loại': inc.category === 'reward' ? 'Khen thưởng (+)' : 'Vi phạm (-)',
      'Điểm': `${inc.points > 0 ? '+' : ''}${inc.points}đ`,
      'Số lần': inc.quantity || 1,
      'Tổng điểm': `${(inc.points * (inc.quantity || 1)) > 0 ? '+' : ''}${inc.points * (inc.quantity || 1)}đ`,
      'Người ghi nhận': inc.reportedBy || `GVCN Thầy ${settings.teacherName}`,
      'Ghi chú': inc.note || '',
    }));

    const wsIncidents = XLSX.utils.json_to_sheet(incidentRows);
    wsIncidents['!cols'] = [
      { wch: 6 },
      { wch: 12 },
      { wch: 18 },
      { wch: 24 },
      { wch: 8 },
      { wch: 34 },
      { wch: 16 },
      { wch: 10 },
      { wch: 8 },
      { wch: 12 },
      { wch: 24 },
      { wch: 30 },
    ];
    XLSX.utils.book_append_sheet(workbook, wsIncidents, 'Nhat_Ky_Vi_Pham_Khen');

    // Sheet 3: Bảng Thi Đua 4 Tổ
    const groupRows = groupSummaries.map((g) => ({
      'Hạng': `Hạng ${g.rank}`,
      'Tổ': `Tổ ${g.group}`,
      'Sĩ số': `${g.studentCount} HS`,
      'Điểm TB Tổ': g.averageScore,
      'Tổng điểm cộng (+)': g.totalRewardPoints,
      'Tổng điểm trừ (-)': g.totalViolationPoints,
      'Lượt khen': g.totalRewardCount,
      'Lượt vi phạm': g.totalViolationCount,
      'Xếp loại': g.rankTitle,
    }));

    const wsGroups = XLSX.utils.json_to_sheet(groupRows);
    wsGroups['!cols'] = [
      { wch: 10 },
      { wch: 10 },
      { wch: 12 },
      { wch: 14 },
      { wch: 18 },
      { wch: 18 },
      { wch: 12 },
      { wch: 14 },
      { wch: 16 },
    ];
    XLSX.utils.book_append_sheet(workbook, wsGroups, 'Thi_Dua_4_To');

    const safeDate = new Date().toISOString().split('T')[0];
    const periodName = filterType === 'week' ? `Tuan_${filterValue}` : `Thang_${filterValue}`;
    XLSX.writeFile(
      workbook,
      `Bao_Cao_Ne_Nep_${settings.className}_${periodName}_${safeDate}.xlsx`
    );
  },

  /**
   * Export All Data Package into a single comprehensive master workbook
   */
  exportMasterAllDataPackageToExcel(
    students: Student[],
    summaries: StudentScoreSummary[],
    groupSummaries: GroupScoreSummary[],
    incidents: IncidentRecord[],
    competitions: SchoolCompetitionRecord[],
    filterType: 'week' | 'month',
    filterValue: number,
    settings: { className: string; teacherName: string; schoolName: string; academicYear: string }
  ): void {
    const workbook = XLSX.utils.book_new();

    // 1. Tổng hợp nề nếp
    const summaryRows = summaries.map((s) => ({
      'STT': s.student.rollNumber,
      'Họ và tên': s.student.name,
      'Giới tính': s.student.gender,
      'Tổ': `Tổ ${s.student.group}`,
      'Chức vụ': s.student.role,
      'Điểm ban đầu': s.baseScore,
      'Điểm cộng': s.rewardPoints,
      'Điểm trừ': s.violationPoints,
      'Tổng điểm': s.totalScore,
      'Xếp loại': s.rankTitle,
      'Lượt khen': s.rewardCount,
      'Lượt vi phạm': s.violationCount,
      'SĐT phụ huynh': s.student.parentPhone,
    }));
    const wsSummary = XLSX.utils.json_to_sheet(summaryRows);
    XLSX.utils.book_append_sheet(workbook, wsSummary, 'Bao_Cao_Ne_Nep');

    // 2. Nhật ký vi phạm/khen
    const filteredIncidents = incidents.filter((inc) =>
      filterType === 'week' ? inc.week === filterValue : inc.month === filterValue
    );
    const incidentRows = filteredIncidents.map((inc, idx) => ({
      'STT': idx + 1,
      'Ngày ghi': inc.date,
      'Thời điểm': inc.period || '10 phút đầu giờ',
      'Học sinh': inc.studentName,
      'Tổ': `Tổ ${inc.group}`,
      'Nội dung lỗi / khen': inc.ruleName,
      'Loại': inc.category === 'reward' ? 'Khen (+)' : 'Phạt (-)',
      'Điểm': `${inc.points > 0 ? '+' : ''}${inc.points}đ`,
      'Người ghi': inc.reportedBy || `GVCN Thầy ${settings.teacherName}`,
      'Ghi chú': inc.note || '',
    }));
    const wsIncidents = XLSX.utils.json_to_sheet(incidentRows);
    XLSX.utils.book_append_sheet(workbook, wsIncidents, 'Nhat_Ky_Vi_Pham_Khen');

    // 3. Thi đua 4 tổ
    const groupRows = groupSummaries.map((g) => ({
      'Hạng': `Hạng ${g.rank}`,
      'Tổ': `Tổ ${g.group}`,
      'Sĩ số': `${g.studentCount} HS`,
      'Điểm TB Tổ': g.averageScore,
      'Tổng điểm cộng': g.totalRewardPoints,
      'Tổng điểm trừ': g.totalViolationPoints,
      'Lượt khen': g.totalRewardCount,
      'Lượt vi phạm': g.totalViolationCount,
      'Xếp loại': g.rankTitle,
    }));
    const wsGroups = XLSX.utils.json_to_sheet(groupRows);
    XLSX.utils.book_append_sheet(workbook, wsGroups, 'Thi_Dua_4_To');

    // 4. Thi đua toàn trường
    const compRows = competitions.map((r, idx) => ({
      'STT': idx + 1,
      'Tuần': `Tuần ${r.week}`,
      'Học kỳ': `Học kỳ ${r.semester}`,
      'Ngày đánh giá': r.date,
      'ĐTB Sổ đầu bài': r.lessonLogScore,
      'Sổ thi đua': r.competitionAuditScore,
      'Trừ nề nếp': r.disciplineDeductionScore,
      'Trừ khác': r.otherViolationDeductionScore,
      'Tổng điểm': r.totalScore,
      'Hạng': `${r.schoolRank}/${r.totalClasses}`,
      'Xếp loại': r.rating,
      'Đánh giá': r.evaluation || '',
    }));
    const wsComp = XLSX.utils.json_to_sheet(compRows);
    XLSX.utils.book_append_sheet(workbook, wsComp, 'Thi_Dua_Toan_Truong');

    // 5. Danh sách học sinh lớp
    const rosterRows = students.map((st, idx) => ({
      'STT': st.rollNumber || idx + 1,
      'Họ và tên': st.name,
      'Giới tính': st.gender,
      'Tổ': `Tổ ${st.group}`,
      'Chức vụ': st.role,
      'Họ tên phụ huynh': st.parentName || '',
      'SĐT phụ huynh': st.parentPhone || '',
      'Ghi chú': st.note || '',
    }));
    const wsRoster = XLSX.utils.json_to_sheet(rosterRows);
    XLSX.utils.book_append_sheet(workbook, wsRoster, 'Danh_Sach_Hoc_Sinh');

    const safeDate = new Date().toISOString().split('T')[0];
    XLSX.writeFile(
      workbook,
      `Bao_Cao_Tong_Hop_Lop_${settings.className}_GVCN_${settings.teacherName.replace(/\s+/g, '_')}_${safeDate}.xlsx`
    );
  },

  /**
   * Export the current class list and behavioral score report to Excel (Legacy alias)
   */
  exportClassReportToExcel(
    students: Student[],
    summaries: StudentScoreSummary[],
    schoolName: string,
    className: string,
    teacherName: string,
    academicYear: string,
    periodLabel: string
  ): void {
    this.exportDisciplineReportToExcel(
      summaries,
      [],
      [],
      'week',
      1,
      { className, teacherName, schoolName, academicYear }
    );
  },

  /**
   * Export the monthly 23-criteria matrix report matching the official school template
   */
  exportMonthlyTrackingToExcel(
    students: Student[],
    summaries: StudentScoreSummary[],
    month: number,
    academicYear: string,
    rules: any[],
    className: string = '10A7',
    teacherName: string = 'Trần Văn Dư'
  ): void {
    const totalCount = summaries.length || 1;
    const countTot = summaries.filter((s) => s.totalScore >= 90).length;
    const countKha = summaries.filter((s) => s.totalScore >= 80 && s.totalScore < 90).length;
    const countDat = summaries.filter((s) => s.totalScore >= 70 && s.totalScore < 80).length;
    const countChuaDat = summaries.filter((s) => s.totalScore < 70).length;

    const aoa: any[][] = [];

    // Header 1: School & National Motto
    aoa.push([
      'SỞ GD&ĐT AN GIANG', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
      'CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM',
    ]);
    aoa.push([
      'TRƯỜNG THPT AN PHÚ', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
      'Độc lập - Tự do - Hạnh phúc',
    ]);
    aoa.push([
      `LỚP: ${className} • GVCN: THẦY ${teacherName.toUpperCase()}`, '', '', '', '', '', '', '', '', '', '', '', '', '', '',
      '------------------------',
    ]);
    aoa.push([]);

    // Document Title (Rows 4 & 5)
    aoa.push(['BẢNG THEO DÕI KẾT QUẢ RÈN LUYỆN']);
    aoa.push([`THÁNG ${month} • NĂM HỌC ${academicYear}`]);
    aoa.push([]);

    // Table Column Headers (Row 7)
    const headerRow = ['Stt', 'Họ tên học sinh'];
    for (let i = 1; i <= 23; i++) {
      headerRow.push(String(i));
    }
    headerRow.push('Điểm', 'Loại');
    aoa.push(headerRow);

    // Data rows
    summaries.forEach((s, idx) => {
      const row: any[] = [
        s.student.rollNumber || idx + 1,
        s.student.name,
      ];

      for (let i = 1; i <= 23; i++) {
        const incidentsForCrit = s.incidents.filter((inc) => {
          const rule = rules.find((r: any) => r.id === inc.ruleId || r.name === inc.ruleName);
          if (rule && rule.criterionNumber) {
            return rule.criterionNumber === i;
          }
          if (inc.ruleName.includes(`(${i})`)) return true;
          return false;
        });

        if (incidentsForCrit.length > 0) {
          const totalPoints = incidentsForCrit.reduce((sum, item) => sum + item.points, 0);
          row.push(totalPoints !== 0 ? totalPoints : '');
        } else {
          row.push('');
        }
      }

      row.push(s.totalScore);
      row.push(s.rankTitle);
      aoa.push(row);
    });

    // Summary Statistics Breakdown
    aoa.push([]);
    aoa.push(['', `TỔNG KẾT RÈN LUYỆN THÁNG ${month} (Sĩ số: ${summaries.length} học sinh)`]);
    aoa.push(['', 'Loại Tốt (90 - 100đ):', `${countTot} HS`, `${Math.round((countTot / totalCount) * 100)}%`]);
    aoa.push(['', 'Loại Khá (80 - dưới 90đ):', `${countKha} HS`, `${Math.round((countKha / totalCount) * 100)}%`]);
    aoa.push(['', 'Loại Đạt (70 - dưới 80đ):', `${countDat} HS`, `${Math.round((countDat / totalCount) * 100)}%`]);
    aoa.push(['', 'Loại Chưa đạt (< 70đ):', `${countChuaDat} HS`, `${Math.round((countChuaDat / totalCount) * 100)}%`]);
    aoa.push([]);

    // Signatures
    const today = new Date();
    aoa.push([
      '', 'LỚP TRƯỞNG', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
      `Ngày ${today.getDate()} tháng ${month} năm ${today.getFullYear()}`,
    ]);
    aoa.push([
      '', '(Ký và ghi rõ họ tên)', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
      'GIÁO VIÊN CHỦ NHIỆM',
    ]);
    aoa.push([]);
    aoa.push([]);
    aoa.push([
      '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '',
      `Thầy ${teacherName}`,
    ]);

    const worksheet = XLSX.utils.aoa_to_sheet(aoa);

    // Columns width
    const cols: any[] = [
      { wch: 6 },  // Stt
      { wch: 25 }, // Họ tên học sinh
    ];
    for (let i = 1; i <= 23; i++) {
      cols.push({ wch: 4.5 }); // Columns 1 to 23
    }
    cols.push({ wch: 9 });  // Điểm
    cols.push({ wch: 12 }); // Loại

    worksheet['!cols'] = cols;

    // Center Title Merges
    worksheet['!merges'] = [
      { s: { r: 4, c: 0 }, e: { r: 4, c: 26 } }, // Title
      { s: { r: 5, c: 0 }, e: { r: 5, c: 26 } }, // Subtitle
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, `Theo_Doi_Thang_${month}`);

    // Sheet 2: Reference notes for 23 criteria
    const criteria23List = [
      ['CỘT', 'NỘI DUNG TIÊU CHÍ RÈN LUYỆN THEO QUY CHẾ NHÀ TRƯỜNG'],
      ['Cột 1', '(1) Rèn luyện phẩm chất yêu nước: Hoạt động truyền thống, đạo lý đền ơn đáp nghĩa'],
      ['Cột 2', '(2) Rèn luyện phẩm chất yêu nước: Chấp hành pháp luật, giữ gìn danh dự nhà trường'],
      ['Cột 3', '(3) Rèn luyện phẩm chất nhân ái: Tôn trọng, giúp đỡ người thân, thầy cô, bạn bè'],
      ['Cột 4', '(4) Rèn luyện phẩm chất nhân ái: Tích cực tham gia hoạt động từ thiện, đền ơn đáp nghĩa'],
      ['Cột 5', '(5) Rèn luyện phẩm chất nhân ái: Đoàn kết, hòa nhã với bạn học, xây dựng tập thể vững mạnh'],
      ['Cột 6', '(6) Nhiệm vụ học tập, vào trễ, nghỉ học, không thuộc bài, đồng phục, trực nhật'],
      ['Cột 7', '(7) Hoạt động trải nghiệm, hướng nghiệp, sinh hoạt tập thể'],
      ['Cột 8', '(8) Gian lận trong học tập, kiểm tra, thi cử'],
      ['Cột 9', '(9) Lấy cắp đồ của người khác hoặc tham của rơi'],
      ['Cột 10', '(10) Không trung thực trong cung cấp thông tin, che giấu khuyết điểm'],
      ['Cột 11', '(11) Xúc phạm nhân phẩm, danh dự, thân thể giáo viên, nhân viên, học sinh'],
      ['Cột 12', '(12) Đánh bạc, rượu bia, thuốc lá điện tử, chất kích thích, pháo'],
      ['Cột 13', '(13) Sử dụng điện thoại di động, thiết bị khác trên lớp khi chưa được phép'],
      ['Cột 14', '(14) Đánh nhau, gây rối trật tự an ninh trong và ngoài nhà trường'],
      ['Cột 15', '(15) Sử dụng, trao đổi sản phẩm kích động bạo lực, đồi trụy'],
      ['Cột 16', '(16) Hành vi nghiêm cấm khác theo quy định pháp luật'],
      ['Cột 17', '(17) Không thương yêu, kính trọng ông bà, cha mẹ'],
      ['Cột 18', '(18) Không tham gia tuyên truyền, hoạt động công ích xã hội'],
      ['Cột 19', '(19) Không chấp hành luật an toàn giao thông, trật tự xã hội'],
      ['Cột 20', '(20) Vi phạm nội quy, quy định, quy tắc ứng xử nhà trường'],
      ['Cột 21', '(21) Lãng phí điện, nước, cơ sở vật chất, dụng cụ học tập'],
      ['Cột 22', '(22) Xả rác bừa bãi hoặc bỏ rác không đúng nơi quy định'],
      ['Cột 23', '(23) Mang thức ăn, nước uống hộp xốp, ly nhựa vào phòng học'],
    ];
    const sheet2 = XLSX.utils.aoa_to_sheet(criteria23List);
    sheet2['!cols'] = [{ wch: 10 }, { wch: 75 }];
    XLSX.utils.book_append_sheet(workbook, sheet2, 'Chu_Thich_23_Tieu_Chi');

    XLSX.writeFile(workbook, `Bang_Theo_Doi_Ket_Qua_Ren_Luyen_Thang_${month}_Lop_${className}.xlsx`);
  },
};

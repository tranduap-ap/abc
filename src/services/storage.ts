import {
  Student,
  Rule,
  IncidentRecord,
  TeacherSettings,
  StudentScoreSummary,
  GroupScoreSummary,
  MessageLog,
  SchoolCompetitionRecord,
  FundTransaction,
  FundSummary,
} from '../types';
import {
  DEFAULT_STUDENTS,
  DEFAULT_RULES,
  DEFAULT_TEACHER_SETTINGS,
  INITIAL_INCIDENTS,
} from '../data/defaultData';

const STORAGE_KEYS = {
  STUDENTS: 'ne_nep_10a7_students_v2',
  RULES: 'ne_nep_10a7_rules_v2',
  INCIDENTS: 'ne_nep_10a7_incidents_v2',
  SETTINGS: 'ne_nep_10a7_settings_v2',
  MESSAGE_LOGS: 'ne_nep_10a7_logs_v2',
  COMPETITION: 'ne_nep_10a7_competition_v4',
  FUND: 'ne_nep_10a7_fund_v3',
};

export const INITIAL_COMPETITIONS: SchoolCompetitionRecord[] = [
  {
    id: 'comp-w01',
    week: 1,
    semester: 1,
    date: '2026-09-08',
    lessonLogScore: 19.5, // ĐTB Sổ đầu bài (tối đa 20đ)
    competitionAuditScore: 98.0, // Sổ chấm điểm thi đua (thang 100đ)
    disciplineDeductionScore: 0.5, // Sổ ghi nhận nề nếp (-0.5đ)
    otherViolationDeductionScore: 0.0, // Vi phạm khác (0đ)
    totalScore: 117.0, // 19.5 + 98.0 - 0.5 - 0 = 117.0
    schoolRank: 2,
    totalClasses: 32,
    rating: 'Xuất sắc',
    evaluation: 'Nề nếp tuần đầu nghiêm túc, tiết học tốt đạt 100%, trừ 0.5đ trang phục.',
    recordedBy: 'Lớp trưởng Nguyễn Hoàng An',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'comp-w02',
    week: 2,
    semester: 1,
    date: '2026-09-15',
    lessonLogScore: 20.0,
    competitionAuditScore: 100.0,
    disciplineDeductionScore: 0.0,
    otherViolationDeductionScore: 0.0,
    totalScore: 120.0, // 20.0 + 100.0 - 0 - 0 = 120.0
    schoolRank: 1,
    totalClasses: 32,
    rating: 'Nhất tuần',
    evaluation: 'Đạt cờ thi đua Nhất tuần toàn trường. Điểm tối đa không có vi phạm.',
    recordedBy: 'GVCN Thầy Trần Văn Dư',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'comp-w03',
    week: 3,
    semester: 1,
    date: '2026-09-22',
    lessonLogScore: 19.0,
    competitionAuditScore: 97.0,
    disciplineDeductionScore: 1.5, // Trừ nề nếp 1.5đ
    otherViolationDeductionScore: 0.5, // Vi phạm khác 0.5đ
    totalScore: 114.0, // 19.0 + 97.0 - 1.5 - 0.5 = 114.0
    schoolRank: 4,
    totalClasses: 32,
    rating: 'Tốt',
    evaluation: 'Học tập duy trì tốt. Có trừ nề nếp do trực nhật muộn và 1 lỗi xả rác.',
    recordedBy: 'Lớp trưởng Nguyễn Hoàng An',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'comp-w04',
    week: 4,
    semester: 1,
    date: '2026-09-29',
    lessonLogScore: 20.0,
    competitionAuditScore: 100.0,
    disciplineDeductionScore: 0.5,
    otherViolationDeductionScore: 0.0,
    totalScore: 119.5, // 20.0 + 100.0 - 0.5 - 0 = 119.5
    schoolRank: 1,
    totalClasses: 32,
    rating: 'Nhất tuần',
    evaluation: 'Giành lại cờ thi đua Nhất tuần toàn trường. Tiết học tốt và thi đua xuất sắc.',
    recordedBy: 'Lớp trưởng Nguyễn Hoàng An',
    updatedAt: new Date().toISOString(),
  },
];

// Xóa toàn bộ dữ liệu mẫu của thủ quỹ theo yêu cầu của Thầy Dư để bắt đầu thu chi thực tế
export const INITIAL_FUND_TRANSACTIONS: FundTransaction[] = [];

export const storageService = {
  // Settings
  getSettings(): TeacherSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (data) {
        const parsed = JSON.parse(data);
        if (parsed.schoolName?.includes('Ngô Quyền')) {
          parsed.schoolName = 'Trường THPT An Phú';
        }
        if (!parsed.teacherPhone || parsed.teacherPhone.includes('0912')) {
          parsed.teacherPhone = '038286427';
          parsed.teacherZalo = '038286427';
        }
        if (!parsed.academicYearsList || !Array.isArray(parsed.academicYearsList) || parsed.academicYearsList.length === 0) {
          parsed.academicYearsList = DEFAULT_TEACHER_SETTINGS.academicYearsList;
        }
        if (!parsed.schoolNamesList || !Array.isArray(parsed.schoolNamesList) || parsed.schoolNamesList.length === 0) {
          parsed.schoolNamesList = DEFAULT_TEACHER_SETTINGS.schoolNamesList;
        }
        return {
          ...DEFAULT_TEACHER_SETTINGS,
          ...parsed,
        };
      }
    } catch (e) {
      console.error('Failed reading settings from storage', e);
    }
    return DEFAULT_TEACHER_SETTINGS;
  },

  saveSettings(settings: TeacherSettings): void {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  },

  // Students
  getStudents(): Student[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.STUDENTS);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error('Failed reading students from storage', e);
    }
    return DEFAULT_STUDENTS;
  },

  saveStudents(students: Student[]): void {
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
  },

  addStudent(student: Omit<Student, 'id'>): Student {
    const students = this.getStudents();
    const newStudent: Student = {
      ...student,
      id: `hs-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    };
    students.push(newStudent);
    this.saveStudents(students);
    return newStudent;
  },

  updateStudent(student: Student): void {
    const students = this.getStudents();
    const idx = students.findIndex((s) => s.id === student.id);
    if (idx !== -1) {
      students[idx] = student;
      this.saveStudents(students);
    }
  },

  deleteStudent(id: string): void {
    const students = this.getStudents().filter((s) => s.id !== id);
    this.saveStudents(students);
  },

  // Rules
  getRules(): Rule[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.RULES);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error('Failed reading rules from storage', e);
    }
    return DEFAULT_RULES;
  },

  saveRules(rules: Rule[]): void {
    localStorage.setItem(STORAGE_KEYS.RULES, JSON.stringify(rules));
  },

  // Incidents
  getIncidents(): IncidentRecord[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.INCIDENTS);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error('Failed reading incidents from storage', e);
    }
    return INITIAL_INCIDENTS;
  },

  saveIncidents(incidents: IncidentRecord[]): void {
    localStorage.setItem(STORAGE_KEYS.INCIDENTS, JSON.stringify(incidents));
  },

  addIncident(
    incident: Omit<IncidentRecord, 'id' | 'createdAt'>
  ): IncidentRecord {
    const incidents = this.getIncidents();
    const newRecord: IncidentRecord = {
      ...incident,
      id: `inc-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date().toISOString(),
    };
    incidents.unshift(newRecord);
    this.saveIncidents(incidents);
    return newRecord;
  },

  deleteIncident(id: string): void {
    const incidents = this.getIncidents().filter((inc) => inc.id !== id);
    this.saveIncidents(incidents);
  },

  // Message Logs
  getMessageLogs(): MessageLog[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MESSAGE_LOGS);
      if (data) return JSON.parse(data);
    } catch (e) {
      console.error('Failed reading message logs', e);
    }
    return [];
  },

  saveMessageLogs(logs: MessageLog[]): void {
    localStorage.setItem(STORAGE_KEYS.MESSAGE_LOGS, JSON.stringify(logs));
  },

  addMessageLog(log: Omit<MessageLog, 'id' | 'sentAt'>): MessageLog {
    const logs = this.getMessageLogs();
    const newLog: MessageLog = {
      ...log,
      id: `msg-${Date.now()}`,
      sentAt: new Date().toISOString(),
    };
    logs.unshift(newLog);
    this.saveMessageLogs(logs);
    return newLog;
  },

  // Calculations
  calculateStudentSummaries(
    students: Student[],
    allIncidents: IncidentRecord[],
    filterType: 'week' | 'month' | 'all',
    filterValue: number,
    baseScore: number = 100
  ): StudentScoreSummary[] {
    const filteredIncidents = allIncidents.filter((inc) => {
      if (filterType === 'week') return inc.week === filterValue;
      if (filterType === 'month') return inc.month === filterValue;
      return true;
    });

    return students.map((student) => {
      const studentIncidents = filteredIncidents.filter(
        (inc) => inc.studentId === student.id
      );

      let rewardPoints = 0;
      let violationPoints = 0;
      let rewardCount = 0;
      let violationCount = 0;

      studentIncidents.forEach((inc) => {
        const qty = inc.quantity && inc.quantity > 0 ? inc.quantity : 1;
        if (inc.category === 'reward') {
          rewardPoints += Math.abs(inc.points);
          rewardCount += qty;
        } else {
          violationPoints += Math.abs(inc.points);
          violationCount += qty;
        }
      });

      const totalScore = baseScore + rewardPoints - violationPoints;

      let rankTitle: StudentScoreSummary['rankTitle'] = 'Tốt';
      if (totalScore >= 90) {
        rankTitle = 'Tốt';
      } else if (totalScore >= 80) {
        rankTitle = 'Khá';
      } else if (totalScore >= 70) {
        rankTitle = 'Đạt';
      } else {
        rankTitle = 'Chưa đạt';
      }

      return {
        student,
        baseScore,
        rewardPoints,
        violationPoints,
        totalScore,
        rewardCount,
        violationCount,
        rankTitle,
        incidents: studentIncidents,
      };
    });
  },

  calculateGroupSummaries(
    summaries: StudentScoreSummary[]
  ): GroupScoreSummary[] {
    const groups = [1, 2, 3, 4];

    const groupData = groups.map((grp) => {
      const inGroup = summaries.filter((s) => s.student.group === grp);
      const studentCount = inGroup.length || 1;
      const totalScore = inGroup.reduce((acc, curr) => acc + curr.totalScore, 0);
      const totalViolations = inGroup.reduce(
        (acc, curr) => acc + curr.violationCount,
        0
      );
      const totalRewards = inGroup.reduce(
        (acc, curr) => acc + curr.rewardCount,
        0
      );
      const totalRewardPoints = inGroup.reduce((acc, curr) => acc + curr.rewardPoints, 0);
      const totalViolationPoints = inGroup.reduce((acc, curr) => acc + curr.violationPoints, 0);
      const averageScore = Math.round((totalScore / studentCount) * 10) / 10;
      const rankTitle = averageScore >= 90 ? 'Tốt' : averageScore >= 75 ? 'Khá' : averageScore >= 50 ? 'Đạt' : 'Chưa đạt';

      return {
        group: grp,
        studentCount: inGroup.length,
        totalScore,
        averageScore,
        totalViolations,
        totalRewards,
        totalRewardPoints,
        totalViolationPoints,
        totalRewardCount: totalRewards,
        totalViolationCount: totalViolations,
        rankTitle,
        rank: 1, // calculated below
      };
    });

    // Rank groups descending by averageScore
    const sorted = [...groupData].sort((a, b) => b.averageScore - a.averageScore);
    sorted.forEach((item, index) => {
      item.rank = index + 1;
    });

    return groupData;
  },

  // Import / Export / Reset
  // Competition Records (Thi Đua Toàn Trường)
  getCompetitionRecords(): SchoolCompetitionRecord[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.COMPETITION);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Failed reading competition records', e);
    }
    return INITIAL_COMPETITIONS;
  },

  saveCompetitionRecords(records: SchoolCompetitionRecord[]): void {
    localStorage.setItem(STORAGE_KEYS.COMPETITION, JSON.stringify(records));
  },

  addCompetitionRecord(
    record: Omit<SchoolCompetitionRecord, 'id' | 'updatedAt'>
  ): SchoolCompetitionRecord {
    const records = this.getCompetitionRecords();
    const newRecord: SchoolCompetitionRecord = {
      ...record,
      id: `comp-${Date.now()}`,
      updatedAt: new Date().toISOString(),
    };
    records.unshift(newRecord);
    this.saveCompetitionRecords(records);
    return newRecord;
  },

  updateCompetitionRecord(updated: SchoolCompetitionRecord): void {
    const records = this.getCompetitionRecords();
    const idx = records.findIndex((r) => r.id === updated.id);
    if (idx !== -1) {
      records[idx] = {
        ...updated,
        updatedAt: new Date().toISOString(),
      };
      this.saveCompetitionRecords(records);
    }
  },

  deleteCompetitionRecord(id: string): void {
    const records = this.getCompetitionRecords().filter((r) => r.id !== id);
    this.saveCompetitionRecords(records);
  },

  // Fund Transactions (Quỹ Lớp 10A7 - Thủ Quỹ Quản Lý)
  getFundTransactions(): FundTransaction[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.FUND);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Failed reading fund transactions', e);
    }
    return INITIAL_FUND_TRANSACTIONS;
  },

  saveFundTransactions(transactions: FundTransaction[]): void {
    localStorage.setItem(STORAGE_KEYS.FUND, JSON.stringify(transactions));
  },

  addFundTransaction(
    tx: Omit<FundTransaction, 'id' | 'createdAt'>
  ): FundTransaction {
    const transactions = this.getFundTransactions();
    const newTx: FundTransaction = {
      ...tx,
      id: `fund-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    transactions.unshift(newTx);
    this.saveFundTransactions(transactions);
    return newTx;
  },

  updateFundTransaction(updated: FundTransaction): void {
    const transactions = this.getFundTransactions();
    const idx = transactions.findIndex((t) => t.id === updated.id);
    if (idx !== -1) {
      transactions[idx] = updated;
      this.saveFundTransactions(transactions);
    }
  },

  deleteFundTransaction(id: string): void {
    const transactions = this.getFundTransactions().filter((t) => t.id !== id);
    this.saveFundTransactions(transactions);
  },

  clearAllFundTransactions(): void {
    this.saveFundTransactions([]);
  },

  calculateFundSummary(transactions: FundTransaction[]): FundSummary {
    let totalIncome = 0;
    let totalExpense = 0;
    let incomeCount = 0;
    let expenseCount = 0;

    transactions.forEach((tx) => {
      const amt = Number(tx.amount) || 0;
      if (tx.type === 'thu') {
        totalIncome += amt;
        incomeCount++;
      } else {
        totalExpense += amt;
        expenseCount++;
      }
    });

    return {
      totalIncome,
      totalExpense,
      currentBalance: totalIncome - totalExpense,
      incomeCount,
      expenseCount,
    };
  },

  exportAllData(): string {
    const exportObject = {
      version: '2.0',
      exportedAt: new Date().toISOString(),
      settings: this.getSettings(),
      students: this.getStudents(),
      rules: this.getRules(),
      incidents: this.getIncidents(),
      messageLogs: this.getMessageLogs(),
      competition: this.getCompetitionRecords(),
      fund: this.getFundTransactions(),
    };
    return JSON.stringify(exportObject, null, 2);
  },

  importAllData(jsonStr: string): boolean {
    try {
      const data = JSON.parse(jsonStr);
      if (data.students && Array.isArray(data.students)) {
        this.saveStudents(data.students);
      }
      if (data.rules && Array.isArray(data.rules)) {
        this.saveRules(data.rules);
      }
      if (data.incidents && Array.isArray(data.incidents)) {
        this.saveIncidents(data.incidents);
      }
      if (data.settings) {
        this.saveSettings(data.settings);
      }
      if (data.messageLogs && Array.isArray(data.messageLogs)) {
        this.saveMessageLogs(data.messageLogs);
      }
      if (data.competition && Array.isArray(data.competition)) {
        this.saveCompetitionRecords(data.competition);
      }
      if (data.fund && Array.isArray(data.fund)) {
        this.saveFundTransactions(data.fund);
      }
      return true;
    } catch (e) {
      console.error('Import failed', e);
      return false;
    }
  },

  resetToDefault(): void {
    localStorage.removeItem(STORAGE_KEYS.STUDENTS);
    localStorage.removeItem(STORAGE_KEYS.RULES);
    localStorage.removeItem(STORAGE_KEYS.INCIDENTS);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    localStorage.removeItem(STORAGE_KEYS.MESSAGE_LOGS);
    localStorage.removeItem(STORAGE_KEYS.COMPETITION);
    localStorage.removeItem(STORAGE_KEYS.FUND);
  },
};

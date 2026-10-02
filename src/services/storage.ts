import {
  Student,
  Rule,
  IncidentRecord,
  TeacherSettings,
  MessageLog,
  SchoolCompetitionRecord,
  FundTransaction,
  StudentScoreSummary,
  GroupScoreSummary,
} from '../types';

const KEYS = {
  SETTINGS: '10a7_settings_v1',
  STUDENTS: '10a7_students_v1',
  RULES: '10a7_rules_v1',
  INCIDENTS: '10a7_incidents_v1',
  MESSAGES: '10a7_messages_v1',
  COMPETITIONS: '10a7_competitions_v1',
  FUNDS: '10a7_funds_v1',
};

const DEFAULT_SETTINGS: TeacherSettings = {
  teacherName: 'Trần Văn Dư',
  className: '10A7',
  schoolName: 'Trường THPT An Phú',
  academicYear: '2025 - 2026',
  academicYearsList: [
    '2024 - 2025',
    '2025 - 2026',
    '2026 - 2027',
    '2027 - 2028',
    '2028 - 2029',
  ],
  teacherPhone: '0912345678',
  baseScore: 100,
  currentWeek: 1,
  currentMonth: 9,
  weeklyFundFeePerStudent: 20000,
};

const DEFAULT_RULES: Rule[] = [
  // Vi phạm Mức 1
  {
    id: 'rule-m1-03',
    code: 'M1-03',
    name: 'Không hoàn thành nhiệm vụ học tập (bỏ bài)',
    category: 'violation',
    points: -2,
    severityLevel: 'Mức 1',
    criterionNumber: 6,
    description: 'Không làm bài tập, thiếu dụng cụ học tập theo yêu cầu',
  },
  {
    id: 'rule-m1-04',
    code: 'M1-04',
    name: 'Vào học trễ / Đi học muộn',
    category: 'violation',
    points: -2,
    severityLevel: 'Mức 1',
    criterionNumber: 6,
    description: 'Đi học trễ hoặc vào lớp muộn sau trống báo',
  },
  {
    id: 'rule-m1-06',
    code: 'M1-06',
    name: 'Không thuộc bài, không soạn bài',
    category: 'violation',
    points: -2,
    severityLevel: 'Mức 1',
    criterionNumber: 6,
    description: 'Kiểm tra miệng không thuộc bài hoặc chưa chuẩn bị bài mới',
  },
  {
    id: 'rule-m1-07',
    code: 'M1-07',
    name: 'Mất trật tự trong giờ học, nói chuyện riêng',
    category: 'violation',
    points: -2,
    severityLevel: 'Mức 1',
    criterionNumber: 20,
    description: 'Nói chuyện riêng, làm việc riêng trong tiết học',
  },
  {
    id: 'rule-m1-07b',
    code: 'M1-07b',
    name: 'Tự ý đổi chỗ ngồi, ngồi sai sơ đồ lớp',
    category: 'violation',
    points: -2,
    severityLevel: 'Mức 1',
    criterionNumber: 20,
    description: 'Ngồi không đúng vị trí sơ đồ lớp GVCN đã sắp xếp',
  },
  {
    id: 'rule-m1-08',
    code: 'M1-08',
    name: 'Không đồng phục / Sai quy định đồng phục',
    category: 'violation',
    points: -2,
    severityLevel: 'Mức 1',
    criterionNumber: 6,
    description: 'Thiếu bảng tên, mang dép lê, áo không bỏ vào quần',
  },
  {
    id: 'rule-m1-09',
    code: 'M1-09',
    name: 'Ngủ gục trong giờ học',
    category: 'violation',
    points: -2,
    severityLevel: 'Mức 1',
    criterionNumber: 6,
    description: 'Ngủ gật trong thời gian tiết học đang diễn ra',
  },
  {
    id: 'rule-m1-10',
    code: 'M1-10',
    name: 'Không trực vệ sinh lớp, hành lang, cầu thang',
    category: 'violation',
    points: -2,
    severityLevel: 'Mức 1',
    criterionNumber: 6,
    description: 'Bỏ trực nhật tổ theo phân công',
  },
  {
    id: 'rule-m1-11',
    code: 'M1-11',
    name: 'Trực nhật vệ sinh trễ',
    category: 'violation',
    points: -1,
    severityLevel: 'Mức 1',
    criterionNumber: 6,
    description: 'Thực hiện vệ sinh lớp học muộn giờ quy định',
  },
  {
    id: 'rule-m1-12',
    code: 'M1-12',
    name: 'Trốn tránh hoặc không tham gia lao động tập thể',
    category: 'violation',
    points: -2,
    severityLevel: 'Mức 1',
    criterionNumber: 7,
    description: 'Vắng mặt hoặc không tích cực khi lao động chung',
  },
  {
    id: 'rule-m1-18',
    code: 'M1-18',
    name: 'Xả rác bừa bãi không đúng nơi quy định',
    category: 'violation',
    points: -2,
    severityLevel: 'Mức 1',
    criterionNumber: 22,
    description: 'Bỏ rác trong hộc bàn, hành lang, sân trường',
  },
  {
    id: 'rule-m1-19',
    code: 'M1-19',
    name: 'Mang thức ăn, nước uống hộp, ly nhựa vào phòng học',
    category: 'violation',
    points: -2,
    severityLevel: 'Mức 1',
    criterionNumber: 23,
    description: 'Vi phạm quy định hạn chế rác thải nhựa và vệ sinh phòng học',
  },
  {
    id: 'rule-m1-20',
    code: 'M1-20',
    name: 'Nghỉ học không xin phép',
    category: 'violation',
    points: -4,
    severityLevel: 'Mức 1',
    criterionNumber: 6,
    description: 'Vắng học không có giấy phép hoặc phụ huynh chưa báo GVCN',
  },
  // Vi phạm Mức 2
  {
    id: 'rule-m2-03',
    code: 'M2-03',
    name: 'Sử dụng điện thoại di động trái phép trong giờ học',
    category: 'violation',
    points: -12,
    severityLevel: 'Mức 2',
    criterionNumber: 13,
    description: 'Dùng điện thoại khi giáo viên chưa cho phép phục vụ học tập',
  },
  {
    id: 'rule-m2-04',
    code: 'M2-04',
    name: 'Gian lận trong kiểm tra, thi cử',
    category: 'violation',
    points: -12,
    severityLevel: 'Mức 2',
    criterionNumber: 8,
    description: 'Xem tài liệu, quay cóp trong giờ kiểm tra',
  },
  // Vi phạm Mức 3
  {
    id: 'rule-m3-01',
    code: 'M3-01',
    name: 'Đánh nhau, gây mất trật tự an ninh trường học',
    category: 'violation',
    points: -32,
    severityLevel: 'Mức 3',
    criterionNumber: 14,
    description: 'Vi phạm nghiêm trọng nội quy nhà trường',
  },
  // Khen thưởng (+)
  {
    id: 'rule-r05',
    code: 'R05',
    name: 'Tích cực phát biểu xây dựng bài',
    category: 'reward',
    points: 1,
    severityLevel: 'Khen thưởng',
    description: 'Giơ tay phát biểu đúng và tích cực trong tiết học',
  },
  {
    id: 'rule-r06',
    code: 'R06',
    name: 'Trả bài, làm bài đạt điểm bông hồng (8 - 10 điểm)',
    category: 'reward',
    points: 1,
    severityLevel: 'Khen thưởng',
    description: 'Đạt điểm giỏi từ 8 đến 10 điểm trong các môn học',
  },
  {
    id: 'rule-r07',
    code: 'R07',
    name: 'Xung phong giải bài tập khó trên bảng',
    category: 'reward',
    points: 2,
    severityLevel: 'Khen thưởng',
    description: 'Giải đúng bài tập nâng cao hoặc bài khó do giáo viên giao',
  },
  {
    id: 'rule-r08',
    code: 'R08',
    name: 'Hoạt động nhóm & Thuyết trình xuất sắc',
    category: 'reward',
    points: 2,
    severityLevel: 'Khen thưởng',
    description: 'Đại diện nhóm thuyết trình hoặc hoàn thành tốt dự án học tập',
  },
];

function safeRead<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function safeWrite(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error('Lỗi lưu localStorage:', err);
  }
}

export const storageService = {
  // 1. Settings
  getSettings(): TeacherSettings {
    const saved = safeRead<Partial<TeacherSettings>>(KEYS.SETTINGS, {});
    return { ...DEFAULT_SETTINGS, ...saved };
  },
  saveSettings(settings: TeacherSettings): void {
    safeWrite(KEYS.SETTINGS, settings);
  },

  // 2. Students
  getStudents(): Student[] {
    return safeRead<Student[]>(KEYS.STUDENTS, []);
  },
  saveStudents(students: Student[]): void {
    safeWrite(KEYS.STUDENTS, students);
  },
  addStudent(studentData: Omit<Student, 'id'>): Student {
    const list = this.getStudents();
    const newStudent: Student = {
      ...studentData,
      id: `hs-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    };
    this.saveStudents([...list, newStudent]);
    return newStudent;
  },
  updateStudent(updated: Student): void {
    const list = this.getStudents().map((s) =>
      s.id === updated.id ? updated : s
    );
    this.saveStudents(list);
  },
  deleteStudent(id: string): void {
    const list = this.getStudents().filter((s) => s.id !== id);
    this.saveStudents(list);
  },

  // 3. Rules
  getRules(): Rule[] {
    const saved = safeRead<Rule[]>(KEYS.RULES, []);
    return saved.length > 0 ? saved : DEFAULT_RULES;
  },
  saveRules(rules: Rule[]): void {
    safeWrite(KEYS.RULES, rules);
  },

  // 4. Incidents
  getIncidents(): IncidentRecord[] {
    return safeRead<IncidentRecord[]>(KEYS.INCIDENTS, []);
  },
  saveIncidents(incidents: IncidentRecord[]): void {
    safeWrite(KEYS.INCIDENTS, incidents);
  },
  addIncident(data: Omit<IncidentRecord, 'id' | 'createdAt'>): IncidentRecord {
    const list = this.getIncidents();
    const newRec: IncidentRecord = {
      ...data,
      id: `inc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      createdAt: new Date().toISOString(),
    };
    this.saveIncidents([newRec, ...list]);
    return newRec;
  },
  deleteIncident(id: string): void {
    const list = this.getIncidents().filter((i) => i.id !== id);
    this.saveIncidents(list);
  },

  // 5. Message Logs
  getMessageLogs(): MessageLog[] {
    return safeRead<MessageLog[]>(KEYS.MESSAGES, []);
  },
  addMessageLog(data: Omit<MessageLog, 'id' | 'sentAt'>): MessageLog {
    const list = this.getMessageLogs();
    const newLog: MessageLog = {
      ...data,
      id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      sentAt: new Date().toISOString(),
    };
    safeWrite(KEYS.MESSAGES, [newLog, ...list]);
    return newLog;
  },

  // 6. School Competition Records
  getCompetitionRecords(): SchoolCompetitionRecord[] {
    return safeRead<SchoolCompetitionRecord[]>(KEYS.COMPETITIONS, []);
  },
  saveCompetitionRecords(records: SchoolCompetitionRecord[]): void {
    safeWrite(KEYS.COMPETITIONS, records);
  },
  addCompetitionRecord(
    data: Omit<SchoolCompetitionRecord, 'id' | 'updatedAt'>
  ): SchoolCompetitionRecord {
    const list = this.getCompetitionRecords();
    const newRec: SchoolCompetitionRecord = {
      ...data,
      id: `comp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      updatedAt: new Date().toISOString(),
    };
    this.saveCompetitionRecords([newRec, ...list]);
    return newRec;
  },
  updateCompetitionRecord(updated: SchoolCompetitionRecord): void {
    const list = this.getCompetitionRecords().map((r) =>
      r.id === updated.id
        ? { ...updated, updatedAt: new Date().toISOString() }
        : r
    );
    this.saveCompetitionRecords(list);
  },
  deleteCompetitionRecord(id: string): void {
    const list = this.getCompetitionRecords().filter((r) => r.id !== id);
    this.saveCompetitionRecords(list);
  },

  // 7. Class Fund Transactions
  getFundTransactions(): FundTransaction[] {
    return safeRead<FundTransaction[]>(KEYS.FUNDS, []);
  },
  saveFundTransactions(txs: FundTransaction[]): void {
    safeWrite(KEYS.FUNDS, txs);
  },
  addFundTransaction(
    data: Omit<FundTransaction, 'id' | 'createdAt'>
  ): FundTransaction {
    const list = this.getFundTransactions();
    const newTx: FundTransaction = {
      ...data,
      id: `fund-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      createdAt: new Date().toISOString(),
    };
    this.saveFundTransactions([newTx, ...list]);
    return newTx;
  },
  updateFundTransaction(updated: FundTransaction): void {
    const list = this.getFundTransactions().map((t) =>
      t.id === updated.id ? updated : t
    );
    this.saveFundTransactions(list);
  },
  deleteFundTransaction(id: string): void {
    const list = this.getFundTransactions().filter((t) => t.id !== id);
    this.saveFundTransactions(list);
  },
  clearAllFundTransactions(): void {
    this.saveFundTransactions([]);
  },
  calculateFundSummary(transactions: FundTransaction[]) {
    let totalIncome = 0;
    let totalExpense = 0;
    let incomeCount = 0;
    let expenseCount = 0;

    transactions.forEach((tx) => {
      if (tx.type === 'thu') {
        totalIncome += Number(tx.amount) || 0;
        incomeCount += 1;
      } else {
        totalExpense += Number(tx.amount) || 0;
        expenseCount += 1;
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

  // 8. Summaries & Rankings Calculation
  calculateStudentSummaries(
    students: Student[],
    incidents: IncidentRecord[],
    filterType: 'week' | 'month',
    filterValue: number,
    baseScore: number = 100
  ): StudentScoreSummary[] {
    const filteredIncidents = incidents.filter((inc) =>
      filterType === 'week'
        ? inc.week === filterValue
        : inc.month === filterValue
    );

    const rawSummaries = students.map((student) => {
      const stIncidents = filteredIncidents.filter(
        (i) => i.studentId === student.id
      );

      let rewardPoints = 0;
      let violationPoints = 0;
      let rewardCount = 0;
      let violationCount = 0;

      stIncidents.forEach((inc) => {
        const qty = inc.quantity && inc.quantity > 0 ? inc.quantity : 1;
        if (inc.category === 'reward' || inc.points > 0) {
          rewardPoints += Math.abs(inc.points);
          rewardCount += qty;
        } else {
          violationPoints += Math.abs(inc.points);
          violationCount += qty;
        }
      });

      const rawTotal = baseScore + rewardPoints - violationPoints;
      const totalScore = Math.max(0, Math.min(100, rawTotal));

      // Quy chuẩn xếp loại: Tốt (90-100), Khá (80-<90), Đạt (70-<80), Chưa đạt (<70)
      let rankTitle: 'Tốt' | 'Khá' | 'Đạt' | 'Chưa đạt' = 'Tốt';
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
        violationCount,
        rewardCount,
        rank: 1,
        rankTitle,
        incidents: stIncidents,
      };
    });

    const sortedByScore = [...rawSummaries].sort(
      (a, b) => b.totalScore - a.totalScore
    );

    return rawSummaries.map((item) => {
      const rankIndex = sortedByScore.findIndex(
        (x) => x.student.id === item.student.id
      );
      return {
        ...item,
        rank: rankIndex + 1,
      };
    });
  },

  calculateGroupSummaries(
    studentSummaries: StudentScoreSummary[]
  ): GroupScoreSummary[] {
    const groups = [1, 2, 3, 4];
    const rawGroups: GroupScoreSummary[] = groups.map((grp) => {
      const members = studentSummaries.filter((s) => s.student.group === grp);
      const studentCount = members.length;
      const totalScore = members.reduce((sum, m) => sum + m.totalScore, 0);
      const averageScore =
        studentCount > 0 ? Math.round((totalScore / studentCount) * 10) / 10 : 100;
      const totalViolations = members.reduce(
        (sum, m) => sum + m.violationCount,
        0
      );
      const totalRewards = members.reduce((sum, m) => sum + m.rewardCount, 0);

      return {
        group: grp,
        studentCount,
        totalScore,
        averageScore,
        totalViolations,
        totalRewards,
        rank: 1,
      };
    });

    const sorted = [...rawGroups].sort(
      (a, b) => b.averageScore - a.averageScore
    );

    return rawGroups.map((g) => ({
      ...g,
      rank: sorted.findIndex((x) => x.group === g.group) + 1,
    }));
  },

  // 9. Backup / Restore / Reset
  exportAllData(): string {
    const data = {
      settings: this.getSettings(),
      students: this.getStudents(),
      rules: this.getRules(),
      incidents: this.getIncidents(),
      messageLogs: this.getMessageLogs(),
      competitions: this.getCompetitionRecords(),
      fundTransactions: this.getFundTransactions(),
    };
    return JSON.stringify(data, null, 2);
  },

  importAllData(jsonStr: string): boolean {
    try {
      const parsed = JSON.parse(jsonStr);
      if (!parsed || typeof parsed !== 'object') return false;
      if (parsed.settings) this.saveSettings(parsed.settings);
      if (Array.isArray(parsed.students)) this.saveStudents(parsed.students);
      if (Array.isArray(parsed.rules)) this.saveRules(parsed.rules);
      if (Array.isArray(parsed.incidents)) this.saveIncidents(parsed.incidents);
      if (Array.isArray(parsed.messageLogs))
        safeWrite(KEYS.MESSAGES, parsed.messageLogs);
      if (Array.isArray(parsed.competitions))
        this.saveCompetitionRecords(parsed.competitions);
      if (Array.isArray(parsed.fundTransactions))
        this.saveFundTransactions(parsed.fundTransactions);
      return true;
    } catch {
      return false;
    }
  },

  resetToDefault(): void {
    this.saveSettings(DEFAULT_SETTINGS);
    this.saveStudents([]);
    this.saveRules(DEFAULT_RULES);
    this.saveIncidents([]);
    safeWrite(KEYS.MESSAGES, []);
    this.saveCompetitionRecords([]);
    this.saveFundTransactions([]);
  },
};

// ============================================================================
// ĐỒNG BỘ DỮ LIỆU ĐÁM MÂY TỰ ĐỘNG CHO PROJECT: tinhoc-724e2
// ============================================================================
const CANDIDATE_URLS = [
  'https://tinhoc-724e2-default-rtdb.asia-southeast1.firebasedatabase.app',
  'https://tinhoc-724e2-default-rtdb.firebaseio.com',
];

let activeFirebaseUrl = CANDIDATE_URLS[0];
let isSyncingFromCloud = false;
let lastSyncedTimestamp = 0;

async function resolveFirebaseUrl(): Promise<string> {
  for (const url of CANDIDATE_URLS) {
    try {
      const res = await fetch(`${url}/lop10a7_data.json`, { method: 'GET' });
      if (res.ok) {
        activeFirebaseUrl = url;
        return url;
      }
    } catch {
      // Thử link tiếp theo
    }
  }
  return activeFirebaseUrl;
}

export async function syncToCloud() {
  if (isSyncingFromCloud) return;
  try {
    const allDataJson = storageService.exportAllData();
    const accounts = localStorage.getItem('10a7_role_accounts_v1');
    const now = Date.now();
    lastSyncedTimestamp = now;

    const payload = {
      appData: JSON.parse(allDataJson),
      accounts: accounts ? JSON.parse(accounts) : null,
      updatedAt: now,
    };

    await fetch(`${activeFirebaseUrl}/lop10a7_data.json`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch (err) {
    console.error('Lỗi khi lưu dữ liệu lên đám mây:', err);
  }
}

export async function pullFromCloud(onDataChanged: () => void) {
  try {
    const res = await fetch(`${activeFirebaseUrl}/lop10a7_data.json`);
    if (!res.ok) return;
    const cloudData = await res.json();

    if (!cloudData || !cloudData.appData) {
      await syncToCloud();
      return;
    }

    if (cloudData.updatedAt && cloudData.updatedAt > lastSyncedTimestamp) {
      lastSyncedTimestamp = cloudData.updatedAt;
      isSyncingFromCloud = true;
      storageService.importAllData(JSON.stringify(cloudData.appData));
      if (cloudData.accounts) {
        localStorage.setItem('10a7_role_accounts_v1', JSON.stringify(cloudData.accounts));
      }
      onDataChanged();
      setTimeout(() => {
        isSyncingFromCloud = false;
      }, 300);
    }
  } catch (err) {
    console.error('Lỗi khi tải dữ liệu từ đám mây:', err);
  }
}

export async function initCloudSync(onDataChanged: () => void) {
  await resolveFirebaseUrl();
  await pullFromCloud(onDataChanged);

  setInterval(() => {
    if (!isSyncingFromCloud) {
      pullFromCloud(onDataChanged);
    }
  }, 3000);
}

const methodsToHook = [
  'saveSettings',
  'saveStudents',
  'addStudent',
  'updateStudent',
  'deleteStudent',
  'saveRules',
  'saveIncidents',
  'addIncident',
  'deleteIncident',
  'addMessageLog',
  'saveCompetitionRecords',
  'addCompetitionRecord',
  'updateCompetitionRecord',
  'deleteCompetitionRecord',
  'saveFundTransactions',
  'addFundTransaction',
  'updateFundTransaction',
  'deleteFundTransaction',
  'clearAllFundTransactions',
  'resetToDefault',
  'importAllData',
];

methodsToHook.forEach((methodName) => {
  const originalMethod = (storageService as any)[methodName];
  if (typeof originalMethod === 'function') {
    (storageService as any)[methodName] = function (...args: any[]) {
      const result = originalMethod.apply(this, args);
      if (!isSyncingFromCloud) {
        setTimeout(() => syncToCloud(), 100);
      }
      return result;
    };
  }
});

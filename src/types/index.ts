export type Gender = 'Nam' | 'Nữ';

export type StudentRole =
  | 'Lớp trưởng'
  | 'Lớp phó học tập'
  | 'Lớp phó lao động'
  | 'Lớp phó trật tự'
  | 'Lớp phó'
  | 'Thủ quỹ'
  | 'Bí thư'
  | 'Tổ trưởng'
  | 'Cờ đỏ'
  | 'Học sinh';

export type RuleDomain = 'hoc_tap' | 've_sinh' | 'trat_tu' | 'khac';

export type AppUserRole =
  | 'gvcn'
  | 'lop_truong'
  | 'thu_quy'
  | 'to_truong_1'
  | 'to_truong_2'
  | 'to_truong_3'
  | 'to_truong_4'
  | 'pho_hoc_tap'
  | 'pho_lao_dong'
  | 'pho_trat_tu';

export interface UserRoleInfo {
  id: AppUserRole;
  title: string;
  shortTitle: string;
  badgeColor: string;
  description: string;
  allowedGroup?: number;
  allowedDomain?: RuleDomain;
  canManageSettings: boolean;
  canSendNotifications: boolean;
  canInputCompetitionScore?: boolean;
  canManageFund?: boolean;
}

export interface RoleAccount {
  role: AppUserRole;
  username: string;
  password: string;
  displayName: string;
  roleTitle: string;
  note: string;
}

export interface Student {
  id: string;
  rollNumber: number; // STT 1..40
  name: string;
  gender: Gender;
  group: number; // Tổ 1, 2, 3, 4
  role: StudentRole;
  parentName: string;
  parentPhone: string;
  dateOfBirth?: string;
  address?: string;
  note?: string;
}

export type RuleCategory = 'violation' | 'reward';

export interface Rule {
  id: string;
  code: string;
  name: string;
  category: RuleCategory;
  points: number; // Negative for violation, positive for reward
  description: string;
  iconName?: string;
  severityLevel?: 'MĐ1' | 'MĐ2' | 'MĐ3' | 'KhenThưởng';
  criterionNumber?: number; // 1..23 mapping to columns in monthly record table
  domain?: RuleDomain; // 'hoc_tap' | 've_sinh' | 'trat_tu' | 'khac'
}

export interface IncidentRecord {
  id: string;
  studentId: string;
  studentName: string;
  group: number;
  ruleId: string;
  ruleName: string;
  category: RuleCategory;
  points: number;
  quantity?: number; // Số lượt điểm cộng hoặc điểm trừ (mặc định: 1 lượt)
  date: string; // YYYY-MM-DD
  week: number; // Tuần 1..35
  month: number; // Tháng 9..12, 1..5
  period?: string; // 10 phút đầu giờ, Tiết 1, Tiết 2, Sinh hoạt lớp, v.v.
  reportedBy: string; // Cờ đỏ, Ban cán sự, GVCN Trần Văn Dư, v.v.
  note?: string;
  createdAt: string;
}

export interface TeacherSettings {
  teacherName: string; // Trần Văn Dư
  className: string; // 10A7
  schoolName: string; // Trường THPT An Phú
  schoolNamesList?: string[]; // Danh sách các trường học gợi ý/đã lưu
  academicYear: string; // 2026 - 2027
  academicYearsList?: string[]; // Danh sách các năm học để chọn
  teacherPhone: string;
  teacherZalo: string;
  baseScore: number; // default 100
  currentWeek: number;
  currentMonth: number;
  weeklyFundFeePerStudent?: number; // Mức thu quỹ hàng tuần trên một học sinh (Mặc định: 20.000đ/học sinh)
}

export interface StudentScoreSummary {
  student: Student;
  baseScore: number;
  rewardPoints: number;
  violationPoints: number;
  totalScore: number;
  violationCount: number;
  rewardCount: number;
  rankTitle: 'Tốt' | 'Khá' | 'Đạt' | 'Chưa đạt';
  incidents: IncidentRecord[];
}

export interface GroupScoreSummary {
  group: number;
  studentCount: number;
  totalScore: number;
  averageScore: number;
  totalViolations: number;
  totalRewards: number;
  rank: number;
  totalRewardPoints?: number;
  totalViolationPoints?: number;
  totalRewardCount?: number;
  totalViolationCount?: number;
  rankTitle?: string;
}

export interface MessageLog {
  id: string;
  studentId: string;
  studentName: string;
  parentPhone: string;
  channel: 'zalo' | 'sms' | 'clipboard';
  content: string;
  sentAt: string;
  status: 'sent' | 'pending';
}

export interface SchoolCompetitionRecord {
  id: string;
  week: number;
  semester: 1 | 2;
  date: string;
  lessonLogScore: number;               // ĐTB Sổ đầu bài (Tối đa 20 điểm)
  competitionAuditScore: number;        // Sổ chấm điểm thi đua (Thang điểm 100)
  disciplineDeductionScore: number;     // Sổ ghi nhận nề nếp (Điểm trừ)
  otherViolationDeductionScore: number; // Vi phạm khác (Điểm trừ)
  totalScore: number;                   // Tổng điểm = ĐTB Sổ đầu bài + Sổ chấm điểm thi đua - Sổ ghi nhận nề nếp - Vi phạm khác
  schoolRank: number;                   // Hạng của lớp thi đua toàn trường (1, 2, 3...)
  totalClasses?: number;                // Tổng số lớp toàn trường (mặc định 32)
  rating: string;                       // Nhất tuần / Xuất sắc / Tốt / Khá / Trung bình
  evaluation?: string;                  // Nhận xét của Đoàn trường / Ban thi đua
  recordedBy: string;                   // Lớp trưởng / GVCN Trần Văn Dư
  note?: string;
  updatedAt: string;
}

export type FundTransactionType = 'thu' | 'chi';

export interface FundTransaction {
  id: string;
  type: FundTransactionType; // 'thu' = Tiền thu, 'chi' = Tiền chi
  amount: number;            // Số tiền VNĐ
  title: string;             // Nội dung khoản thu / chi
  category: string;          // Danh mục: Quỹ tuần, Học tập, Vệ sinh, Khen thưởng, Liên hoan, Khác
  date: string;              // YYYY-MM-DD
  week?: number;             // Tuần thu chi (hàng tuần)
  studentCount?: number;     // Số học sinh đóng (đối với thu quỹ hàng tuần)
  feePerStudent?: number;    // Mức thu trên mỗi học sinh (mặc định 20.000đ)
  actor: string;             // Người nộp / Người nhận / Người chi
  receiptNo?: string;        // Số hóa đơn / phiếu thu chi
  hasReceipt: boolean;       // Có chứng từ kèm theo không
  note?: string;
  recordedBy: string;        // Thủ quỹ / GVCN
  createdAt: string;
}

export interface FundSummary {
  totalIncome: number;       // Tổng tiền thu
  totalExpense: number;      // Tổng tiền chi
  currentBalance: number;    // Tổng tồn lại (Thu - Chi)
  incomeCount: number;
  expenseCount: number;
}


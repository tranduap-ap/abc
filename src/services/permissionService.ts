import { AppUserRole, UserRoleInfo, RuleDomain, Rule, Student, RoleAccount } from '../types';

export const USER_ROLES: Record<AppUserRole, UserRoleInfo> = {
  gvcn: {
    id: 'gvcn',
    title: 'GVCN: Thầy Trần Văn Dư',
    shortTitle: 'Thầy Dư (GVCN)',
    badgeColor: 'bg-indigo-600 text-white border-indigo-700',
    description: 'Toàn quyền quản trị hệ thống: Chấm điểm mọi mặt, nhập sổ điểm & hạng thi đua toàn trường, quản lý quỹ lớp, gửi thông báo Zalo/SMS, cài đặt lớp.',
    canManageSettings: true,
    canSendNotifications: true,
    canInputCompetitionScore: true,
    canManageFund: true,
  },
  lop_truong: {
    id: 'lop_truong',
    title: 'Lớp Trưởng',
    shortTitle: 'Lớp Trưởng',
    badgeColor: 'bg-blue-600 text-white border-blue-700',
    description: 'Bao quát toàn diện: Nhập điểm và theo dõi tất cả học sinh trong lớp. Được phân quyền nhập sổ điểm và hạng của lớp thi đua toàn trường. Được gửi thông báo Zalo/SMS cho phụ huynh.',
    canManageSettings: false,
    canSendNotifications: true,
    canInputCompetitionScore: true,
    canManageFund: false,
  },
  thu_quy: {
    id: 'thu_quy',
    title: 'Thủ Quỹ Lớp 10A7',
    shortTitle: 'Thủ Quỹ',
    badgeColor: 'bg-emerald-600 text-white border-emerald-700',
    description: 'Chuyên trách tài chính lớp: Nhập số tiền chi, tiền thu và tổng tồn lại là bao nhiêu. Quản lý sổ quỹ lớp và xuất báo cáo quyết toán.',
    canManageSettings: false,
    canSendNotifications: false,
    canInputCompetitionScore: false,
    canManageFund: true,
  },
  to_truong_1: {
    id: 'to_truong_1',
    title: 'Tổ Trưởng Tổ 1',
    shortTitle: 'Tổ Trưởng 1',
    badgeColor: 'bg-emerald-600 text-white border-emerald-700',
    description: 'Nhập điểm rèn luyện cho các thành viên thuộc Tổ 1 về mọi mặt.',
    allowedGroup: 1,
    canManageSettings: false,
    canSendNotifications: false,
    canInputCompetitionScore: false,
    canManageFund: false,
  },
  to_truong_2: {
    id: 'to_truong_2',
    title: 'Tổ Trưởng Tổ 2',
    shortTitle: 'Tổ Trưởng 2',
    badgeColor: 'bg-teal-600 text-white border-teal-700',
    description: 'Nhập điểm rèn luyện cho các thành viên thuộc Tổ 2 về mọi mặt.',
    allowedGroup: 2,
    canManageSettings: false,
    canSendNotifications: false,
    canInputCompetitionScore: false,
    canManageFund: false,
  },
  to_truong_3: {
    id: 'to_truong_3',
    title: 'Tổ Trưởng Tổ 3',
    shortTitle: 'Tổ Trưởng 3',
    badgeColor: 'bg-cyan-600 text-white border-cyan-700',
    description: 'Nhập điểm rèn luyện cho các thành viên thuộc Tổ 3 về mọi mặt.',
    allowedGroup: 3,
    canManageSettings: false,
    canSendNotifications: false,
    canInputCompetitionScore: false,
    canManageFund: false,
  },
  to_truong_4: {
    id: 'to_truong_4',
    title: 'Tổ Trưởng Tổ 4',
    shortTitle: 'Tổ Trưởng 4',
    badgeColor: 'bg-sky-600 text-white border-sky-700',
    description: 'Nhập điểm rèn luyện cho các thành viên thuộc Tổ 4 về mọi mặt.',
    allowedGroup: 4,
    canManageSettings: false,
    canSendNotifications: false,
    canInputCompetitionScore: false,
    canManageFund: false,
  },
  pho_hoc_tap: {
    id: 'pho_hoc_tap',
    title: 'Lớp Phó Học Tập',
    shortTitle: 'LP Học Tập',
    badgeColor: 'bg-amber-600 text-white border-amber-700',
    description: 'Chuyên trách học tập: Nhập các mặt về học tập cho toàn bộ học sinh (bài vở, kiểm tra, thi cử, phát biểu, điểm hồng, bài khó, dự án...).',
    allowedDomain: 'hoc_tap',
    canManageSettings: false,
    canSendNotifications: false,
    canInputCompetitionScore: false,
    canManageFund: false,
  },
  pho_lao_dong: {
    id: 'pho_lao_dong',
    title: 'Lớp Phó Lao Động',
    shortTitle: 'LP Lao Động',
    badgeColor: 'bg-lime-700 text-white border-lime-800',
    description: 'Chuyên trách vệ sinh: Nhập các mặt về vệ sinh, trực nhật lớp, cầu thang, trốn lao động, xả rác, đồ hộp xốp/ly nhựa...',
    allowedDomain: 've_sinh',
    canManageSettings: false,
    canSendNotifications: false,
    canInputCompetitionScore: false,
    canManageFund: false,
  },
  pho_trat_tu: {
    id: 'pho_trat_tu',
    title: 'Lớp Phó Trật Tự',
    shortTitle: 'LP Trật Tự',
    badgeColor: 'bg-purple-600 text-white border-purple-700',
    description: 'Chuyên trách nề nếp học tập: Nhập các mặt như đổi chỗ ngồi, mất trật tự, nói chuyện nhiều, ngủ gục, vào trễ, điện thoại, đồng phục...',
    allowedDomain: 'trat_tu',
    canManageSettings: false,
    canSendNotifications: false,
    canInputCompetitionScore: false,
    canManageFund: false,
  },
};

export const permissionService = {
  /**
   * Determine rule domain from rule properties
   */
  getRuleDomain(rule: Rule): RuleDomain {
    if (rule.domain) return rule.domain;

    const text = (rule.name + ' ' + (rule.description || '')).toLowerCase();

    // Vệ sinh & Lao động
    if (
      text.includes('vệ sinh') ||
      text.includes('trực nhật') ||
      text.includes('cầu thang') ||
      text.includes('lao động') ||
      text.includes('xả rác') ||
      text.includes('bỏ rác') ||
      text.includes('hộp xốp') ||
      text.includes('ly nhựa') ||
      text.includes('tiết kiệm điện') ||
      text.includes('lãng phí điện') ||
      text.includes('nước')
    ) {
      return 've_sinh';
    }

    // Nề nếp & Trật tự
    if (
      text.includes('chỗ ngồi') ||
      text.includes('đổi chỗ') ||
      text.includes('trật tự') ||
      text.includes('nói chuyện') ||
      text.includes('ngủ gục') ||
      text.includes('vào trễ') ||
      text.includes('đi trễ') ||
      text.includes('đồng phục') ||
      text.includes('điện thoại') ||
      text.includes('thiết bị') ||
      text.includes('nghỉ học') ||
      text.includes('cúp học') ||
      text.includes('gây rối') ||
      text.includes('đánh nhau') ||
      text.includes('quy tắc ứng xử')
    ) {
      return 'trat_tu';
    }

    // Học tập
    if (
      text.includes('học tập') ||
      text.includes('thuộc bài') ||
      text.includes('soạn bài') ||
      text.includes('nhiệm vụ học tập') ||
      text.includes('gian lận') ||
      text.includes('kiểm tra') ||
      text.includes('thi') ||
      text.includes('phát biểu') ||
      text.includes('điểm hồng') ||
      text.includes('trả bài') ||
      text.includes('bài tập khó') ||
      text.includes('thuyết trình') ||
      text.includes('dự án') ||
      text.includes('nhóm')
    ) {
      return 'hoc_tap';
    }

    return 'khac';
  },

  /**
   * Check if current role is allowed to record for a given student
   */
  canRecordForStudent(role?: AppUserRole | null, student?: Student): boolean {
    if (!role || !student) return false;
    const roleInfo = USER_ROLES[role];
    if (!roleInfo) return false;

    // Tổ trưởng is restricted to their assigned group
    if (roleInfo.allowedGroup !== undefined) {
      return student.group === roleInfo.allowedGroup;
    }

    return true;
  },

  /**
   * Check if current role is allowed to record a specific rule
   */
  canRecordRule(role?: AppUserRole | null, rule?: Rule): boolean {
    if (!role || !rule) return false;
    const roleInfo = USER_ROLES[role];
    if (!roleInfo) return false;

    // Domain restricted roles: Lớp phó học tập, Lớp phó lao động, Lớp phó trật tự
    if (roleInfo.allowedDomain !== undefined) {
      const ruleDomain = this.getRuleDomain(rule);
      return ruleDomain === roleInfo.allowedDomain;
    }

    // GVCN, Lớp trưởng, Tổ trưởng are NOT domain-restricted (tổ trưởng nhập các mặt tổ mình)
    return true;
  },

  /**
   * Filter rule list based on active role
   */
  filterRulesForRole(role?: AppUserRole | null, rules: Rule[] = []): Rule[] {
    if (!role) return rules;
    const roleInfo = USER_ROLES[role];
    if (!roleInfo || !roleInfo.allowedDomain) return rules;

    return rules.filter((r) => this.getRuleDomain(r) === roleInfo.allowedDomain);
  },

  /**
   * Filter student list based on active role
   */
  filterStudentsForRole(role?: AppUserRole | null, students: Student[] = []): Student[] {
    if (!role) return students;
    const roleInfo = USER_ROLES[role];
    if (!roleInfo || roleInfo.allowedGroup === undefined) return students;

    return students.filter((s) => s.group === roleInfo.allowedGroup);
  },

  /**
   * Get default reporter name string for incident creation
   */
  getReporterName(role?: AppUserRole | null, teacherName: string = 'Trần Văn Dư'): string {
    if (!role) return 'Khách';
    if (role === 'gvcn') return `GVCN Thầy ${teacherName}`;
    return USER_ROLES[role]?.title || 'Ban cán sự lớp';
  },

  /**
   * Domain friendly display labels
   */
  getDomainLabel(domain: RuleDomain): { label: string; color: string } {
    switch (domain) {
      case 'hoc_tap':
        return { label: 'Học tập', color: 'bg-amber-100 text-amber-800 border-amber-300' };
      case 've_sinh':
        return { label: 'Vệ sinh & Lao động', color: 'bg-lime-100 text-lime-800 border-lime-300' };
      case 'trat_tu':
        return { label: 'Nề nếp & Trật tự', color: 'bg-purple-100 text-purple-800 border-purple-300' };
      default:
        return { label: 'Khác', color: 'bg-slate-100 text-slate-800 border-slate-300' };
    }
  },

  /**
   * Check if role has permission to input class competition scores & school ranks
   * Lớp trưởng và GVCN có quyền nhập sổ điểm và hạng thi đua toàn trường
   */
  canInputCompetitionScore(role?: AppUserRole | null): boolean {
    return role === 'gvcn' || role === 'lop_truong';
  },

  /**
   * Check if role has permission to manage class treasury / fund
   * Thủ quỹ và GVCN có quyền nhập tiền thu, chi và cập nhật tồn quỹ
   */
  canManageFund(role?: AppUserRole | null): boolean {
    return role === 'gvcn' || role === 'thu_quy';
  },
};

export interface RolePersonInfo {
  roleTitle: string;
  personName: string;
  isTeacher: boolean;
  avatarIcon: string;
}

export const getRolePersonInfo = (
  role?: AppUserRole | null,
  students: Student[] = [],
  currentAccount?: RoleAccount | null,
  teacherName: string = 'Trần Văn Dư'
): RolePersonInfo => {
  if (!role || !currentAccount) {
    return {
      roleTitle: 'Chưa Đăng Nhập',
      personName: 'Khách / Xem thông tin',
      isTeacher: false,
      avatarIcon: '🔒',
    };
  }

  if (role === 'gvcn') {
    return {
      roleTitle: 'Giáo Viên Chủ Nhiệm',
      personName: currentAccount?.displayName || `Thầy ${teacherName}`,
      isTeacher: true,
      avatarIcon: '👑',
    };
  }

  // Look up student assigned to this role in students list
  let targetStudent: Student | undefined;
  if (role === 'lop_truong') {
    targetStudent = students.find((s) => s.role === 'Lớp trưởng');
  } else if (role === 'thu_quy') {
    targetStudent = students.find((s) => s.role === 'Thủ quỹ');
  } else if (role === 'pho_hoc_tap') {
    targetStudent = students.find((s) => s.role === 'Lớp phó học tập');
  } else if (role === 'pho_lao_dong') {
    targetStudent = students.find((s) => s.role === 'Lớp phó lao động');
  } else if (role === 'pho_trat_tu') {
    targetStudent = students.find((s) => s.role === 'Lớp phó trật tự');
  } else if (role === 'to_truong_1') {
    targetStudent = students.find((s) => s.group === 1 && s.role === 'Tổ trưởng');
  } else if (role === 'to_truong_2') {
    targetStudent = students.find((s) => s.group === 2 && s.role === 'Tổ trưởng');
  } else if (role === 'to_truong_3') {
    targetStudent = students.find((s) => s.group === 3 && s.role === 'Tổ trưởng');
  } else if (role === 'to_truong_4') {
    targetStudent = students.find((s) => s.group === 4 && s.role === 'Tổ trưởng');
  }

  let roleTitle = USER_ROLES[role]?.title || 'Cán sự lớp';
  if (role === 'lop_truong') roleTitle = 'Lớp Trưởng';
  else if (role === 'thu_quy') roleTitle = 'Thủ Quỹ Lớp';

  const personName = targetStudent?.name || currentAccount?.displayName || 'Chưa phân công';

  let avatarIcon = '🛡️';
  if (role === 'thu_quy') avatarIcon = '💰';
  else if (role === 'pho_hoc_tap') avatarIcon = '📚';
  else if (role === 'pho_lao_dong') avatarIcon = '🧹';
  else if (role === 'pho_trat_tu') avatarIcon = '🎯';
  else if (role.startsWith('to_truong')) avatarIcon = '🚩';

  return {
    roleTitle,
    personName,
    isTeacher: false,
    avatarIcon,
  };
};

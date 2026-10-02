import { AppUserRole, RoleAccount } from '../types';

export const DEFAULT_ACCOUNTS: RoleAccount[] = [
  {
    role: 'gvcn',
    username: 'gvcn',
    password: 'lop10A7@',
    displayName: 'Thầy Trần Văn Dư',
    roleTitle: 'Giáo Viên Chủ Nhiệm 10A7',
    note: 'Toàn quyền: Chấm điểm mọi mặt, quản lý học sinh, xem thống kê, gửi thông báo Zalo/SMS, cài đặt.',
  },
  {
    role: 'lop_truong',
    username: 'loptruong',
    password: 'lop10A7@',
    displayName: 'Nguyễn Hoàng An',
    roleTitle: 'Lớp Trưởng 10A7',
    note: 'Bao quát toàn diện: Nhập nề nếp, học tập, trật tự, vệ sinh. Nhập sổ điểm và hạng thi đua của lớp toàn trường. Gửi thông báo Zalo/SMS cho phụ huynh.',
  },
  {
    role: 'thu_quy',
    username: 'thuquy',
    password: 'lop10A7@',
    displayName: 'Thủ Quỹ 10A7',
    roleTitle: 'Thủ Quỹ 10A7',
    note: 'Chuyên trách tài chính: Nhập số tiền thu, số tiền chi, theo dõi tổng thu, tổng chi và số tiền quỹ còn tồn lại.',
  },
  {
    role: 'pho_hoc_tap',
    username: 'phohoctap',
    password: 'lop10A7@',
    displayName: 'Trần Minh Đăng',
    roleTitle: 'Lớp Phó Học Tập',
    note: 'Chuyên trách học tập: Nhập bài vở, kiểm tra, thi cử, điểm hồng, phát biểu, bài khó, dự án.',
  },
  {
    role: 'pho_lao_dong',
    username: 'pholaodong',
    password: 'lop10A7@',
    displayName: 'Lê Bảo Châu',
    roleTitle: 'Lớp Phó Lao Động',
    note: 'Chuyên trách vệ sinh: Nhập trực nhật lớp, cầu thang, trốn lao động, xả rác, ly nhựa, hộp xốp.',
  },
  {
    role: 'pho_trat_tu',
    username: 'photrattu',
    password: 'lop10A7@',
    displayName: 'Phạm Gia Huy',
    roleTitle: 'Lớp Phó Trật Tự',
    note: 'Chuyên trách nề nếp: Nhập đổi chỗ ngồi, mất trật tự, nói chuyện, ngủ gục, vào trễ, điện thoại, đồng phục.',
  },
  {
    role: 'to_truong_1',
    username: 'totruong1',
    password: 'lop10A7@',
    displayName: 'Tổ Trưởng Tổ 1',
    roleTitle: 'Tổ Trưởng Tổ 1',
    note: 'Nhập điểm rèn luyện các thành viên thuộc Tổ 1 về mọi mặt.',
  },
  {
    role: 'to_truong_2',
    username: 'totruong2',
    password: 'lop10A7@',
    displayName: 'Tổ Trưởng Tổ 2',
    roleTitle: 'Tổ Trưởng Tổ 2',
    note: 'Nhập điểm rèn luyện các thành viên thuộc Tổ 2 về mọi mặt.',
  },
  {
    role: 'to_truong_3',
    username: 'totruong3',
    password: 'lop10A7@',
    displayName: 'Tổ Trưởng Tổ 3',
    roleTitle: 'Tổ Trưởng Tổ 3',
    note: 'Nhập điểm rèn luyện các thành viên thuộc Tổ 3 về mọi mặt.',
  },
  {
    role: 'to_truong_4',
    username: 'totruong4',
    password: 'lop10A7@',
    displayName: 'Tổ Trưởng Tổ 4',
    roleTitle: 'Tổ Trưởng Tổ 4',
    note: 'Nhập điểm rèn luyện các thành viên thuộc Tổ 4 về mọi mặt.',
  },
];

const AUTH_STORAGE_KEY = 'ne_nep_10a7_accounts_v1';
const CURRENT_SESSION_KEY = 'ne_nep_10a7_current_session_v1';

export const authService = {
  getAccounts(): RoleAccount[] {
    try {
      const data = localStorage.getItem(AUTH_STORAGE_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return DEFAULT_ACCOUNTS.map((def) => {
            const found = parsed.find((p: RoleAccount) => p.role === def.role);
            if (found) {
              const pass = found.password === '123' ? 'lop10A7@' : (found.password || def.password);
              return {
                ...def,
                displayName: found.displayName || def.displayName,
                password: pass,
                username: found.username || def.username,
                note: found.note || def.note,
              };
            }
            return def;
          });
        }
      }
    } catch (e) {
      console.error('Error reading auth accounts', e);
    }
    return DEFAULT_ACCOUNTS;
  },

  saveAccounts(accounts: RoleAccount[]): void {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(accounts));
  },

  getCurrentSession(): RoleAccount | null {
    try {
      const data = localStorage.getItem(CURRENT_SESSION_KEY);
      if (data === 'LOGGED_OUT' || data === 'null' || data === '') {
        return null;
      }
      if (data) {
        const parsed = JSON.parse(data);
        if (parsed && parsed.role) {
          // Sync with latest credentials
          const allAccounts = this.getAccounts();
          const found = allAccounts.find((a) => a.role === parsed.role);
          if (found) return found;
        }
      } else {
        // Default initial session before explicit logout: GVCN
        const allAccounts = this.getAccounts();
        const gvcn = allAccounts.find((a) => a.role === 'gvcn') || allAccounts[0];
        return gvcn;
      }
    } catch (e) {
      console.error('Error reading current session', e);
    }
    return null;
  },

  setCurrentSession(account: RoleAccount | null): void {
    if (!account) {
      localStorage.setItem(CURRENT_SESSION_KEY, 'LOGGED_OUT');
    } else {
      localStorage.setItem(CURRENT_SESSION_KEY, JSON.stringify(account));
    }
  },

  logout(): void {
    try {
      localStorage.setItem(CURRENT_SESSION_KEY, 'LOGGED_OUT');
      sessionStorage.clear();
    } catch (e) {
      console.error('Error logging out', e);
    }
  },

  login(usernameInput: string, passwordInput: string): { success: boolean; account?: RoleAccount; error?: string } {
    const cleanUser = usernameInput.trim().toLowerCase();
    const cleanPass = passwordInput.trim();

    if (!cleanUser || !cleanPass) {
      return { success: false, error: 'Vui lòng nhập đầy đủ tên tài khoản và mật khẩu.' };
    }

    const accounts = this.getAccounts();
    const matched = accounts.find(
      (a) => a.username.toLowerCase() === cleanUser && a.password === cleanPass
    );

    if (matched) {
      this.setCurrentSession(matched);
      return { success: true, account: matched };
    }

    // Alternative matching if user types e.g. "lớp trưởng"
    const aliasMatched = accounts.find((a) => {
      const isRole = a.role === cleanUser;
      const isTitle = a.roleTitle.toLowerCase() === cleanUser;
      return (isRole || isTitle) && a.password === cleanPass;
    });

    if (aliasMatched) {
      this.setCurrentSession(aliasMatched);
      return { success: true, account: aliasMatched };
    }

    return {
      success: false,
      error: 'Tên đăng nhập hoặc mật khẩu không chính xác. Vui lòng kiểm tra lại.',
    };
  },

  quickSwitchRole(role: AppUserRole): RoleAccount {
    const accounts = this.getAccounts();
    const target = accounts.find((a) => a.role === role) || DEFAULT_ACCOUNTS.find((a) => a.role === role) || accounts[0];
    this.setCurrentSession(target);
    return target;
  },

  updateAccountPassword(role: AppUserRole, newPassword: string): boolean {
    const accounts = this.getAccounts();
    const idx = accounts.findIndex((a) => a.role === role);
    if (idx !== -1) {
      accounts[idx].password = newPassword.trim();
      this.saveAccounts(accounts);

      const current = this.getCurrentSession();
      if (current && current.role === role) {
        current.password = newPassword.trim();
        this.setCurrentSession(current);
      }
      return true;
    }
    return false;
  },

  updateAccount(role: AppUserRole, updates: Partial<RoleAccount>): boolean {
    const accounts = this.getAccounts();
    const idx = accounts.findIndex((a) => a.role === role);
    if (idx !== -1) {
      accounts[idx] = { ...accounts[idx], ...updates };
      this.saveAccounts(accounts);

      const current = this.getCurrentSession();
      if (current && current.role === role) {
        this.setCurrentSession(accounts[idx]);
      }
      return true;
    }
    return false;
  },

  resetAccounts(): RoleAccount[] {
    this.saveAccounts(DEFAULT_ACCOUNTS);
    this.setCurrentSession(DEFAULT_ACCOUNTS[0]);
    return DEFAULT_ACCOUNTS;
  },
};

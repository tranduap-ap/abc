import React, { useState } from 'react';
import {
  X,
  KeyRound,
  Copy,
  CheckCircle2,
  Printer,
  RotateCcw,
  ShieldCheck,
  Edit2,
  Lock,
  User,
} from 'lucide-react';
import { RoleAccount, AppUserRole } from '../types';
import { authService } from '../services/authService';
import { USER_ROLES } from '../services/permissionService';

interface AccountManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccountsUpdated: () => void;
  onOpenRoleAssignmentModal?: () => void;
  activeRole?: AppUserRole | null;
}

export const AccountManagementModal: React.FC<AccountManagementModalProps> = ({
  isOpen,
  onClose,
  onAccountsUpdated,
  onOpenRoleAssignmentModal,
  activeRole = null,
}) => {
  const [accounts, setAccounts] = useState<RoleAccount[]>(() => authService.getAccounts());
  const [editingRole, setEditingRole] = useState<AppUserRole | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  if (activeRole !== 'gvcn') {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 text-center border border-slate-200">
          <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-1">
            Quyền Truy Cập Bị Giới Hạn
          </h3>
          <p className="text-xs text-slate-600 mb-4">
            Danh sách tài khoản & mật khẩu chỉ dành riêng cho <strong>GVCN Thầy Trần Văn Dư</strong>. Học sinh và ban cán sự lớp không được phép xem mật khẩu của người khác.
          </p>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 text-white text-xs font-bold rounded-xl cursor-pointer hover:bg-slate-900"
          >
            Đã hiểu & Đóng
          </button>
        </div>
      </div>
    );
  }

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleCopyCredentials = (acc: RoleAccount) => {
    const text = `Tài khoản: ${acc.username}\nMật khẩu: ${acc.password}\nVai trò: ${acc.roleTitle}\nPhạm vi: ${acc.note}`;
    navigator.clipboard.writeText(text);
    showToast(`Đã sao chép tài khoản của ${acc.roleTitle}!`);
  };

  const handleSavePassword = (role: AppUserRole) => {
    if (!newPassword.trim()) return;
    authService.updateAccountPassword(role, newPassword);
    setAccounts(authService.getAccounts());
    setEditingRole(null);
    setNewPassword('');
    onAccountsUpdated();
    showToast('Đã đổi mật khẩu thành công!');
  };

  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleResetDefaults = () => {
    const reset = authService.resetAccounts();
    setAccounts(reset);
    onAccountsUpdated();
    setShowResetConfirm(false);
    showToast('Đã đặt lại tất cả tài khoản về mặc định (Mật khẩu: lop10A7@)!');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-blue-900 to-indigo-900 text-white flex items-center justify-between print:hidden">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-blue-500/20 text-amber-300">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white">
                Danh Sách Tài Khoản & Mật Khẩu Phân Quyền (Lớp 10A7)
              </h3>
              <p className="text-xs text-blue-200">
                Cấp phát tài khoản cho Lớp trưởng, Thủ quỹ, các Lớp phó và 4 Tổ trưởng
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {onOpenRoleAssignmentModal && (
              <button
                onClick={() => {
                  onClose();
                  onOpenRoleAssignmentModal();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg cursor-pointer transition-colors"
                title="Mở giao diện phân quyền chức vụ cho từng học sinh"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Phân Quyền HS</span>
              </button>
            )}
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-700 hover:bg-blue-600 text-white text-xs font-bold rounded-lg cursor-pointer transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>In Phiếu Cấp</span>
            </button>
            <button
              onClick={onClose}
              className="text-blue-200 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Toast */}
        {toastMessage && (
          <div className="mx-5 mt-4 p-3 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs rounded-xl flex items-center gap-2 animate-fadeIn print:hidden">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Content */}
        <div className="p-5 flex-1 overflow-y-auto space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200 print:hidden">
            <p className="text-xs text-slate-600">
              Mỗi thành viên ban cán sự đăng nhập bằng tài khoản và mật khẩu riêng. Thầy có thể chỉnh sửa mật khẩu hoặc in phiếu bàn giao nhiệm vụ.
            </p>
            {showResetConfirm ? (
              <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-lg text-xs">
                <span className="text-rose-800 font-semibold">Khôi phục tất cả MK về "lop10A7@"?</span>
                <button
                  onClick={handleResetDefaults}
                  className="px-2 py-0.5 bg-rose-600 hover:bg-rose-700 text-white rounded font-bold cursor-pointer"
                >
                  Xác nhận
                </button>
                <button
                  onClick={() => setShowResetConfirm(false)}
                  className="px-2 py-0.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded cursor-pointer"
                >
                  Hủy
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowResetConfirm(true)}
                className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-rose-600 font-medium transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Khôi phục mặc định (lop10A7@)</span>
              </button>
            )}
          </div>

          {/* Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="p-3 w-10 text-center">STT</th>
                  <th className="p-3">Vai Trò Nhiệm Vụ</th>
                  <th className="p-3">Tên Tài Khoản</th>
                  <th className="p-3">Mật Khẩu</th>
                  <th className="p-3">Quyền Hạn Ghi Nhận</th>
                  <th className="p-3 text-right print:hidden">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {accounts.map((acc, index) => {
                  const roleInfo = USER_ROLES[acc.role];
                  const isEditing = editingRole === acc.role;

                  return (
                    <tr key={acc.role} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3 text-center text-slate-400 font-semibold">{index + 1}</td>
                      <td className="p-3">
                        <div className="font-bold text-slate-900 flex items-center gap-1.5">
                          <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${roleInfo.badgeColor}`}>
                            {roleInfo.shortTitle}
                          </span>
                          <span>{acc.roleTitle}</span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5">{acc.displayName}</div>
                      </td>
                      <td className="p-3 font-mono font-bold text-blue-900 text-xs">
                        <code>{acc.username}</code>
                      </td>
                      <td className="p-3 font-mono font-bold text-amber-900">
                        {isEditing ? (
                          <div className="flex items-center gap-1">
                            <input
                              type="text"
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              placeholder="Mật khẩu mới..."
                              className="px-2 py-1 text-xs border border-blue-400 rounded outline-none w-28 bg-white"
                            />
                            <button
                              onClick={() => handleSavePassword(acc.role)}
                              className="px-2 py-1 bg-emerald-600 text-white rounded text-[11px] font-bold"
                            >
                              Lưu
                            </button>
                            <button
                              onClick={() => setEditingRole(null)}
                              className="px-2 py-1 bg-slate-200 text-slate-700 rounded text-[11px]"
                            >
                              Hủy
                            </button>
                          </div>
                        ) : (
                          <span className="bg-amber-100 px-2 py-0.5 rounded text-amber-900 border border-amber-300">
                            {acc.password}
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-[11px] text-slate-600 max-w-xs">
                        {acc.note}
                      </td>
                      <td className="p-3 text-right print:hidden">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleCopyCredentials(acc)}
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            title="Sao chép tài khoản & mật khẩu"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              setEditingRole(acc.role);
                              setNewPassword(acc.password);
                            }}
                            className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                            title="Đổi mật khẩu"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

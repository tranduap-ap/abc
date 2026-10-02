import React from 'react';
import {
  Home,
  ClipboardCheck,
  BarChart3,
  Users,
  MessageSquareShare,
  Sparkles,
  Settings,
  Trophy,
  Wallet,
} from 'lucide-react';

export type TabType =
  | 'dashboard'
  | 'record'
  | 'stats'
  | 'competition'
  | 'fund'
  | 'notify'
  | 'roster'
  | 'ai'
  | 'rules';

interface NavigationProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  pendingNotifyCount?: number;
  studentCount?: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  setActiveTab,
  pendingNotifyCount = 0,
  studentCount = 0,
}) => {
  const tabs = [
    {
      id: 'dashboard' as TabType,
      label: 'Trang chủ',
      icon: Home,
      badge: 'Dashboard',
      badgeColor: 'bg-blue-100 text-blue-900 border border-blue-300',
    },
    {
      id: 'record' as TabType,
      label: 'Chấm Điểm & Vi Phạm',
      icon: ClipboardCheck,
      badge: null,
    },
    {
      id: 'stats' as TabType,
      label: 'Thống Kê Tuần & Tháng',
      icon: BarChart3,
      badge: null,
    },
    {
      id: 'competition' as TabType,
      label: 'Thi Đua Toàn Trường',
      icon: Trophy,
      badge: 'Lớp Trưởng & GVCN',
      badgeColor: 'bg-amber-100 text-amber-900 border border-amber-300',
    },
    {
      id: 'fund' as TabType,
      label: 'Quỹ Lớp 10A7',
      icon: Wallet,
      badge: 'Thủ Quỹ',
      badgeColor: 'bg-emerald-100 text-emerald-900 border border-emerald-300',
    },
    {
      id: 'notify' as TabType,
      label: 'Gửi Thông Báo Zalo/SMS',
      icon: MessageSquareShare,
      badge: pendingNotifyCount > 0 ? `${pendingNotifyCount} PH` : null,
      highlight: true,
    },
    {
      id: 'roster' as TabType,
      label: 'Danh Sách Lớp 10A7',
      icon: Users,
      badge: studentCount > 0 ? `${studentCount} HS` : '0 HS',
    },
    {
      id: 'ai' as TabType,
      label: 'Trợ Lý GVCN (AI)',
      icon: Sparkles,
      badge: 'Mới',
    },
    {
      id: 'rules' as TabType,
      label: 'Cài Đặt & Quy Định',
      icon: Settings,
      badge: 'Chỉ GVCN sửa',
      badgeColor: 'bg-purple-100 text-purple-900 border border-purple-300',
    },
  ];

  return (
    <div className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex space-x-1 sm:space-x-4 overflow-x-auto py-2.5 no-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-lg whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-blue-700 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`ml-1 text-[11px] font-bold px-1.5 py-0.2 rounded-full ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : tab.badgeColor
                        ? tab.badgeColor
                        : tab.highlight
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

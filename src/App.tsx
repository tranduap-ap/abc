import React, { useState, useMemo, useEffect } from 'react';
import { storageService } from './services/storage';
import {
  Student,
  Rule,
  IncidentRecord,
  TeacherSettings,
  MessageLog,
  AppUserRole,
  RoleAccount,
  SchoolCompetitionRecord,
  FundTransaction,
  StudentScoreSummary,
} from './types';
import { authService } from './services/authService';
import { Header } from './components/Header';
import { Navigation, TabType } from './components/Navigation';
import { DashboardView } from './components/DashboardView';
import { QuickRecordView } from './components/QuickRecordView';
import { QuickRecordModal } from './components/QuickRecordModal';
import { StatisticsView } from './components/StatisticsView';
import { NotificationEngineView } from './components/NotificationEngineView';
import { StudentRosterView } from './components/StudentRosterView';
import { AiAssistantView } from './components/AiAssistantView';
import { RulesSettingsView } from './components/RulesSettingsView';
import { PrintableReport } from './components/PrintableReport';
import { ExcelImportModal } from './components/ExcelImportModal';
import { LoginModal } from './components/LoginModal';
import { AccountManagementModal } from './components/AccountManagementModal';
import { SchoolCompetitionView } from './components/SchoolCompetitionView';
import { ClassFundView } from './components/ClassFundView';
import { StudentRoleAssignmentModal } from './components/StudentRoleAssignmentModal';
import { StudentEditModal } from './components/StudentEditModal';
import { SendNotificationModal } from './components/SendNotificationModal';
import { ExcelExportModal } from './components/ExcelExportModal';
import { excelService } from './services/excelService';

// ============================================================================
// CẤU HÌNH ĐỒNG BỘ ĐÁM MÂY FIREBASE (PROJECT: tinhoc-724e2)
// ============================================================================
const CANDIDATE_URLS = [
  'https://tinhoc-724e2-default-rtdb.asia-southeast1.firebasedatabase.app',
  'https://tinhoc-724e2-default-rtdb.firebaseio.com',
];

let activeFirebaseUrl = CANDIDATE_URLS[0];
let isSyncingFromCloud = false;
let lastSyncedTimestamp = 0;
let isHooked = false;

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

async function syncToCloud() {
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
    console.error('Lỗi lưu đám mây:', err);
  }
}

async function pullFromCloud(onDataChanged: () => void) {
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
    console.error('Lỗi tải đám mây:', err);
  }
}

function setupStorageHooks() {
  if (isHooked) return;
  isHooked = true;
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
}

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [filterType, setFilterType] = useState<'week' | 'month'>('week');
  const [currentAccount, setCurrentAccount] = useState<RoleAccount | null>(() =>
    authService.getCurrentSession()
  );
  const [activeRole, setActiveRole] = useState<AppUserRole | null>(() =>
    authService.getCurrentSession()?.role || null
  );
  const [authNotification, setAuthNotification] = useState<{
    message: string;
    type: 'success' | 'info' | 'warning';
  } | null>(null);

  const showNotification = (
    message: string,
    type: 'success' | 'info' | 'warning' = 'success'
  ) => {
    setAuthNotification({ message, type });
    setTimeout(() => setAuthNotification(null), 5000);
  };

  // Core state
  const [settings, setSettings] = useState<TeacherSettings>(() =>
    storageService.getSettings()
  );
  const [students, setStudents] = useState<Student[]>(() =>
    storageService.getStudents()
  );
  const [rules, setRules] = useState<Rule[]>(() =>
    storageService.getRules()
  );
  const [incidents, setIncidents] = useState<IncidentRecord[]>(() =>
    storageService.getIncidents()
  );
  const [messageLogs, setMessageLogs] = useState<MessageLog[]>(() =>
    storageService.getMessageLogs()
  );
  const [competitions, setCompetitions] = useState<SchoolCompetitionRecord[]>(() =>
    storageService.getCompetitionRecords()
  );
  const [fundTransactions, setFundTransactions] = useState<FundTransaction[]>(() =>
    storageService.getFundTransactions()
  );

  // Modals & Navigation helpers
  const [isQuickRecordModalOpen, setIsQuickRecordModalOpen] = useState(false);
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);
  const [isExcelExportModalOpen, setIsExcelExportModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isAccountsModalOpen, setIsAccountsModalOpen] = useState(false);
  const [isRoleAssignModalOpen, setIsRoleAssignModalOpen] = useState(false);
  const [isStudentEditModalOpen, setIsStudentEditModalOpen] = useState(false);
  const [studentToEdit, setStudentToEdit] = useState<Student | null>(null);
  const [notificationSummary, setNotificationSummary] = useState<StudentScoreSummary | null>(null);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [preSelectedStudentId, setPreSelectedStudentId] = useState<string | undefined>(undefined);
  const [isPrintOpen, setIsPrintOpen] = useState(false);
  const [selectedStudentForZalo, setSelectedStudentForZalo] = useState<string | null>(null);

  const handleOpenEditStudent = (student?: Student) => {
    setStudentToEdit(student || null);
    setIsStudentEditModalOpen(true);
  };

  const filterValue = filterType === 'week' ? settings.currentWeek : settings.currentMonth;

  const summaries = useMemo(() => {
    return storageService.calculateStudentSummaries(
      students,
      incidents,
      filterType,
      filterValue,
      settings.baseScore
    );
  }, [students, incidents, filterType, filterValue, settings.baseScore]);

  const groupSummaries = useMemo(() => {
    return storageService.calculateGroupSummaries(summaries);
  }, [summaries]);

  const handleExportRoster = () => {
    excelService.exportStudentRosterToExcel(students, summaries, settings);
    showNotification('Đã xuất thành công Danh Sách Học Sinh Lớp 10A7 sang file Excel!', 'success');
  };

  const handleExportCompetition = () => {
    excelService.exportCompetitionToExcel(competitions, groupSummaries, settings);
    showNotification('Đã xuất thành công Sổ Điểm Thi Đua Toàn Trường sang file Excel!', 'success');
  };

  const handleExportDiscipline = () => {
    excelService.exportDisciplineReportToExcel(
      summaries,
      groupSummaries,
      incidents,
      filterType,
      filterValue,
      settings
    );
    showNotification('Đã xuất thành công Báo Cáo Nề Nếp & Vi Phạm sang file Excel!', 'success');
  };

  const handleSelectRole = (role: AppUserRole) => {
    const acc = authService.quickSwitchRole(role);
    setCurrentAccount(acc);
    setActiveRole(role);
  };

  const handleLoginSuccess = (account: RoleAccount) => {
    setCurrentAccount(account);
    setActiveRole(account.role);
    showNotification(`Đã đăng nhập thành công với vai trò: ${account.roleTitle} (${account.displayName})`, 'success');
  };

  const handleLogout = () => {
    authService.logout();
    setCurrentAccount(null);
    setActiveRole(null);
    showNotification('🔒 Đã đăng xuất thành công! Tất cả tài khoản đã được out hoàn toàn. Hệ thống đã khóa các quyền bảo mật.', 'info');
  };

  const handleUpdateSettings = (newSettings: TeacherSettings) => {
    const isClassOrSchoolChanged =
      newSettings.schoolName !== settings.schoolName ||
      newSettings.className !== settings.className ||
      newSettings.teacherName !== settings.teacherName ||
      newSettings.academicYear !== settings.academicYear;

    if (isClassOrSchoolChanged && activeRole !== 'gvcn') {
      showNotification('Quyền hạn bị từ chối: Chỉ Giáo viên chủ nhiệm mới có quyền thay đổi tên trường, tên lớp và thông tin cài đặt!', 'warning');
      return;
    }
    setSettings(newSettings);
    storageService.saveSettings(newSettings);
  };

  const handleQuickAdd = (student: Student, rule: Rule) => {
    storageService.addIncident({
      studentId: student.id,
      studentName: student.name,
      group: student.group,
      ruleId: rule.id,
      ruleName: rule.name,
      category: rule.category,
      points: rule.points,
      quantity: 1,
      date: new Date().toISOString().split('T')[0],
      week: settings.currentWeek,
      month: settings.currentMonth,
      period: '10 phút đầu giờ',
      reportedBy: `GVCN ${settings.teacherName}`,
    });
    setIncidents(storageService.getIncidents());
  };

  const handleSaveIncidents = (
    newIncidents: Omit<IncidentRecord, 'id' | 'createdAt'>[]
  ) => {
    newIncidents.forEach((item) => {
      storageService.addIncident(item);
    });
    setIncidents(storageService.getIncidents());
  };

  const handleDeleteIncident = (id: string) => {
    storageService.deleteIncident(id);
    setIncidents(storageService.getIncidents());
  };

  const handleAddStudent = (studentData: Omit<Student, 'id'>) => {
    storageService.addStudent(studentData);
    setStudents(storageService.getStudents());
  };

  const handleUpdateStudent = (updatedStudent: Student) => {
    storageService.updateStudent(updatedStudent);
    setStudents(storageService.getStudents());
  };

  const handleDeleteStudent = (id: string) => {
    storageService.deleteStudent(id);
    setStudents(storageService.getStudents());
  };

  const handleClearAllStudents = () => {
    storageService.saveStudents([]);
    setStudents([]);
  };

  const handleImportStudents = (
    newStudents: Omit<Student, 'id'>[],
    mode: 'replace' | 'append'
  ) => {
    if (mode === 'replace') {
      const formatted: Student[] = newStudents.map((s, idx) => ({
        ...s,
        id: `hs-${Date.now()}-${idx}`,
        rollNumber: s.rollNumber || idx + 1,
      }));
      storageService.saveStudents(formatted);
      setStudents(formatted);
    } else {
      const current = storageService.getStudents();
      const currentMaxRoll = current.reduce((max, s) => Math.max(max, s.rollNumber), 0);
      const formatted: Student[] = newStudents.map((s, idx) => ({
        ...s,
        id: `hs-${Date.now()}-${idx}`,
        rollNumber: s.rollNumber || currentMaxRoll + idx + 1,
      }));
      const combined = [...current, ...formatted];
      storageService.saveStudents(combined);
      setStudents(combined);
    }
  };

  const handleSaveRules = (updatedRules: Rule[]) => {
    if (activeRole !== 'gvcn') {
      showNotification('Quyền hạn bị từ chối: Chỉ Giáo viên chủ nhiệm mới có quyền thay đổi quy định/thang điểm!', 'warning');
      return;
    }
    setRules(updatedRules);
    storageService.saveRules(updatedRules);
  };

  const handleAddCompetitionRecord = (
    record: Omit<SchoolCompetitionRecord, 'id' | 'updatedAt'>
  ) => {
    storageService.addCompetitionRecord(record);
    setCompetitions(storageService.getCompetitionRecords());
  };

  const handleUpdateCompetitionRecord = (record: SchoolCompetitionRecord) => {
    storageService.updateCompetitionRecord(record);
    setCompetitions(storageService.getCompetitionRecords());
  };

  const handleDeleteCompetitionRecord = (id: string) => {
    storageService.deleteCompetitionRecord(id);
    setCompetitions(storageService.getCompetitionRecords());
  };

  const handleAddFundTransaction = (
    tx: Omit<FundTransaction, 'id' | 'createdAt'>
  ) => {
    storageService.addFundTransaction(tx);
    setFundTransactions(storageService.getFundTransactions());
  };

  const handleUpdateFundTransaction = (tx: FundTransaction) => {
    storageService.updateFundTransaction(tx);
    setFundTransactions(storageService.getFundTransactions());
  };

  const handleDeleteFundTransaction = (id: string) => {
    storageService.deleteFundTransaction(id);
    setFundTransactions(storageService.getFundTransactions());
  };

  const handleClearAllFund = () => {
    storageService.clearAllFundTransactions();
    setFundTransactions([]);
  };

  const handleSaveRoleAssignments = (updatedStudents: Student[]) => {
    storageService.saveStudents(updatedStudents);
    setStudents(updatedStudents);
  };

  const handleResetData = () => {
    if (activeRole !== 'gvcn') {
      showNotification('Quyền hạn bị từ chối: Chỉ Giáo viên chủ nhiệm mới có quyền đặt lại dữ liệu gốc!', 'warning');
      return;
    }
    storageService.resetToDefault();
    setSettings(storageService.getSettings());
    setStudents(storageService.getStudents());
    setRules(storageService.getRules());
    setIncidents(storageService.getIncidents());
    setMessageLogs(storageService.getMessageLogs());
    setCompetitions(storageService.getCompetitionRecords());
    setFundTransactions(storageService.getFundTransactions());
  };

  const handleReloadAllData = () => {
    setSettings(storageService.getSettings());
    setStudents(storageService.getStudents());
    setRules(storageService.getRules());
    setIncidents(storageService.getIncidents());
    setMessageLogs(storageService.getMessageLogs());
    setCompetitions(storageService.getCompetitionRecords());
    setFundTransactions(storageService.getFundTransactions());
  };

  // Kích hoạt đồng bộ đám mây tự động khi mở trang web
  useEffect(() => {
    setupStorageHooks();
    resolveFirebaseUrl().then(() => {
      pullFromCloud(handleReloadAllData);
    });
    const timer = setInterval(() => {
      if (!isSyncingFromCloud) {
        pullFromCloud(handleReloadAllData);
      }
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const handleLogSent = (log: Omit<MessageLog, 'id' | 'sentAt'>) => {
    storageService.addMessageLog(log);
    setMessageLogs(storageService.getMessageLogs());
  };

  const handleSelectStudentForZalo = (studentId: string) => {
    setSelectedStudentForZalo(studentId);
    const sum = summaries.find((s) => s.student.id === studentId);
    if (sum) {
      setNotificationSummary(sum);
      setIsNotificationModalOpen(true);
    } else {
      setActiveTab('notify');
    }
  };

  const openQuickRecordWithStudent = (studentId?: string) => {
    setPreSelectedStudentId(studentId);
    setIsQuickRecordModalOpen(true);
  };

  const pendingViolationsCount = summaries.filter((s) => s.violationCount > 0).length;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-900 selection:bg-blue-600 selection:text-white">
      <Header
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        summaries={summaries}
        activeRole={activeRole}
        currentAccount={currentAccount}
        onSelectRole={handleSelectRole}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
        onLogout={handleLogout}
        onOpenAccountsModal={() => setIsAccountsModalOpen(true)}
        onOpenRoleAssignmentModal={() => setIsRoleAssignModalOpen(true)}
        onOpenQuickRecord={() => openQuickRecordWithStudent(undefined)}
        onOpenPrint={() => setIsPrintOpen(true)}
        onOpenExcelModal={() => setIsExcelModalOpen(true)}
        onOpenExportExcelModal={() => setIsExcelExportModalOpen(true)}
        filterType={filterType}
        setFilterType={setFilterType}
      />

      <Navigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        pendingNotifyCount={pendingViolationsCount}
        studentCount={students.length}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'dashboard' && (
          <DashboardView
            students={students}
            incidents={incidents}
            summaries={summaries}
            groupSummaries={groupSummaries}
            competitions={competitions}
            settings={settings}
            rules={rules}
            activeRole={activeRole}
            onNavigateTab={setActiveTab}
            onOpenQuickRecord={openQuickRecordWithStudent}
            onOpenSelectStudentForZalo={handleSelectStudentForZalo}
            onOpenPrint={() => setIsPrintOpen(true)}
          />
        )}

        {activeTab === 'record' && (
          <QuickRecordView
            students={students}
            rules={rules}
            incidents={incidents}
            summaries={summaries}
            settings={settings}
            activeRole={activeRole}
            onSelectRole={handleSelectRole}
            onOpenModal={openQuickRecordWithStudent}
            onOpenExcelModal={() => setIsExcelModalOpen(true)}
            onQuickAdd={handleQuickAdd}
            onDeleteIncident={handleDeleteIncident}
            onOpenEditStudent={handleOpenEditStudent}
            onOpenLoginModal={() => setIsLoginModalOpen(true)}
          />
        )}

        {activeTab === 'stats' && (
          <StatisticsView
            students={students}
            rules={rules}
            summaries={summaries}
            groupSummaries={groupSummaries}
            settings={settings}
            incidents={incidents}
            filterType={filterType}
            onSelectMonth={(m) => handleUpdateSettings({ ...settings, currentMonth: m })}
            onSelectStudentForZalo={handleSelectStudentForZalo}
            onOpenPrint={() => setIsPrintOpen(true)}
            onOpenEditStudent={handleOpenEditStudent}
            onExportExcel={handleExportDiscipline}
          />
        )}

        {activeTab === 'competition' && (
          <SchoolCompetitionView
            records={competitions}
            activeRole={activeRole}
            settings={settings}
            students={students}
            onAddRecord={handleAddCompetitionRecord}
            onUpdateRecord={handleUpdateCompetitionRecord}
            onDeleteRecord={handleDeleteCompetitionRecord}
            onExportExcel={handleExportCompetition}
          />
        )}

        {activeTab === 'fund' && (
          <ClassFundView
            transactions={fundTransactions}
            students={students}
            activeRole={activeRole}
            settings={settings}
            onAddTransaction={handleAddFundTransaction}
            onUpdateTransaction={handleUpdateFundTransaction}
            onDeleteTransaction={handleDeleteFundTransaction}
            onClearAllFund={handleClearAllFund}
            onUpdateSettings={handleUpdateSettings}
          />
        )}

        {activeTab === 'notify' && (
          <NotificationEngineView
            summaries={summaries}
            settings={settings}
            messageLogs={messageLogs}
            activeRole={activeRole}
            onLogSent={handleLogSent}
            selectedStudentIdFromParent={selectedStudentForZalo}
          />
        )}

        {activeTab === 'roster' && (
          <StudentRosterView
            students={students}
            summaries={summaries}
            settings={settings}
            activeRole={activeRole}
            onAddStudent={handleAddStudent}
            onUpdateStudent={handleUpdateStudent}
            onDeleteStudent={handleDeleteStudent}
            onClearAllStudents={handleClearAllStudents}
            onOpenRecordForStudent={(sId) => openQuickRecordWithStudent(sId)}
            onOpenZaloForStudent={handleSelectStudentForZalo}
            onOpenExcelModal={() => setIsExcelModalOpen(true)}
            onOpenRoleAssignmentModal={() => setIsRoleAssignModalOpen(true)}
            onExportExcel={handleExportRoster}
          />
        )}

        {activeTab === 'ai' && (
          <AiAssistantView
            summaries={summaries}
            settings={settings}
            onOpenZalo={handleSelectStudentForZalo}
          />
        )}

        {activeTab === 'rules' && (
          <RulesSettingsView
            settings={settings}
            rules={rules}
            activeRole={activeRole}
            onSaveSettings={handleUpdateSettings}
            onSaveRules={handleSaveRules}
            onResetData={handleResetData}
            onReloadAllData={handleReloadAllData}
          />
        )}
      </main>

      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500">
        <p>
          Phần Mềm Quản Lý Nề Nếp Lớp Chủ Nhiệm <strong>{settings.className}</strong> • GVCN: <strong>Thầy {settings.teacherName}</strong> • {settings.schoolName}
        </p>
        <p className="mt-0.5 text-[11px] text-slate-400">
          Tích hợp tự động hóa gửi thông báo phụ huynh qua Zalo & SMS • Thống kê thi đua 4 Tổ
        </p>
      </footer>

      <QuickRecordModal
        isOpen={isQuickRecordModalOpen}
        onClose={() => {
          setIsQuickRecordModalOpen(false);
          setPreSelectedStudentId(undefined);
        }}
        students={students}
        rules={rules}
        settings={settings}
        activeRole={activeRole}
        onSaveIncidents={handleSaveIncidents}
        preSelectedStudentId={preSelectedStudentId}
      />

      <ExcelImportModal
        isOpen={isExcelModalOpen}
        onClose={() => setIsExcelModalOpen(false)}
        onImportStudents={handleImportStudents}
        currentStudentCount={students.length}
        settings={settings}
      />

      <ExcelExportModal
        isOpen={isExcelExportModalOpen}
        onClose={() => setIsExcelExportModalOpen(false)}
        students={students}
        summaries={summaries}
        groupSummaries={groupSummaries}
        incidents={incidents}
        competitions={competitions}
        settings={settings}
        filterType={filterType}
      />

      <PrintableReport
        isOpen={isPrintOpen}
        onClose={() => setIsPrintOpen(false)}
        summaries={summaries}
        groupSummaries={groupSummaries}
        settings={settings}
        filterType={filterType}
      />

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        currentRole={activeRole}
        onLoginSuccess={handleLoginSuccess}
      />

      <AccountManagementModal
        isOpen={isAccountsModalOpen}
        onClose={() => setIsAccountsModalOpen(false)}
        activeRole={activeRole}
        onAccountsUpdated={() => {
          setCurrentAccount(authService.getCurrentSession());
          syncToCloud();
        }}
        onOpenRoleAssignmentModal={() => setIsRoleAssignModalOpen(true)}
      />

      <StudentRoleAssignmentModal
        isOpen={isRoleAssignModalOpen}
        onClose={() => setIsRoleAssignModalOpen(false)}
        students={students}
        onSaveRoleAssignments={handleSaveRoleAssignments}
        onAccountsUpdated={() => {
          setCurrentAccount(authService.getCurrentSession());
          syncToCloud();
        }}
      />

      <StudentEditModal
        isOpen={isStudentEditModalOpen}
        onClose={() => {
          setIsStudentEditModalOpen(false);
          setStudentToEdit(null);
        }}
        student={studentToEdit}
        students={students}
        onSaveStudent={handleUpdateStudent}
      />

      <SendNotificationModal
        isOpen={isNotificationModalOpen}
        onClose={() => {
          setIsNotificationModalOpen(false);
          setNotificationSummary(null);
        }}
        summary={notificationSummary}
        settings={settings}
        onLogSent={handleLogSent}
        onUpdateParentPhone={(studentId, newPhone) => {
          const st = students.find((s) => s.id === studentId);
          if (st) {
            handleUpdateStudent({ ...st, parentPhone: newPhone });
          }
        }}
      />

      {authNotification && (
        <div className="fixed bottom-5 right-5 z-50 max-w-md bg-slate-900/95 text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-700/80 backdrop-blur-md flex items-center justify-between gap-3 animate-fadeIn">
          <div className="text-xs font-semibold leading-relaxed">
            {authNotification.message}
          </div>
          {!activeRole && (
            <button
              onClick={() => setIsLoginModalOpen(true)}
              className="px-3 py-1.5 bg-gradient-to-r from-amber-400 to-yellow-400 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-bold text-xs rounded-xl shrink-0 cursor-pointer shadow-sm transition-all"
            >
              Đăng Nhập
            </button>
          )}
        </div>
      )}
    </div>
  );
}

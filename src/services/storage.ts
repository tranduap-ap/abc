// ============================================================================
// ĐỒNG BỘ DỮ LIỆU ĐÁM MÂY TỰ ĐỘNG QUA FIREBASE REALTIME DATABASE (BẢN FIX)
// ============================================================================

// DÁN LINK FIREBASE CỦA BẠN VÀO ĐÂY (Có hay không có dấu / ở cuối đều được)
const RAW_FIREBASE_URL = 'https://THAY_LINK_CUA_BAN_VAO_DAY.firebasedatabase.app/';

// Tự động làm sạch dấu / ở cuối link để tránh lỗi //lop10a7_data.json
const FIREBASE_DB_URL = RAW_FIREBASE_URL.trim().replace(/\/+$/, '');

let isSyncingFromCloud = false;
let lastSyncedTimestamp = 0;

// 1. Hàm đẩy toàn bộ dữ liệu hiện tại lên Đám mây
export async function syncToCloud() {
  if (
    isSyncingFromCloud ||
    !FIREBASE_DB_URL.startsWith('https://') ||
    FIREBASE_DB_URL.includes('THAY_LINK')
  ) {
    return;
  }
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

    await fetch(`${FIREBASE_DB_URL}/lop10a7_data.json`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    console.log('✅ Đã đồng bộ dữ liệu lớp 10A7 lên đám mây!');
  } catch (err) {
    console.error('❌ Lỗi khi lưu dữ liệu lên đám mây:', err);
  }
}

// 2. Hàm tải dữ liệu từ Đám mây về máy
export async function pullFromCloud(onDataChanged: () => void) {
  if (
    !FIREBASE_DB_URL.startsWith('https://') ||
    FIREBASE_DB_URL.includes('THAY_LINK')
  ) {
    return;
  }
  try {
    const res = await fetch(`${FIREBASE_DB_URL}/lop10a7_data.json`);
    if (!res.ok) return;
    const cloudData = await res.json();

    // Nếu trên đám mây chưa có gì, đẩy dữ liệu từ máy hiện tại lên
    if (!cloudData || !cloudData.appData) {
      await syncToCloud();
      return;
    }

    // Chỉ cập nhật nếu dữ liệu trên mây mới hơn dữ liệu ở máy
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
    console.error('❌ Lỗi khi tải dữ liệu từ đám mây:', err);
  }
}

// 3. Khởi chạy đồng bộ khi mở trang web
export function initCloudSync(onDataChanged: () => void) {
  if (
    !FIREBASE_DB_URL.startsWith('https://') ||
    FIREBASE_DB_URL.includes('THAY_LINK')
  ) {
    return;
  }

  // Tải dữ liệu ngay lập tức khi vừa mở trang web
  pullFromCloud(onDataChanged);

  // Tự động kiểm tra cập nhật mỗi 3 giây (Đảm bảo chạy mượt trên mọi trình duyệt điện thoại/máy tính)
  setInterval(() => {
    if (!isSyncingFromCloud) {
      pullFromCloud(onDataChanged);
    }
  }, 3000);
}

// 4. Tự động gắn lệnh đẩy lên mây vào TẤT CẢ các hàm lưu dữ liệu của storageService
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

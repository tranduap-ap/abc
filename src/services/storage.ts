// ============================================================================
// ĐỒNG BỘ DỮ LIỆU ĐÁM MÂY TỰ ĐỘNG CHO PROJECT: tinhoc-724e2
// ============================================================================

// Danh sách URL tự động nhận diện cho project tinhoc-724e2 (Singapore hoặc US)
const CANDIDATE_URLS = [
  'https://tinhoc-724e2-default-rtdb.asia-southeast1.firebasedatabase.app',
  'https://tinhoc-724e2-default-rtdb.firebaseio.com',
];

let activeFirebaseUrl = CANDIDATE_URLS[0];
let isSyncingFromCloud = false;
let lastSyncedTimestamp = 0;

// Tự động tìm đúng máy chủ Firebase của tinhoc-724e2
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

// 1. Hàm đẩy toàn bộ dữ liệu hiện tại lên Đám mây
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

// 2. Hàm tải dữ liệu từ Đám mây về máy
export async function pullFromCloud(onDataChanged: () => void) {
  try {
    const res = await fetch(`${activeFirebaseUrl}/lop10a7_data.json`);
    if (!res.ok) return;
    const cloudData = await res.json();

    // Nếu trên đám mây chưa có dữ liệu, đẩy dữ liệu từ máy hiện tại lên
    if (!cloudData || !cloudData.appData) {
      await syncToCloud();
      return;
    }

    // Cập nhật nếu dữ liệu trên mây mới hơn
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

// 3. Khởi chạy đồng bộ khi mở trang web
export async function initCloudSync(onDataChanged: () => void) {
  await resolveFirebaseUrl();
  await pullFromCloud(onDataChanged);

  // Tự động đồng bộ mỗi 3 giây giữa các máy
  setInterval(() => {
    if (!isSyncingFromCloud) {
      pullFromCloud(onDataChanged);
    }
  }, 3000);
}

// 4. Tự động gắn lệnh đẩy lên mây vào TẤT CẢ các hàm lưu dữ liệu
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

import React, { useState, useRef } from 'react';
import {
  FileSpreadsheet,
  Upload,
  Download,
  CheckCircle2,
  AlertCircle,
  X,
  FileText,
  Trash2,
} from 'lucide-react';
import { excelService, ParsedStudentRow } from '../services/excelService';
import { Student, TeacherSettings } from '../types';

interface ExcelImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportStudents: (newStudents: Omit<Student, 'id'>[], mode: 'replace' | 'append') => void;
  currentStudentCount: number;
  settings?: TeacherSettings;
}

export const ExcelImportModal: React.FC<ExcelImportModalProps> = ({
  isOpen,
  onClose,
  onImportStudents,
  currentStudentCount,
  settings,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<ParsedStudentRow[]>([]);
  const [importMode, setImportMode] = useState<'replace' | 'append'>('replace');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = async (selectedFile: File) => {
    setFile(selectedFile);
    setLoading(true);
    setErrorMessage(null);
    try {
      const rows = await excelService.parseExcelFile(selectedFile);
      if (rows.length === 0) {
        setErrorMessage('File Excel không có dữ liệu hoặc không đúng định dạng!');
        setParsedRows([]);
      } else {
        setParsedRows(rows);
      }
    } catch (err: any) {
      setErrorMessage('Không thể đọc file Excel. Vui lòng kiểm tra lại file của bạn!');
      setParsedRows([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const validRows = parsedRows.filter((r) => r.isValid);

  const handleConfirmImport = () => {
    if (validRows.length === 0) return;

    const studentList: Omit<Student, 'id'>[] = validRows.map((r) => ({
      rollNumber: r.rollNumber,
      name: r.name,
      gender: r.gender,
      group: r.group,
      role: r.role,
      parentName: r.parentName,
      parentPhone: r.parentPhone,
      note: r.note,
    }));

    onImportStudents(studentList, importMode);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-emerald-800 to-teal-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-300">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold">
                Thêm Danh Sách Học Sinh Từ File Excel (.xlsx / .csv)
              </h3>
              <p className="text-xs text-emerald-200">
                Lớp Chủ Nhiệm {settings?.className || '10A7'} • {settings?.schoolName || 'Trường THPT An Phú'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-emerald-200 hover:text-white p-1 rounded-lg hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* Top download template button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl">
            <div>
              <div className="font-bold text-emerald-950">Chưa có file mẫu chuẩn?</div>
              <div className="text-emerald-800 mt-0.5">
                Tải file mẫu Excel đã thiết lập sẵn các cột (STT, Họ tên, Giới tính, Tổ, Chức vụ, SĐT PH...) để nhập liệu nhanh nhất.
              </div>
            </div>
            <button
              onClick={() => excelService.downloadTemplate()}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold rounded-lg shadow-2xs transition-colors shrink-0 cursor-pointer self-start sm:self-auto"
            >
              <Download className="w-4 h-4" />
              <span>Tải File Mẫu Excel</span>
            </button>
          </div>

          {/* Upload Drop Zone */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl p-6 text-center cursor-pointer transition-colors bg-slate-50/60 hover:bg-emerald-50/30"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx, .xls, .csv"
              onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
              className="hidden"
            />
            <Upload className="w-8 h-8 mx-auto text-emerald-600 mb-2" />
            <div className="font-bold text-slate-800 text-sm">
              {file ? file.name : 'Bấm để chọn file Excel hoặc kéo thả file vào đây'}
            </div>
            <div className="text-slate-500 text-[11px] mt-1">
              Hỗ trợ định dạng: .xlsx, .xls, .csv (Tự động nhận diện các cột dữ liệu)
            </div>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Loading indicator */}
          {loading && (
            <div className="text-center py-4 text-emerald-700 font-semibold">
              Đang phân tích dữ liệu file Excel...
            </div>
          )}

          {/* Preview Table */}
          {parsedRows.length > 0 && (
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="font-bold text-slate-800 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>
                    Xem trước kết quả: Tìm thấy {validRows.length} / {parsedRows.length} học sinh hợp lệ
                  </span>
                </div>

                {/* Import Mode Options */}
                <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg">
                  <label className="flex items-center gap-1 cursor-pointer px-2 py-0.5 rounded text-[11px] font-medium text-slate-700 hover:bg-white">
                    <input
                      type="radio"
                      name="importMode"
                      checked={importMode === 'replace'}
                      onChange={() => setImportMode('replace')}
                      className="text-emerald-600"
                    />
                    <span>Ghi đè danh sách (Thay thế)</span>
                  </label>
                  <label className="flex items-center gap-1 cursor-pointer px-2 py-0.5 rounded text-[11px] font-medium text-slate-700 hover:bg-white">
                    <input
                      type="radio"
                      name="importMode"
                      checked={importMode === 'append'}
                      onChange={() => setImportMode('append')}
                      className="text-emerald-600"
                    />
                    <span>Thêm tiếp vào danh sách ({currentStudentCount} HS hiện tại)</span>
                  </label>
                </div>
              </div>

              {/* Scrollable preview table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden max-h-56 overflow-y-auto">
                <table className="w-full text-left text-[11px]">
                  <thead className="bg-slate-100 text-slate-700 font-bold sticky top-0 border-b border-slate-200">
                    <tr>
                      <th className="px-3 py-2 w-10 text-center">STT</th>
                      <th className="px-3 py-2">Họ và tên</th>
                      <th className="px-2 py-2">Phái</th>
                      <th className="px-2 py-2">Tổ</th>
                      <th className="px-3 py-2">Chức vụ</th>
                      <th className="px-3 py-2">SĐT Phụ huynh</th>
                      <th className="px-3 py-2">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {parsedRows.map((r, idx) => (
                      <tr
                        key={idx}
                        className={r.isValid ? 'hover:bg-slate-50' : 'bg-rose-50/50 text-rose-800'}
                      >
                        <td className="px-3 py-1.5 text-center font-medium">{r.rollNumber}</td>
                        <td className="px-3 py-1.5 font-bold text-slate-900">{r.name}</td>
                        <td className="px-2 py-1.5">{r.gender}</td>
                        <td className="px-2 py-1.5 font-semibold text-blue-700">Tổ {r.group}</td>
                        <td className="px-3 py-1.5">{r.role}</td>
                        <td className="px-3 py-1.5 font-mono text-slate-600">{r.parentPhone}</td>
                        <td className="px-3 py-1.5">
                          {r.isValid ? (
                            <span className="text-emerald-600 font-semibold">Hợp lệ</span>
                          ) : (
                            <span className="text-rose-600 font-semibold">{r.error}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3 bg-slate-100 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold"
          >
            Đóng
          </button>

          <button
            onClick={handleConfirmImport}
            disabled={validRows.length === 0}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-xs font-bold shadow-sm transition-all"
          >
            Xác Nhận Nhập {validRows.length} Học Sinh Vào Lớp 10A7
          </button>
        </div>
      </div>
    </div>
  );
};

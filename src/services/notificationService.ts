import { StudentScoreSummary, TeacherSettings } from '../types';

export type NotificationTemplateType =
  | 'weekly_report'
  | 'urgent_violation'
  | 'commendation'
  | 'custom';

export const notificationService = {
  cleanPhoneNumber(phone: string): string {
    if (!phone) return '';
    let clean = phone.replace(/[^0-9]/g, '');
    if (clean.startsWith('84') && clean.length > 9) {
      clean = '0' + clean.slice(2);
    }
    return clean;
  },

  isValidPhoneNumber(phone: string): boolean {
    const clean = this.cleanPhoneNumber(phone);
    return clean.length >= 9 && clean.length <= 11 && clean.startsWith('0');
  },

  getZaloChatUrl(phone: string): string {
    const clean = this.cleanPhoneNumber(phone);
    return clean ? `https://zalo.me/${clean}` : 'https://chat.zalo.me';
  },

  getZaloWebUrl(): string {
    return 'https://chat.zalo.me';
  },

  getSmsUrl(phone: string, message: string): string {
    const clean = this.cleanPhoneNumber(phone);
    // Standard SMS URI scheme supported across Android, iOS and SMS handlers
    return `sms:${clean}?body=${encodeURIComponent(message)}`;
  },

  generateMessage(
    summary: StudentScoreSummary,
    settings: TeacherSettings,
    templateType: NotificationTemplateType = 'weekly_report',
    customNotes: string = ''
  ): string {
    const { student, totalScore, rankTitle, violationCount, rewardCount, incidents } = summary;
    const week = settings.currentWeek;

    const violations = incidents.filter((i) => i.category === 'violation');
    const rewards = incidents.filter((i) => i.category === 'reward');

    const parentSalutation = student.parentName
      ? `Kính gửi Bác/Cô/Chú ${student.parentName} (Phụ huynh em ${student.name})`
      : `Kính gửi Quý Phụ huynh em ${student.name}`;

    if (templateType === 'urgent_violation') {
      let violationDetails = 'Chưa ghi nhận chi tiết.';
      if (violations.length > 0) {
        violationDetails = violations
          .map(
            (v, idx) =>
              `${idx + 1}. ${v.ruleName} (${v.points}đ) - ${v.date}${v.period ? ` [${v.period}]` : ''}${v.note ? `: ${v.note}` : ''}`
          )
          .join('\n');
      }

      return `📢 [THÔNG BÁO TỪ GVCN LỚP 10A7]
${parentSalutation} - Học sinh Lớp 10A7 (Tổ ${student.group}),

Thầy Trần Văn Dư (GVCN Lớp 10A7) xin trân trọng trao đổi cùng Gia đình về tình hình rèn luyện nề nếp của em ${student.name} trong Tuần ${week}:
Hiện tại em đang bị trừ điểm do các vi phạm sau:
${violationDetails}

📉 Điểm nề nếp tuần hiện tại: ${totalScore}/100 điểm (Xếp loại: ${rankTitle})
${customNotes ? `\n📝 Lời dặn từ Thầy Dư: ${customNotes}\n` : ''}
Kính mong Quý Phụ huynh dành thời gian trò chuyện, nhắc nhở và đôn đốc em chấp hành nghiêm chỉnh nội quy lớp học, giờ giấc và tác phong để tuần tới đạt kết quả thi đua tốt hơn.

Trân trọng cảm ơn sự đồng hành của Gia đình!
GVCN: Thầy Trần Văn Dư - SĐT/Zalo: ${settings.teacherPhone}
${settings.schoolName}`;
    }

    if (templateType === 'commendation') {
      let rewardDetails = '';
      if (rewards.length > 0) {
        rewardDetails = rewards
          .map(
            (r, idx) =>
              `✨ ${r.ruleName} (+${r.points}đ) - ${r.note || r.period || r.date}`
          )
          .join('\n');
      }

      return `🎉 [THƯ KHEN NỀ NẾP & HỌC TẬP LỚP 10A7]
${parentSalutation},

Thầy Trần Văn Dư (GVCN Lớp 10A7) rất vui mừng thông báo trong Tuần ${week} vừa qua, em ${student.name} (Tổ ${student.group}) đã có thành tích rèn luyện và nề nếp rất xuất sắc:
🏆 Điểm thi đua: ${totalScore}/100 điểm (Xếp loại: ${rankTitle})
${rewardDetails ? `\nCác thành tích & điểm sáng nổi bật:\n${rewardDetails}\n` : ''}
${customNotes ? `\nLời nhắn từ GVCN: ${customNotes}\n` : ''}
Thầy Dư cùng tập thể lớp 10A7 ghi nhận sự nỗ lực, chăm ngoan của em và xin gửi lời chúc mừng, cảm ơn chân thành đến Quý Phụ huynh đã luôn sát sao dạy bảo con.

Trân trọng!
GVCN: Thầy Trần Văn Dư - SĐT/Zalo: ${settings.teacherPhone}
${settings.schoolName}`;
    }

    // Default: weekly_report
    let detailSection = '';
    if (violationCount > 0) {
      detailSection += `\n⚠️ Các điểm cần lưu ý/khắc phục (${violationCount} lần):\n` +
        violations
          .map((v) => ` - ${v.ruleName} (${v.points}đ)${v.note ? ` [${v.note}]` : ''}`)
          .join('\n');
    }

    if (rewardCount > 0) {
      detailSection += `\n🌟 Điểm cộng tuyên dương (${rewardCount} lần):\n` +
        rewards
          .map((r) => ` + ${r.ruleName} (+${r.points}đ)${r.note ? ` [${r.note}]` : ''}`)
          .join('\n');
    }

    if (violationCount === 0 && rewardCount === 0) {
      detailSection = '\n✅ Em duy trì nề nếp rất ổn định, chấp hành tốt mọi nội quy lớp học và nhà trường.';
    }

    let advice = '';
    if (totalScore >= 95) {
      advice = 'Em chăm ngoan, giữ vững tinh thần gương mẫu của lớp 10A7!';
    } else if (totalScore >= 85) {
      advice = 'Nề nếp của em khá tốt, cần tiếp tục phát huy trong tuần tới.';
    } else if (totalScore >= 75) {
      advice = 'Kính nhờ Quý Phụ huynh nhắc nhở thêm để em chú ý tác phong và chuẩn bị bài chu đáo hơn.';
    } else {
      advice = 'Kính nhờ Gia đình quan tâm, đôn đốc nhắc nhở em khắc phục ngay các lỗi vi phạm trên.';
    }

    return `📋 [BÁO CÁO NỀ NẾP TUẦN ${week} - LỚP 10A7]
${parentSalutation},

Thầy Trần Văn Dư (GVCN Lớp 10A7) xin gửi báo cáo tổng kết nề nếp thi đua tuần vừa qua của em ${student.name} (Tổ ${student.group}):

📊 Kết quả nề nếp:
• Điểm thi đua: ${totalScore}/100 điểm
• Xếp loại tuần: ${rankTitle}
${detailSection}

💡 Lời dặn từ GVCN:
${advice}
${customNotes ? `• Ghi chú thêm: ${customNotes}\n` : ''}
Kính chúc Quý Phụ huynh cùng gia đình thật nhiều sức khỏe! Mọi thắc mắc cần trao đổi xin vui lòng liên hệ thầy Dư.

Trân trọng!
Thầy Trần Văn Dư (GVCN Lớp 10A7)
SĐT / Zalo: ${settings.teacherPhone}
${settings.schoolName}`;
  },

  async copyToClipboard(text: string): Promise<boolean> {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      }
      // fallback
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return true;
    } catch (err) {
      console.error('Clipboard copy failed:', err);
      return false;
    }
  },
};

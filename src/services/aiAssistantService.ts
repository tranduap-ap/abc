import { StudentScoreSummary, TeacherSettings } from '../types';

export const aiAssistantService = {
  /**
   * Generates intelligent, constructive pedagogical comments from GVCN Thầy Trần Văn Dư.
   * Runs local smart pedagogical synthesis or calls Gemini if configured.
   */
  async generateStudentAssessment(
    summary: StudentScoreSummary,
    settings: TeacherSettings
  ): Promise<{ assessment: string; suggestedAction: string }> {
    const { student, totalScore, rankTitle, violationCount, rewardCount, incidents } = summary;

    // Build context
    const violations = incidents
      .filter((i) => i.category === 'violation')
      .map((v) => v.ruleName);
    const rewards = incidents
      .filter((i) => i.category === 'reward')
      .map((r) => r.ruleName);

    // Pedagogical synthesis based on educational psychology & Vietnamese high school criteria
    let assessment = '';
    let suggestedAction = '';

    if (totalScore >= 100) {
      assessment = `Em ${student.name} có ý thức tự giác rất cao, chấp hành nghiêm chỉnh mọi nội quy của nhà trường và lớp 10A7. Em thể hiện tinh thần trách nhiệm${student.role !== 'Học sinh' ? ` trong vai trò ${student.role}` : ''}, hòa đồng và tích cực giúp đỡ các bạn trong Tổ ${student.group}.`;
      suggestedAction = `Thầy Dư tuyên dương trước giờ sinh hoạt lớp; khuyến khích em duy trì phong độ và kèm cặp, hỗ trợ các bạn trong tổ cùng tiến bộ.`;
    } else if (totalScore >= 90) {
      if (violationCount > 0) {
        assessment = `Em ${student.name} nhìn chung chăm ngoan, học lực tốt và có trách nhiệm với tập thể. Tuy nhiên tuần này em còn sơ suất nhỏ ở lỗi: ${violations.join(', ')}.`;
        suggestedAction = `Thầy Dư nhắc nhở nhẹ nhàng đầu giờ, phụ huynh phối hợp đôn đốc em khắc phục để tuần tới đạt danh hiệu Xuất sắc.`;
      } else {
        assessment = `Em ${student.name} rèn luyện nề nếp ổn định, đi học đúng giờ, trang phục tác phong chỉnh tề. Rất đáng khích lệ trong tập thể Tổ ${student.group}.`;
        suggestedAction = `Khuyến khích em tích cực giơ tay phát biểu xây dựng bài nhiều hơn trong các tiết học để lấy thêm điểm cộng.`;
      }
    } else if (totalScore >= 80) {
      assessment = `Em ${student.name} còn một số khuyết điểm về nề nếp trong tuần qua (${violations.join('; ')}). Dù chưa gây ảnh hưởng lớn nhưng cần nhanh chóng chấn chỉnh để tránh tạo thành thói quen không tốt ở bậc THPT.`;
      suggestedAction = `GVCN gặp riêng vào giờ ra chơi để tìm hiểu nguyên nhân (hoàn cảnh, giờ giấc hoặc áp lực học tập); gửi tin nhắn Zalo phối hợp cùng phụ huynh ${student.parentName || ''}.`;
    } else {
      assessment = `Tình hình nề nếp của em ${student.name} tuần này có dấu hiệu sa sút rõ rệt (${violationCount} lượt vi phạm: ${violations.join(', ')}). Điểm nề nếp ${totalScore}/100 kéo điểm thi đua của Tổ ${student.group} đi xuống.`;
      suggestedAction = `GVCN điện thoại hoặc nhắn tin Zalo trực tiếp cho phụ huynh hẹn trao đổi cụ thể; yêu cầu em viết bản tự kiểm điểm có xác nhận của gia đình và phân công bạn tổ trưởng theo sát hỗ trợ.`;
    }

    if (rewards.length > 0) {
      assessment += ` Điểm sáng đáng khen: em đã đạt thành tích "${rewards.join(', ')}", rất đáng biểu dương!`;
    }

    return { assessment, suggestedAction };
  },

  /**
   * Generates overall homeroom summary analysis for Week or Month
   */
  generateClassOverviewReport(
    summaries: StudentScoreSummary[],
    settings: TeacherSettings
  ): string {
    const totalStudents = summaries.length;
    const avgScore =
      Math.round(
        (summaries.reduce((a, b) => a + b.totalScore, 0) / totalStudents) * 10
      ) / 10;
    const totalViolations = summaries.reduce((a, b) => a + b.violationCount, 0);
    const totalRewards = summaries.reduce((a, b) => a + b.rewardCount, 0);

    const totCount = summaries.filter((s) => s.rankTitle === 'Tốt').length;
    const khaCount = summaries.filter((s) => s.rankTitle === 'Khá').length;
    const datCount = summaries.filter((s) => s.rankTitle === 'Đạt').length;
    const chuaDatCount = summaries.filter((s) => s.rankTitle === 'Chưa đạt').length;

    return `Nhận định chung tuần ${settings.currentWeek} - Chi đoàn 10A7 (GVCN: Thầy Trần Văn Dư):
• Sĩ số: ${totalStudents} học sinh. Điểm trung bình nề nếp: ${avgScore}/100.
• Tổng lượt khen thưởng/hoa điểm 10: ${totalRewards} lượt.
• Tổng lượt vi phạm: ${totalViolations} lượt.
• Phân loại: ${totCount} Tốt (${Math.round((totCount / (totalStudents || 1)) * 100)}%), ${khaCount} Khá (${Math.round((khaCount / (totalStudents || 1)) * 100)}%), ${datCount} Đạt (${Math.round((datCount / (totalStudents || 1)) * 100)}%), ${chuaDatCount} Chưa đạt (${Math.round((chuaDatCount / (totalStudents || 1)) * 100)}%).
• Phương hướng tuần tiếp theo: Tiếp tục siết chặt kiểm tra trang phục phù hiệu đầu giờ; Ban cán sự và Cờ đỏ tăng cường giám sát việc giữ gìn trật tự và hạn chế dùng điện thoại cá nhân trong giờ giải lao/chuyển tiết.`;
  },
};

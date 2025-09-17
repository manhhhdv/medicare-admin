const getStatusColor = (status) => {
  switch (status) {
    // Đang Chờ
    case "Pending":
      return "yellow.200";
    // Đã Xác Nhận
    case "Confirmed":
      return "green.200";
    // Đã Từ Chối, Đã Hủy
    case "Rejected":
    case "Cancelled":
      return "red.200";
    // Đã Hoàn Thành
    case "Completed":
      return "blue.200";
    // Đã Đổi Lịch
    case "Rescheduled":
      return "orange.200";
    // Đã Khám
    case "Visited":
      return "purple.200";
    // Không xác định
    default:
      return "gray.200";
  }
};
export default getStatusColor;

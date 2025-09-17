import { Badge } from "@chakra-ui/react";

const getCancellationStatusBadge = (status) => {
  switch (status) {
    case "Processing":
      return (
        <Badge colorScheme="yellow" fontSize={12}>
          Đang Xử Lý
        </Badge>
      );
    case "Approved":
      return (
        <Badge colorScheme="green" fontSize={12}>
          Đã Duyệt
        </Badge>
      );
    case "Rejected":
      return (
        <Badge colorScheme="red" fontSize={12}>
          Đã Từ Chối
        </Badge>
      );
    case "Cancelled":
      return (
        <Badge colorScheme="red" fontSize={12}>
          Đã Hủy
        </Badge>
      );
    case "Initiated":
      return (
        <Badge colorScheme="blue" fontSize={12}>
          Khởi Tạo
        </Badge>
      );
    default:
      return (
        <Badge colorScheme="gray" fontSize={12}>
          Không Có Thông Tin
        </Badge>
      );
  }
};

export default getCancellationStatusBadge;

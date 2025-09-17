import { Badge } from "@chakra-ui/react";

const getStatusBadge = (status) => {
  switch (status) {
    case "Pending":
      return (
        <Badge colorScheme="yellow" fontSize={12} letterSpacing={0.5} p={"5px"}>
          Đang Chờ
        </Badge>
      );
    case "Confirmed":
      return (
        <Badge colorScheme="green" fontSize={12} letterSpacing={0.5} p={"5px"}>
          Đã Xác Nhận
        </Badge>
      );
    case "Rejected":
      return (
        <Badge colorScheme="red" fontSize={12} letterSpacing={0.5} p={"5px"}>
          Đã Từ Chối
        </Badge>
      );
    case "Cancelled":
      return (
        <Badge colorScheme="red" fontSize={12} letterSpacing={0.5} p={"5px"}>
          Đã Hủy
        </Badge>
      );
    case "Completed":
      return (
        <Badge colorScheme="blue" fontSize={12} letterSpacing={0.5} p={"5px"}>
          Đã Hoàn Thành
        </Badge>
      );
    case "Rescheduled":
      return (
        <Badge colorScheme="orange" fontSize={12} letterSpacing={0.5} p={"5px"}>
          Đã Đổi Lịch
        </Badge>
      );
    case "Visited":
      return (
        <Badge colorScheme="purple" fontSize={12} letterSpacing={0.5} p={"5px"}>
          Đã Khám
        </Badge>
      );
    default:
      return (
        <Badge colorScheme="gray" fontSize={12} letterSpacing={0.5} p={"5px"}>
          {status}
        </Badge>
      );
  }
};

export default getStatusBadge;

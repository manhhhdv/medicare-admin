import { useToast } from "@chakra-ui/react";

export default function ShowChakraToast({ status, message }) {
  const toast = useToast();

  toast({
    title: message, // Tiêu đề thông báo (đã được truyền vào, nên không cần dịch ở đây)
    status: status,
    duration: 3000, // Toast display duration in milliseconds
    isClosable: true,
    position: "top",
  });
}

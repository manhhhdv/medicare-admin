import { Box, Flex, Heading, Text, Icon } from "@chakra-ui/react";
import { MessageCircleWarningIcon } from "lucide-react";

function NotAuth() {
  return (
    <Flex direction="column" align="center" justify="center" minH="100%" p={4}>
      <Box p={8} rounded="lg" shadow="lg" textAlign="center">
        <Flex justify="center" mb={4}>
          <Icon as={MessageCircleWarningIcon} boxSize={10} color="red.500" />
        </Flex>
        <Heading as="h1" size="lg" mb={4} color="red.600">
          Bạn không có quyền truy cập trang này.
        </Heading>
        <Text fontSize="md" mb={6}>
          Bạn đã cố gắng truy cập vào một trang mà bạn không có quyền xem.
          <br />
          Vui lòng liên hệ quản trị viên để được cấp quyền hoặc thử đăng nhập bằng tài khoản khác.
        </Text>
      </Box>
    </Flex>
  );
}
export default NotAuth;

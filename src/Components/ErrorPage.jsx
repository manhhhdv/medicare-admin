import Logout from "../Controllers/logout";
import {
  Box,
  Heading,
  Text,
  Image,
  Button,
  useColorModeValue,
} from "@chakra-ui/react";
import { useEffect } from "react";

const ErrorPage = () => {
  const textColor = useColorModeValue("gray.700", "gray.300");

  useEffect(() => {
    document.title = "500 Internal Server Error";
  }, []);

  const baseURL = import.meta.env.BASE_URL;

  return (
    <Box
      textAlign="center"
      py={10}
      px={6}
      bg={useColorModeValue("gray.50", "gray.800")}
      minH="100vh"
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
    >
      <Image
        src={`${baseURL}/broken.gif`}
        alt="Error Illustration"
        boxSize="200px"
        mb={6}
      />

      <Heading as="h1" size="2xl" color={textColor}>
        <Text fontSize="6xl" fontWeight="bold" color="red.500">
          500
        </Text>
        Internal Server Error
      </Heading>

      <Text fontSize="lg" mt={4} color={textColor}>
        Ôi! Đã xảy ra sự cố phía máy chủ. Chúng tôi đang khắc phục sự cố này.
      </Text>

      <Text fontSize="md" mt={2} color={textColor}>
        Vui lòng thử tải lại trang, hoặc quay về trang chủ.
      </Text>

      <Button
        colorScheme="blue"
        mt={6}
        onClick={() => window.location.reload()}
      >
        Thử Lại
      </Button>
      <Button
        w={48}
        colorScheme="red"
        mt={6}
        onClick={() => {
          Logout();
        }}
      >
        Đăng Xuất
      </Button>
    </Box>
  );
};

export default ErrorPage;

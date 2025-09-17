import ForgetPassword from "../Components/ForgetPassword";
import AnimatedCircles from "../Components/ui/AnimatedCircles";
import api from "../Controllers/api";

import useSettingsData from "../Hooks/SettingData";
import {
  Button,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Link,
  Stack,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Radio,
  RadioGroup,
  useDisclosure,
  IconButton,
  InputGroup,
  InputRightElement,
  useColorModeValue,
  VStack,
  Text,
  Image,
} from "@chakra-ui/react";
import axios from "axios";
import { motion } from "framer-motion";
import moment from "moment";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { AiFillEyeInvisible } from "react-icons/ai";
import { AiFillEye } from "react-icons/ai";

const MotionButton = motion(Button);
const MotionStack = motion(Stack);

function getExpTime() {
  const timestamp = moment().add(24, "hours").valueOf();
  return timestamp;
}

export default function Login() {
  const { register, handleSubmit } = useForm();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false); // Fixed typo: setisLoading -> setIsLoading
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [loginData, setLoginData] = useState(); // Fixed typo: setloginData -> setLoginData
  const [showPassword, setShowPassword] = useState(false);
  const { settingsData } = useSettingsData();
  const title = settingsData?.find((value) => value.id_name === "clinic_name");
  

  const {
    isOpen: isPasswordOpen,
    onOpen: onPasswordOpen,
    onClose: onPasswordClose,
  } = useDisclosure();

  const formBg = useColorModeValue("white", "gray.700");
  const textColor = useColorModeValue("gray.600", "gray.200");
  const headingColor = useColorModeValue("blue.700", "blue.300");
  const inputBg = useColorModeValue("gray.100", "gray.600");
  const inputBorder = useColorModeValue("gray.200", "gray.500");
  const focusBorderColor = useColorModeValue("blue.500", "teal.300");
  const linkColor = useColorModeValue("blue.500", "teal.300");

  const handleTogglePassword = () => setShowPassword(!showPassword);

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const response = await axios.post(`${api}/login`, data);
      const loginData = response.data;
      setIsLoading(false);
      if (loginData.response === 200) {
        if (!loginData.data.role || loginData.data.role.length === 0) {
          toastError("Bạn không có quyền truy cập vào bảng quản trị.");
        } else if (loginData.data.role.length > 1) {
          setRoles(loginData.data.role);
          setLoginData({ data: loginData.data, token: loginData.token });
          onOpen();
        } else {
          loginUser(loginData.data, loginData.token, loginData.data.role[0]);
        }
      } else {
        toastError("Sai Email hoặc Mật khẩu.");
      }
    } catch (error) {
      setIsLoading(false);
      toastError("Đã xảy ra lỗi trong quá trình đăng nhập. Vui lòng thử lại.");
      console.error(error);
    }
  };

  const loginUser = (userData, token, selectedRole) => {
    const combinedObject = {
      ...userData,
      role: selectedRole,
      token,
      exp: getExpTime(),
    };
    localStorage.setItem("admin", JSON.stringify(combinedObject));
    toast({
      title: "Đăng nhập thành công.",
      status: "success",
      duration: 9000,
      isClosable: true,
      position: "top",
    });
    setTimeout(() => window.location.reload(), 1000);
  };

  const toastError = (message) => {
    toast({
      title: message,
      status: "error",
      duration: 9000,
      isClosable: true,
      position: "top",
    });
  };

  const handleRoleSelection = () => {
    const selectedRoleObject = roles.find((role) => role.name === selectedRole);
    if (selectedRoleObject) {
      loginUser(loginData.data, loginData.token, selectedRoleObject);
      onClose();
    }
  };

  return (
    <Flex
      minH="100vh"
      align="center"
      justify="center"
      bgImage={"https://i.postimg.cc/Dz1HT4QX/loginbg.png"}
      position="relative"
      overflow="hidden"
      background={"https://i.postimg.cc/Dz1HT4QX/loginbg.png"}
      backgroundSize="cover"
      backgroundPosition="center"
    >
      {/* Animated Background Elements */}
      <AnimatedCircles />

      <MotionStack
        spacing={6}
        w="full"
        maxW="lg"
        bg={formBg}
        rounded="xl"
        boxShadow="lg"
        p={8}
        as="form"
        onSubmit={handleSubmit(onSubmit)}
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        backdropFilter="blur(10px)"
      >
        <VStack spacing={3} align="center">
          <Image
            src={'https://i.postimg.cc/vZJkktny/logo-transation.png'}
            fallbackSrc={'https://i.postimg.cc/vZJkktny/logo-transation.png'}
            alt={title?.value}
            boxSize="150px"
          />
          <Heading fontSize="3xl" fontWeight="bold" color={headingColor}>
            Đăng nhập vào tài khoản của bạn
          </Heading>
          <Text fontSize="sm" color={textColor}>
            Chào mừng trở lại! Vui lòng nhập thông tin của bạn.
          </Text>
        </VStack>

        <FormControl isRequired>
          <FormLabel fontSize="sm" color={textColor}>
            Địa chỉ email
          </FormLabel>
          <Input
            size="md"
            borderRadius="md"
            type="email"
            placeholder="Nhập địa chỉ email"
            variant="filled"
            bg={inputBg}
            borderColor={inputBorder}
            focusBorderColor={focusBorderColor}
            {...register("email")}
            as={motion.input}
            whileFocus={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          />
        </FormControl>

        <FormControl isRequired>
          <Flex justify="space-between" align="center">
            <FormLabel fontSize="sm" color={textColor}>
              Mật khẩu
            </FormLabel>
            <Link fontSize="sm" color={linkColor} onClick={onPasswordOpen}>
              Quên mật khẩu?
            </Link>
          </Flex>
          <InputGroup>
            <Input
              size="md"
              borderRadius="md"
              type={showPassword ? "text" : "password"}
              placeholder="Nhập mật khẩu của bạn"
              variant="filled"
              bg={inputBg}
              borderColor={inputBorder}
              focusBorderColor={focusBorderColor}
              {...register("password")}
              as={motion.input}
              whileFocus={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            />
            <InputRightElement>
              <IconButton
                variant="ghost"
                size="sm"
                onClick={handleTogglePassword}
                icon={showPassword ? <AiFillEyeInvisible /> : <AiFillEye />}
                aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                as={motion.button}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              />
            </InputRightElement>
          </InputGroup>
        </FormControl>

        <MotionButton
          colorScheme="blue"
          size="md"
          fontWeight="medium"
          rounded="md"
          isLoading={isLoading}
          loadingText="Đang đăng nhập..."
          type="submit"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          transition={{ duration: 0.3 }}
        >
          Đăng nhập
        </MotionButton>
      </MotionStack>

      {/* Role Selection Modal */}
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent
          rounded="lg"
          p={2}
          bg={formBg}
          as={motion.div}
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <ModalHeader fontSize="lg" fontWeight="semibold" color={headingColor}>
            Chọn vai trò của bạn
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <RadioGroup onChange={setSelectedRole} value={selectedRole}>
              <VStack align="start" spacing={3}>
                {roles.map((role) => (
                  <Radio
                    key={role.id}
                    value={role.name}
                    colorScheme="blue"
                    as={motion.div}
                    whileHover={{ x: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    {role.name}
                  </Radio>
                ))}
              </VStack>
            </RadioGroup>
          </ModalBody>
          <ModalFooter>
            <MotionButton
              colorScheme="blue"
              mr={3}
              onClick={handleRoleSelection}
              isDisabled={!selectedRole}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Tiếp tục
            </MotionButton>
            <MotionButton
              variant="ghost"
              onClick={onClose}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Hủy
            </MotionButton>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Reset Password */}
      <ForgetPassword isOpen={isPasswordOpen} onClose={onPasswordClose} />
    </Flex>
  );
}

/* eslint-disable react/prop-types */
import { ADD } from "../Controllers/ApiControllers";
import ShowToast from "../Controllers/ShowToast";
import admin from "../Controllers/admin";
import {
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  FormErrorMessage,
  useToast,
} from "@chakra-ui/react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";

const sentEmail = async (data) => {
  const res = await ADD("", "forget_password", data);
  if (res.response !== 200) {
    throw new Error(res.message);
  }
  return res;
};

const ForgetPassword = ({ isOpen, onClose }) => {
  const toast = useToast();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  const mutation = useMutation({
    mutationFn: async (data) => {
      await sentEmail(data);
    },
    onError: (error) => {
      ShowToast(toast, "lỗi", error.message);
    },
    onSuccess: () => {
      toast({
        title: "Email Đã Được Gửi",
        description: `Mật khẩu của bạn đã được gửi đến địa chỉ email của bạn. Vui lòng kiểm tra email.`,
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
      reset();
      onClose();
    },
  });

  // Submit Handler
  const onSubmit = async (data) => {
    mutation.mutate(data);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Quên Mật Khẩu</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <form onSubmit={handleSubmit(onSubmit)}>
            <FormControl isInvalid={errors.email}>
              <FormLabel>Nhập địa chỉ email của bạn</FormLabel>
              <Input
                defaultValue={admin?.email || ""}
                type="email"
                placeholder="Enter your email"
                {...register("email", {
                  required: "Bắt buộc nhập email",
                  pattern: {
                    value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/,
                    message: "Địa chỉ email không hợp lệ",
                  },
                })}
                size={"sm"}
                borderRadius={2}
              />
              <FormErrorMessage>
                {errors.email && errors.email.message}
              </FormErrorMessage>
            </FormControl>
            <ModalFooter>
              <Button
                colorScheme="teal"
                type="submit"
                isLoading={mutation.isPending}
                size={"sm"}
              >
                Gửi
              </Button>
              <Button
                ml={3}
                onClick={() => {
                  reset();
                  onClose();
                }}
                size={"sm"}
              >
                Hủy
              </Button>
            </ModalFooter>
          </form>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default ForgetPassword;

/* eslint-disable react/prop-types */
import { UPDATE } from "../../../Controllers/ApiControllers";
import ShowToast from "../../../Controllers/ShowToast";
import admin from "../../../Controllers/admin";
import {
  Box,
  Button,
  Divider,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Textarea,
  useToast,
} from "@chakra-ui/react";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";

export default function UpdatePaymentGetways({ isOpen, onClose, data }) {
  const [isLoading, setisLoading] = useState();
  const { register, handleSubmit } = useForm();
  const queryClient = useQueryClient();
  const toast = useToast();

  const handleUpdate = async (Inputdata) => {
    let formData = {
      ...Inputdata,
      id: data.id,
    };
    try {
      setisLoading(true);
      const res = await UPDATE(admin.token, "update_payment_gateway", formData);
      setisLoading(false);
      if (res.response === 200) {
        ShowToast(toast, "success", "Cổng thanh toán đã được cập nhật!");
        queryClient.invalidateQueries("payment-getways");
        onClose();
      } else {
        ShowToast(toast, "error", res.message);
      }
    } catch (error) {
      setisLoading(false);
      ShowToast(toast, "error", JSON.stringify(error));
    }
  };

  //   deleteImage

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      isCentered
      size={"lg"}
      scrollBehavior="inside"
    >
      <ModalOverlay />
      <ModalContent as={"form"} onSubmit={handleSubmit(handleUpdate)}>
        <ModalHeader fontSize={18} py={2}>
          Cập nhật cổng thanh toán
        </ModalHeader>
        <ModalCloseButton />
        <Divider />
        <ModalBody>
          <Box pb={3}>
            <FormControl isRequired>
              <FormLabel>Tiêu đề</FormLabel>
              <Input
                isReadOnly
                placeholder="Tiêu đề"
                defaultValue={data?.title}
                {...register("title", { required: true })}
              />
            </FormControl>
            <FormControl isRequired mt={5}>
              <FormLabel>Khóa</FormLabel>
              <Textarea
                placeholder="Khóa"
                defaultValue={data?.key}
                {...register("key", { required: true })}
              />
            </FormControl>
            <FormControl isRequired mt={5}>
              <FormLabel>Bí mật</FormLabel>
              <Textarea
                placeholder="Bí mật"
                defaultValue={data?.secret}
                {...register("secret", { required: true })}
              />
            </FormControl>
            <FormControl isRequired mt={5}>
              <FormLabel>Khóa bí mật Webhook</FormLabel>
              <Textarea
                placeholder="Khóa bí mật Webhook"
                defaultValue={data?.webhook_secret_key}
                {...register("webhook_secret_key", { required: true })}
              />
            </FormControl>
          </Box>
        </ModalBody>
        <Divider />
        <ModalFooter py={3}>
          <Button colorScheme="gray" mr={3} onClick={onClose} size={"sm"}>
            Đóng
          </Button>
          <Button
            variant="solid"
            size={"sm"}
            colorScheme="blue"
            type="submit"
            isLoading={isLoading}
          >
            Cập nhật
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

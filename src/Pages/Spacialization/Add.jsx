/* eslint-disable react/prop-types */
import { ADD } from "../../Controllers/ApiControllers";
import ShowToast from "../../Controllers/ShowToast";
import admin from "../../Controllers/admin";
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
  useToast,
} from "@chakra-ui/react";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";

export default function AddSpecialization({ isOpen, onClose }) {
  const [isLoading, setisLoading] = useState();

  const { register, handleSubmit, reset } = useForm();
  const queryClient = useQueryClient();
  const toast = useToast();

  const AddNew = async (data) => {
    let formData = {
      ...data,
    };
    try {
      setisLoading(true);
      const res = await ADD(admin.token, "add_specialization", formData);
      setisLoading(false);
      if (res.response === 200) {
        ShowToast(toast, "success", "Đã thêm chuyên môn!");
        queryClient.invalidateQueries("specialization");
        reset();
        onClose();
      } else {
        ShowToast(toast, "error", res.message);
      }
    } catch (error) {
      setisLoading(false);
      ShowToast(toast, "error", JSON.stringify(error));
    }
  };
  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size={"lg"}>
      <ModalOverlay />
      <ModalContent as={"form"} onSubmit={handleSubmit(AddNew)}>
        <ModalHeader fontSize={18} py={2}>
          Thêm chuyên môn
        </ModalHeader>
        <ModalCloseButton />
        <Divider />
        <ModalBody>
          <Box pb={3}>
            <FormControl isRequired>
              <FormLabel>Tiêu đề</FormLabel>
              <Input
                placeholder="Tiêu đề"
                {...register("title", { required: true })}
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
            Thêm chuyên môn
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

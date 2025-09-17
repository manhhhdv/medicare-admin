/* eslint-disable react/prop-types */
import { UPDATE } from "../../Controllers/ApiControllers";
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
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";

export default function UpdateBanner({ isOpen, onClose, data }) {
  const { register, handleSubmit, reset } = useForm();
  const queryClient = useQueryClient();
  const toast = useToast();

  // UseMutation for updating the department
  const updateMutation = useMutation({
    mutationFn: async (data) => {
      await UPDATE(admin.token, "update_banner", data);
    },
    onSuccess: () => {
      ShowToast(toast, "success", "Đã cập nhật!");
      queryClient.invalidateQueries(["banners"]);
      reset();
      onClose();
    },
    onError: (error) => {
      ShowToast(toast, "error", JSON.stringify(error));
    },
    onSettled: () => {
      // Optionally handle any cleanup logic after success or failure
    },
  });

  // Add New Department function
  const AddNewDepartment = (Inputdata) => {
    const formData = {
      ...Inputdata,
      id: data.id,
    };

    updateMutation.mutate(formData);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      isCentered
      size={"lg"}
      scrollBehavior="inside"
    >
      <ModalOverlay />
      <ModalContent as={"form"} onSubmit={handleSubmit(AddNewDepartment)}>
        <ModalHeader fontSize={18} py={2}>
          Cập nhật biểu ngữ
        </ModalHeader>
        <ModalCloseButton />
        <Divider />
        <ModalBody>
          <Box pb={3}>
            <FormControl isRequired>
              <FormLabel>Thứ tự ưu tiên</FormLabel>
              <Input
                defaultValue={data?.preferences}
                placeholder="Thứ tự ưu tiên"
                {...register("preferences", { required: true })}
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
            isLoading={updateMutation.isPending}
          >
            Cập nhật biểu ngữ
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

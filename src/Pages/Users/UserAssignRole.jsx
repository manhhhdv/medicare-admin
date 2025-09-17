/* eslint-disable react/prop-types */
import { UPDATE } from "../../Controllers/ApiControllers";
import ShowToast from "../../Controllers/ShowToast";
import admin from "../../Controllers/admin";
import useHasPermission from "../../Hooks/HasPermission";
import useRolesData from "../../Hooks/UserRolesData";
import {
  Box,
  Button,
  Divider,
  FormControl,
  FormLabel,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  useToast,
} from "@chakra-ui/react";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";

export default function UserAssignRole({ isOpen, onClose, userID }) {
  const [isLoading, setisLoading] = useState(false);
  const { hasPermission } = useHasPermission();
  const { register, handleSubmit, reset } = useForm();
  const queryClient = useQueryClient();
  const toast = useToast();
  const { Roles } = useRolesData();

  const addRole = async (Inputdata) => {
    let formData = {
      ...Inputdata,
      user_id: userID,
    };

    try {
      setisLoading(true);
      const res = await UPDATE(admin.token, "assign_role", formData);
      setisLoading(false);
      if (res.response === 200) {
        ShowToast(toast, "success", "Gán vai trò thành công!");
        queryClient.invalidateQueries("roles");
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
  if (!hasPermission)
    return toast({
      title: "Bạn không được phép",
      description:
        "Bạn đã cố gắng truy cập một trang mà bạn không có quyền xem.",
      status: "error",
      duration: 2000,
      isClosable: true,
      position: "top",
    });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      isCentered
      size={"xl"}
      scrollBehavior="inside"
    >
      <ModalOverlay />
      <ModalContent as={"form"} onSubmit={handleSubmit(addRole)}>
        <ModalHeader fontSize={18} py={2}>
          Gán vai trò cho người dùng
        </ModalHeader>
        <ModalCloseButton />
        <Divider />
        <ModalBody>
          <Box pb={3}>
            <FormControl isRequired>
              <FormLabel>Vai trò</FormLabel>
              <Select
                placeholder="Chọn vai trò"
                {...register("role_id", { required: true })}
              >
                {Roles?.map((role) => (
                  <option value={role.id} key={role.id}>
                    {role.name}
                  </option>
                ))}
              </Select>
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
            Gán vai trò
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

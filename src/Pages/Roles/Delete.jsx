/* eslint-disable react/prop-types */
import { DELETE } from "../../Controllers/ApiControllers";
import showToast from "../../Controllers/ShowToast";
import admin from "../../Controllers/admin";
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Button,
  useToast,
} from "@chakra-ui/react";
import { useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";

export default function DeleteRole({ isOpen, onClose, data }) {
  const toast = useToast();
  const cancelRef = useRef();
  const queryClient = useQueryClient();
  const [isLoading, setisLoading] = useState();

  const DeleteRole = async () => {
    if (
      data.name === "Doctor" ||
      data.name === "Admin" ||
      data.name === "Front Desk"
    ) {
      return showToast(toast, "error", "Không thể xóa vai trò này!");
    }
    let formData = {
      id: data.id,
    };
    try {
      setisLoading(true);
      const res = await DELETE(admin.token, "delete_role", formData);
      setisLoading(false);
      if (res.response === 200) {
        showToast(toast, "success", "Đã xóa vai trò!");
        queryClient.invalidateQueries("roles");
        onClose();
      } else {
        showToast(toast, "error", res.message);
      }
    } catch (error) {
      setisLoading(false);
      showToast(toast, "error", JSON.stringify(error));
    }
  };

  return (
    <AlertDialog
      isOpen={isOpen}
      onClose={onClose}
      leastDestructiveRef={cancelRef}
      isCentered
    >
      <AlertDialogOverlay>
        <AlertDialogContent>
          <AlertDialogHeader fontSize="lg" fontWeight="semi-bold">
            Xóa vai trò ( <b>{data?.name}</b> )
          </AlertDialogHeader>

          <AlertDialogBody>
            Bạn có chắc không? Bạn không thể hoàn tác hành động này sau đó.
          </AlertDialogBody>

          <AlertDialogFooter>
            <Button
              ref={cancelRef}
              onClick={onClose}
              colorScheme="gray"
              size={"sm"}
            >
              Hủy
            </Button>
            <Button
              colorScheme="red"
              onClick={DeleteRole}
              ml={3}
              size={"sm"}
              isLoading={isLoading}
            >
              Xóa
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  );
}

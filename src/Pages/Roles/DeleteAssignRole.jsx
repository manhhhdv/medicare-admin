/* eslint-disable react/prop-types */
import { DELETE } from "../../Controllers/ApiControllers";
import ShowToast from "../../Controllers/ShowToast";
import admin from "../../Controllers/admin";
import {
  Button,
  useToast,
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
} from "@chakra-ui/react";
import { useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";

function DeleteAssignRole({ isOpen, onClose, data }) {
  const toast = useToast();
  const cancelRef = useRef();
  const queryClient = useQueryClient();
  const [isLoading, setisLoading] = useState();

  const DeleteRole = async () => {
    let formData = {
      id: data.id,
    };
    try {
      setisLoading(true);
      const res = await DELETE(admin.token, "de_assign_role", formData);
      setisLoading(false);
      if (res.response === 200) {
        ShowToast(toast, "success", "Đã xóa!");
        queryClient.invalidateQueries(["roles"]);
        queryClient.invalidateQueries(["user", data.userID]);
        queryClient.invalidateQueries(["users"]);
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
    <AlertDialog
      isOpen={isOpen}
      onClose={onClose}
      leastDestructiveRef={cancelRef}
      isCentered
    >
      <AlertDialogOverlay>
        <AlertDialogContent>
          <AlertDialogHeader fontSize="lg" fontWeight="semi-bold">
            Xóa vai trò đã gán ( <b>{data.role_name}</b> ) khỏi ({data.name})
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
export default DeleteAssignRole;

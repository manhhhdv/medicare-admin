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

export default function DeleteCity({ isOpen, onClose, data }) {
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
      const res = await DELETE(admin.token, "delete_city", formData);
      setisLoading(false);
      if (res.response === 200) {
        showToast(toast, "success", "Đã xóa thành phố!");
        queryClient.invalidateQueries("cities");
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
            Xóa thành phố ( <b>{data?.title}</b> )
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

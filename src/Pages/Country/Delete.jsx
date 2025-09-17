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

export default function DeleteCountry({ isOpen, onClose, data }) {
  const toast = useToast();
  const cancelRef = useRef();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  const deleteCountry = async () => {
    const formData = {
      id: data.id,
    };
    try {
      setIsLoading(true);
      const res = await DELETE(admin.token, "delete_country", formData);
      setIsLoading(false);
      if (res.response === 200) {
        showToast(toast, "success", "Đã xóa quốc gia!");
        queryClient.invalidateQueries("countries");
        onClose();
      } else {
        showToast(toast, "error", res.message);
      }
    } catch (error) {
      setIsLoading(false);
      showToast(toast, "error", error.message || "Đã có lỗi xảy ra.");
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
          <AlertDialogHeader fontSize="lg" fontWeight="semibold">
            Xóa quốc gia (<b>{data?.title}</b>)
          </AlertDialogHeader>

          <AlertDialogBody>
            Bạn có chắc không? Hành động này không thể được hoàn tác.
          </AlertDialogBody>

          <AlertDialogFooter>
            <Button
              ref={cancelRef}
              onClick={onClose}
              colorScheme="gray"
              size="sm"
            >
              Hủy
            </Button>
            <Button
              colorScheme="red"
              onClick={deleteCountry}
              ml={3}
              size="sm"
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

/* eslint-disable react/prop-types */
import { DELETE } from "../../Controllers/ApiControllers";
import ShowToast from "../../Controllers/ShowToast";
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

export default function DeletePrescription({ isOpen, onClose, data }) {
  const toast = useToast();
  const cancelRef = useRef();
  const queryClient = useQueryClient();
  const [isLoading, setisLoading] = useState();

  const handleDelete = async () => {
    let formData = {
      id: data.id,
    };
    try {
      setisLoading(true);
      const res = await DELETE(admin.token, "delete_prescription", formData);
      setisLoading(false);
      if (res.response === 200) {
        ShowToast(toast, "success", "Đã xóa đơn thuốc!");
        queryClient.invalidateQueries(["prescriptions", data.id]);
        queryClient.invalidateQueries([
          "prescriptions-patient",
          data.patient_id,
        ]);
        queryClient.invalidateQueries([
          "prescriptions-patient",
          data.appointment_id,
        ]);
        queryClient.invalidateQueries(["prescriptions"]);
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
            Xóa đơn thuốc ( <b>#{data?.id}</b> )
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
              onClick={handleDelete}
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

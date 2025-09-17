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
  Flex,
  useToast,
} from "@chakra-ui/react";
import { useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";

export default function DeletePatientFiles({ isOpen, onClose, data }) {
  const toast = useToast();
  const cancelRef = useRef();
  const queryClient = useQueryClient();
  const [isLoading, setisLoading] = useState();
  const DeleteFile = async () => {
    let formData = {
      id: data.id,
    };
    try {
      setisLoading(true);
      const res = await DELETE(admin.token, "delete_patient_file", formData);
      setisLoading(false);
      if (res.response === 200) {
        ShowToast(toast, "success", "Đã xóa tệp bệnh nhân");
        queryClient.invalidateQueries(["patient-files", data.patient_id]);
        queryClient.invalidateQueries(["all-files"]);
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
            <Flex>
              {" "}
              Xóa tệp ( <b>{data?.file_name}</b> )
            </Flex>
          </AlertDialogHeader>

          <AlertDialogBody>
            Bạn có chắc không? Bạn không thể hoàn tác hành động này.
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
              onClick={DeleteFile}
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

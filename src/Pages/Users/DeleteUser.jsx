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

export default function DeleteUser({ isOpen, onClose, data }) {
  const toast = useToast();
  const cancelRef = useRef();
  const queryClient = useQueryClient();
  const [isLoading, setisLoading] = useState();
  const [isSoftDeleteOpen, setIsSoftDeleteOpen] = useState(false);

  const HandleSoftDelete = async () => {
    let formData = {
      id: data.id,
    };
    try {
      setisLoading(true);
      const res = await DELETE(admin.token, "user_soft_delete", formData);
      setisLoading(false);
      if (res.response === 200) {
        ShowToast(toast, "success", "Đã xóa mềm người dùng!");
        queryClient.invalidateQueries("users");
        setIsSoftDeleteOpen(false);
        onClose();
      } else {
        ShowToast(toast, "error", res.message);
      }
    } catch (error) {
      setisLoading(false);
      ShowToast(toast, "error", JSON.stringify(error));
    }
  };

  const HandleDelete = async () => {
    let formData = {
      id: data.id,
    };
    try {
      setisLoading(true);
      const res = await DELETE(admin.token, "user_delete", formData);
      setisLoading(false);
      if (res.response === 200) {
        ShowToast(toast, "success", "Đã xóa người dùng!");
        queryClient.invalidateQueries("users");
        onClose();
      } else {
        ShowToast(toast, "error", res.message);
        setIsSoftDeleteOpen(true); // Open soft delete alert
      }
    } catch (error) {
      setisLoading(false);
      ShowToast(toast, "error", JSON.stringify(error));
    }
  };

  const handleAllClose = () => {
    setIsSoftDeleteOpen(false);
    onClose();
  };

  return (
    <>
      <AlertDialog
        isOpen={isOpen}
        onClose={isSoftDeleteOpen ? handleAllClose : onClose}
        leastDestructiveRef={cancelRef}
        isCentered
      >
        <AlertDialogOverlay>
          {isSoftDeleteOpen ? (
            <AlertDialogOverlay>
              <AlertDialogContent>
                <AlertDialogHeader fontSize="lg" fontWeight="semi-bold">
                  Xóa mềm người dùng ({" "}
                  <b>
                    #{data?.id} - {data?.name}
                  </b>{" "}
                  )
                </AlertDialogHeader>

                <AlertDialogBody>
                  Không thể xóa vĩnh viễn người dùng. Bạn có muốn thực hiện xóa mềm thay thế không?
                </AlertDialogBody>

                <AlertDialogFooter>
                  <Button
                    ref={cancelRef}
                    onClick={handleAllClose}
                    colorScheme="gray"
                    size={"sm"}
                  >
                    Hủy
                  </Button>
                  <Button
                    colorScheme="orange"
                    onClick={HandleSoftDelete}
                    ml={3}
                    size={"sm"}
                    isLoading={isLoading}
                  >
                    Xóa mềm người dùng
                  </Button>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialogOverlay>
          ) : (
            <AlertDialogContent>
              <AlertDialogHeader fontSize="lg" fontWeight="semi-bold">
                Xóa người dùng ({" "}
                <b>
                  #{data?.id} - {data?.name}
                </b>{" "}
                )
              </AlertDialogHeader>

              <AlertDialogBody>
                Bạn có chắc không? Bạn không thể hoàn tác hành động này sau đó.
              </AlertDialogBody>

              <AlertDialogFooter>
                <Button
                  ref={cancelRef}
                  onClick={handleAllClose}
                  colorScheme="gray"
                  size={"sm"}
                >
                  Hủy
                </Button>
                <Button
                  colorScheme="red"
                  onClick={HandleDelete}
                  ml={3}
                  size={"sm"}
                  isLoading={isLoading}
                >
                  Xóa người dùng
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          )}
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
}

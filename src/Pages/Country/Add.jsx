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
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";

export default function AddCountry({ isOpen, onClose, data }) {
  const [isLoading, setisLoading] = useState();

  const { register, handleSubmit, reset } = useForm();
  const queryClient = useQueryClient();
  const toast = useToast();

  const handleAdd = async (Inputdata) => {
    let formData = {
      ...Inputdata,
    };

    try {
      setisLoading(true);
      const res = await UPDATE(admin.token, "add_country", formData);
      setisLoading(false);
      if (res.response === 200) {
        ShowToast(toast, "success", "Đã thêm quốc gia!");
        queryClient.invalidateQueries("countries");
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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      isCentered
      size={"lg"}
      scrollBehavior="inside"
    >
      <ModalOverlay />
      <ModalContent as={"form"} onSubmit={handleSubmit(handleAdd)}>
        <ModalHeader fontSize={18} py={2}>
          Thêm quốc gia
        </ModalHeader>
        <ModalCloseButton />
        <Divider />
        <ModalBody>
          <Box pb={3}>
            <FormControl isRequired>
              <FormLabel>Tên</FormLabel>
              <Input
                defaultValue={data?.title}
                placeholder="Tên quốc gia"
                {...register("title", { required: true })}
              />
            </FormControl>
            <FormControl isRequired mt={5}>
              <FormLabel>Mã ISO</FormLabel>
              <Input
                defaultValue={data?.iso_code}
                placeholder="Mã ISO"
                {...register("iso_code", {
                  required: true,
                })}
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
            Thêm quốc gia
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

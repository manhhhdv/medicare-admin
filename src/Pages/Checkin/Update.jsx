/* eslint-disable react/prop-types */
import { UPDATE } from "../../Controllers/ApiControllers";
import ShowToast from "../../Controllers/ShowToast";
import admin from "../../Controllers/admin";
import {
  Box,
  Button,
  Divider,
  Flex,
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

export default function UpdateCheckin({ isOpen, onClose, data }) {
  const [isLoading, setisLoading] = useState();

  const { register, handleSubmit, reset } = useForm();
  const queryClient = useQueryClient();
  const toast = useToast();

  const handleUpdate = async (Inputdata) => {
    let formData = {
      ...Inputdata,
      id: data.id,
    };

    try {
      setisLoading(true);
      const res = await UPDATE(
        admin.token,
        "update_appointment_checkin",
        formData
      );
      setisLoading(false);
      if (res.response === 200) {
        ShowToast(toast, "success", "Đã cập nhật!");
        queryClient.invalidateQueries("checkins");
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
      <ModalContent as={"form"} onSubmit={handleSubmit(handleUpdate)}>
        <ModalHeader fontSize={18} py={2}>
          Cập nhật Check-in
        </ModalHeader>
        <ModalCloseButton />
        <Divider />
        <ModalBody>
          {" "}
          <Box pb={3}>
            <Flex align={"center"} gap={5}>
              {" "}
              <FormControl isRequired>
                <FormLabel>Mã Check-in</FormLabel>
                <Input
                  size={"sm"}
                  defaultValue={data?.id}
                  placeholder="Mã lịch hẹn"
                  {...register("appointment_id", { required: true })}
                  isReadOnly
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Mã lịch hẹn</FormLabel>
                <Input
                  size={"sm"}
                  defaultValue={data?.id}
                  placeholder="Mã lịch hẹn"
                  {...register("appointment_id", { required: true })}
                  isReadOnly
                />
              </FormControl>
            </Flex>

            <FormControl isRequired mt={3}>
              <FormLabel>Thời gian</FormLabel>
              <Input
                defaultValue={data?.time}
                size={"sm"}
                type="time"
                step={60}
                placeholder="thời gian"
                {...register("time", { required: true })}
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
            Cập nhật Check-in
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

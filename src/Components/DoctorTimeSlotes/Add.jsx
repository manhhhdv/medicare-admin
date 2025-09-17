/* eslint-disable react/prop-types */
import { ADD } from "../../Controllers/ApiControllers";
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
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Select,
  useToast,
} from "@chakra-ui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";

const AddTimeSlot = async (data) => {
  const res = await ADD(admin.token, "add_timeslots", data);
  if (res.response !== 200) {
    throw new Error(res.message);
  }
  return res;
};

export default function AddDoctorTimeSlotes({ isOpen, onClose, doctorID }) {
  const { register, handleSubmit, reset } = useForm();
  const queryClient = useQueryClient();
  const toast = useToast();

  const mutation = useMutation({
    mutationFn: async (data) => {
      await AddTimeSlot(data);
    },
    onSuccess: () => {
      ShowToast(toast, "success", "Đã Thêm Khung Giờ!");
      queryClient.invalidateQueries("time-slotes", doctorID);
      reset();
      onClose();
    },
    onError: (error) => {
      ShowToast(toast, "error", error.message);
    },
  });

  const addTimeSlotes = async (Inputdata, event) => {
    event.stopPropagation();
    let formData = {
      doct_id: doctorID,
      ...Inputdata,
    };

    mutation.mutate(formData);
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
      <ModalContent
        as={"form"}
        id="addTimeSlotesForm"
        onSubmit={handleSubmit(addTimeSlotes)}
      >
        <ModalHeader fontSize={18} py={2}>
          Thêm Khung Giờ
        </ModalHeader>
        <ModalCloseButton />
        <Divider />
        <ModalBody>
          <Box pb={3}>
            <FormControl isRequired>
              <FormLabel>Giờ Bắt Đầu</FormLabel>
              <Input
                size={"sm"}
                type="time"
                step={60}
                placeholder="Giờ Bắt Đầu"
                {...register("time_start", { required: true })}
              />
            </FormControl>
            <FormControl isRequired mt={3}>
              <FormLabel>Giờ Kết Thúc</FormLabel>
              <Input
                size={"sm"}
                type="time"
                step={60}
                placeholder="Giờ Kết Thúc"
                {...register("time_end", { required: true })}
              />
            </FormControl>
            <FormControl isRequired mt={3}>
              <FormLabel>Thời Lượng ( Tính Bằng Phút )</FormLabel>
              <NumberInput size={"sm"} defaultValue={1} min={1} max={60}>
                <NumberInputField
                  placeholder="Thời Lượng"
                  defaultValue={1}
                  min={1}
                  max={5}
                  {...register("time_duration", { required: true })}
                />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </FormControl>
            <FormControl isRequired mt={3} size={"sm"} colorScheme="blue">
              <FormLabel>Ngày</FormLabel>
              <Select
                colorScheme="blue"
                placeholder="Chọn Ngày"
                size={"sm"}
                {...register("day", { required: true })}
              >
                <option value="Monday">Thứ Hai</option>
                <option value="Tuesday">Thứ Ba</option>
                <option value="Wednesday">Thứ Tư</option>
                <option value="Thursday">Thứ Năm</option>
                <option value="Friday">Thứ Sáu</option>
                <option value="Saturday">Thứ Bảy</option>
                <option value="Sunday">Chủ Nhật</option>
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
            isLoading={mutation.isPending}
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            Thêm Khung Giờ
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

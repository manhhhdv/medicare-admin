/* eslint-disable react/prop-types */
import { ClinicComboBox } from "../../Components/ClinicComboBox";
import { useSelectedClinic } from "../../Context/SelectedClinic";
import { ADD } from "../../Controllers/ApiControllers";
import ShowToast from "../../Controllers/ShowToast";
import admin from "../../Controllers/admin";
import UseClinicsData from "../../Hooks/UseClinicsData";
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

export default function AddCoupon({ isOpen, onClose }) {
  const [isLoading, setisLoading] = useState();
  const { register, handleSubmit, reset } = useForm();
  const queryClient = useQueryClient();
  const toast = useToast();
  const { selectedClinic } = useSelectedClinic();
  const { clinicsData } = UseClinicsData();
  const [selectedClinicID, setselectedClinicID] = useState();

  const handleAdd = async (data) => {
    let formData = { ...data, active: 1, title: data.title.toUpperCase() };
    try {
      setisLoading(true);
      const res = await ADD(admin.token, "add_coupon", formData);
      setisLoading(false);
      if (res.response === 200) {
        ShowToast(toast, "success", "Đã thêm phiếu giảm giá!");
        queryClient.invalidateQueries(["coupons"]);
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

  const onSubmit = (data) => {
    if (!selectedClinicID)
      return ShowToast(toast, "error", "Vui lòng chọn một phòng khám");
    handleAdd({ ...data, clinic_id: selectedClinicID.id });
  };
  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size={"lg"}>
      <ModalOverlay />
      <ModalContent as={"form"} onSubmit={handleSubmit(onSubmit)}>
        <ModalHeader fontSize={18} py={2}>
          Thêm phiếu giảm giá
        </ModalHeader>
        <ModalCloseButton />
        <Divider />
        <ModalBody>
          <Box pb={3}>
            <FormControl isRequired>
              <FormLabel>Phòng khám</FormLabel>
              <ClinicComboBox
                data={clinicsData}
                name={"clinic"}
                defaultData={selectedClinic}
                setState={setselectedClinicID}
              />
            </FormControl>
            <FormControl isRequired mt={5}>
              <FormLabel>Tiêu đề</FormLabel>
              <Input
                textTransform={"uppercase"}
                placeholder="Tiêu đề"
                {...register("title", { required: true })}
              />
            </FormControl>
            <FormControl isRequired mt={5}>
              <FormLabel>Giá trị (Giảm giá %)</FormLabel>
              <Input
                type="number"
                placeholder="Giá trị"
                max={100}
                {...register("value", { required: true })}
              />
            </FormControl>
            <FormControl isRequired mt={5}>
              <FormLabel>Mô tả</FormLabel>
              <Input
                placeholder="Mô tả"
                {...register("description", { required: true })}
              />
            </FormControl>
            <Flex mt={5} gap={5}>
              {" "}
              <FormControl isRequired>
                <FormLabel>Ngày bắt đầu</FormLabel>
                <Input
                  type="date"
                  placeholder="Ngày bắt đầu"
                  {...register("start_date", { required: true })}
                />
              </FormControl>{" "}
              <FormControl isRequired>
                <FormLabel>Ngày kết thúc</FormLabel>
                <Input
                  type="date"
                  placeholder="Ngày kết thúc"
                  {...register("end_date", { required: true })}
                />
              </FormControl>
            </Flex>
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
            Thêm phiếu giảm giá
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

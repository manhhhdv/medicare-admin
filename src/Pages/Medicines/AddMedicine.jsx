/* eslint-disable react/prop-types */
import { ClinicComboBox } from "../../Components/ClinicComboBox";
import NotAuth from "../../Components/NotAuth";
import { useSelectedClinic } from "../../Context/SelectedClinic";
import { ADD } from "../../Controllers/ApiControllers";
import showToast from "../../Controllers/ShowToast";
import admin from "../../Controllers/admin";
import useHasPermission from "../../Hooks/HasPermission";
import UseClinicsData from "../../Hooks/UseClinicsData";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Divider,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  useToast,
  Box,
} from "@chakra-ui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";

const addPrescribeMedicines = async (data) => {
  const res = await ADD(admin.token, "add_prescribe_medicines", data);
  if (res.response !== 200) {
    throw new Error(res.message);
  }
  return res;
};

export default function AddMedicine({ isOpen, onClose }) {
  const { hasPermission } = useHasPermission();
  const { register, handleSubmit, reset } = useForm();
  const toast = useToast();
  const queryClient = useQueryClient();
  const { selectedClinic } = useSelectedClinic();
  const { clinicsData } = UseClinicsData();
  const [selectedClinicID, setselectedClinicID] = useState();

  const mutation = useMutation({
    mutationFn: async (data) => {
      await addPrescribeMedicines(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries("medicines");
      showToast(toast, "success", "Đã thêm thuốc!");
      onClose(); // Optionally close the modal on success
      reset();
    },
    onError: (error) => {
      showToast(toast, "error", error.message);
    },
  });

  const onSubmit = (data) => {
    if (!selectedClinicID)
      return showToast(toast, "error", "Vui lòng chọn một phòng khám");
    mutation.mutate({ ...data, clinic_id: selectedClinicID.id });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent as={"form"} onSubmit={handleSubmit(onSubmit)}>
        <ModalHeader fontSize={"md"}>Thêm thuốc mới</ModalHeader>
        <ModalCloseButton top={3} />
        <Divider />
        <ModalBody>
          <Box>
            {hasPermission("MEDICINE_ADD") ? (
              <>
                {" "}
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
                  <FormLabel fontSize={"sm"}>Tên</FormLabel>
                  <Input
                    size={"md"}
                    name="comment"
                    {...register("title", { required: true })}
                  />
                </FormControl>{" "}
                <FormControl mt={3}>
                  <FormLabel fontSize={"sm"}>Ghi chú</FormLabel>
                  <Textarea size={"md"} name="comment" {...register("notes")} />
                </FormControl>{" "}
              </>
            ) : (
              <NotAuth />
            )}
          </Box>
        </ModalBody>

        <ModalFooter>
          <Button colorScheme="gray" mr={3} onClick={onClose} size={"sm"}>
            Đóng
          </Button>
          <Button
            colorScheme={"blue"}
            size={"sm"}
            w={32}
            type="submit"
            isLoading={mutation.isPending}
          >
            Thêm
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

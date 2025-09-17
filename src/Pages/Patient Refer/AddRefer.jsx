/* eslint-disable react/prop-types */
import { ClinicComboBox } from "../../Components/ClinicComboBox";
import UsersCombobox from "../../Components/UsersComboBox";
import { useSelectedClinic } from "../../Context/SelectedClinic";
import { ADD } from "../../Controllers/ApiControllers";
import ShowToast from "../../Controllers/ShowToast";
import admin from "../../Controllers/admin";
import UseClinicsData from "../../Hooks/UseClinicsData";
import usePatientData from "../../Hooks/UsePatientsData";
import {
  Box,
  Button,
  Divider,
  FormControl,
  FormLabel,
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

export default function AddRefer({ isOpen, onClose, patient }) {
  const [isLoading, setisLoading] = useState();
  const { handleSubmit, reset } = useForm();
  const queryClient = useQueryClient();
  const toast = useToast();
  const { selectedClinic } = useSelectedClinic();
  const { clinicsData } = UseClinicsData();
  const { patientsData } = usePatientData();
  const [selectedClinicID, setselectedClinicID] = useState();
  const [selectedPatient, setselectedPatient] = useState(patient);

  const AddNewDepartment = async () => {
    if (!selectedPatient) {
      return ShowToast(toast, "error", "Vui lòng chọn bệnh nhân");
    }
    if (!selectedClinicID) {
      return ShowToast(toast, "error", "Vui lòng chọn phòng khám");
    }

    let formData = {
      patient_id: selectedPatient.id,
      from_clinic_id: selectedClinic.id,
      to_clinic_id: selectedClinicID.id,
      requested_by: admin.id,
    };

    try {
      setisLoading(true);
      const res = await ADD(admin.token, "add_referral_clinic", formData);
      setisLoading(false);
      if (res.response === 200) {
        ShowToast(toast, "success", "Yêu cầu chuyển tuyến đã được khởi tạo!");
        queryClient.invalidateQueries(["referals"]);
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
      size={"xl"}
      scrollBehavior="inside"
    >
      <ModalOverlay />
      <ModalContent as={"form"} onSubmit={handleSubmit(AddNewDepartment)}>
        <ModalHeader fontSize={18} py={2}>
          Chuyển tuyến bệnh nhân
        </ModalHeader>
        <ModalCloseButton />
        <Divider />
        <ModalBody>
          <Box pb={3}>
            <FormControl isRequired>
              <FormLabel>Bệnh nhân</FormLabel>
              <UsersCombobox
                data={patientsData}
                name={"Patient"}
                defaultData={selectedPatient}
                setState={setselectedPatient}
              />
            </FormControl>
            <FormControl isRequired mt={5}>
              <FormLabel>Tới phòng khám</FormLabel>
              <ClinicComboBox
                data={clinicsData}
                name={"clinic"}
                setState={setselectedClinicID}
                isDisabledOverright={true}
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
            Thêm
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

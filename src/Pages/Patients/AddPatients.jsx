/* eslint-disable react/prop-types */
import { ClinicComboBox } from "../../Components/ClinicComboBox";
import ISDCODEMODAL from "../../Components/IsdModal";
import { useSelectedClinic } from "../../Context/SelectedClinic";
import { ADD } from "../../Controllers/ApiControllers";
import ShowToast from "../../Controllers/ShowToast";
import admin from "../../Controllers/admin";
import todayDate from "../../Controllers/today";
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
  Grid,
  Select,
  useDisclosure,
  InputGroup,
  InputLeftAddon,
  useToast,
} from "@chakra-ui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import moment from "moment";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { AiOutlineDown } from "react-icons/ai";

const addPatient = async (data) => {
  const res = await ADD(admin.token, "add_patient", data);
  if (res.response !== 200) {
    throw new Error(res.message);
  }
  return res;
};

function AddPatients({ nextFn, isOpen, onClose }) {
  const queryClient = useQueryClient();
  const toast = useToast();
  const { register, handleSubmit, reset, watch } = useForm();
  const [isd_code, setisd_code] = useState("+91");
  const {
    isOpen: isIsdOpen,
    onOpen: onIsdOpen,
    onClose: onIsdClose,
  } = useDisclosure();
  const { selectedClinic } = useSelectedClinic();
  const { clinicsData } = UseClinicsData();
  const [selectedClinicID, setselectedClinicID] = useState();

  const mutation = useMutation({
    mutationFn: async (data) => {
      await addPatient(data);
    },
    onError: (error) => {
      ShowToast(toast, "error", JSON.stringify(error));
    },
    onSuccess: () => {
      if (nextFn) {
        nextFn({
          f_name: watch("f_name"),
          l_name: watch("l_name"),
          phone: watch("phone"),
        });
      }
      ShowToast(toast, "success", "Thêm bệnh nhân thành công");
      queryClient.invalidateQueries("users");
      queryClient.invalidateQueries("patients");
      onClose();
      reset();
    },
  });

  const onSubmit = (data) => {
    if (!isd_code) {
      return ShowToast(toast, "error", "Vui lòng chọn mã quốc gia");
    }
    if (!selectedClinicID) {
      return ShowToast(toast, "error", "Vui lòng chọn phòng khám");
    }
    let formData = {
      ...data,
      isd_code,
      dob: data.dob ? moment(data.dob).format("YYYY-MM-DD") : "",
      clinic_id: selectedClinicID.id,
    };

    mutation.mutate(formData);
  };
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      isCentered
      size={"2xl"}
      scrollBehavior="inside"
    >
      <ModalOverlay />
      <form onSubmit={handleSubmit(onSubmit)}>
        <ModalContent borderRadius={8} overflow={"hidden"} zIndex={99999999}>
          <ModalHeader py={1} fontSize={"md"} bg={"blue.700"} color={"#fff"}>
            Thêm bệnh nhân
          </ModalHeader>
          <ModalCloseButton top={0} color={"#fff"} />
          <Divider />

          <ModalBody>
            <Grid templateColumns="repeat(3, 1fr)" gap={4} mt={3}>
              <FormControl isRequired>
                <FormLabel>Phòng khám</FormLabel>
                <ClinicComboBox
                  data={clinicsData}
                  name={"clinic"}
                  defaultData={selectedClinic}
                  setState={setselectedClinicID}
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Tên</FormLabel>
                <Input
                  size="md"
                  {...register("f_name")}
                  placeholder="Tên"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Họ</FormLabel>
                <Input {...register("l_name")} placeholder="Họ" />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Số điện thoại</FormLabel>
                <InputGroup>
                  <InputLeftAddon
                    bg={"none"}
                    pl={1}
                    pr={2}
                    borderRadius={0}
                    cursor={"pointer"}
                    onClick={(e) => {
                      e.stopPropagation();
                      onIsdOpen();
                    }}
                    fontSize={"sm"}
                  >
                    {isd_code} <AiOutlineDown style={{ marginLeft: "10px" }} />
                  </InputLeftAddon>
                  <Input
                    type="tel"
                    placeholder="Số điện thoại"
                    {...register("phone", {
                      required: true,
                      pattern: /^[+]*[(]{0,1}[0-9]{1,3}[)]{0,1}[-\s\\./0-9]*$/g,
                    })}
                  />
                </InputGroup>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Giới tính</FormLabel>
                <Select
                  defaultValue="Male"
                  {...register("gender")}
                  placeholder="Giới tính"
                >
                  <option value={"Male"}>Nam</option>
                  <option value={"Female"}>Nữ</option>
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>Ngày sinh</FormLabel>
                <Input max={todayDate()} type="date" {...register("dob")} />
              </FormControl>
            </Grid>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="gray" mr={3} onClick={onClose} size={"sm"}>
              Đóng
            </Button>
            <Button
              colorScheme={"blue"}
              size={"sm"}
              type="submit"
              isLoading={mutation.isPending}
            >
              Thêm bệnh nhân
            </Button>
          </ModalFooter>
        </ModalContent>
      </form>
      <ISDCODEMODAL
        isOpen={isIsdOpen}
        onClose={onIsdClose}
        setisd_code={setisd_code}
      />
    </Modal>
  );
}

export default AddPatients;

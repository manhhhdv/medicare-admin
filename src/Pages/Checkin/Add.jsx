/* eslint-disable react/prop-types */
import QRCodeScanner from "../../Components/QrScanner";
import { useSelectedClinic } from "../../Context/SelectedClinic";
import { ADD, GET } from "../../Controllers/ApiControllers";
import ShowToast from "../../Controllers/ShowToast";
import admin from "../../Controllers/admin";
import todayDate from "../../Controllers/today";
import {
  AbsoluteCenter,
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
import moment from "moment";
import { useState } from "react";
import { useForm } from "react-hook-form";

const isOwnAppointment = (appointmentData, selectedClinic) => {
  if (admin.role.name === "Admin" || admin.role.name === "Super Admin") {
    return true; // Admins can check in any appointment
  }
  return appointmentData?.clinic_id === selectedClinic.id;
};

export default function AddCheckin({ isOpen, onClose }) {
  const [isLoading, setisLoading] = useState(false);
  const [appointmentData, setappointmentData] = useState();
  const [showQRScanner, setShowQRScanner] = useState(false); // State for QR scanner visibility
  const { register, handleSubmit, reset, setValue, getValues } = useForm(); // Added setValue here
  const queryClient = useQueryClient();
  const toast = useToast();
  const { selectedClinic } = useSelectedClinic();

  const onqrScan = (qrData) => {
    // Use setValue to update form inputs
    setValue("appointment_id", qrData.appointment_id || "");
    setValue("date", qrData.date || "");
    setValue("time", qrData.time || "");
    setShowQRScanner(false); // Hide the QR scanner after a successful scan
    getAppData(qrData.appointment_id); // Fetch additional data based on QR
  };

  const getAppData = async () => {
    const { appointment_id } = getValues();
    setisLoading(true);
    try {
      const res = await GET(admin.token, `get_appointment/${appointment_id}`);
      console.log(res);
      setisLoading(false);
      if (res.data === null) {
        ShowToast(toast, "error", "Không tìm thấy lịch hẹn");
        // Reset values if not found
        setValue("appointment_id", "");
        setValue("date", "");
        setValue("time", "");
        return;
      } else if (!isOwnAppointment(res.data, selectedClinic)) {
        return ShowToast(
          toast,
          "error",
          "Không tìm thấy lịch hẹn trong phòng khám của bạn"
        );
      } else {
        let appointmentData = res.data;
        setappointmentData(appointmentData);
        setValue("appointment_id", appointmentData?.id || "");
        setValue("date", appointmentData?.date || "");
        setValue("time", appointmentData?.time_slots || "");
      }
    } catch (error) {
      setisLoading(false);
      ShowToast(toast, "error", "Không tìm thấy lịch hẹn");
      setValue("appointment_id", "");
      setValue("date", "");
      setValue("time", "");
      return;
    }
  };

  const addCheckin = async (Inputdata) => {
    if (appointmentData?.type === "Video Consultant") {
      return ShowToast(
        toast,
        "error",
        "Không thể đăng ký cho Tư vấn Video"
      );
    }
    const formdata = {
      ...Inputdata,
      time: moment(Inputdata.time, "HH:mm").format("HH:mm:ss"),
    };
    try {
      setisLoading(true);
      const res = await ADD(admin.token, "add_appointment_checkin", formdata);
      setisLoading(false);
      if (res.response === 200) {
        ShowToast(toast, "success", "Đã thêm!");
        queryClient.invalidateQueries("checkins");
        reset(); // Reset form values
        onClose();
      } else {
        ShowToast(toast, "error", res.message);
        queryClient.invalidateQueries("checkins");
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
      <ModalContent as={"form"} onSubmit={handleSubmit(addCheckin)}>
        <ModalHeader fontSize={18} py={2}>
          Check-in Mới
        </ModalHeader>
        <ModalCloseButton />
        <Divider />
        <ModalBody>
          {showQRScanner ? (
            <Button
              my={2}
              w={"full"}
              size={"sm"}
              colorScheme={"blue"}
              onClick={() => setShowQRScanner(false)}
            >
              Thêm dữ liệu thủ công
            </Button>
          ) : (
            <Button
              my={2}
              w={"full"}
              size={"sm"}
              colorScheme={"blue"}
              onClick={() => setShowQRScanner(true)}
            >
              Quét mã QR
            </Button>
          )}

          {showQRScanner && <QRCodeScanner onScan={onqrScan} />}

          {!showQRScanner && (
            <Box pb={3}>
              <Box position="relative" py="5">
                <Divider />
                <AbsoluteCenter bg="white" px="2" fontWeight={500}>
                  Hoặc
                </AbsoluteCenter>
              </Box>
              <Flex alignItems={"flex-end"} gap={5}>
                <FormControl isRequired>
                  <FormLabel>Mã lịch hẹn</FormLabel>
                  <Input
                    size={"sm"}
                    placeholder="Mã lịch hẹn"
                    {...register("appointment_id", { required: true })}
                    onChange={() => {
                      setValue("date", "");
                      setValue("time", "");
                    }}
                  />
                </FormControl>
                <Button
                  colorScheme={"teal"}
                  size={"sm"}
                  onClick={() => getAppData()}
                >
                  Lấy chi tiết
                </Button>
              </Flex>

              <FormControl isRequired mt={3}>
                <FormLabel>Ngày</FormLabel>
                <Input
                  max={todayDate()}
                  size={"sm"}
                  type="date"
                  placeholder="Ngày"
                  {...register("date", { required: true })}
                />
              </FormControl>
              <FormControl isRequired mt={3}>
                <FormLabel>Thời gian</FormLabel>
                <Input
                  size={"sm"}
                  type="time"
                  step={60}
                  placeholder="Thời gian"
                  {...register("time", { required: true })}
                />
              </FormControl>
            </Box>
          )}
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
            Thêm Check-in
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

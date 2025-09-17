/* eslint-disable react/prop-types */
import UsersCombobox from "../../Components/UsersComboBox";
import { ADD, GET } from "../../Controllers/ApiControllers";
import ShowToast from "../../Controllers/ShowToast";
import admin from "../../Controllers/admin";
import getStatusBadge from "../../Hooks/StatusBadge";
import useDoctorData from "../../Hooks/UseDoctorData";
import usePatientData from "../../Hooks/UsePatientsData";
import AddPatients from "../Patients/AddPatients";
import AvailableTimeSlotes from "./AvailableTimeSlotes";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Box,
  Flex,
  useColorModeValue,
  Heading,
  FormControl,
  FormLabel,
  Input,
  CardBody,
  Card,
  Divider,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Badge,
  Select,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronDownIcon } from "lucide-react";
import moment from "moment";
import { useState } from "react";

let defStatus = ["Chờ xác nhận", "Đã xác nhận"];

const getTypeBadge = (type) => {
  switch (type) {
    case "Khẩn cấp":
      return (
        <Badge colorScheme="red" p={"5px"} px={10}>
          {type}
        </Badge>
      );
    case "Khám trực tiếp":
      return (
        <Badge colorScheme="green" p={"5px"} px={10}>
          {type}
        </Badge>
      );
    default:
      return (
        <Badge colorScheme="blue" p={"5px"} px={10}>
          {type}
        </Badge>
      );
  }
};
const getFee = (type, doct) => {
  switch (type) {
    case "Khẩn cấp":
      return doct?.emg_fee;
    case "Khám trực tiếp":
      return doct?.opd_fee;
    case "Tư vấn video":
      return doct?.video_fee;
    default:
      return doct?.emg_fee;
  }
};
const paymentModes = [
  {
    id: 1,
    name: "Tiền mặt",
  },
  {
    id: 2,
    name: "Trực tuyến",
  },
  {
    id: 3,
    name: "Khác",
  },
  {
    id: 4,
    name: "Ví",
  },
  {
    id: 5,
    name: "Chuyển khoản",
  },
];

// add appointemmnt
const addAppointment = async (data) => {
  const res = await ADD(admin.token, "add_appointment", data);
  if (res.response !== 200) {
    throw new Error(res.message);
  }
  return res;
};

function AddNewAppointment({ isOpen, onClose, PatientID }) {
  const toast = useToast();
  const {
    isOpen: timeSlotisOpen,
    onOpen: timeSlotonOpen,
    onClose: timeSlotonClose,
  } = useDisclosure();
  const {
    isOpen: AddPatientisOpen,
    onOpen: AddPatientonOpen,
    onClose: AddPatientonClose,
  } = useDisclosure();
  const { doctorsData } = useDoctorData();
  const { patientsData } = usePatientData();
  const [patient, setpatient] = useState();
  const [doct, setdoct] = useState();
  const [selectedDate, setselectedDate] = useState();
  const [selectedSlot, setselectedSlot] = useState();
  const [status, setstatus] = useState("Đã xác nhận");
  const [type, settype] = useState();
  const [paymentStatus, setpaymentStatus] = useState();
  const [paymentMathod, setpaymentMathod] = useState();
  const queryClient = useQueryClient();
  const [defalutDataForPationt, setdefalutDataForPationt] = useState(PatientID);

  //   doctorDetails
  const { data: doctorDetails, isLoading: isDoctLoading } = useQuery({
    queryKey: ["doctor", doct?.user_id],
    queryFn: async () => {
      const res = await GET(admin.token, `get_doctor/${doct?.user_id}`);
      return res.data;
    },
    enabled: !!doct,
  });

  //
  const checkMissingValues = () => {
    if (!patient) return "patient";
    if (!doct) return "doctor";
    if (!type) return "Loại lịch hẹn";
    if (!selectedDate) return "Ngày";
    if (!selectedSlot) return "Khung thời gian";
    if (!status) return "Trạng thái lịch hẹn";
    if (!paymentStatus) return "Trạng thái thanh toán";
    if (paymentStatus === "Trả tiền" && !paymentMathod) return "Phương thức thanh toán";
    return null; // All values are present
  };
  const mutation = useMutation({
    mutationFn: async () => {
      const missingField = checkMissingValues();
      if (missingField) {
        throw new Error(`Vui lòng chọn ${missingField}`);
      } else if (isDoctLoading || !doctorDetails) {
        throw new Error(`Không thể lấy thông tin bác sĩ`);
      }
      if (!missingField) {
        let formData = {
          patient_id: patient.id,
          status: status,
          date: selectedDate,
          time_slots: selectedSlot.time_start,
          doct_id: doct.user_id,
          dept_id: doctorDetails.department,
          type: type,
          fee: getFee(type, doct),
          total_amount: getFee(type, doct),
          unit_total_amount: getFee(type, doct),
          invoice_description: type,
          payment_method: paymentMathod || null,
          service_charge: 0,
          payment_transaction_id:
            paymentStatus === "Trả tiền" ? "Trả tiền tại bệnh viện" : null,
          is_wallet_txn: 0,
          payment_status: paymentStatus,
          source: "Admin",
        };
        await addAppointment(formData);
      }
    },
    onError: (error) => {
      ShowToast(toast, "error", error.message);
    },
    onSuccess: () => {
      ShowToast(toast, "success", "Success");
      queryClient.invalidateQueries("appointments");
      queryClient.invalidateQueries("main-appointments");
      onClose();
    },
  });

  return (
    <Box>
      {" "}
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size={"2xl"}
        onOverlayClick={false}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Thêm lịch hẹn mới</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Flex gap={10}>
              {" "}
              <Flex flex={3} gap={4} align={"center"}>
                <UsersCombobox
                  data={patientsData}
                  name={"Patient"}
                  setState={setpatient}
                  defaultData={defalutDataForPationt}
                  addNew={true}
                  addOpen={AddPatientonOpen}
                />
                Hoặc <br/>
                <Button
                  size={"xs"}
                  w={200}
                  colorScheme={"blue"}
                  onClick={() => {
                    AddPatientonOpen();
                  }}
                >
                  Thêm bệnh nhân
                </Button>
              </Flex>
              
            </Flex>
            <Flex flex={2} mt={2}>
                <UsersCombobox
                  data={doctorsData}
                  name={"Doctor"}
                  setState={setdoct}
                />
              </Flex>
            <Card mt={5} bg={useColorModeValue("white", "gray.700")}>
              <CardBody p={3} as={"form"}>
                {" "}
                <Heading as={"h3"} size={"sm"}>
                  Chi tiết lịch hẹn{" "}
                </Heading>{" "}
                <Divider mt={2} mb={5} />
                <Flex gap={5}>
                  <FormControl id="doct_specialization" size={"sm"}>
                    <FormLabel
                      fontSize={"sm"}
                      mb={0}
                      color={useColorModeValue("gray.600", "gray.300")}
                    >
                      Loại lịch hẹn
                    </FormLabel>
                    <Menu>
                      <MenuButton
                        as={Button}
                        rightIcon={<ChevronDownIcon />}
                        bg={"transparent"}
                        w={"100%"}
                        textAlign={"left"}
                        pl={0}
                        pt={0}
                        h={8}
                        _hover={{
                          bg: "transparent",
                        }}
                        _focus={{
                          bg: "transparent",
                        }}
                        borderBottom={"1px solid"}
                        borderBottomRadius={0}
                        borderColor={useColorModeValue("gray.200", "gray.600")}
                      >
                        {type ? getTypeBadge(type) : "Chọn loại lịch hẹn"}
                      </MenuButton>
                      <MenuList>
                        {["Khám trực tiếp", "Tư vấn video", "Khẩn cấp"]?.map(
                          (option) => (
                            <MenuItem
                              key={option}
                              onClick={() => {
                                if (option !== "Khám trực tiếp") {
                                  setpaymentStatus("Trả tiền");
                                }

                                if (option === "Khẩn cấp") {
                                  settype(option);
                                  setselectedDate(
                                    moment().format("YYYY-MM-DD")
                                  );
                                  setselectedSlot({
                                    time_start: moment().format("HH:mm"),
                                  });
                                } else {
                                  setselectedDate();
                                  setselectedSlot();
                                  settype(option);
                                }
                              }}
                            >
                              <Box display="flex" alignItems="center">
                                {getTypeBadge(option)}
                              </Box>
                            </MenuItem>
                          )
                        )}
                      </MenuList>
                    </Menu>
                  </FormControl>
                  <FormControl>
                    <FormLabel
                      fontSize={"sm"}
                      mb={0}
                      color={useColorModeValue("gray.600", "gray.300")}
                    >
                      Ngày hẹn
                    </FormLabel>
                    <Input
                      size={"sm"}
                      fontWeight={600}
                      variant="flushed"
                      value={moment(selectedDate).format("DD-MM-YYYY")}
                      onClick={() => {
                        if (!doct) {
                          return ShowToast(
                            toast,
                            "error",
                            "Vui lòng chọn bác sĩ"
                          );
                        }
                        if (!type) {
                          return ShowToast(
                            toast,
                            "error",
                            "Vui lòng chọn loại lịch hẹn"
                          );
                        }
                        timeSlotonOpen();
                      }}
                      cursor={"pointer"}
                    />
                  </FormControl>
                </Flex>
                <Flex gap={5} mt={2}>
                  <FormControl>
                    <FormLabel
                      fontSize={"sm"}
                      mb={0}
                      color={useColorModeValue("gray.600", "gray.300")}
                    >
                      Khung giờ hẹn
                    </FormLabel>
                    <Input
                      size={"sm"}
                      fontWeight={600}
                      variant="flushed"
                      value={
                        selectedSlot
                          ? moment(selectedSlot.time_start, "hh:mm").format(
                              "hh:mm A"
                            )
                          : "Chọn khung giờ"
                      }
                      onClick={() => {
                        if (!doct) {
                          return ShowToast(
                            toast,
                            "error",
                            "Vui lòng chọn bác sĩ"
                          );
                        }
                        timeSlotonOpen();
                      }}
                      cursor={"pointer"}
                      isReadOnly
                    />
                  </FormControl>
                  <FormControl id="status" size={"sm"}>
                    <FormLabel
                      fontSize={"sm"}
                      mb={0}
                      color={useColorModeValue("gray.600", "gray.300")}
                    >
                      Trạng thái
                    </FormLabel>
                    <Menu>
                      <MenuButton
                        as={Button}
                        rightIcon={<ChevronDownIcon />}
                        bg={"transparent"}
                        w={"100%"}
                        textAlign={"left"}
                        pl={0}
                        pt={0}
                        h={8}
                        _hover={{
                          bg: "transparent",
                        }}
                        _focus={{
                          bg: "transparent",
                        }}
                        borderBottom={"1px solid"}
                        borderBottomRadius={0}
                        borderColor={useColorModeValue("gray.200", "gray.600")}
                      >
                        {status ? getStatusBadge(status) : "Select Status"}
                      </MenuButton>
                      <MenuList>
                        {defStatus.map((option) => (
                          <MenuItem
                            key={option}
                            onClick={() => {
                              setstatus(option);
                            }}
                          >
                            <Box display="flex" alignItems="center">
                              {getStatusBadge(option)}
                            </Box>
                          </MenuItem>
                        ))}
                      </MenuList>
                    </Menu>
                  </FormControl>
                </Flex>
              </CardBody>
            </Card>
            <Card mt={5} bg={useColorModeValue("white", "gray.700")}>
              <CardBody p={3} as={"form"}>
                {" "}
                <Heading as={"h3"} size={"sm"}>
                  Chi tiết thanh toán{" "}
                </Heading>{" "}
                <Divider mt={2} mb={5} />
                <Flex gap={5}>
                  <FormControl>
                    <FormLabel
                      fontSize={"sm"}
                      mb={0}
                      color={useColorModeValue("gray.600", "gray.300")}
                    >
                      Trạng thái thanh toán
                    </FormLabel>
                    <Select
                      placeholder="Chọn trạng thái thanh toán"
                      variant="flushed"
                      onChange={(e) => {
                        setpaymentStatus(e.target.value);
                      }}
                      value={paymentStatus}
                    >
                      <option value="Paid">Trả tiền</option>
                      {type === "Khám trực tiếp" && (
                        <option value="Chưa thanh toán">Chưa thanh toán</option>
                      )}
                    </Select>
                  </FormControl>
                  <FormControl>
                    <FormLabel
                      fontSize={"sm"}
                      mb={0}
                      color={useColorModeValue("gray.600", "gray.300")}
                    >
                      Phương thức thanh toán
                    </FormLabel>
                    <Select
                      placeholder="Chọn phương thức thanh toán"
                      variant="flushed"
                      onChange={(e) => {
                        setpaymentMathod(e.target.value);
                      }}
                    >
                      {paymentModes.map((item) => (
                        <option value={item.name} key={item.id}>
                          {item.name}
                        </option>
                      ))}
                    </Select>
                  </FormControl>
                </Flex>
                <Flex gap={5} mt={4}>
                  <FormControl w={"50%"}>
                    <FormLabel
                      fontSize={"sm"}
                      mb={0}
                      color={useColorModeValue("gray.600", "gray.300")}
                    >
                      Phí
                    </FormLabel>
                    <Input
                      fontWeight={600}
                      variant="flushed"
                      size={"sm"}
                      isReadOnly
                      value={doct && type ? getFee(type, doct) : 0}
                    />
                  </FormControl>
                  <FormControl w={"50%"}> 
                    <FormLabel
                      fontSize={"sm"}
                      mb={0}
                      color={useColorModeValue("gray.600", "gray.300")}
                    >
                      Tổng tiền
                    </FormLabel>
                    <Input
                      fontWeight={600}
                      variant="flushed"
                      size={"sm"}
                      isReadOnly
                      value={doct && type ? getFee(type, doct) : 0}
                    />
                  </FormControl>
                </Flex>
              </CardBody>
            </Card>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="gray" mr={3} onClick={onClose} size={"sm"}>
              Đóng
            </Button>
            <Button
              colorScheme={"blue"}
              size={"sm"}
              onClick={() => {
                mutation.mutate();
              }}
              isLoading={mutation.isPending}
            >
              Thêm lịch hẹn
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      {timeSlotisOpen ? (
        <AvailableTimeSlotes
          isOpen={timeSlotisOpen}
          onClose={timeSlotonClose}
          doctID={doct.user_id}
          selectedDate={selectedDate}
          setselectedDate={setselectedDate}
          selectedSlot={selectedSlot}
          setselectedSlot={setselectedSlot}
          type={type}
        />
      ) : null}
      {AddPatientisOpen ? (
        <AddPatients
          nextFn={(data) => {
            setdefalutDataForPationt(data);
          }}
          isOpen={AddPatientisOpen}
          onClose={AddPatientonClose}
        />
      ) : null}
    </Box>
  );
}

export default AddNewAppointment;

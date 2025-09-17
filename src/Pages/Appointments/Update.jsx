import DynamicTable from "../../Components/DataTable";
import Loading from "../../Components/Loading";
import { GET, UPDATE } from "../../Controllers/ApiControllers";
import showToast from "../../Controllers/ShowToast";
import admin from "../../Controllers/admin";
import api from "../../Controllers/api";
import getCancellationStatusBadge from "../../Hooks/CancellationReqBadge";
import useHasPermission from "../../Hooks/HasPermission";
import getStatusBadge from "../../Hooks/StatusBadge";
import InvoiceByAppointmentID from "../Invoices/InvoiceByAppointmentID";
import PatientFiles from "../Patients/PatientFiles";
import PaymentsByAppID from "../Payments/PaymentsByAppID";
import PrescriptionByAppID from "../Prescriptions/Prescription";
import TransactionByAppID from "../Transaction/TransactionByAppID";
import PaymentStatusPaid from "./PaymentStatusPaid";
import RescheduleAppointment from "./RescheduleAppointment";

/* eslint-disable react/prop-types */

/* eslint-disable react-hooks/rules-of-hooks */
import {
  Box,
  Button,
  Flex,
  Heading,
  useColorModeValue,
  FormControl,
  FormLabel,
  Input,
  CardBody,
  Card,
  Divider,
  Select,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Badge,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Skeleton,
  useToast,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useDisclosure,
  Link,
  theme,
} from "@chakra-ui/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ChevronDownIcon } from "lucide-react";
import moment from "moment";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { BiLinkExternal } from "react-icons/bi";
import { BsPersonVideo } from "react-icons/bs";
import { FaPrint } from "react-icons/fa";
import { useNavigate, useParams, Link as RouterLink } from "react-router-dom";

let defStatusOPD = ["Pending", "Confirmed", "Rejected", "Visited"];
let defStatusVedio = ["Pending", "Confirmed", "Rejected", "Completed"];

const getDef = (type) => {
  return type === "OPD"
    ? defStatusOPD
    : type === "Video Consultant"
    ? defStatusVedio
    : defStatusOPD;
};

const getTypeBadge = (type) => {
  switch (type) {
    case "Emergency":
      return (
        <Badge colorScheme="red" p={"5px"} px={10}>
          {type}
        </Badge>
      );
    case "OPD":
      return (
        <Badge colorScheme="green" p={"5px"} px={10}>
          {type}
        </Badge>
      );
    default:
      return (
        <Badge colorScheme="green" p={"5px"} px={10}>
          {type}
        </Badge>
      );
  }
};

const handleUpdate = async (data) => {
  const res = await UPDATE(admin.token, "update_appointment", data);
  if (res.response !== 200) {
    throw new Error(res.message);
  }
  return res;
};
const handleStatusUpdate = async (data) => {
  const res = await UPDATE(admin.token, "update_appointment_status", data);
  if (res.response !== 200) {
    throw new Error(res.message);
  }
  return res;
};
const handleAppointmentReject = async (data) => {
  const res = await UPDATE(admin.token, "appointment_reject_and_refund", data);
  if (res.response !== 200) {
    throw new Error(res.message);
  }
  return res;
};
const handleCancelAppointment = async (data) => {
  const res = await UPDATE(
    admin.token,
    "appointment_cancellation_and_refund",
    data
  );
  if (res.response !== 200) {
    throw new Error(res.message);
  }
  return res;
};

export default function UpdateAppointment() {
  const { register, handleSubmit } = useForm();
  const { id } = useParams();
  const toast = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedOption, setSelectedOption] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { hasPermission } = useHasPermission();
  const {
    isOpen: RescheduleIsOpen,
    onOpen: RescheduleOnOpen,
    onClose: RescheduleOnClose,
  } = useDisclosure();
  const {
    isOpen: paymentIsOpen,
    onOpen: paymentOnOpen,
    onClose: paymentOnClose,
  } = useDisclosure();

  const getData = async () => {
    const res = await GET(admin.token, `get_appointment/${id}`);
    setSelectedOption(res.data.status);
    return res.data;
  };

  const { data: appointmntData, isLoading } = useQuery({
    queryKey: ["appointment", id],
    queryFn: getData,
  });

  const mutation = useMutation({
    mutationFn: async (data) => {
      await handleUpdate(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries("appointments");
      queryClient.invalidateQueries("main-appointments");
      queryClient.invalidateQueries(["appointment", id]);
    },
    onError: (error) => {
      showToast(toast, "error", error.message);
    },
  });
  const statusMutation = useMutation({
    mutationFn: async (data) => {
      await handleStatusUpdate(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries("appointments");
      queryClient.invalidateQueries("main-appointments");
      queryClient.invalidateQueries(["appointment", id]);
    },
    onError: (error) => {
      showToast(toast, "error", error.message);
    },
  });

  const onSubmit = (formData) => {
    mutation.mutate({ ...formData, status: selectedOption });
  };

  if (isLoading || mutation.isPending || statusMutation.isPending)
    return <Loading />;

  return (
    <Box>
      {" "}
      <Flex justify={"space-between"} alignItems={"center"}>
        <Flex justify={"space-between"} alignItems={"center"} gap={5}>
          <Heading as={"h1"} size={"md"}>
            Chi tiết lịch hẹn #{id}
          </Heading>
          {getStatusBadge(appointmntData?.status)}
          <Badge colorScheme="gray" p={"5px"} px={5}>
            Nguồn - {appointmntData.source}
          </Badge>
          {appointmntData.type === "Video Consultant"
            ? appointmntData.meeting_link && (
                <Button
                  rightIcon={<BsPersonVideo />}
                  size={"sm"}
                  variant={"outline"}
                  cursor={"pointer"}
                  as={Link}
                  href={appointmntData.meeting_link}
                  isExternal
                  color={"teal"}
                >
                  Tham gia cuộc họp
                </Button>
              )
            : null}
          <Button
            rightIcon={<FaPrint />}
            size={"sm"}
            variant={"link"}
            cursor={"pointer"}
            as={Link}
            href={`${api}/consultation_report/${id}`}
            isExternal
          >
            In báo cáo tư vấn
          </Button>
        </Flex>

        <Button
          w={120}
          size={"sm"}
          variant={useColorModeValue("blackButton", "gray")}
          onClick={() => {
            navigate(-1);
          }}
        >
          Quay lại
        </Button>
      </Flex>
      <Tabs colorScheme={"blue"} mt={3}>
        <TabList>
          <Tab>Tổng quan</Tab>
          {hasPermission("PRESCRIPTION_VIEW") && <Tab>Đơn thuốc</Tab>}
          {hasPermission("APPOINTMENT_INVOICE_VIEW") && <Tab>Hóa đơn</Tab>}
          {hasPermission("ALL_TRANSACTION_VIEW") && <Tab>Giao dịch</Tab>}
          {hasPermission("APPOINTMENT_PAYMENTS_VIEW") && <Tab>Thanh toán</Tab>}
          {hasPermission("FILE_VIEW") && <Tab>Hồ sơ bệnh nhân</Tab>}
        </TabList>

        <TabPanels>
          <TabPanel>
            <Box>
              <form onSubmit={handleSubmit(onSubmit)}>
                <Flex gap={8}>
                  <Box w={"55%"}>
                    {" "}
                    <Card mt={5} bg={useColorModeValue("white", "gray.700")}>
                      <CardBody p={3} as={"form"}>
                        {" "}
                        <Flex align={"center"} gap={5}>
                          {" "}
                          <Heading as={"h3"} size={"sm"}>
                            Thông tin bệnh nhân
                          </Heading>
                          <Link
                            to={`/patient/${appointmntData.patient_id}`}
                            as={RouterLink}
                          >
                            <BiLinkExternal fontSize={20} />
                          </Link>
                        </Flex>
                        <Divider mt={2} mb={5} />
                        <Flex gap={5}>
                          <FormControl>
                            <FormLabel
                              fontSize={"sm"}
                              mb={0}
                              color={useColorModeValue("gray.600", "gray.300")}
                            >
                              Họ và tên
                            </FormLabel>
                            <Input
                              size={"sm"}
                              isReadOnly
                              fontWeight={600}
                              variant="flushed"
                              defaultValue={appointmntData.patient_f_name}
                            />
                          </FormControl>

                          <FormControl>
                            <FormLabel
                              fontSize={"sm"}
                              mb={0}
                              color={useColorModeValue("gray.600", "gray.300")}
                            >
                              Họ và tên
                            </FormLabel>
                            <Input
                              size={"sm"}
                              isReadOnly
                              fontWeight={600}
                              variant="flushed"
                              defaultValue={appointmntData.patient_l_name}
                            />
                          </FormControl>
                        </Flex>
                        <Flex gap={5} mt={2}>
                          <FormControl id="doct_specialization" size={"sm"}>
                            <FormLabel
                              fontSize={"sm"}
                              mb={0}
                              color={useColorModeValue("gray.600", "gray.300")}
                            >
                              Số điện thoại
                            </FormLabel>
                            <Input
                              size={"sm"}
                              isReadOnly
                              fontWeight={600}
                              variant="flushed"
                              defaultValue={appointmntData.patient_phone}
                            />
                          </FormControl>

                          <FormControl id="dept_title" size={"sm"}>
                            <FormLabel
                              fontSize={"sm"}
                              mb={0}
                              color={useColorModeValue("gray.600", "gray.300")}
                            >
                              Giới tính
                            </FormLabel>
                            <Input
                              size={"sm"}
                              isReadOnly
                              fontWeight={600}
                              variant="flushed"
                              defaultValue={appointmntData.patient_gender}
                            />
                          </FormControl>
                        </Flex>
                      </CardBody>
                    </Card>
                  </Box>{" "}
                  <Box w={"45%"}>
                    {" "}
                    <Card mt={5} bg={useColorModeValue("white", "gray.700")}>
                      <CardBody p={3} as={"form"}>
                        {" "}
                        <Flex alignItems={"center"} gap={5}>
                          <Heading as={"h3"} size={"sm"}>
                            Bác sĩ{" "}
                          </Heading>{" "}
                          <Link
                            to={`/doctor/${appointmntData.doct_id}`}
                            as={RouterLink}
                          >
                            <BiLinkExternal fontSize={20} />
                          </Link>
                        </Flex>
                        <Divider mt={2} mb={5} />
                        <Flex gap={5}>
                          <FormControl>
                            <FormLabel
                              fontSize={"sm"}
                              mb={0}
                              color={useColorModeValue("gray.600", "gray.300")}
                            >
                              Họ và tên
                            </FormLabel>
                            <Input
                              size={"sm"}
                              isReadOnly
                              fontWeight={600}
                              variant="flushed"
                              defaultValue={appointmntData.doct_f_name}
                            />
                          </FormControl>

                          <FormControl>
                            <FormLabel
                              fontSize={"sm"}
                              mb={0}
                              color={useColorModeValue("gray.600", "gray.300")}
                            >
                              Họ và tên
                            </FormLabel>
                            <Input
                              size={"sm"}
                              isReadOnly
                              fontWeight={600}
                              variant="flushed"
                              defaultValue={appointmntData.doct_l_name}
                            />
                          </FormControl>
                        </Flex>
                        <Flex gap={5} mt={2}>
                          <FormControl id="doct_specialization" size={"sm"}>
                            <FormLabel
                              fontSize={"sm"}
                              mb={0}
                              color={useColorModeValue("gray.600", "gray.300")}
                            >
                              Chuyên khoa
                            </FormLabel>
                            <Input
                              size={"sm"}
                              isReadOnly
                              fontWeight={600}
                              variant="flushed"
                              defaultValue={appointmntData.doct_specialization}
                            />
                          </FormControl>

                          <FormControl id="dept_title" size={"sm"}>
                            <FormLabel
                              fontSize={"sm"}
                              mb={0}
                              color={useColorModeValue("gray.600", "gray.300")}
                            >
                            Phòng khám
                            </FormLabel>
                            <Input
                              size={"sm"}
                              isReadOnly
                              fontWeight={600}
                              variant="flushed"
                              defaultValue={appointmntData.dept_title}
                            />
                          </FormControl>
                        </Flex>
                      </CardBody>
                    </Card>
                  </Box>{" "}
                </Flex>
                <Flex gap={8}>
                  <Box w={"45%"}>
                    {" "}
                    <Card mt={5} bg={useColorModeValue("white", "gray.700")}>
                      <CardBody p={3} as={"form"}>
                        {" "}
                        <Heading as={"h3"} size={"sm"}>
                          Thông tin hẹn -{" "}
                        </Heading>{" "}
                        <Divider mt={2} mb={5} />
                        <Flex gap={5}>
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
                              value={moment(appointmntData?.date).format(
                                "DD-MM-YYYY"
                              )}
                              onClick={() => {
                                if (
                                  appointmntData?.status == "Confirmed" ||
                                  appointmntData?.status == "Pending" ||
                                  appointmntData?.status == "Rescheduled"
                                ) {
                                  RescheduleOnOpen();
                                } else {
                                  return;
                                }
                              }}
                              cursor={"pointer"}
                            />
                          </FormControl>

                          <FormControl>
                            <FormLabel
                              fontSize={"sm"}
                              mb={0}
                              color={useColorModeValue("gray.600", "gray.300")}
                            >
                              Thời gian hẹn
                            </FormLabel>
                            <Input
                              size={"sm"}
                              fontWeight={600}
                              variant="flushed"
                              value={moment(
                                appointmntData?.time_slots,
                                "hh:mm:ss"
                              ).format("hh:mm A")}
                              onClick={() => {
                                if (
                                  appointmntData?.status == "Confirmed" ||
                                  appointmntData?.status == "Pending" ||
                                  appointmntData?.status == "Rescheduled"
                                ) {
                                  RescheduleOnOpen();
                                } else {
                                  return;
                                }
                              }}
                              cursor={"pointer"}
                            />
                          </FormControl>
                        </Flex>
                        <Flex gap={5} mt={2}>
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
                                borderColor={useColorModeValue(
                                  "gray.200",
                                  "gray.600"
                                )}
                              >
                                {selectedOption
                                  ? getStatusBadge(selectedOption)
                                  : getStatusBadge(appointmntData?.status)}
                              </MenuButton>
                              {["Pending", "Confirmed", "Rescheduled"].includes(
                                appointmntData?.status
                              ) && (
                                <MenuList>
                                  {getDef(appointmntData.type).map((option) => (
                                    <MenuItem
                                      key={option}
                                      onClick={() => {
                                        if (
                                          appointmntData.current_cancel_req_status ===
                                          "Initiated"
                                        ) {
                                          return showToast(
                                            toast,
                                            "error",
                                            "Vui lòng cập nhật yêu cầu huỷ trước"
                                          );
                                        }

                                        if (option === "Rejected") {
                                          onOpen();
                                        } else {
                                          let data = {
                                            id: id,
                                            status: option,
                                          };
                                          statusMutation.mutate(data);
                                        }
                                      }}
                                    >
                                      <Box display="flex" alignItems="center">
                                        {getStatusBadge(option)}
                                      </Box>
                                    </MenuItem>
                                  ))}
                                </MenuList>
                              )}
                            </Menu>
                          </FormControl>
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
                                borderColor={useColorModeValue(
                                  "gray.200",
                                  "gray.600"
                                )}
                              >
                                {getTypeBadge(appointmntData.type)}
                              </MenuButton>
                            </Menu>
                          </FormControl>
                        </Flex>
                      </CardBody>
                    </Card>
                  </Box>{" "}
                  <Box w={"55%"}>
                    {" "}
                    <Card mt={5} bg={useColorModeValue("white", "gray.700")}>
                      <CardBody p={3} as={"form"}>
                        {" "}
                        <Heading as={"h3"} size={"sm"}>
                          Thông tin thanh toán - {" "}
                        </Heading>{" "}
                        <Divider mt={2} mb={5} />
                        <Flex gap={5} align={"flex-end"}>
                          <FormControl isRequired>
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
                              value={appointmntData?.payment_status}
                              {...register("payment_status")}
                              isReadOnly
                              onChange={(e) => {
                                if (e.target.value === "Paid") {
                                  paymentOnOpen();
                                } else {
                                  return;
                                }
                              }}
                            >
                              {["Pending", "Not Paid", "Unpaid"].includes(
                                appointmntData.payment_status
                              ) || appointmntData.payment_status === null ? (
                                <>
                                  <option value="Paid">Đã thanh toán</option>
                                  <option value="Pending">Đang chờ</option>
                                  <option value="Not Paid">Chưa thanh toán</option>
                                  <option value="Refunded">Đã hoàn tiền</option>
                                </>
                              ) : (
                                <>
                                  <option value={appointmntData.payment_status}>
                                    {appointmntData.payment_status}
                                  </option>
                                </>
                              )}
                            </Select>
                          </FormControl>

                          {/* <FormControl>
                            <FormLabel
                              fontSize={"sm"}
                              mb={0}
                              color={useColorModeValue("gray.600", "gray.300")}
                            >
                              Payment Id
                            </FormLabel>
                            <Input
                              {...register("payment_id")}
                              size={"sm"}
                              fontWeight={600}
                              variant="flushed"
                              defaultValue={appointmntData.payment_id || "N/A"}
                            />
                          </FormControl> */}
                        </Flex>
                        <Flex gap={5} mt={2}>
                          <FormControl id="doct_specialization" size={"sm"}>
                            <FormLabel
                              fontSize={"sm"}
                              mb={0}
                              color={useColorModeValue("gray.600", "gray.300")}
                            >
                                ID Cuộc họp
                            </FormLabel>
                            <Input
                              {...register("meeting_id")}
                              size={"sm"}
                              fontWeight={600}
                              variant="flushed"
                              defaultValue={appointmntData.meeting_id}
                            />
                          </FormControl>

                          <FormControl id="dept_title" size={"sm"}>
                            <FormLabel
                              fontSize={"sm"}
                              mb={0}
                              color={useColorModeValue("gray.600", "gray.300")}
                              display={"Flex"}
                              alignItems={"center"}
                              gap={2}
                            >
                              Meeting Link {" "}
                              {appointmntData.type === "Video Consultant"
                                ? appointmntData.meeting_link && (
                                    <Link
                                      href={appointmntData.meeting_link}
                                      target="_blank"
                                    >
                                      <BiLinkExternal
                                        fontSize={20}
                                        color={theme.colors.teal[500]}
                                      />
                                    </Link>
                                  )
                                : null}
                            </FormLabel>
                            <Input
                              {...register("meeting_link")}
                              size={"sm"}
                              fontWeight={600}
                              variant="flushed"
                              value={appointmntData.meeting_link}
                            />
                          </FormControl>
                        </Flex>
                      </CardBody>
                    </Card>
                  </Box>{" "}
                </Flex>
              </form>

              {/* cancellation req */}
              <Tabs mt={5} colorScheme={"red"}>
                <TabList>
                  <Tab fontSize={18} fontWeight={600}>
                    Yêu cầu huỷ của bệnh nhân
                  </Tab>
                </TabList>
                <TabPanels>
                  <TabPanel px={0}>
                    <CancellationReq
                      current_req={appointmntData.current_cancel_req_status}
                    />
                  </TabPanel>
                </TabPanels>
              </Tabs>
            </Box>
          </TabPanel>
          {hasPermission("PRESCRIPTION_VIEW") && (
            <TabPanel>
              <PrescriptionByAppID
                appointmentID={id}
                appointmntData={appointmntData}
              />
            </TabPanel>
          )}
          {hasPermission("APPOINTMENT_INVOICE_VIEW") && (
            <TabPanel>
              <InvoiceByAppointmentID appointmentID={id} />
            </TabPanel>
          )}
          {hasPermission("ALL_TRANSACTION_VIEW") && (
            <TabPanel>
              <TransactionByAppID appointmentID={id} />
            </TabPanel>
          )}
          {hasPermission("APPOINTMENT_PAYMENTS_VIEW") && (
            <TabPanel>
              <PaymentsByAppID appointmentID={id} />
            </TabPanel>
          )}

          <TabPanel>
            <PatientFiles id={appointmntData.patient_id} />
          </TabPanel>
        </TabPanels>
      </Tabs>
      <HandlePendingStatus
        isOpen={isOpen}
        onClose={onClose}
        id={id}
        appData={appointmntData}
      />
      <RescheduleAppointment
        data={appointmntData}
        isOpen={RescheduleIsOpen}
        onClose={RescheduleOnClose}
      />
      <PaymentStatusPaid
        id={id}
        isOpen={paymentIsOpen}
        onClose={paymentOnClose}
      />
    </Box>
  );
}

function getNextStates(currentState) {
  switch (currentState) {
    case "Initiated":
      return ["Processing", "Rejected", "Approved"];
    case "Processing":
      return ["Rejected", "Approved"];
    case "Rejected":
      return [];
    case "Approved":
      return [];
    default:
      return [];
  }
}

const CancellationReq = ({ current_req }) => {
  const { id } = useParams();
  const toast = useToast();
  const queryClient = useQueryClient();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [updatedStatus, setupdatedStatus] = useState();

  const getData = async () => {
    const res = await GET(
      admin.token,
      `get_appointment_cancel_req/appointment/${id}`
    );
    const rearrangedArray = res?.data.map((item) => {
      const { status, notes, created_at } = item;
      return {
        // id: id,
        // appointment_id,
        Status: getCancellationStatusBadge(status),
        notes: notes,
        "Ngày tạo": moment(created_at).format("DD MMM YY hh:mm A"),
      };
    });

    return rearrangedArray.sort((a, b) => b.id - a.id);
  };
  const { isLoading, data } = useQuery({
    queryKey: ["appointment-canc-req", id],
    queryFn: getData,
  });

  const updateReqStatus = async (status) => {
    let data = {
      appointment_id: id,
      status: status,
    };
    try {
      const res = await UPDATE(admin.token, "appointment_cancellation", data);
      if (res.response === 200) {
        showToast(toast, "success", "Updated!");
      } else {
        showToast(toast, "error", res.message);
      }
    } catch (error) {
      showToast(toast, "error", JSON.stringify(error));
    }
  };

  const mutation = useMutation({
    mutationFn: async (status) => {
      updateReqStatus(status);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["appointment-canc-req", id]);
      queryClient.invalidateQueries("appointment", id);
      queryClient.invalidateQueries("appointments");
      queryClient.invalidateQueries("main-appointments");
    },
  });

  if (mutation.isLoading) return <Loading />;
  return (
    <Box>
      {isLoading || !data ? (
        <Box>
          <Flex mb={5} justify={"space-between"}>
            <Skeleton w={400} h={8} />
            <Skeleton w={200} h={8} />
          </Flex>
          <Skeleton h={10} w={"100%"} mt={2} />
          <Skeleton h={10} w={"100%"} mt={2} />
          <Skeleton h={10} w={"100%"} mt={2} />
          <Skeleton h={10} w={"100%"} mt={2} />
          <Skeleton h={10} w={"100%"} mt={2} />
          <Skeleton h={10} w={"100%"} mt={2} />
          <Skeleton h={10} w={"100%"} mt={2} />
          <Skeleton h={10} w={"100%"} mt={2} />
          <Skeleton h={10} w={"100%"} mt={2} />
          <Skeleton h={10} w={"100%"} mt={2} />
        </Box>
      ) : (
        <Box>
          {data.length ? (
            <Flex mb={5} justify={"space-between"} align={"center"}>
              <FormControl size={"sm"}>
                <FormLabel
                  fontSize={"sm"}
                  mb={0}
                  color={useColorModeValue("gray.600", "gray.300")}
                >
                  Cập nhật trạng thái yêu cầu
                </FormLabel>
                <Menu>
                  <MenuButton
                    as={Button}
                    rightIcon={<ChevronDownIcon />}
                    bg={"transparent"}
                    w={"300px"}
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
                    {getCancellationStatusBadge(current_req)}
                  </MenuButton>
                  {getNextStates(current_req)?.length ? (
                    <MenuList>
                      {getNextStates(current_req)?.map((option) => (
                        <MenuItem
                          key={option}
                          onClick={() => {
                            onOpen();
                            setupdatedStatus(option);
                            // if (option === "Approved") {
                            //   return;
                            // } else {
                            //   mutation.mutate(option);
                            // }
                          }}
                        >
                          <Box display="flex" alignItems="center">
                            {getCancellationStatusBadge(option)}
                          </Box>
                        </MenuItem>
                      ))}
                    </MenuList>
                  ) : null}
                </Menu>
              </FormControl>
            </Flex>
          ) : null}
          <DynamicTable minPad={"8px 10px"} data={data} />
        </Box>
      )}

      <HandelUpdateCancellation
        isOpen={isOpen}
        onClose={onClose}
        id={id}
        type={updatedStatus}
      />
    </Box>
  );
};

const HandlePendingStatus = ({ isOpen, onClose, id, appData }) => {
  const queryClient = useQueryClient();
  const toast = useToast();

  const rejectMutation = useMutation({
    mutationFn: async (data) => {
      if (appData.source === "Admin") {
        let data = {
          id: id,
          status: "Rejected",
        };
        await handleStatusUpdate(data);
      } else {
        await handleAppointmentReject(data);
      }
    },
    onSuccess: () => {
      showToast(toast, "success", "Success");
      queryClient.invalidateQueries("appointments");
      queryClient.invalidateQueries("main-appointments");
      queryClient.invalidateQueries(["appointment", id]);
      onClose();
    },
    onError: (error) => {
      showToast(toast, "error", error.message);
    },
  });

  if (rejectMutation.isPending) return <Loading />;

  return (
    <AlertDialog isOpen={isOpen} onClose={onClose} isCentered>
      <AlertDialogOverlay>
        <AlertDialogContent>
          <AlertDialogHeader fontSize="lg" fontWeight="bold">
            Từ chối lịch hẹn, mã: {id}
          </AlertDialogHeader>

          <AlertDialogBody>
            Bạn có chắc chắn? Hành động này không thể hoàn tác.
          </AlertDialogBody>

          <AlertDialogFooter>
            <Button onClick={onClose} size={"sm"}>
              Cancel
            </Button>
            <Button
              colorScheme="red"
              onClick={() => {
                let data = { appointment_id: id };
                rejectMutation.mutate(data);
              }}
              ml={3}
              size={"sm"}
            >
              Reject
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  );
};

const HandelUpdateCancellation = ({ isOpen, onClose, id, type }) => {
  const queryClient = useQueryClient();
  const toast = useToast();

  const updateReqStatus = async (status) => {
    let data = {
      appointment_id: id,
      status: status,
    };
    try {
      const res = await UPDATE(admin.token, "appointment_cancellation", data);
      if (res.response === 200) {
        showToast(toast, "success", "Updated!");
      } else {
        showToast(toast, "error", res.message);
      }
    } catch (error) {
      showToast(toast, "error", JSON.stringify(error));
    }
  };

  const mutationApprove = useMutation({
    mutationFn: async (data) => {
      await handleCancelAppointment(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries("appointments");
      queryClient.invalidateQueries("main-appointments");
      queryClient.invalidateQueries(["appointment-canc-req", id]);
      queryClient.invalidateQueries("appointment", id);
      onClose();
    },
    onError: (error) => {
      showToast(toast, "error", error.message);
      onClose();
    },
  });

  const mutationRest = useMutation({
    mutationFn: async (data) => {
      await updateReqStatus(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries("appointments");
      queryClient.invalidateQueries("main-appointments");
      queryClient.invalidateQueries(["appointment-canc-req", id]);
      queryClient.invalidateQueries("appointment", id);
      onClose();
    },
    onError: (error) => {
      showToast(toast, "error", error.message);
      onClose();
    },
  });

  if (mutationApprove.isPending || mutationRest.isPending) return <Loading />;

  return (
    <AlertDialog isOpen={isOpen} onClose={onClose} isCentered>
      <AlertDialogOverlay>
        <AlertDialogContent>
          <AlertDialogHeader fontSize="md" fontWeight="bold">
            Yêu cầu {type}, mã: {id}
          </AlertDialogHeader>

          <AlertDialogBody>
            Bạn có chắc chắn muốn cập nhật trạng thái huỷ thành {type}?
          </AlertDialogBody>

          <AlertDialogFooter>
            <Button onClick={onClose} size={"sm"}>
              Hủy
            </Button>
            <Button
              colorScheme="red"
              onClick={() => {
                if (type === "Approved") {
                  let data = { appointment_id: id, status: "Approved" };
                  mutationApprove.mutate(data);
                } else {
                  mutationRest.mutate(type);
                }
              }}
              ml={3}
              size={"sm"}
            >
              {type === "Approved" ? "Duyệt" : type === "Rejected" ? "Từ chối" : type} yêu cầu huỷ
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  );
};

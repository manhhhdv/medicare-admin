import ClockWithCountdown from "../../Components/LiveClock";
import { useSelectedClinic } from "../../Context/SelectedClinic";
import { GET } from "../../Controllers/ApiControllers";
import admin from "../../Controllers/admin";
import useHasPermission from "../../Hooks/HasPermission";

/* eslint-disable react-hooks/rules-of-hooks */
import useAppointmentData from "../../Hooks/UseAppointmentData";
import usePatientData from "../../Hooks/UsePatientsData";
import useTransactionData from "../../Hooks/UseTransaction";
import useUserData from "../../Hooks/Users";
import AddNewAppointment from "../Appointments/AddNewAppointment";
import AddCheckin from "../Checkin/Add";
import AddMedicine from "../Medicines/AddMedicine";
import AddPatients from "../Patients/AddPatients";
import {
  AppointmentCardsOthers,
  AppointmentCardsTop,
} from "./AppointmentCards";
import AppointmentChart from "./AppointmentChart";
import AppointmentReg from "./AppointmentReg";
import StatusPieChart from "./AppointmentStatusPieChart";
import AppointmentsCalendar from "./Calender";
import CancellationPieChart from "./CancelationReqChart";
import CancellationReqStatsics from "./CancellationReqStatsics";
import PatientsReg from "./PatientsReg";
import TransactionChart from "./TransactionChart";
import TransactionPieChart from "./TransactionPieChart";
import UsersReg from "./UsersReg";
import WelcomeCard from "./WelcomeCard";
import {
  Box,
  Button,
  Flex,
  Skeleton,
  useColorModeValue,
  useDisclosure,
} from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { BiCheckShield } from "react-icons/bi";
import { MdAddCircleOutline } from "react-icons/md";
import { useNavigate } from "react-router-dom";

const getData = async () => {
  const res = await GET(admin.token, "get_dashboard_count");
  if (res.response !== 200) {
    throw new Error(res.message);
  }
  return res.data;
};
const getDataByDoct = async () => {
  const res = await GET(admin.token, `get_dashboard_count/doctor/${admin.id}`);
  if (res.response !== 200) {
    throw new Error(res.message);
  }
  return res.data;
};

export default function DashboardMain() {
  const { appointmentsData } = useAppointmentData();
  const { usersData } = useUserData();
  const { transactionsData } = useTransactionData();
  const { patientsData } = usePatientData();
  const { hasPermission } = useHasPermission();
  const { selectedClinic } = useSelectedClinic();
  const getDataByClinic = async () => {
    const res = await GET(
      admin.token,
      `get_dashboard_count/clinic/${selectedClinic.id}`
    );
    if (res.response !== 200) {
      throw new Error(res.message);
    }
    return res.data;
  };
  //
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard", selectedClinic],
    queryFn:
      admin.role.name === "Doctor"
        ? getDataByDoct
        : selectedClinic
        ? getDataByClinic
        : getData,
  });

  // filter fn
  const completedAppointment = appointmentsData?.filter(
    (appointment) =>
      appointment.status === "Completed" || appointment.status === "Visited"
  );
  const CancelledAppointments = appointmentsData?.filter(
    (appointment) => appointment.status === "Cancelled"
  );
  const confirmAppointments = appointmentsData?.filter(
    (appointment) =>
      appointment.status != "Cancelled" ||
      appointment.status != "Rejected" ||
      appointment.status != "Pending"
  );

  // transaction
  const debitTxn = transactionsData?.filter(
    (item) => item.transaction_type === "Debited"
  );
  const creditTxn = transactionsData?.filter(
    (item) => item.transaction_type === "Credited"
  );

  return (
    <Box>
      <Buttons />
      <Flex gap={5} mt={5}>
        <Box width={"35%"} minH={"100%"} flex={1}>
          {isLoading ? (
            <Skeleton w={"100%"} h={240} />
          ) : (
            <WelcomeCard data={data} />
          )}
        </Box>
        <Box width={"70%"} flex={2}>
          {isLoading ? (
            <>
              <Flex gap={5}>
                {" "}
                <>
                  <Skeleton flex={1} w={"100%"} h={24}></Skeleton>
                  <Skeleton flex={1} w={"100%"} h={24}></Skeleton>
                </>
              </Flex>
              <Flex gap={5} mt={8}>
                {" "}
                <>
                  <Skeleton flex={1} w={"100%"} h={24}></Skeleton>
                  <Skeleton flex={1} w={"100%"} h={24}></Skeleton>
                </>
              </Flex>
            </>
          ) : (
            <>
              <AppointmentCardsTop data={data} />
            </>
          )}
        </Box>
      </Flex>
      <Box mt={5}>
        {isLoading ? (
          <>
            <Flex gap={5}>
              {" "}
              <>
                <Skeleton flex={1} w={"100%"} h={24}></Skeleton>
                <Skeleton flex={1} w={"100%"} h={24}></Skeleton>
              </>
            </Flex>
            <Flex gap={5} mt={8}>
              {" "}
              <>
                <Skeleton flex={1} w={"100%"} h={24}></Skeleton>
                <Skeleton flex={1} w={"100%"} h={24}></Skeleton>
              </>
            </Flex>
          </>
        ) : (
          <>
            <AppointmentCardsOthers data={data} />
          </>
        )}
      </Box>
      <Flex gap={2} mt={5}>
        {admin.role.name === "Admin" ? (
          <Box
            flex={1}
            bg={useColorModeValue("#fff", "gray.900")}
            borderRadius={8}
          >
            <UsersReg Users={usersData} />
          </Box>
        ) : hasPermission("USER_VIEW") ? (
          <Box
            flex={1}
            bg={useColorModeValue("#fff", "gray.900")}
            borderRadius={8}
          >
            <UsersReg Users={usersData} />
          </Box>
        ) : null}{" "}
        {admin.role.name === "Admin" ? (
          <Box
            flex={1}
            bg={useColorModeValue("#fff", "gray.900")}
            borderRadius={8}
          >
            <PatientsReg Patients={patientsData} />
          </Box>
        ) : hasPermission("PATIENT_VIEW") ? (
          <Box
            flex={1}
            bg={useColorModeValue("#fff", "gray.900")}
            borderRadius={8}
          >
            <PatientsReg Patients={patientsData} />
          </Box>
        ) : null}{" "}
      </Flex>
      {/* calender */}
      {hasPermission("APPOINTMENT_VIEW") && (
        <Box mt={5}>
          <AppointmentsCalendar appointmentData={appointmentsData} />
        </Box>
      )}
      {/* appointment in last 15 days */}
      {hasPermission("APPOINTMENT_VIEW") ? (
        <Box mt={5}>
          <AppointmentReg Appointments={appointmentsData} />
        </Box>
      ) : null}{" "}
      {/* charts */}
      {hasPermission("APPOINTMENT_VIEW") ? (
        <Flex gap={5} mt={5}>
          <Box
            maxW={"68%"}
            flex={2}
            bg={useColorModeValue("#fff", "gray.900")}
            borderRadius={8}
          >
            <AppointmentChart
              appointments={appointmentsData}
              cancelledAppointments={CancelledAppointments}
              compleatedAppointments={completedAppointment}
              confirmedAppointments={confirmAppointments}
            />
          </Box>
          <Box
            maxW={"30%"}
            flex={1}
            bg={useColorModeValue("#fff", "gray.900")}
            borderRadius={8}
          >
            <StatusPieChart appointments={appointmentsData} />
          </Box>
        </Flex>
      ) : null}{" "}
      {hasPermission("ALL_TRANSACTION_VIEW") ? (
        <Flex gap={5} mt={5}>
          <Box
            maxW={"68%"}
            flex={2}
            bg={useColorModeValue("#fff", "gray.900")}
            borderRadius={8}
          >
            <TransactionChart
              creditTransactions={creditTxn}
              debitTransactions={debitTxn}
            />
          </Box>
          <Box
            maxW={"30%"}
            flex={1}
            bg={useColorModeValue("#fff", "gray.900")}
            borderRadius={8}
          >
            <TransactionPieChart transactions={transactionsData} />
          </Box>
        </Flex>
      ) : null}{" "}
      <Flex gap={5} mt={5}>
        <Box maxW={"68%"} flex={2}>
          <CancellationReqStatsics data={data} />
        </Box>
        <Box
          maxW={"30%"}
          flex={1}
          bg={useColorModeValue("#fff", "gray.900")}
          borderRadius={8}
          maxH={"fit-content"}
        >
          <CancellationPieChart cancelData={data} />
        </Box>
      </Flex>
    </Box>
  );
}

const Buttons = () => {
  const { hasPermission } = useHasPermission();
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: appointmentisOpen,
    onOpen: appointmentonOpen,
    onClose: appointmentonClose,
  } = useDisclosure();
  const {
    isOpen: patientisOpen,
    onOpen: patientonOpen,
    onClose: patientonClose,
  } = useDisclosure();
  const {
    isOpen: checkinisOpen,
    onOpen: checkinonOpen,
    onClose: checkinonClose,
  } = useDisclosure();
  return (
    <>
      <Flex gap={5} justify={"space-between"}>
        <Flex gap={5} justify={"start"}>
          {hasPermission("APPOINTMENT_ADD") && (
            <Button
              size={"xs"}
              colorScheme={"blue"}
              bg={"blue.700"}
              _hover={{
                bg: "blue.700",
              }}
              color={"#fff"}
              leftIcon={<MdAddCircleOutline fontSize={18} />}
              onClick={() => {
                appointmentonOpen();
              }}
              borderRadius={0}
            >
              Thêm lịch hẹn mới
            </Button>
          )}
          {hasPermission("DOCTOR_ADD") && (
            <Button
              size={"xs"}
              colorScheme={"blue"}
              bg={"blue.700"}
              _hover={{
                bg: "blue.700",
              }}
              color={"#fff"}
              leftIcon={<MdAddCircleOutline fontSize={18} />}
              onClick={() => {
                navigate("/doctors/add");
              }}
              borderRadius={0}
            >
              Thêm bác sĩ
            </Button>
          )}
          {hasPermission("PATIENT_ADD") && (
            <Button
              size={"xs"}
              colorScheme={"blue"}
              bg={"blue.700"}
              _hover={{
                bg: "blue.700",
              }}
              color={"#fff"}
              leftIcon={<MdAddCircleOutline fontSize={18} />}
              onClick={() => {
                patientonOpen();
              }}
              borderRadius={0}
            >
              Thêm bệnh nhân
            </Button>
          )}
          {hasPermission("MEDICINE_ADD") && (
            <Button
              size={"xs"}
              colorScheme={"blue"}
              bg={"blue.700"}
              _hover={{
                bg: "blue.700",
              }}
              color={"#fff"}
              leftIcon={<MdAddCircleOutline fontSize={18} />}
              onClick={() => {
                onOpen();
              }}
              borderRadius={0}
            >
              Thêm thuốc
            </Button>
          )}
          {hasPermission("CHECKIN_ADD") && (
            <Button
              size={"xs"}
              colorScheme={"blue"}
              bg={"blue.700"}
              _hover={{
                bg: "blue.700",
              }}
              color={"#fff"}
              leftIcon={<BiCheckShield fontSize={18} />}
              onClick={() => {
                checkinonOpen();
              }}
              borderRadius={0}
            >
              Check-in mới
            </Button>
          )}
        </Flex>
        <ClockWithCountdown />
      </Flex>
      <AddMedicine isOpen={isOpen} onClose={onClose} />
      <AddNewAppointment
        isOpen={appointmentisOpen}
        onClose={appointmentonClose}
      />
      <AddPatients
        nextFn={() => {}}
        onClose={patientonClose}
        isOpen={patientisOpen}
      />
      <AddCheckin isOpen={checkinisOpen} onClose={checkinonClose} />
    </>
  );
};

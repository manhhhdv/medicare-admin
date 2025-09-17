import Loading from "../../Components/Loading";
import { GET } from "../../Controllers/ApiControllers";
import admin from "../../Controllers/admin";
import imageBaseURL from "../../Controllers/image";
import todayDate from "../../Controllers/today";
import useSettingsData from "../../Hooks/SettingData";
import {
  Box,
  Grid,
  Text,
  List,
  Image,
  Flex,
  Select,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Input,
} from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import moment from "moment";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

// Fetch Appointments Function

// get doctors
const getData = async (clinic_id) => {
  const res = await GET(admin.token, `get_doctor?clinic_id=${clinic_id || ""}`);
  return res.data;
};

const QueueList = () => {
  const { settingsData } = useSettingsData();
  const logo = settingsData?.find((value) => value.id_name === "logo");
  const [time, setTime] = useState(moment().format("MMMM D YYYY, h:mm:ss a"));
  const [selectDoc, setselectDoc] = useState(false);
  const [selectedDate, setselectedDate] = useState(
    moment().format("YYYY-MM-DD")
  );
  const [isLOad, setisLOad] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const doctID = searchParams.get("doct");
  const doctname = searchParams.get("name");
  const clinic_id = searchParams.get("clinic_id");
  const ParamsDoctor = searchParams.get("isSelectedDoctor");

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(moment().format("MMMM D YYYY, h:mm:ss a"));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // doctors
  const { isLoading: doctorsLoading, data: doctors } = useQuery({
    queryKey: ["doctors"],
    queryFn: () => getData(clinic_id),
  });

  useEffect(() => {
    if (doctors && doctors.length > 0) {
      const selectedDoctor = doctID
        ? doctors?.find((doc) => doc.user_id.toString() === doctID)
        : null;

      console.log(doctID, selectedDoctor, doctors);

      if (doctID && selectedDoctor) {
        // Valid doctID, ensure name is consistent
        const expectedName = `${selectedDoctor.f_name} ${selectedDoctor.l_name}`;
        if (doctname !== expectedName) {
          setSearchParams({
            ...searchParams,
            clinic_id: clinic_id || "",
            doct: doctID,
            name: expectedName,
            isSelectedDoctor: ParamsDoctor,
          });
        }
      } else {
        // Invalid or no doctID, default to first doctor
        const firstDoctor = doctors[0];
        setSearchParams({
          clinic_id: clinic_id || "",
          doct: firstDoctor.user_id,
          name: `${firstDoctor.f_name} ${firstDoctor.l_name}`,
        });
      }
    }
  }, [
    doctors,
    doctID,
    doctname,
    clinic_id,
    setSearchParams,
    searchParams,
    ParamsDoctor,
  ]);

  const fetchAppointments = async () => {
    setisLOad(true);
    const res = await GET(
      admin?.token,
      `get_appointment_check_in?start_date=${selectedDate}&end_date=${selectedDate}&doctor_id=${doctID}&clinic_id=${
        clinic_id || ""
      }`
    );
    setisLOad(false);
    return res.data;
  };
  // Query to fetch appointments
  const { data, error, isLoading } = useQuery({
    queryKey: ["appointments-queue", doctID, selectedDate, clinic_id],
    queryFn: fetchAppointments,
    refetchInterval: 30000, // Refetch every 30 seconds
    enabled: !!doctID,
  });

  if (isLoading || doctorsLoading || isLOad) return <Loading />;
  if (error) return <Text color="red.500">Không thể tải lịch hẹn</Text>;
  const appointments = data || [];
  // Separate current and next appointments
  const currentAppointment = appointments[0] || null;
  const nextAppointments = appointments.slice(1); // All but the first one

  return (
    <Box p={4} bg="blackAlpha.800" minH="100vh" color="white">
      <Grid
        templateColumns="1fr 3fr 1fr"
        gap={6}
        bg={"#fff"}
        p={3}
        borderRadius={5}
        alignContent={"center"}
        alignItems={"center"}
      >
        {/* Left side - Logo */}
        <Box>
          <Image
            w={20}
            src={`${imageBaseURL}/${logo?.value}`}
            fallbackSrc={"/admin/logo.png"}
          />
        </Box>

        {/* Middle - Doctor label */}
        <Flex
          textAlign="center"
          w={"100%"}
          justifyContent={"center"}
          gap={4}
          alignItems={"center"}
        >
          <Text
            fontSize="2xl"
            fontWeight="bold"
            color="blue.600"
            cursor={"pointer"}
            onClick={() => {
              if (!ParamsDoctor) {
                setselectDoc(!selectDoc);
              }
            }}
          >
            Bác sĩ: {doctname}
          </Text>
          {selectDoc && (
            <>
              {" "}
              <Select
                placeholder="Chọn bác sĩ"
                w={60}
                color={"#000"}
                value={selectDoc}
                onChange={(e) => {
                  const doct = JSON.parse(e.target.value);
                  setSearchParams({
                    doct: doct.user_id,
                    name: `${doct.f_name} ${doct.l_name}`,
                  });
                  setselectDoc(false);
                }}
              >
                {doctors.map((doct) => (
                  <option
                    color={"#000"}
                    key={doct.id}
                    value={JSON.stringify(doct)}
                  >
                    Bs. {doct.f_name} {doct.l_name}
                  </option>
                ))}
              </Select>
              <Input
                placeholder={"Chọn ngày"}
                w={60}
                color={"#000"}
                value={selectedDate}
                type="date"
                max={todayDate()}
                onChange={(e) => {
                  const date = moment(e.target.value).format("YYYY-MM-DD");
                  setselectedDate(date);
                  setselectDoc(false);
                }}
              />
            </>
          )}
        </Flex>

        {/* Right side - Date and Time */}
      </Grid>

      {/* Main Content */}
      <Grid templateColumns="1fr 2fr" gap={6} mt={6} minH={"87vh"}>
        {/* Left - Next Appointments */}
        <Box
          bg="blackAlpha.900"
          p={4}
          borderRadius="md"
          minH={"70vh"}
          px={2}
          pt={2}
          borderRight={"sm"}
          color={"#000"}
        >
          <Text
            fontSize="2xl"
            fontWeight="bold"
            mb={4}
            textAlign={"center"}
            bg={"#fff"}
          >
            Bệnh nhân tiếp theo
          </Text>
          <List spacing={3}>
            {nextAppointments.length > 0 ? (
              <Table variant="simple">
                <Thead>
                  <Tr>
                    {" "}
                    <Th color="#fff">STT</Th>
                    <Th color="#fff">Mã</Th>
                    <Th color="#fff">Tên bệnh nhân</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {nextAppointments.map((appointment, index) => (
                    <Tr key={appointment.id} color={"#fff"} fontWeight={600}>
                      {" "}
                      <Td>#{index + 2}</Td>
                      <Td>#{appointment.appointment_id}</Td>
                      <Td fontWeight="bold">
                        {" "}
                        {appointment.patient_f_name}{" "}
                        {appointment.patient_l_name}
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            ) : (
              <Text color={"#fff"}>Không có bệnh nhân sắp tới</Text>
            )}
          </List>
        </Box>

        <Box>
          {" "}
          <Box textAlign="center" bg="#fff" p={4} borderRadius="md" mb={5}>
            <Text fontSize="3xl" fontWeight={700} py={3} color={"blue.600"}>
              {time}
            </Text>
          </Box>
          <Box bg="blackAlpha.900" borderRadius="md" pb={4} p={2}>
            <Text
              fontSize="2xl"
              fontWeight="bold"
              mb={4}
              px={2}
              py={2}
              bg={"#fff"}
              borderRadius={"sm"}
              color={"#000"}
              textAlign={"center"}
            >
              Hiện tại
            </Text>
            {currentAppointment ? (
              <Box
                bg="gray.900"
                height="full"
                p={4}
                m={4}
                color="white"
                borderRadius={"sm"}
              >
                <Text fontSize={"3xl"} fontWeight={700} textAlign={"center"}>
                  Mã lịch hẹn: #{currentAppointment.appointment_id}
                </Text>
                <Text fontWeight="bold" fontSize="2xl" textAlign={"center"}>
                  Tên - {currentAppointment.patient_f_name}{" "}
                  {currentAppointment.patient_l_name}
                </Text>

                <Text textAlign={"center"} fontSize={"xl"}>
                  Thời gian:{" "}
                  {moment(currentAppointment.time, "hh:mm:ss").format(
                    "hh:mm A"
                  )}
                </Text>
                <Text textAlign={"center"} fontSize={"xl"}>
                  Ngày: {currentAppointment.date}
                </Text>
              </Box>
            ) : (
              <Text>Hiện không có bệnh nhân nào đang được khám</Text>
            )}
          </Box>
        </Box>
        {/* Right - Current Appointment */}
      </Grid>
    </Box>
  );
};

export default QueueList;

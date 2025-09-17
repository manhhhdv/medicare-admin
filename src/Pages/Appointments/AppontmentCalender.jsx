import ErrorPage from "../../Components/ErrorPage";
import NotAuth from "../../Components/NotAuth";
import { useSelectedClinic } from "../../Context/SelectedClinic";
import { GET } from "../../Controllers/ApiControllers";
import admin from "../../Controllers/admin";
import useHasPermission from "../../Hooks/HasPermission";
import AppointmentsCalendar from "../Dashboard/Calender";
import { Box, Flex, Skeleton, useToast } from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { useRef } from "react";

export default function AppontmentCalender() {
  const toast = useToast();
  const id = "Errortoast";
  const boxRef = useRef(null);
  const { hasPermission } = useHasPermission();
  const { selectedClinic } = useSelectedClinic();

  const getData = async () => {
    const url = `get_appointments?doctor_id=${
      admin.role.name === "Doctor" ? admin.id : ""
    }&clinic_id=${selectedClinic?.id || ""}`;
    const res = await GET(admin.token, url);
    return res.data;
  };

  const { isLoading, data, error } = useQuery({
    queryKey: ["all-appointments", selectedClinic?.id],
    queryFn: getData,
  });

  if (error) {
    if (!toast.isActive(id)) {
      toast({
        id,
        title: "Lỗi!",
        description: "Đã xảy ra lỗi.",
        status: "error",
        duration: 2000,
        isClosable: true,
        position: "top",
      });
    }
    return <ErrorPage errorCode={error.name} />;
  }
  if (!hasPermission("APPOINTMENT_VIEW")) return <NotAuth />;

  return (
    <Box ref={boxRef}>
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
          <AppointmentsCalendar appointmentData={data} />
        </Box>
      )}
    </Box>
  );
}

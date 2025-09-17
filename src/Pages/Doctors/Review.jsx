/* eslint-disable react/prop-types */
import DynamicTable from "../../Components/DataTable";
import ErrorPage from "../../Components/ErrorPage";
import { GET } from "../../Controllers/ApiControllers";
import admin from "../../Controllers/admin";
import RatingStars from "../../Hooks/ShowRating";
import { Box, Flex, Skeleton, Text } from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";

function Review({ doctID, doctorDetails }) {
  const getData = async () => {
    const res = await GET(
      admin.token,
      `get_all_doctor_review?doctor_id=${doctID}`
    );
    const rearrangedArray = res?.data.map((doctor) => {
      const {
        id,
        user_id,
        appointment_id,
        points,
        description,
        f_name,
        l_name,
        created_at,
      } = doctor;

      return {
        id,
        patient_id: user_id,
        appointment_id,
        Name: `${f_name} ${l_name}`,
        points,
        description,
        created_at,
      };
    });
    return rearrangedArray;
  };
  const { isLoading, data, error } = useQuery({
    queryKey: ["reviews", doctID],
    queryFn: getData,
  });
  if (error) {
    return <ErrorPage errorCode={error.name} />;
  }

  return (
    <Box mt={5}>
      {isLoading || !data ? (
        <Box>
          <Flex mb={5} justify={"space-between"}>
            <Skeleton w={400} h={8} />
            <Skeleton w={200} h={8} />
          </Flex>
          {/* Loading skeletons */}
          {[...Array(10)].map((_, index) => (
            <Skeleton key={index} h={10} w={"100%"} mt={2} />
          ))}
        </Box>
      ) : (
        <Box>
          <Flex gap={2} mb={3}>
            <Flex display={"flex"} align={"center"} gap={1}>
              {" "}
              <RatingStars rating={doctorDetails?.average_rating || 0} />{" "}
              <Text fontSize={"sm"} fontWeight={600}>
                {" "}
                ( {doctorDetails?.number_of_reviews || 0}) ,
              </Text>
            </Flex>
            <Text fontSize={"sm"} fontWeight={600}>
              {" "}
              {doctorDetails?.total_appointment_done || 0} Lịch hẹn đã hoàn thành
            </Text>
          </Flex>
          <DynamicTable minPad={"15px 10px"} data={data} />
        </Box>
      )}
    </Box>
  );
}

export default Review;

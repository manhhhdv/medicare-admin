/* eslint-disable react-hooks/rules-of-hooks */
import DateRangeCalender from "../../Components/DateRangeCalender";
import Loading from "../../Components/Loading";
import UsersCombobox from "../../Components/UsersComboBox";
import BloodPressure from "../../Components/Vitals/BloodPressure";
import BloodSugar from "../../Components/Vitals/BloodSugar";
import SpO2 from "../../Components/Vitals/Spo2";
import Temperature from "../../Components/Vitals/Temp";
import Weight from "../../Components/Vitals/Weigjht";
import { GET } from "../../Controllers/ApiControllers";
import admin from "../../Controllers/admin";
import {
  Box,
  Button,
  Flex,
  Heading,
  useColorModeValue,
  Card,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Divider,
  Alert,
  AlertIcon,
} from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import moment from "moment";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const Last30 = moment().subtract(30, "days").format("YYYY-MM-DD");
const today = moment().format("YYYY-MM-DD");
function VitalsData() {
  const navigate = useNavigate();
  const [selectedFamilyMember, setselectedFamilyMember] = useState();
  const [dateRange, setdateRange] = useState({
    startDate: Last30,
    endDate: today,
  });
  const { id } = useParams();
  const { data: family, isLoading } = useQuery({
    queryFn: async () => {
      const res = await GET(admin.token, `get_family_members/user/${id}`);
      return res.data;
    },
    queryKey: ["family-member", id],
  });

  useEffect(() => {
    if (family) {
      setselectedFamilyMember(family[0]);
    }
  }, [family]);

  if (isLoading) return <Loading />;
  return (
    <Box>
      <Flex justify={"space-between"} alignItems={"center"}>
        <Heading as={"h1"} size={"lg"}>
          Chi tiết chỉ số sinh tồn gia đình
        </Heading>
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
      <Divider my={2} />
      <Flex mt={4} gap={3}>
        <Box w={360}>
          {" "}
          <UsersCombobox
            name={"Chọn thành viên gia đình"}
            data={family}
            setState={setselectedFamilyMember}
            defaultData={selectedFamilyMember}
          />
        </Box>
        <DateRangeCalender
          setDateRange={setdateRange}
          daysBack={30}
          size={"md"}
        />
      </Flex>
      <Box mt={3}>
        <Tabs>
          <TabList>
            <Tab>Huyết áp</Tab>
            <Tab>Đường huyết</Tab>
            <Tab>Spo2</Tab>
            <Tab>Nhiệt độ</Tab>
            <Tab>Cân nặng</Tab>
          </TabList>

          {selectedFamilyMember ? (
            <TabPanels>
              <TabPanel px={0}>
                {" "}
                <Card p={2}>
                  {" "}
                  <BloodPressure
                    userID={id}
                    id={selectedFamilyMember?.id}
                    startDate={dateRange.startDate}
                    endDate={dateRange.endDate}
                  />
                </Card>
              </TabPanel>
              <TabPanel px={0}>
                {" "}
                <Card p={2}>
                  {" "}
                  <BloodSugar
                    userID={id}
                    id={selectedFamilyMember?.id}
                    startDate={dateRange.startDate}
                    endDate={dateRange.endDate}
                  />
                </Card>
              </TabPanel>
              <TabPanel px={0}>
                {" "}
                <Card p={2}>
                  {" "}
                  <SpO2
                    userID={id}
                    id={selectedFamilyMember?.id}
                    startDate={dateRange.startDate}
                    endDate={dateRange.endDate}
                  />
                </Card>
              </TabPanel>
              <TabPanel px={0}>
                {" "}
                <Card p={2}>
                  {" "}
                  <Temperature
                    userID={id}
                    id={selectedFamilyMember?.id}
                    startDate={dateRange.startDate}
                    endDate={dateRange.endDate}
                  />
                </Card>
              </TabPanel>
              <TabPanel px={0}>
                {" "}
                <Card p={2}>
                  {" "}
                  <Weight
                    userID={id}
                    id={selectedFamilyMember?.id}
                    startDate={dateRange.startDate}
                    endDate={dateRange.endDate}
                  />
                </Card>
              </TabPanel>
            </TabPanels>
          ) : (
            <Alert status="error" py={1} fontWeight={600} mt={3} fontSize={14}>
              <AlertIcon />
              Vui lòng chọn thành viên gia đình
            </Alert>
          )}
        </Tabs>
      </Box>
    </Box>
  );
}

export default VitalsData;

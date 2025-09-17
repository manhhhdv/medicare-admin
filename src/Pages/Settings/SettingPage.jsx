import Loading from "../../Components/Loading";
import { GET } from "../../Controllers/ApiControllers";
import admin from "../../Controllers/admin";
import t from "../../Controllers/configs";
import SettingConfigurations from "./Configs/SettingConfigurations";
import { Box, Tabs, TabList, Tab, TabPanels, TabPanel } from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";

const getData = async () => {
  try {
    await t();
    const res = await GET(admin.token, "get_configurations");
    if (res.response !== 200) {
      throw new Error(res.message || "Failed to fetch configurations");
    }
    return res.data;
  } catch (error) {
    console.error("Failed to fetch configurations:", error);
    throw error;
  }
};

export default function SettingsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["configs"],
    queryFn: getData,
  });

  const groupNames = () => {
    try {
      let names = [];
      for (let index = 0; index < data?.length; index++) {
        const element = data[index];
        if (!names.includes(element.group_name)) {
          names.push(element.group_name);
        }
      }
      return names;
    } catch (error) {
      console.log(error);
    }
  };

  if (isLoading) return <Loading />;

  return (
    <Box mt={5}>
      <Tabs>
        <TabList>
          {groupNames()?.map((item) => (
            <Tab key={item}>{item}</Tab>
          ))}
        </TabList>
        <TabPanels>
          {groupNames()?.map((item) => (
            <TabPanel key={item} p={0}>
              <SettingConfigurations groupName={item} />
            </TabPanel>
          ))}
        </TabPanels>
      </Tabs>
    </Box>
  );
}

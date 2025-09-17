import AssignedUsers from "./AssignedUsers";
import Roles from "./Role";
import { Box, Tabs, TabList, TabPanels, Tab, TabPanel } from "@chakra-ui/react";

function Index() {
  return (
    <Box>
      <Tabs>
        <TabList>
          <Tab>Vai trò</Tab>
          <Tab>Người dùng đã được gán</Tab>
        </TabList>

        <TabPanels>
          <TabPanel p={0}>
            <Box mt={5}>
              {" "}
              <Roles />
            </Box>
          </TabPanel>
          <TabPanel p={0}>
            <Box mt={5}>
              {" "}
              <AssignedUsers />
            </Box>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
}

export default Index;

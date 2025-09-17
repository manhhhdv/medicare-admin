import NotAuth from "../../Components/NotAuth";
import useHasPermission from "../../Hooks/HasPermission";
import PaymentGetways from "./PaymentGetways/Index";
import SettingsPage from "./SettingPage";
import WebPages from "./WebPages";
import SocialMedia from "@/Pages/Settings/Social-Media/SocialMedia";
import { Box, Tabs, TabList, TabPanels, Tab, TabPanel } from "@chakra-ui/react";
import { useState } from "react";

export default function Settings() {
  const { hasPermission } = useHasPermission();
  const [activeTab, setActiveTab] = useState(0);
  if (!hasPermission("SETTING_VIEW")) return <NotAuth />;

  return (
    <Box>
      <Tabs index={activeTab} onChange={(index) => setActiveTab(index)}>
        <TabList>
          <Tab>Cài đặt</Tab>
          <Tab>Trang web</Tab>
          <Tab>Mạng xã hội</Tab>
          <Tab>Cổng thanh toán</Tab>
        </TabList>

        <TabPanels>
          <TabPanel p={0}>
            <SettingsPage currentTab={0} activeTab={activeTab} />
          </TabPanel>
          <TabPanel px={0}>
            <WebPages currentTab={1} activeTab={activeTab} />
          </TabPanel>

          <TabPanel>
            <SocialMedia currentTab={2} activeTab={activeTab} />
          </TabPanel>

          <TabPanel>
            <PaymentGetways currentTab={3} activeTab={activeTab} />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
}

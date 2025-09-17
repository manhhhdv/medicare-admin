import Cities from "../Cities/Index";
import Country from "../Country/Index";
import States from "../States/Index";
import { Tabs, TabList, TabPanels, Tab, TabPanel } from "@chakra-ui/react";
import { useState } from "react";

function LocationConfig() {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (index) => {
    setActiveTab(index);
  };

  return (
    <Tabs onChange={handleTabChange}>
      <TabList>
        <Tab>Quốc gia</Tab>
        <Tab>Tỉnh/Thành phố</Tab>
        <Tab>Quận/Huyện</Tab>
      </TabList>

      <TabPanels>
        <TabPanel p={0} pt={5}>
          <Country activeTab={activeTab} tabId={0} />
        </TabPanel>
        <TabPanel p={0} pt={5}>
          <States activeTab={activeTab} tabId={1} />
        </TabPanel>
        <TabPanel p={0} pt={5}>
          <Cities activeTab={activeTab} tabId={2} />
        </TabPanel>
      </TabPanels>
    </Tabs>
  );
}

export default LocationConfig;

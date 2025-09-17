import AllCoupons from "./AllCoupon";
import UsedCoupons from "./UsedCoupons";
import { Box, Tab, TabList, Tabs, TabPanels, TabPanel } from "@chakra-ui/react";

function Coupons() {
  return (
    <Box>
      <Tabs>
        <TabList>
          <Tab>Tất cả phiếu giảm giá</Tab>
          <Tab>Phiếu giảm giá đã sử dụng</Tab>
        </TabList>

        <TabPanels>
          <TabPanel px={0}>
            <AllCoupons />
          </TabPanel>
          <TabPanel px={0}>
            <UsedCoupons />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
}

export default Coupons;

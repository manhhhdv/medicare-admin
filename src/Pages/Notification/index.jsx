import NotAuth from "../../Components/NotAuth";
import admin from "../../Controllers/admin";
import useHasPermission from "../../Hooks/HasPermission";
import AdminNotification from "./AdminNotifcation";
import DoctorNotification from "./DoctorNotification";
import UserNotification from "./UserNotification";
import { Box, Tabs, TabList, TabPanels, Tab, TabPanel } from "@chakra-ui/react";
import { useState } from "react";

export default function Notification() {
  const [activeTab, setActiveTab] = useState(0);
  const { hasPermission } = useHasPermission();

  if (!hasPermission("NOTIFICATION_VIEW")) return <NotAuth />;

  const role = admin.role.name.toLowerCase();
  const isSuperAdmin = role === "super admin";
  const isDoctor = role === "doctor";
  const isClinic = role === "clinic";

  // Determine which tabs to show based on role
  const showUserTab = isSuperAdmin;
  const showDoctorTab = isSuperAdmin || isDoctor || isClinic;
  const showAdminTab = isSuperAdmin || isClinic;

  return (
    <Box>
      <Tabs index={activeTab} onChange={(index) => setActiveTab(index)}>
        <TabList>
          {showUserTab && <Tab>Thông báo người dùng</Tab>}
          {showDoctorTab && <Tab>Thông báo bác sĩ</Tab>}
          {showAdminTab && <Tab>Thông báo quản trị viên</Tab>}
        </TabList>

        <TabPanels>
          {showUserTab && (
            <TabPanel px={0}>
              <UserNotification currentTab={0} activeTab={activeTab} />
            </TabPanel>
          )}
          {showDoctorTab && (
            <TabPanel px={0}>
              <DoctorNotification
                currentTab={showUserTab ? 1 : 0}
                activeTab={activeTab}
              />
            </TabPanel>
          )}
          {showAdminTab && (
            <TabPanel px={0}>
              <AdminNotification
                currentTab={showUserTab ? 2 : showDoctorTab ? 1 : 0}
                activeTab={activeTab}
              />
            </TabPanel>
          )}
        </TabPanels>
      </Tabs>
    </Box>
  );
}

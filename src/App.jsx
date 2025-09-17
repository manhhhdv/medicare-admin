import Loading from "./Components/Loading";
import { UPDATE } from "./Controllers/ApiControllers";
import admin from "./Controllers/admin";
import { getToken, messaging } from "./Controllers/firebase.config";
import ErrorBoundary from "./ErrorBoundary";
import "/src/App.css";
import { Box } from "@chakra-ui/react";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import moment from "moment";
import React, { useEffect, Suspense } from "react";
import { useLocation } from "react-router-dom";

const Dashboard = React.lazy(() => import("./Global/Dashboard"));
const Topbar = React.lazy(() => import("./Global/Topbar"));
const Login = React.lazy(() => import("./Pages/Login"));
const Sidebar = React.lazy(() => import("./Global/Sidebar"));
const QueueList = React.lazy(() => import("./Pages/Checkin/Queue"));
const updateUser = async (fcmid) => {
  await UPDATE(admin.token, "update_user", { id: admin.id, web_fcm: fcmid });
  localStorage.setItem("webfcm", fcmid);
};
function hasExpiredUser(timestamp) {
  const currentTime = moment().valueOf();
  return currentTime > timestamp;
}
export default function App() {
  const location = useLocation();
  const requestPermission = async () => {
    try {
      if (!("serviceWorker" in navigator)) {
        console.error("Trình duyệt này không hỗ trợ Service Worker.");
        return;
      }
      if (!("Notification" in window)) {
        console.error("Trình duyệt này không hỗ trợ thông báo.");
        return;
      }
      const permission = await Notification.requestPermission();

      if (permission === "granted") {
        const token = await getToken(messaging, {
          vapidKey: import.meta.env.VITE_FIREBASE_FCM_PUBLIC_KEY,
        });
        console.log(token);
        if (admin) {
          updateUser(token);
        }
      } else {
        console.error("Bạn đã từ chối cấp quyền nhận thông báo.");
      }
    } catch (error) {
      console.error("Có lỗi xảy ra khi xin quyền nhận thông báo:", error);
    }
  };
  useEffect(() => {
    admin && requestPermission();
  }, []);
  useEffect(() => {
    if (admin) {
      if (hasExpiredUser(admin.exp)) {
        localStorage.removeItem("admin");
        window.location.reload();
      }
    }
  }, []);
  useEffect(() => {
    if (!navigator.geolocation) {
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        console.log("Latitude:", position.coords.latitude);
        console.log("Longitude:", position.coords.longitude);
      },
      (error) => {
        if (error.code === 2) {
          console.log("Lỗi: Không có thông tin vị trí.");
        } else {
          console.log("Error:", error.message);
        }
      }
    );
  }, []);
  return (
    <ErrorBoundary>
      {" "}
      <Suspense fallback={<Loading />}>
        {" "}
        {location.pathname === "/admin/queue" || location.pathname === "/queue" ? (
          <QueueList />
        ) : admin ? (
          <Box display={"flex"} width={"100%"}>
            {" "}
            <Box>
              {" "}
              <Sidebar />{" "}
            </Box>{" "}
            <Box
              maxH={"100vh"}
              overflow={"scroll"}
              w={"100vw"}
              overflowX={"hidden"}
            >
              {" "}
              <Topbar /> <Dashboard />{" "}
            </Box>{" "}
          </Box>
        ) : (
          <Login />
        )}{" "}
        <ReactQueryDevtools initialIsOpen={false} />{" "}
      </Suspense>{" "}
    </ErrorBoundary>
  );
}

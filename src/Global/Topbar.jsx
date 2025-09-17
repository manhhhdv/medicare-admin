import NotificationIcon from "../Components/Notification";
import UpdateAdminPassword from "../Components/UpdatePassword";
import { useSelectedClinic } from "../Context/SelectedClinic";
import admin from "../Controllers/admin";
import imageBaseURL from "../Controllers/image";
import Logout from "../Controllers/logout";
import useHasPermission from "../Hooks/HasPermission";
import UseClinicsData from "../Hooks/UseClinicsData";
import {
  Flex,
  IconButton,
  useColorModeValue,
  Text,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Box,
  Avatar,
  Image,
  useColorMode,
  Divider,
  Input,
  VStack,
  Button,
  useDisclosure,
} from "@chakra-ui/react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

/* eslint-disable react-hooks/rules-of-hooks */
import { AiFillSetting } from "react-icons/ai";
import { FaHospitalUser } from "react-icons/fa";
import { FiLogOut } from "react-icons/fi";
import { FiSun, FiMoon, FiUser } from "react-icons/fi";
import { RiLockPasswordLine } from "react-icons/ri";
import { useLocation, useNavigate } from "react-router-dom";

export default function Topbar() {
  const { colorMode, toggleColorMode } = useColorMode();
  const Uselocation = useLocation();
  const location = Uselocation.pathname.split("/")[1];
  const { isOpen, onOpen, onClose } = useDisclosure();
  const navigate = useNavigate();
  // const { settingsData } = useSettingsData();
  const { hasPermission } = useHasPermission();

  // Vietnamese location mapping
  const locationMapping = {
    "dashboard": "Bảng Điều Khiển",
    "checkins": "Check-in",
    "appointments": "Lịch Hẹn",
    "appointment-status-log": "Nhật Ký Trạng Thái Lịch Hẹn",
    "appointments-calender": "Lịch Hẹn",
    "transactions": "Giao Dịch",
    "payments": "Thanh Toán",
    "invoices": "Hóa Đơn",
    "clinics": "Phòng Khám",
    "doctors": "Bác Sĩ",
    "departments": "Khoa",
    "specialization": "Chuyên Khoa",
    "patients": "Bệnh Nhân",
    "family-members": "Thành Viên Gia Đình",
    "users": "Người Dùng",
    "patient-refer": "Giới Thiệu Bệnh Nhân",
    "prescriptions": "Đơn Thuốc",
    "patient-files": "Hồ Sơ Bệnh Nhân",
    "medicines": "Thuốc",
    "banners": "Banner",
    "coupons": "Phiếu Giảm Giá",
    "doctor-reviews": "Đánh Giá Bác Sĩ",
    "testimonials": "Lời Chứng Thực",
    "contact-us-form": "Biểu Mẫu Liên Hệ",
    "notification": "Thông Báo",
    "login-screen": "Màn Hình Đăng Nhập",
    "roles": "Vai Trò",
    "location-settings": "Cài Đặt Vị Trí",
    "settings": "Cài Đặt"
  };

  const getDisplayLocation = () => {
    if (!location) return "Bảng Điều Khiển";
    return locationMapping[location.toLowerCase()] || location;
  };

  useEffect(() => {
    colorMode === "dark"
      ? document.body.classList.add("dark")
      : document.body.classList.remove("dark");
  }, [colorMode]);

  // // update  user
  // const logo = settingsData?.find((value) => value.id_name === "logo");

  // handle updateMutation

  return (
    <Flex
      as="header"
      align="center"
      justify="space-between"
      px="4"
      py="2"
      bg={useColorModeValue("white", "gray.800")}
      boxShadow="none"
      zIndex="sticky"
      top="0"
      position={"sticky"}
      borderBottom={"1px solid"}
      borderColor={useColorModeValue("gray.200", "gray.600")}
    >
      <Box display={"flex"} alignItems={"center"} gap={5}>
        {" "}
        <Image
            src={"https://i.postimg.cc/vZJkktny/logo-transation.png"}
            boxSize="50px"
          />
        <Text
          fontSize="xl"
          fontWeight="500"
          mb={0}
          textTransform={"capitalize"}
        >
          {getDisplayLocation()}
        </Text>
      </Box>

      <Flex align={"center"}>
        <ClinicSelctor />
        <NotificationIcon />
        <IconButton
          aria-label="Chuyển chế độ sáng/tối"
          icon={colorMode === "light" ? <FiMoon /> : <FiSun />}
          onClick={() => {
            toggleColorMode();
            colorMode === "light"
              ? document.body.classList.add("dark")
              : document.body.classList.remove("dark");
          }}
          variant="ghost"
          colorScheme="black"
        />{" "}
        <Menu>
          <MenuButton
            as={IconButton}
            variant="ghost"
            colorScheme="black"
            icon={<FiUser />}
          />

          <MenuList>
            <Box p={2} w={300}>
              <Flex justify={"center"}>
                <Avatar
                  src={`${imageBaseURL}/${admin.image}`}
                  fallbackSrc={import.meta.env.MODE === "development" ? "/profile.png" : "/admin/profile.png"}
                  w={16}
                />
              </Flex>
              <Text textAlign={"center"} mt={2} fontSize={"lg"}>
                {admin.f_name} {admin.l_name}
              </Text>
              <Text textAlign={"center"} fontSize={"md"} fontWeight={600}>
                {admin.role.name}
              </Text>
            </Box>
            <Divider mb={3} />
            <MenuItem
              onClick={() => {
                admin.role.name.toLowerCase() === "doctor"
                  ? navigate(`/doctor/profile`)
                  : admin.role.name.toLowerCase() === "clinic"
                  ? navigate(`/clinic/self/profile/update/${admin.clinic_id}`)
                  : navigate(`/user/update/${admin.id}`);
              }}
              icon={<FiUser />}
            >
              Tài khoản
            </MenuItem>
            <MenuItem onClick={onOpen} icon={<RiLockPasswordLine />}>
              Đổi mật khẩu
            </MenuItem>
            {hasPermission("SETTING_VIEW") && (
              <MenuItem
                onClick={() => {
                  navigate("/settings");
                }}
                icon={<AiFillSetting />}
              >
                Cài đặt
              </MenuItem>
            )}

            <MenuItem
              icon={<FiLogOut />}
              onClick={() => {
                Logout();
              }}
            >
              Đăng xuất
            </MenuItem>
          </MenuList>
        </Menu>
      </Flex>

      <UpdateAdminPassword isOpen={isOpen} onClose={onClose} />
    </Flex>
  );
}

const ClinicSelctor = () => {
  const [search, setSearch] = useState("");
  const { clinicsData, clinicsError, clinicsLoading } = UseClinicsData();
  const { selectedClinic, setSelectedClinic } = useSelectedClinic();

  const filteredClinics = clinicsData?.filter((clinic) => {
    if (!search) return true;

    const query = search.toLowerCase();
    const searchableFields = [
      clinic.title,
      clinic.address,
      clinic.city_title,
      clinic.state_title,
      clinic.description,
    ];

    return searchableFields.some(
      (field) => field && field.toLowerCase().includes(query)
    );
  });
  useEffect(() => {
    if (admin) {
      if (admin.role.name.toLowerCase() === "clinic") {
        const clinic = clinicsData?.find(
          (clinic) => clinic.id === admin.clinic_id
        );
        setSelectedClinic(clinic);
      } else if (admin.clinic_id) {
        const clinic = clinicsData?.find(
          (clinic) => clinic.id === admin.clinic_id
        );
        setSelectedClinic(clinic);
      } else if (admin.assign_clinic_id) {
        const clinic = clinicsData?.find(
          (clinic) => clinic.id === admin.assign_clinic_id
        );
        setSelectedClinic(clinic);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clinicsData]);

  return (
    <VStack spacing={4} align="start">
      <Menu>
        <Flex align={"center"} gap={2}>
          <Text fontWeight={600}>Phòng khám - </Text>
          <MenuButton
            as={Button}
            leftIcon={<FaHospitalUser />}
            size={"sm"}
            bg={"none"}
            border={"1px solid"}
            borderColor={"gray.300"}
            _hover={{
              bg: "none",
            }}
            _active={{
              bg: "none",
            }}
            isDisabled={
              clinicsError ||
              clinicsLoading ||
              (admin.role.name.toLowerCase() !== "admin" &&
                admin.role.name.toLowerCase() !== "super admin")
            }
            _disabled={{
              cursor: "not-allowed",
            }}
          >
            {clinicsLoading ? (
              <Flex>
                Đang tải
                <motion.span
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
                >
                  .
                </motion.span>
                <motion.span
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
                >
                  .
                </motion.span>
                <motion.span
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ duration: 1, repeat: Infinity, delay: 0.6 }}
                >
                  .
                </motion.span>
              </Flex>
            ) : selectedClinic ? (
              selectedClinic.title
            ) : (
              "Tất cả"
            )}
          </MenuButton>
        </Flex>
        <MenuList
          maxW={"500px"}
          minW={"300px"}
          zIndex={100}
          maxH={"70vh"}
          overflow={"auto"}
        >
          <Box p={2}>
            <Input
              placeholder="Tìm kiếm phòng khám..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              size="md"
            />
          </Box>
          <MenuItem
            onClick={() => {
              setSelectedClinic();
              setSearch("");
            }}
            bg={
              !selectedClinic
                ? useColorModeValue("gray.100", "gray.600")
                : "initial"
            }
            _hover={{
              bg: useColorModeValue("gray.100", "gray.600"),
            }}
          >
            Tất cả
          </MenuItem>
          {filteredClinics?.length > 0 ? (
            filteredClinics?.map((clinic) => (
              <MenuItem
                key={clinic?.id}
                onClick={() => {
                  setSelectedClinic(clinic);
                  setSearch("");
                }}
                bg={
                  selectedClinic?.id === clinic?.id
                    ? useColorModeValue("gray.100", "gray.600")
                    : "initial"
                }
                _hover={{
                  bg: useColorModeValue("gray.100", "gray.600"),
                }}
                fontSize={"md"}
              >
                {clinic.title} - {clinic.city_title}, {clinic.state_title} - #
                {clinic.id}
              </MenuItem>
            ))
          ) : (
            <Box p={2} textAlign="center" color="gray.500">
              Không tìm thấy kết quả
            </Box>
          )}
        </MenuList>
      </Menu>
    </VStack>
  );
};

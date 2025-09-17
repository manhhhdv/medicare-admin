/* eslint-disable react-hooks/rules-of-hooks */
import { ClinicComboBox } from "../../Components/ClinicComboBox";
import ISDCODEMODAL from "../../Components/IsdModal";
import Loading from "../../Components/Loading";
import NotAuth from "../../Components/NotAuth";
import { ADD, GET, UPDATE } from "../../Controllers/ApiControllers";
import {
  default as ShowToast,
  default as showToast,
} from "../../Controllers/ShowToast";
import { walletMinAmount } from "../../Controllers/Wallet";
import admin from "../../Controllers/admin";
import imageBaseURL from "../../Controllers/image";
import todayDate from "../../Controllers/today";
import useHasPermission from "../../Hooks/HasPermission";
import UseClinicsData from "../../Hooks/UseClinicsData";
import FamilyMembersByUser from "../Family-Members/FamilyMembersByUser";
import DeleteAssignRole from "../Roles/DeleteAssignRole";
import Wallet from "../Wallet/Wallet";
import UserAssignRole from "./UserAssignRole";
import VitalsData from "./VitalsData";
import {
  Box,
  Button,
  Card,
  CardBody,
  Divider,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  IconButton,
  Image,
  Input,
  InputGroup,
  InputLeftAddon,
  Select,
  Text,
  Tooltip,
  VStack,
  useColorModeValue,
  useDisclosure,
  useToast,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Badge,
} from "@chakra-ui/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { AiOutlineDown } from "react-icons/ai";
import { FaTrash } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";

export default function UpdateUser() {
  const { id } = useParams();
  const { hasPermission } = useHasPermission();
  if (!hasPermission("USER_UPDATE")) return <NotAuth />;
  return (
    <Box>
      <Tabs>
        <TabList>
          <Tab>Tổng quan</Tab>
          <Tab>Thành viên gia đình</Tab>
          <Tab>Dữ liệu sinh hiệu gia đình</Tab>
          <Tab>Ví</Tab>
        </TabList>

        <TabPanels>
          <TabPanel px={0}>
            <UserDetails />
          </TabPanel>
          <TabPanel px={0}>
            <FamilyMembersByUser userID={id} />
          </TabPanel>
          <TabPanel px={0}>
            <VitalsData />
          </TabPanel>
          <TabPanel px={0}>
            <Wallet userID={id} />
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
}

const handlePasswordChange = async (data) => {
  const res = await UPDATE(admin.token, "update_password", data);
  if (res.response !== 200) {
    throw new Error(res.message);
  }
  return res;
};

function UserDetails() {
  const param = useParams();
  const navigate = useNavigate();
  const [isLoading, setisLoading] = useState();
  const { register, handleSubmit } = useForm();
  const queryClient = useQueryClient();
  const toast = useToast();
  const inputRef = useRef();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [password, setpassword] = useState();
  const { clinicsData } = UseClinicsData();
  const [selectedClinicID, setselectedClinicID] = useState();

  // assignRole
  const {
    isOpen: DeleteisOpen,
    onOpen: DeleteonOpen,
    onClose: DeleteonClose,
  } = useDisclosure();

  const {
    isOpen: AssignisOpen,
    onOpen: AssignonOpen,
    onClose: AssignonClose,
  } = useDisclosure();

  // get doctor details

  const { data: userDetails, isLoading: isUserLoading } = useQuery({
    queryKey: ["user", param.id],
    queryFn: async () => {
      const res = await GET(admin.token, `get_user/${param.id}`);
      setisd_code(res.data.isd_code);
      return res.data;
    },
  });

  const [isd_code, setisd_code] = useState(userDetails?.isd_code || undefined);

  const AddNew = async (data) => {
    if (data.password && data.password != data.cnfPassword) {
      return showToast(toast, "error", "Mật khẩu không khớp");
    }
    let formData = {
      id: param.id,
      isd_code,
      clinic_id: selectedClinicID?.id || userDetails.clinic_id,
      ...data,
    };

    try {
      setisLoading(true);
      const res = await ADD(admin.token, "update_user", formData);
      setisLoading(false);
      if (res.response === 200) {
        ShowToast(toast, "success", "User Updated!");
        queryClient.invalidateQueries(["user", param.id]);
        queryClient.invalidateQueries("users");
      } else {
        ShowToast(toast, "error", res.message);
      }
    } catch (error) {
      setisLoading(false);
      ShowToast(toast, "error", JSON.stringify(error));
    }
  };

  const handleFileUpload = async (image) => {
    try {
      setisLoading(true);
      const res = await ADD(admin.token, "update_user", {
        id: param.id,
        image: image,
      });
      setisLoading(false);
      if (res.response === 200) {
        ShowToast(toast, "success", "User Updated!");
        queryClient.invalidateQueries(["user", param.id]);
        queryClient.invalidateQueries("users");
      } else {
        ShowToast(toast, "error", res.message);
      }
    } catch (error) {
      setisLoading(false);
      ShowToast(toast, "error", JSON.stringify(error));
    }
  };
  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    handleFileUpload(selectedFile);
  };

  const handleFileDelete = async () => {
    try {
      setisLoading(true);
      const res = await ADD(admin.token, "remove_user_image", {
        id: param.id,
      });
      setisLoading(false);
      if (res.response === 200) {
        ShowToast(toast, "success", "Đã xóa ảnh hồ sơ!");
        queryClient.invalidateQueries("doctor", param.id);
      } else {
        ShowToast(toast, "error", res.message);
      }
    } catch (error) {
      setisLoading(false);
      ShowToast(toast, "error", JSON.stringify(error));
    }
  };

  const paswordChngMutate = useMutation({
    mutationFn: async (data) => {
      await handlePasswordChange(data);
    },
    onSuccess: () => {
      setpassword("");
      ShowToast(toast, "success", "Đổi mật khẩu thành công");
    },
    onError: (error) => {
      ShowToast(toast, "error", error.message);
    },
  });

  if (isUserLoading || isLoading) return <Loading />;

  return (
    <Box>
      <Flex justify={"space-between"} alignItems={"center"}>
        <Flex alignItems={"center"} gap={3}>
          {" "}
          <Heading as={"h1"} size={"lg"}>
            {admin.id === param.id ? "Chi tiết Quản trị viên" : "Chi tiết Người dùng"}
          </Heading>{" "}
          <Badge
            p={1}
            px={3}
            fontSize="sm"
            textAlign="center"
            borderRadius={6}
            colorScheme={
              userDetails.wallet_amount < walletMinAmount ? "red" : "green"
            }
            my={2}
          >
            Số dư ví - {userDetails.wallet_amount}
          </Badge>
          <Button
            size={"sm"}
            variant={"outline"}
            ml={5}
            colorScheme={userDetails.role_id ? "red" : "blue"}
            onClick={() => {
              if (userDetails.role_id) {
                DeleteonOpen();
              } else {
                AssignonOpen();
              }
            }}
          >
            {userDetails.role_id
              ? `Xóa vai trò đã gán - ${userDetails?.role_name}`
              : "Gán một vai trò"}
          </Button>
        </Flex>
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

      <Flex gap={10}>
        <Card mt={5} bg={useColorModeValue("white", "gray.700")} w={"70%"}>
          <CardBody p={3} as={"form"} onSubmit={handleSubmit(AddNew)}>
            <Flex gap={10}>
              <FormControl isRequired>
                <FormLabel>Tên</FormLabel>
                <Input
                  placeholder="Nhập tên"
                  {...register("f_name", { required: true })}
                  defaultValue={userDetails.f_name}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Họ</FormLabel>
                <Input
                  placeholder="Nhập họ"
                  {...register("l_name", { required: false })}
                  defaultValue={userDetails.l_name}
                />
              </FormControl>
            </Flex>
            <Flex gap={10} mt={5}>
              <FormControl>
                <FormLabel>Email</FormLabel>
                <Input
                  type="email"
                  placeholder="Nhập email"
                  {...register("email")}
                  defaultValue={userDetails.email}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Số điện thoại</FormLabel>
                <InputGroup>
                  <InputLeftAddon
                    cursor={"pointer"}
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpen();
                    }}
                  >
                    {isd_code || userDetails?.isd_code}{" "}
                    <AiOutlineDown style={{ marginLeft: "10px" }} />
                  </InputLeftAddon>
                  <Input
                    type="tel"
                    placeholder="Nhập số điện thoại"
                    {...register("phone", {
                      required: true,
                      pattern: /^[+]*[(]{0,1}[0-9]{1,3}[)]{0,1}[-\s\\./0-9]*$/g,
                    })}
                    defaultValue={userDetails.phone}
                  />
                </InputGroup>
              </FormControl>
            </Flex>
            <Flex gap={10} mt={5}>
              <FormControl>
                <FormLabel>Ngày sinh</FormLabel>
                <Input
                  max={todayDate()}
                  placeholder="Chọn ngày"
                  size="md"
                  type="date"
                  {...register("dob", { required: false })}
                  defaultValue={userDetails.dob}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Giới tính</FormLabel>
                <Select
                  placeholder="Chọn giới tính"
                  {...register("gender", { required: false })}
                  defaultValue={userDetails.gender}
                >
                  <option value="Female">Nữ</option>{" "}
                  <option value="Male">Nam</option>
                </Select>
              </FormControl>
            </Flex>
            <Flex gap={10} mt={5}>
              <FormControl>
                <FormLabel>Phòng khám</FormLabel>
                <ClinicComboBox
                  data={clinicsData}
                  name={"clinic"}
                  defaultData={userDetails.clinic_id}
                  setState={setselectedClinicID}
                  isDisabled
                />
              </FormControl>
            </Flex>
            <Button
              w={"100%"}
              mt={10}
              type="submit"
              colorScheme="green"
              size={"sm"}
              isLoading={isLoading}
            >
              Cập nhật
            </Button>
            <>
              {" "}
              <Divider py={2} mb={2} />
              <Heading as={"h1"} size={"sm"} mt={5}>
                Cập nhật mật khẩu -
              </Heading>{" "}
              <Flex gap={10} mt={5} align={"flex-end"}>
                <FormControl w={300}>
                  <FormLabel>Mật khẩu mới</FormLabel>
                  <Input
                    value={password}
                    type="password"
                    placeholder="Nhập mật khẩu mới . . ."
                    onChange={(e) => {
                      setpassword(e.target.value);
                    }}
                  />
                </FormControl>
                <Button
                  colorScheme={"blue"}
                  onClick={() => {
                    let user_id = param.id;
                    paswordChngMutate.mutate({
                      user_id,
                      password,
                    });
                  }}
                  isLoading={paswordChngMutate.isPending}
                >
                  Cập nhật mật khẩu
                </Button>
              </Flex>
            </>
          </CardBody>
        </Card>
        <Card
          mt={5}
          bg={useColorModeValue("white", "gray.700")}
          w={"25%"}
          h={"fit-content"}
          pb={10}
        >
          <CardBody p={2}>
            <Text textAlign={"center"}>Ảnh hồ sơ</Text>
            <Divider></Divider>
            <Flex p={2} justify={"center"} mt={5} position={"relative"}>
              <Image
                borderRadius={"50%"}
                h={200}
                objectFit={"cover"}
                w={200}
                src={
                  userDetails?.image
                    ? `${imageBaseURL}/${userDetails?.image}`
                    : "/admin/profilePicturePlaceholder.png"
                }
              />
              {userDetails?.image && (
                <Tooltip label="Xóa" fontSize="md">
                  <IconButton
                    size={"sm"}
                    colorScheme="red"
                    variant={"solid"}
                    position={"absolute"}
                    right={5}
                    icon={<FaTrash />}
                    onClick={() => {
                      handleFileDelete();
                    }}
                  />
                </Tooltip>
              )}
            </Flex>
            <VStack spacing={4} align="stretch" mt={10}>
              <Input
                type="file"
                display="none" // Hide the actual file input
                ref={inputRef}
                onChange={handleFileChange}
                accept=".jpeg, .svg, .png , .jpg"
              />
              <Button
                isDisabled={userDetails?.image !== null}
                size={"sm"}
                onClick={() => {
                  inputRef.current.click();
                }}
                colorScheme="blue"
              >
                Thay đổi ảnh hồ sơ
              </Button>
            </VStack>
          </CardBody>
        </Card>
      </Flex>

      <ISDCODEMODAL
        isOpen={isOpen}
        onClose={onClose}
        setisd_code={setisd_code}
      />

      {DeleteisOpen && (
        <DeleteAssignRole
          isOpen={DeleteisOpen}
          onClose={DeleteonClose}
          data={{
            id: userDetails?.role_assign_id,
            userID: param.id,
            role_name: userDetails?.role_name,
            name: `${userDetails?.f_name} ${userDetails?.l_name}`,
          }}
        />
      )}
      {AssignisOpen && (
        <UserAssignRole
          isOpen={AssignisOpen}
          onClose={AssignonClose}
          userID={param.id}
        />
      )}
    </Box>
  );
}

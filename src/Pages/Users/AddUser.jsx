/* eslint-disable react-hooks/rules-of-hooks */
import { ClinicComboBox } from "../../Components/ClinicComboBox";
import ISDCODEMODAL from "../../Components/IsdModal";
import NotAuth from "../../Components/NotAuth";
import { useSelectedClinic } from "../../Context/SelectedClinic";
import { ADD } from "../../Controllers/ApiControllers";
import {
  default as ShowToast,
  default as showToast,
} from "../../Controllers/ShowToast";
import admin from "../../Controllers/admin";
import todayDate from "../../Controllers/today";
import useHasPermission from "../../Hooks/HasPermission";
import UseClinicsData from "../../Hooks/UseClinicsData";
import useRolesData from "../../Hooks/UserRolesData";
import {
  Box,
  Button,
  Card,
  CardBody,
  CloseButton,
  Divider,
  Flex,
  FormControl,
  FormLabel,
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
} from "@chakra-ui/react";
import { useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { AiOutlineDown } from "react-icons/ai";
import { useNavigate } from "react-router-dom";

export default function AddUser() {
  const navigate = useNavigate();
  const [isLoading, setisLoading] = useState();
  const { register, handleSubmit, reset } = useForm();
  const queryClient = useQueryClient();
  const toast = useToast();
  const [profilePicture, setprofilePicture] = useState(null);
  const [isd_code, setisd_code] = useState("+91");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const inputRef = useRef();
  const { selectedClinic } = useSelectedClinic();
  const { clinicsData } = UseClinicsData();
  const [selectedClinicID, setselectedClinicID] = useState();
  const { Roles, rolesLoading, rolesError } = useRolesData();
  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    setprofilePicture(selectedFile);
  };

  const AddNew = async (data) => {
    if (data.password != data.cnfPassword) {
      return showToast(toast, "error", "Mật khẩu không khớp");
    }

    let formData = {
      image: profilePicture,
      isd_code: isd_code,
      clinic_id: selectedClinicID?.id || "",
      ...data,
    };
    try {
      setisLoading(true);
      const res = await ADD(admin.token, "add_user", formData);
      setisLoading(false);
      if (res.response === 200) {
        ShowToast(toast, "success", "Đã thêm người dùng!");
        queryClient.invalidateQueries("users");
        reset();
        navigate("/users");
      } else {
        ShowToast(toast, "error", res.message);
      }
    } catch (error) {
      setisLoading(false);
      ShowToast(toast, "error", JSON.stringify(error));
    }
  };

  const { hasPermission } = useHasPermission();
  if (!hasPermission("USER_ADD")) return <NotAuth />;

  return (
    <Box>
      <Flex justify={"space-between"} alignItems={"center"}>
        <Text fontSize={20} fontWeight={500}>
          Thêm người dùng
        </Text>
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
              <FormControl>
                <FormLabel>Email</FormLabel>
                <Input
                  w={250}
                  type="email"
                  placeholder="Nhập email"
                  {...register("email")}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Mật khẩu</FormLabel>
                <Input
                  type="password"
                  placeholder="Nhập mật khẩu"
                  {...register("password")}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Xác nhận mật khẩu</FormLabel>
                <Input
                  type="password"
                  placeholder="Nhập lại mật khẩu"
                  {...register("cnfPassword")}
                />
              </FormControl>
            </Flex>
            <Flex gap={10} mt={5}>
              <FormControl isRequired>
                <FormLabel>Tên</FormLabel>
                <Input
                  placeholder="Nhập tên"
                  {...register("f_name", { required: true })}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Họ</FormLabel>
                <Input
                  placeholder="Nhập họ"
                  {...register("l_name", { required: true })}
                />
              </FormControl>
            </Flex>

            <Flex gap={10} mt={5}>
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
                    {isd_code} <AiOutlineDown style={{ marginLeft: "10px" }} />
                  </InputLeftAddon>
                  <Input
                    type="tel"
                    placeholder="Nhập số điện thoại"
                    {...register("phone", {
                      pattern: /^[+]*[(]{0,1}[0-9]{1,3}[)]{0,1}[-\s\\./0-9]*$/g,
                    })}
                  />
                </InputGroup>
              </FormControl>
              <FormControl>
                <FormLabel>Ngày sinh</FormLabel>
                <Input
                  max={todayDate()}
                  placeholder="Chọn ngày"
                  size="md"
                  type="date"
                  {...register("dob")}
                />
              </FormControl>
            </Flex>
            <Flex gap={10} mt={5}>
              <FormControl>
                <FormLabel>Giới tính</FormLabel>
                <Select placeholder="Chọn giới tính" {...register("gender")}>
                  <option value="Female">Nữ</option>{" "}
                  <option value="Male">Nam</option>
                </Select>
              </FormControl>
              <FormControl isRequired={admin.role.name === "Clinic"}>
                <FormLabel>Vai trò</FormLabel>
                <Select
                  placeholder={
                    rolesLoading
                      ? "Đang tải..."
                      : rolesError
                      ? "Không thể tải vai trò"
                      : "Chọn vai trò"
                  }
                  {...register("role_id")}
                >
                  {Roles?.map((role) => (
                    <option key={role.id} value={role.id}>
                      {role.name}
                    </option>
                  ))}
                </Select>
              </FormControl>
            </Flex>
            <Flex gap={10} mt={5}>
              <FormControl isRequired mt={5}>
                <FormLabel>Phòng khám</FormLabel>
                <ClinicComboBox
                  data={clinicsData}
                  name={"clinic"}
                  defaultData={selectedClinic}
                  setState={setselectedClinicID}
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
              Thêm
            </Button>
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
                  profilePicture
                    ? URL.createObjectURL(profilePicture)
                    : "/admin/profilePicturePlaceholder.png"
                }
              />
              {profilePicture && (
                <Tooltip label="Xóa" fontSize="md">
                  <CloseButton
                    colorScheme="red"
                    variant={"solid"}
                    position={"absolute"}
                    right={2}
                    onClick={() => {
                      setprofilePicture(null);
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
                size={"sm"}
                onClick={() => {
                  inputRef.current.click();
                }}
                colorScheme="blue"
              >
                Tải lên ảnh hồ sơ
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
    </Box>
  );
}

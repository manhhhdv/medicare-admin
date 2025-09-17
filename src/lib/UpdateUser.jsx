/* eslint-disable no-undef */

/* eslint-disable react-hooks/rules-of-hooks */
import ISDCODEMODAL from "../../Components/IsdModal";
import Loading from "../../Components/Loading";
import { ADD, GET } from "../../Controllers/ApiControllers";
import {
  default as ShowToast,
  default as showToast,
} from "../../Controllers/ShowToast";
import admin from "../../Controllers/admin";
import imageBaseURL from "../../Controllers/image";
// import { max } from "moment";
import todayDate from "../Controllers/today";
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
  Heading,
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
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { AiOutlineDown } from "react-icons/ai";
import { useNavigate, useParams } from "react-router-dom";

export default function UpdateUser() {
  const param = useParams();
  const navigate = useNavigate();
  const [isLoading, setisLoading] = useState();
  const { register, handleSubmit } = useForm();
  const queryClient = useQueryClient();
  const toast = useToast();
  const inputRef = useRef();
  const [profilePicture, setprofilePicture] = useState();
  const { isOpen, onOpen, onClose } = useDisclosure();
  // get doctor details

  const { data: userDetails, isLoading: isDoctorLoading } = useQuery({
    queryKey: ["user", param.id],
    queryFn: async () => {
      const res = await GET(admin.token, `get_user/${param.id}`);

      setisd_code(res.data.isd_code);
      return res.data;
    },
  });

  const AddNew = async (data) => {
    if (data.password && data.password != data.cnfPassword) {
      return showToast(toast, "error", "Mật khẩu không khớp");
    }
    let formData = {
      id: param.id,

      isd_code,
      ...data,
    };

    try {
      setisLoading(true);
      const res = await ADD(admin.token, "update_user", formData);
      setisLoading(false);
      if (res.response === 200) {
        ShowToast(toast, "success", "Cập nhật người dùng thành công!");
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
        ShowToast(toast, "success", "Cập nhật người dùng thành công!");
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
    const fileUrl = URL.createObjectURL(selectedFile);
    // This will log the URL of the selected file
    setprofilePicture(fileUrl); // Set the created URL to state
    handleFileUpload(selectedFile);
  };

  if (isDoctorLoading || isLoading) return <Loading />;

  return (
    <Box>
      <Flex justify={"space-between"} alignItems={"center"}>
        <Heading as={"h1"} size={"lg"}>
          Thông Tin Bác Sĩ
        </Heading>
        <Button
          w={120}
          size={"sm"}
          variant={useColorModeValue("blackButton", "gray")}
          onClick={() => {
            navigate(-1);
          }}
        >
          Quay Lại
        </Button>
      </Flex>

      <Flex gap={10}>
        <Card mt={5} bg={useColorModeValue("white", "gray.700")} w={"70%"}>
          <CardBody p={3} as={"form"} onSubmit={handleSubmit(AddNew)}>
            <Flex gap={10}>
              <FormControl isRequired>
                <FormLabel>Email</FormLabel>
                <Input
                  w={250}
                  type="email"
                  placeholder="Email"
                  {...register("email", { required: true })}
                  defaultValue={userDetails.email}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Mật Khẩu</FormLabel>
                <Input
                  type="password"
                  placeholder="Nhập mật khẩu"
                  {...register("password", { required: true })}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Nhập Lại Mật Khẩu</FormLabel>
                <Input
                  type="password"
                  placeholder="Nhập lại mật khẩu"
                  {...register("cnfPassword", { required: true })}
                />
              </FormControl>
            </Flex>
            <Flex gap={10} mt={5}>
              <FormControl isRequired>
                <FormLabel>Họ</FormLabel>
                <Input
                  placeholder="Họ"
                  {...register("f_name", { required: true })}
                  defaultValue={userDetails.f_name}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Tên</FormLabel>
                <Input
                  placeholder="Tên"
                  {...register("l_name", { required: true })}
                  defaultValue={userDetails.l_name}
                />
              </FormControl>
            </Flex>

            <Flex gap={10} mt={5}>
              <FormControl isRequired>
                <FormLabel>Số Điện Thoại</FormLabel>
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
                    placeholder="Số Điện Thoại"
                    {...register("phone", {
                      required: true,
                      pattern: /^[+]*[(]{0,1}[0-9]{1,3}[)]{0,1}[-\s\\./0-9]*$/g,
                    })}
                    defaultValue={userDetails.phone}
                  />
                </InputGroup>
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Ngày Sinh (MM/DD/YYYY)</FormLabel>
                <Input
                  max={todayDate()}
                  placeholder="Chọn Ngày"
                  size="md"
                  type="date"
                  {...register("dob", { required: true })}
                  defaultValue={userDetails.dob}
                />
              </FormControl>
              <FormControl>
                <FormLabel>Giới Tính</FormLabel>
                <Select
                  placeholder="Chọn Giới Tính"
                  {...register("gender")}
                  defaultValue={userDetails.gender}
                >
                  <option value="Female">Nữ</option>{" "}
                  <option value="Male">Nam</option>
                </Select>
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
              Cập Nhật
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
            <Text textAlign={"center"}>Ảnh Đại Diện</Text>
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
                Đổi Ảnh Đại Diện
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

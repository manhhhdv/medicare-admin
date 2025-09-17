import { ADD } from "../../Controllers/ApiControllers";
import {
  default as ShowToast,
  default as showToast,
} from "../../Controllers/ShowToast";
import admin from "../../Controllers/admin";
import useLocationData from "../../Hooks/UseLocationData";
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
  Select,
  Text,
  Tooltip,
  VStack,
  useColorModeValue,
  useToast,
} from "@chakra-ui/react";
import { useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

export default function AddClinic() {
  const navigate = useNavigate();
  const [isLoading, setisLoading] = useState();
  const { register, handleSubmit, reset } = useForm();
  const queryClient = useQueryClient();
  const toast = useToast();
  const [profilePicture, setprofilePicture] = useState(null);

  const { cities } = useLocationData();

  const inputRef = useRef();

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
      ...data,
    };

    console.log(formData);

    try {
      setisLoading(true);
      const res = await ADD(admin.token, "add_clinic", formData);
      setisLoading(false);
      if (res.response === 200) {
        ShowToast(toast, "success", "Đã thêm phòng khám!");
        queryClient.invalidateQueries("clinics");
        reset();
        navigate(`/clinic/update/${res.id}`);
      } else {
        console.log(res);
        ShowToast(toast, "error", `${res.message} - ${res.response}`);
      }
    } catch (error) {
      console.log(error);
      setisLoading(false);
      ShowToast(toast, "error", JSON.stringify(error));
    }
  };

  return (
    <Box>
      <Flex justify={"space-between"} alignItems={"center"}>
        <Text fontSize={20} fontWeight={500}>
          Thêm phòng khám
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
        <Box w={"70%"} as={"form"} onSubmit={handleSubmit(AddNew)}>
          {" "}
          <Card mt={5} bg={useColorModeValue("white", "gray.700")}>
            <CardBody p={3}>
              <Heading size={"md"} fontWeight={"md"}>
                Thông tin cơ bản -{" "}
              </Heading>
              <Divider my={3} />
              <Flex gap={10}>
                <FormControl isRequired>
                  <FormLabel>Tên</FormLabel>
                  <Input
                    type="text"
                    placeholder="Tên phòng khám"
                    {...register("title", { required: true })}
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Thành phố</FormLabel>
                  <Select
                    placeholder="Chọn thành phố"
                    isRequired
                    {...register("city_id", { required: true })}
                  >
                    {cities?.map((city) => (
                      <option key={city.id} value={city.id}>
                        {city.title}
                      </option>
                    ))}
                  </Select>
                </FormControl>
              </Flex>
            </CardBody>
          </Card>{" "}
          <Card mt={5} bg={useColorModeValue("white", "gray.700")}>
            <CardBody p={3}>
              <Heading size={"md"} fontWeight={"md"}>
                Chi tiết quản trị phòng khám -{" "}
              </Heading>
              <Divider my={3} />

              <Flex gap={10}>
                <FormControl isRequired>
                  <FormLabel>Email</FormLabel>
                  <Input
                    w={300}
                    type="email"
                    placeholder="Email"
                    {...register("email", { required: true })}
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Mật khẩu</FormLabel>
                  <Input
                    type="password"
                    placeholder="Mật khẩu"
                    {...register("password", { required: true })}
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Xác nhận mật khẩu</FormLabel>
                  <Input
                    type="text"
                    placeholder="Mật khẩu"
                    {...register("cnfPassword", { required: true })}
                  />
                </FormControl>
              </Flex>
              <Flex gap={10} mt={5}>
                <FormControl isRequired>
                  <FormLabel>Tên</FormLabel>
                  <Input
                    placeholder="Tên"
                    {...register("f_name", { required: true })}
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Họ</FormLabel>
                  <Input
                    placeholder="Họ"
                    {...register("l_name", { required: true })}
                  />
                </FormControl>
              </Flex>
            </CardBody>
          </Card>{" "}
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
        </Box>
        <Card
          mt={5}
          bg={useColorModeValue("white", "gray.700")}
          w={"25%"}
          h={"fit-content"}
          pb={10}
        >
          <CardBody p={2}>
            <Text textAlign={"center"}>Hình ảnh / Ảnh thu nhỏ</Text>
            <Divider></Divider>
            <Flex p={2} justify={"center"} mt={5} position={"relative"}>
              <Image
                h={200}
                objectFit={"cover"}
                w={200}
                src={
                  profilePicture
                    ? URL.createObjectURL(profilePicture)
                    : "/admin/imagePlaceholder.png"
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
                Tải lên ảnh đại diện
              </Button>
            </VStack>
          </CardBody>
        </Card>
      </Flex>
    </Box>
  );
}

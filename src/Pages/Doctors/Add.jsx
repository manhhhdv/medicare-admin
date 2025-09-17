import { ClinicComboBox } from "../../Components/ClinicComboBox";
import { ComboboxDemo } from "../../Components/ComboBox";
import ISDCODEMODAL from "../../Components/IsdModal";
import { MultiTagInput } from "../../Components/MultiTaginput";
import { ADD, GET } from "../../Controllers/ApiControllers";
import {
  default as ShowToast,
  default as showToast,
} from "../../Controllers/ShowToast";
import admin from "../../Controllers/admin";
import todayDate from "../../Controllers/today";
import UseClinicsData from "../../Hooks/UseClinicsData";
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
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { AiOutlineDown } from "react-icons/ai";
import { useNavigate } from "react-router-dom";

export default function AddDoctor() {
  const navigate = useNavigate();
  const [isLoading, setisLoading] = useState();
  const { register, handleSubmit, reset } = useForm();
  const queryClient = useQueryClient();
  const toast = useToast();
  const [profilePicture, setprofilePicture] = useState(null);
  const [departmentID, setdepartmentID] = useState();
  const [specializationID, setspecializationID] = useState([]);
  const [isd_code, setisd_code] = useState("+91");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { clinicsData } = UseClinicsData();
  const [selectedClinic, setselectedClinic] = useState();

  const inputRef = useRef();

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    setprofilePicture(selectedFile);
  };

  const AddNew = async (data) => {
    if (data.password != data.cnfPassword) {
      return showToast(toast, "error", "Mật khẩu không khớp");
    }

    if (!departmentID) {
      return showToast(toast, "error", "Chọn khoa");
    }

    if (!specializationID) {
      return showToast(toast, "error", "Chọn chuyên khoa");
    }
    if (!selectedClinic) {
      return showToast(toast, "error", "Chọn phòng khám");
    }

    let formData = {
      isd_code: isd_code,
      image: profilePicture,
      department: departmentID,
      specialization: specializationID.join(", "),
      active: 0,
      clinic_id: selectedClinic.id,
      ...data,
    };
    console.log(formData);
    try {
      setisLoading(true);
      const res = await ADD(admin.token, "add_doctor", formData);
      setisLoading(false);
      if (res.response === 200) {
        ShowToast(toast, "success", "Đã thêm bác sĩ!");
        queryClient.invalidateQueries("doctors");
        reset();
        navigate(`/doctor/update/${res.id}`);
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
  const getDepartmentList = async () => {
    const res = await GET(admin.token, "get_department_active");
    return res.data;
  };

  const { data: departmentList } = useQuery({
    queryKey: ["department-active"],
    queryFn: getDepartmentList,
  });

  const getSpclizeList = async () => {
    const res = await GET(admin.token, "get_specialization");
    return res.data;
  };

  const { data: specializationList } = useQuery({
    queryKey: ["specialization"],
    queryFn: getSpclizeList,
  });

  return (
    <Box>
      <Flex justify={"space-between"} alignItems={"center"}>
        <Text fontSize={20} fontWeight={500}>
          Thêm bác sĩ
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
              <FormControl isRequired>
                <FormLabel>Email</FormLabel>
                <Input
                  w={250}
                  type="email"
                  placeholder="Email"
                  {...register("email", { required: true })}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Mật khẩu</FormLabel>
                <Input
                  type="password"
                  placeholder="Nhập mật khẩu"
                  {...register("password", { required: true })}
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Xác nhận mật khẩu</FormLabel>
                <Input
                  type="password"
                  placeholder="Nhập lại mật khẩu"
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

            <Flex gap={10} mt={5}>
              <FormControl isRequired>
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
                    placeholder="Số điện thoại"
                    {...register("phone", {
                      required: true,
                      pattern: /^[+]*[(]{0,1}[0-9]{1,3}[)]{0,1}[-\s\\./0-9]*$/g,
                    })}
                  />
                </InputGroup>
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Ngày sinh</FormLabel>
                <Input
                  max={todayDate()}
                  placeholder="Chọn ngày"
                  size="md"
                  type="date"
                  {...register("dob", { required: true })}
                />
              </FormControl>
            </Flex>

            <Flex gap={10} mt={5}>
              <FormControl isRequired>
                <FormLabel>Giới tính</FormLabel>
                <Select
                  placeholder="Chọn giới tính"
                  {...register("gender", { required: true })}
                >
                  <option value="Female">Nữ</option>{" "}
                  <option value="Male">Nam</option>
                </Select>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Số năm kinh nghiệm</FormLabel>
                <Input
                  type="number"
                  placeholder="Số năm kinh nghiệm"
                  {...register("ex_year", { required: true })}
                />
              </FormControl>
            </Flex>

            <Flex gap={10} mt={5}>
              <FormControl isRequired>
                <FormLabel>Khoa</FormLabel>
                <ComboboxDemo
                  name={"Khoa"}
                  data={departmentList}
                  setState={setdepartmentID}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Chuyên khoa</FormLabel>
                <MultiTagInput
                  data={specializationList}
                  setState={setspecializationID}
                  name={"Chuyên khoa"}
                />
              </FormControl>
            </Flex>
            <FormControl mt={5}>
              <FormLabel>Phòng khám</FormLabel>
              <ClinicComboBox
                data={clinicsData}
                setState={setselectedClinic}
                name={"Phòng khám"}
              />
            </FormControl>

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
            <Text textAlign={"center"}>Ảnh đại diện</Text>
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
                Tải lên ảnh đại diện
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

/* eslint-disable react-hooks/rules-of-hooks */
import ISDCODEMODAL from "../../Components/IsdModal";
import Loading from "../../Components/Loading";
import NotAuth from "../../Components/NotAuth";
import { ADD, GET } from "../../Controllers/ApiControllers";
import showToast from "../../Controllers/ShowToast";
import ShowToast from "../../Controllers/ShowToast";
import admin from "../../Controllers/admin";
import imageBaseURL from "../../Controllers/image";
import todayDate from "../../Controllers/today";
import useHasPermission from "../../Hooks/HasPermission";
import AppointmentsByPatientID from "../Appointments/AppointmentsByPatientID";
import PrescriptionByPatientID from "../Prescriptions/PrescriptionByPatientID";
import PatientFiles from "./PatientFiles";
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
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Textarea,
  Tooltip,
  useColorModeValue,
  useDisclosure,
  useToast,
  VStack,
} from "@chakra-ui/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { FaTrash } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";

export default function UpdatePatient() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setisLoading] = useState();
  const { register, handleSubmit } = useForm();
  const queryClient = useQueryClient();
  const toast = useToast();
  const [isd_code, setisd_code] = useState();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const inputRef = useRef();
  const { hasPermission } = useHasPermission();

  const getPatient = async () => {
    const res = await GET(admin.token, `get_patients/${id}`);
    setisd_code(res.data.isd_code);
    return res.data;
  };

  const { data: patientDetails, isLoading: patientLoading } = useQuery({
    queryKey: ["patient", id],
    queryFn: getPatient,
  });

  const AddNew = async (data) => {
    let formData = {
      id: id,
      isd_code,
      ...data,
    };

    try {
      setisLoading(true);
      const res = await ADD(admin.token, "update_patient", formData);
      setisLoading(false);
      if (res.response === 200) {
        showToast(toast, "success", "Đã cập nhật bệnh nhân!");
        queryClient.invalidateQueries(["patient", id]);
        queryClient.invalidateQueries(["patients"]);
      } else {
        showToast(toast, "error", res.message);
      }
    } catch (error) {
      setisLoading(false);
      showToast(toast, "error", JSON.stringify(error));
    }
  };

  const handleFileUpload = async (image) => {
    try {
      setisLoading(true);
      const res = await ADD(admin.token, "update_patient", {
        id: id,
        image: image,
      });
      setisLoading(false);
      if (res.response === 200) {
        showToast(toast, "success", "Đã cập nhật bệnh nhân!");
        queryClient.invalidateQueries(["patient", id]);
        queryClient.invalidateQueries(["patients"]);
      } else {
        ShowToast(toast, "error", res.message);
      }
    } catch (error) {
      setisLoading(false);
      ShowToast(toast, "error", JSON.stringify(error));
    }
  };

  //   handle file upload
  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];
    handleFileUpload(selectedFile);
  };

  const handleFileDelete = async () => {
    try {
      setisLoading(true);
      const res = await ADD(admin.token, "remove_patient_image", {
        id: id,
      });
      setisLoading(false);
      if (res.response === 200) {
        ShowToast(toast, "success", "Đã xóa ảnh!");
        queryClient.invalidateQueries("patient", id);
      } else {
        ShowToast(toast, "error", res.message);
      }
    } catch (error) {
      setisLoading(false);
      ShowToast(toast, "error", JSON.stringify(error));
    }
  };

  if (patientLoading || isLoading) return <Loading />;
  if (!hasPermission("PATIENT_UPDATE")) return <NotAuth />;

  return (
    <Box>
      <Flex justify={"space-between"} alignItems={"center"}>
        <Heading as={"h1"} size={"lg"}>
          Patients Details
        </Heading>
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
      <Divider mb={2} mt={3} />
      <Tabs>
        <TabList>
          <Tab>Tổng quan</Tab>
          <Tab>Tệp bệnh nhân</Tab>
          <Tab>Lịch hẹn</Tab>
          <Tab>Đơn thuốc</Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            <Flex gap={10} mt={2} as={"form"} onSubmit={handleSubmit(AddNew)}>
              <Box w={"60%"}>
                {" "}
                <Card mt={5} bg={useColorModeValue("white", "gray.700")}>
                  <CardBody p={3} as={"form"}>
                    <Flex align={"center"} justify={"space-between"}>
                      {" "}
                      <Heading as={"h3"} size={"sm"}>
                        Thông tin cơ bản -{" "}
                      </Heading>{" "}
                    </Flex>

                    <Divider mt={2} mb={5} />

                    <Flex gap={10} mt={5} align={"flex-end"}>
                      <FormControl isRequired>
                        <FormLabel>Tên</FormLabel>
                        <Input
                          size={"sm"}
                          borderRadius={6}
                          placeholder="Tên"
                          {...register("f_name", { required: true })}
                          defaultValue={patientDetails?.f_name}
                        />
                      </FormControl>

                      <FormControl isRequired>
                        <FormLabel>Họ</FormLabel>
                        <Input
                          size={"sm"}
                          borderRadius={6}
                          placeholder="Họ"
                          {...register("l_name", { required: true })}
                          defaultValue={patientDetails?.l_name}
                        />
                      </FormControl>
                    </Flex>

                    <Flex gap={10} mt={5}>
                      <FormControl isRequired>
                        <FormLabel>Ngày sinh</FormLabel>
                        <Input
                          max={todayDate()}
                          size={"sm"}
                          borderRadius={6}
                          placeholder="Chọn ngày"
                          type="date"
                          {...register("dob", { required: true })}
                          defaultValue={patientDetails?.dob}
                        />
                      </FormControl>
                      <FormControl>
                        <FormLabel>Giới tính</FormLabel>
                        <Select
                          size={"sm"}
                          borderRadius={6}
                          placeholder="Chọn giới tính"
                          {...register("gender")}
                          defaultValue={patientDetails?.gender}
                        >
                          <option value="Female">Nữ</option>{" "}
                          <option value="Male">Nam</option>
                        </Select>
                      </FormControl>
                    </Flex>
                    <Flex gap={10} mt={5}>
                      <FormControl>
                        <FormLabel>Ghi chú</FormLabel>
                        <Textarea
                          placeholder="Ghi chú"
                          size="sm"
                          resize={"vertical"}
                          {...register("notes")}
                          defaultValue={patientDetails?.notes}
                        />
                      </FormControl>
                    </Flex>
                  </CardBody>
                </Card>
                <Card mt={5} bg={useColorModeValue("white", "gray.700")}>
                  <CardBody p={3} as={"form"}>
                    <Flex align={"center"} justify={"space-between"}>
                      {" "}
                      <Heading as={"h3"} size={"sm"}>
                        Thông tin liên hệ -
                      </Heading>{" "}
                    </Flex>

                    <Divider mt={2} mb={5} />

                    <Flex gap={10} mt={5}>
                      <FormControl>
                        <FormLabel>Email</FormLabel>
                        <Input
                          size={"sm"}
                          borderRadius={6}
                          type="email"
                          placeholder="Email"
                          {...register("email")}
                          defaultValue={patientDetails?.email}
                        />
                      </FormControl>
                      <FormControl mt={0} isRequired>
                        <FormLabel>Số điện thoại</FormLabel>
                        <InputGroup size={"sm"}>
                          <InputLeftAddon
                            cursor={"pointer"}
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpen();
                            }}
                          >
                            {isd_code}
                          </InputLeftAddon>
                          <Input
                            borderRadius={6}
                            placeholder="Nhập số điện thoại"
                            type="Tel"
                            fontSize={16}
                            {...register("phone", { required: true })}
                            defaultValue={patientDetails?.phone}
                          />
                        </InputGroup>
                      </FormControl>
                    </Flex>
                  </CardBody>
                </Card>
                <Card mt={5} bg={useColorModeValue("white", "gray.700")}>
                  <CardBody p={3} as={"form"}>
                    <Flex align={"center"} justify={"space-between"}>
                      {" "}
                      <Heading as={"h3"} size={"sm"}>
                        Địa chỉ -{" "}
                      </Heading>{" "}
                    </Flex>

                    <Divider mt={2} mb={5} />
                    <Flex gap={10}>
                      <FormControl>
                        <FormLabel>Tỉnh/Thành phố</FormLabel>
                        <Input
                          size={"sm"}
                          borderRadius={6}
                          type="email"
                          placeholder="Tỉnh/Thành phố"
                          {...register("state")}
                          defaultValue={patientDetails?.state}
                        />
                      </FormControl>

                      <FormControl>
                        <FormLabel>Thành phố</FormLabel>
                        <Input
                          size={"sm"}
                          borderRadius={6}
                          type="text"
                          placeholder="Thành phố"
                          {...register("city")}
                          defaultValue={patientDetails.city}
                        />
                      </FormControl>
                      <FormControl>
                        <FormLabel>Mã bưu điện</FormLabel>
                        <Input
                          size={"sm"}
                          borderRadius={6}
                          type="number"
                          placeholder="Mã bưu điện"
                          {...register("postal_code")}
                          defaultValue={patientDetails.postal_code}
                        />
                      </FormControl>
                    </Flex>

                    <Flex gap={10} mt={5}>
                      <FormControl>
                        <FormLabel>Địa chỉ</FormLabel>
                        <Textarea
                          placeholder="Địa chỉ"
                          size="sm"
                          resize={"vertical"}
                          {...register("address")}
                          defaultValue={patientDetails?.address}
                        />
                      </FormControl>
                    </Flex>
                  </CardBody>
                </Card>
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
              </Box>

              <Box w={"35%"}>
                <Card
                  mt={5}
                  bg={useColorModeValue("white", "gray.700")}
                  h={"fit-content"}
                  pb={5}
                >
                  <CardBody p={2}>
                    <Heading as={"h3"} size={"sm"} textAlign="center">
                      Ảnh hồ sơ
                    </Heading>
                    <Divider mt={2} />
                    <Flex p={2} justify={"center"} mt={5} position={"relative"}>
                      <Image
                        borderRadius={"50%"}
                        h={150}
                        objectFit={"cover"}
                        w={150}
                        src={
                          patientDetails?.image
                            ? `${imageBaseURL}/${patientDetails?.image}` // Use profilePicture
                            : "/admin/profilePicturePlaceholder.png" // Fallback placeholder image
                        }
                      />
                      {patientDetails?.image && (
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
                        size={"sm"}
                        borderRadius={6}
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

                <Card
                  mt={5}
                  bg={useColorModeValue("white", "gray.700")}
                  h={"fit-content"}
                  pb={5}
                >
                  <CardBody p={2}>
                    <PatientFiles id={id} />
                  </CardBody>
                </Card>
              </Box>
            </Flex>
          </TabPanel>
          <TabPanel>
            <Box maxW={500}>
              {" "}
              <PatientFiles id={id} />
            </Box>
          </TabPanel>
          <TabPanel>
            <AppointmentsByPatientID patientID={id} />
          </TabPanel>
          <TabPanel>
            <PrescriptionByPatientID patientID={id} queryActive={true} />
          </TabPanel>
        </TabPanels>
      </Tabs>

      <ISDCODEMODAL
        isOpen={isOpen}
        onClose={onClose}
        setisd_code={setisd_code}
      />
    </Box>
  );
}

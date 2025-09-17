/* eslint-disable react-hooks/rules-of-hooks */
import { ComboboxDemo } from "../../Components/ComboBox";
import TimeSlotes from "../../Components/DoctorTimeSlotes/TimeSlotes";
import ISDCODEMODAL from "../../Components/IsdModal";
import Loading from "../../Components/Loading";
import { MultiTagInput } from "../../Components/MultiTaginput";
import VideoTimeSlotes from "../../Components/VideoTimeSlotes/TimeSlotes";
import { ADD, GET, UPDATE } from "../../Controllers/ApiControllers";
import {
  default as ShowToast,
  default as showToast,
} from "../../Controllers/ShowToast";
import admin from "../../Controllers/admin";
import imageBaseURL from "../../Controllers/image";
import todayDate from "../../Controllers/today";
import useHasPermission from "../../Hooks/HasPermission";
import RatingStars from "../../Hooks/ShowRating";
import DoctAppointments from "./DoctAppoinrtments";
import Review from "./Review";

/* eslint-disable react/prop-types */
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
  InputLeftElement,
  InputRightElement,
  Select,
  Switch,
  Text,
  Textarea,
  Tooltip,
  VStack,
  theme,
  useColorModeValue,
  useDisclosure,
  useToast,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
} from "@chakra-ui/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { AiFillYoutube } from "react-icons/ai";
import { AiOutlineTwitter } from "react-icons/ai";
import { BiLinkExternal } from "react-icons/bi";
import { BsInstagram } from "react-icons/bs";
import { CgFacebook } from "react-icons/cg";
import { FaChevronDown, FaTrash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const getSpclizeList = async () => {
  const res = await GET(admin.token, "get_specialization");
  return res.data;
};
const getDepartmentList = async () => {
  const res = await GET(admin.token, "get_department");
  return res.data;
};

export default function DoctorProfile() {
  const param = {
    id: admin.id,
  };
  const { data: doctorDetails, isLoading: isDoctorLoading } = useQuery({
    queryKey: ["doctor", param.id],
    queryFn: async () => {
      const res = await GET(admin.token, `get_doctor/${param.id}`);
      return res.data;
    },
  });

  const navigate = useNavigate();
  const [isLoading, setisLoading] = useState();
  const { register, handleSubmit, setValue } = useForm();
  const queryClient = useQueryClient();
  const toast = useToast();
  const [departmentID, setdepartmentID] = useState(doctorDetails?.department);
  const [specializationID, setspecializationID] = useState(
    doctorDetails?.specialization
  );
  const inputRef = useRef();
  const [isd_code, setisd_code] = useState(doctorDetails?.isd_code);
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    setdepartmentID(doctorDetails?.department);
    setspecializationID(doctorDetails?.specialization);
  }, [doctorDetails]);

  // get doctor details

  const AddNew = async (data) => {
    if (data.password && data.password != data.cnfPassword) {
      return showToast(toast, "error", "Mật khẩu không khớp");
    }

    if (!departmentID) {
      return showToast(toast, "error", "Vui lòng chọn khoa");
    }

    if (!specializationID) {
      return showToast(toast, "error", "Vui lòng chọn chuyên khoa");
    }

    let formData = {
      id: param.id,
      department: departmentID,
      specialization: Array.isArray(specializationID)
        ? specializationID.join(", ")
        : specializationID || "",
      isd_code_sec: isd_code,
      isd_code,
      ...data,
    };
    console.log(data);

    try {
      setisLoading(true);
      const res = await ADD(admin.token, "update_doctor", formData);
      setisLoading(false);
      if (res.response === 200) {
        ShowToast(toast, "success", "Hồ sơ đã được cập nhật!");
        queryClient.invalidateQueries(["doctor", param.id]);
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
      const res = await ADD(admin.token, "update_doctor", {
        id: param.id,
        image: image,
      });
      setisLoading(false);
      if (res.response === 200) {
        ShowToast(toast, "success", "Hồ sơ đã được cập nhật!");
        queryClient.invalidateQueries("doctor", param.id);
      } else {
        ShowToast(toast, "error", res.message);
      }
    } catch (error) {
      setisLoading(false);
      ShowToast(toast, "error", JSON.stringify(error));
    }
  };
  const handleFileDelete = async () => {
    try {
      setisLoading(true);
      const res = await ADD(admin.token, "remove_doctor_image", {
        id: param.id,
      });
      setisLoading(false);
      if (res.response === 200) {
        ShowToast(toast, "success", "Đã xóa ảnh!");
        queryClient.invalidateQueries("doctor", param.id);
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

  const { data: departmentList } = useQuery({
    queryKey: ["department"],
    queryFn: getDepartmentList,
  });

  const { data: specializationList } = useQuery({
    queryKey: ["specialization"],
    queryFn: getSpclizeList,
  });

  if (isDoctorLoading || isLoading) return <Loading />;

  return (
    <Box>
      <Flex justify={"space-between"} alignItems={"center"}>
        <Heading as={"h1"} size={"lg"}>
          Doctor Profile #{param.id}
        </Heading>
        <Button
          w={120}
          size={"sm"}
          variant={useColorModeValue("blackButton", "gray")}
          onClick={() => {
            navigate(-1);
          }}
        >
          Back
        </Button>
      </Flex>

      <Tabs mt={5}>
        <TabList>
          <Tab>Thông tin bác sĩ</Tab>
          <Tab>Khung giờ làm việc</Tab>
          <Tab>Đánh giá</Tab>
          <Tab>Lịch hẹn</Tab>
        </TabList>

        <TabPanels>
          <TabPanel p={0}>
            <Flex gap={10} mt={2} as={"form"} onSubmit={handleSubmit(AddNew)}>
              <Box w={"75%"}>
                <Card mt={5} bg={useColorModeValue("white", "gray.700")}>
                  <CardBody p={3} as={"form"}>
                    <Flex align={"center"} justify={"space-between"}>
                      {" "}
                      <Heading as={"h3"} size={"sm"}>
                        Thông tin cơ bản -{" "}
                      </Heading>{" "}
                      <Flex gap={2}>
                        <Flex display={"flex"} align={"center"} gap={1}>
                          {" "}
                          <RatingStars
                            rating={doctorDetails?.average_rating}
                          />{" "}
                          <Text fontSize={"sm"} color={"gray.500"}>
                            PNG, JPG, GIF tối đa 10MB
                          </Text> ( {doctorDetails?.number_of_reviews}) ,
                        </Flex>
                        <Text fontSize={"sm"} fontWeight={600}>
                          {" "}
                          {doctorDetails?.total_appointment_done} Appointments
                          Done
                        </Text>
                      </Flex>
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
                          defaultValue={doctorDetails?.f_name}
                        />
                      </FormControl>

                      <FormControl isRequired>
                        <FormLabel>Họ</FormLabel>
                        <Input
                          size={"sm"}
                          borderRadius={6}
                          placeholder="Họ"
                          {...register("l_name", { required: true })}
                          defaultValue={doctorDetails?.l_name}
                        />
                      </FormControl>
                      <FormControl>
                        <FormControl
                          display="flex"
                          alignItems="center"
                          mb={2}
                          gap={3}
                        >
                          <FormLabel
                            htmlFor="email-alerts"
                            mb="0"
                            fontSize={"sm"}
                          >
                            Bác sĩ hoạt động ?
                          </FormLabel>
                          <Box>
                            {" "}
                            <IsActiveSwitch
                              id={param.id}
                              isActive={doctorDetails?.active}
                            />
                          </Box>
                        </FormControl>{" "}
                        <FormControl
                          display="flex"
                          alignItems="center"
                          mb={2}
                          gap={3}
                        >
                          <FormLabel
                            htmlFor="email-alerts"
                            mb="0"
                            fontSize={"sm"}
                          >
                            Dừng đặt lịch ?
                          </FormLabel>
                          <Box>
                            {" "}
                            <StopBooking
                              id={param.id}
                              isStop_booking={doctorDetails?.stop_booking}
                            />
                          </Box>
                        </FormControl>
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
                          defaultValue={doctorDetails?.dob}
                        />
                      </FormControl>
                      <FormControl isRequired>
                        <FormLabel>Giới tính</FormLabel>
                        <Select
                          size={"sm"}
                          borderRadius={6}
                          placeholder="Chọn giới tính"
                          {...register("gender", { required: true })}
                          defaultValue={doctorDetails?.gender}
                        >
                          <option value="Female">Nữ</option>{" "}
                          <option value="Male">Nam</option>
                        </Select>
                      </FormControl>

                      <FormControl isRequired>
                        <FormLabel>Số năm kinh nghiệm</FormLabel>
                        <Input
                          size={"sm"}
                          borderRadius={6}
                          type="number"
                          placeholder="Số năm kinh nghiệm"
                          {...register("ex_year", { required: true })}
                          defaultValue={doctorDetails?.ex_year}
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
                        Thông tin liên hệ -{" "}
                      </Heading>{" "}
                    </Flex>

                    <Divider mt={2} mb={5} />

                    <Flex gap={10} mt={5}>
                      <FormControl isRequired>
                        <FormLabel>Email</FormLabel>
                        <Input
                          size={"sm"}
                          borderRadius={6}
                          type="email"
                          placeholder="Email"
                          {...register("email", { required: true })}
                          defaultValue={doctorDetails?.email}
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
                            {isd_code || doctorDetails?.isd_code}{" "}
                            <FaChevronDown style={{ marginLeft: "5px" }} />
                          </InputLeftAddon>
                          <Input
                            borderRadius={6}
                            placeholder="Số điện thoại"
                            type="tel"
                            fontSize={16}
                            {...register("phone", { required: true })}
                            defaultValue={doctorDetails.phone}
                          />
                        </InputGroup>
                      </FormControl>
                      <FormControl mt={0}>
                        <FormLabel>Số điện thoại phụ</FormLabel>
                        <InputGroup size={"sm"}>
                          <InputLeftAddon
                            cursor={"pointer"}
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpen();
                            }}
                          >
                            {isd_code || doctorDetails?.isd_code}{" "}
                            <FaChevronDown style={{ marginLeft: "5px" }} />
                          </InputLeftAddon>
                          <Input
                            borderRadius={6}
                            placeholder="Số điện thoại phụ"
                            type="tel"
                            fontSize={16}
                            {...register("phone_sec")}
                            defaultValue={doctorDetails.phone_sec}
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
                        Học vấn và các chi tiết khác -{" "}
                      </Heading>{" "}
                    </Flex>

                    <Divider mt={2} mb={5} />

                    <Flex gap={10} mt={5}>
                      <FormControl isRequired>
                        <FormLabel>Khoa</FormLabel>
                        <ComboboxDemo
                          name={"Khoa"}
                          data={departmentList}
                          setState={setdepartmentID}
                          defaultId={doctorDetails?.department}
                        />
                      </FormControl>

                      <FormControl isRequired size={"sm"}>
                        <FormLabel>Chuyên khoa</FormLabel>
                        <MultiTagInput
                          data={specializationList}
                          setState={setspecializationID}
                          name={"Chuyên khoa"}
                          defaultSelected={doctorDetails?.specialization.split(
                            ", "
                          )}
                        />
                      </FormControl>
                    </Flex>

                    <Flex gap={10} mt={5}>
                      <FormControl>
                        <FormLabel>Mô tả</FormLabel>
                        <Textarea
                          height="200px"
                          placeholder="Mô tả"
                          size="sm"
                          resize={"vertical"}
                          {...register("description")}
                          defaultValue={doctorDetails?.description}
                        />
                      </FormControl>

                      <FormControl>
                        <FormLabel>Học vấn</FormLabel>
                        <Textarea
                          height="200px"
                          placeholder="Học vấn"
                          size="sm"
                          resize={"vertical"}
                          {...register("education")}
                          defaultValue={doctorDetails?.education}
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
                          type="text"
                          placeholder="Tỉnh/Thành phố"
                          {...register("state")}
                          defaultValue={doctorDetails?.state}
                        />
                      </FormControl>

                      <FormControl>
                        <FormLabel>Quận/Huyện</FormLabel>
                        <Input
                          size={"sm"}
                          borderRadius={6}
                          type="text"
                          placeholder="Quận/Huyện"
                          {...register("city")}
                          defaultValue={doctorDetails.city}
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
                          defaultValue={doctorDetails.postal_code}
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
                          defaultValue={doctorDetails?.address}
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
                        Mật khẩu -{" "}
                      </Heading>{" "}
                    </Flex>

                    <Divider mt={2} mb={5} />
                    <Flex gap={10}>
                      <FormControl>
                        <FormLabel>Mật khẩu</FormLabel>
                        <Input
                          size={"sm"}
                          borderRadius={6}
                          type="password"
                          placeholder="Mật khẩu"
                          {...register("password")}
                        />
                      </FormControl>
                      <FormControl>
                        <FormLabel>Xác nhận mật khẩu</FormLabel>
                        <Input
                          size={"sm"}
                          borderRadius={6}
                          type="password"
                          placeholder="Xác nhận mật khẩu"
                          {...register("cnfPassword")}
                        />
                      </FormControl>
                    </Flex>
                  </CardBody>
                </Card>
                <Button
                  w={"100%"}
                  mt={10}
                  type="submit"
                  colorScheme="blue"
                  size={"sm"}
                  isLoading={isLoading}
                >
                  Cập nhật
                </Button>
              </Box>

              <Box w={"25%"}>
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
                          doctorDetails?.image
                            ? `${imageBaseURL}/${doctorDetails?.image}` // Use profilePicture
                            : "/admin/profilePicturePlaceholder.png" // Fallback placeholder image
                        }
                      />
                      {doctorDetails?.image && (
                        <Tooltip label="Delete" fontSize="md">
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
                      <Text color={"gray.500"} fontSize={"sm"}>
                        Nhấp vào ảnh để tải lên hoặc kéo và thả
                      </Text>
                    </Flex>
                    <VStack spacing={4} align="stretch" mt={10}>
                      <Input
                        size={"sm"}
                        borderRadius={6}
                        type="file"
                        display="none" // Hide the actual file input
                        ref={inputRef}
                        onChange={handleFileChange}
                        accept=".jpeg, .svg, .png , .jpg , .avif"
                      />
                      <Button
                        isDisabled={doctorDetails?.image !== null}
                        size={"sm"}
                        onClick={() => {
                          inputRef.current.click();
                        }}
                        colorScheme="blue"
                      >
                        Tải ảnh hồ sơ
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
                    <Heading as={"h3"} size={"sm"}>
                      Tài khoản mạng xã hội
                    </Heading>
                    <Divider mt={2} mb={5} />
                    <InputGroup mt={3} size="sm">
                      <InputLeftElement pointerEvents="none">
                        <CgFacebook
                          size={"20"}
                          color={theme.colors.facebook[500]}
                        />
                      </InputLeftElement>
                      <Input
                        borderRadius={6}
                        placeholder="Facebook"
                        defaultValue={doctorDetails?.fb_linik}
                        {...register("fb_linik")}
                      />
                      <InputRightElement
                        cursor={"pointer"}
                        onClick={() => {
                          const isValidUrl =
                            /^(ftp|http|https):\/\/[^ "]+$/.test(
                              doctorDetails?.fb_linik
                            );
                          if (isValidUrl) {
                            window.open(doctorDetails?.fb_linik, "_blank");
                          } else {
                            ShowToast(
                              toast,
                              "error",
                              "This is not a valid url"
                            );
                          }
                        }}
                      >
                        <BiLinkExternal size={"16"} />
                      </InputRightElement>
                    </InputGroup>
                    <InputGroup mt={3} size="sm">
                      <InputLeftElement pointerEvents="none">
                        <AiOutlineTwitter
                          size={"20"}
                          color={theme.colors.twitter[500]}
                        />
                      </InputLeftElement>
                      <Input
                        borderRadius={6}
                        placeholder="Twitter"
                        defaultValue={doctorDetails?.twitter_link}
                        {...register("twitter_link")}
                      />
                      <InputRightElement
                        cursor={"pointer"}
                        onClick={() => {
                          const isValidUrl =
                            /^(ftp|http|https):\/\/[^ "]+$/.test(
                              doctorDetails?.insta_link
                            );
                          if (isValidUrl) {
                            window.open(doctorDetails?.insta_link, "_blank");
                          } else {
                            ShowToast(
                              toast,
                              "error",
                              "This is not a valid url"
                            );
                          }
                        }}
                      >
                        <BiLinkExternal size={"16"} />
                      </InputRightElement>
                    </InputGroup>
                    <InputGroup mt={3} size="sm">
                      <InputLeftElement pointerEvents="none">
                        <BsInstagram
                          size={"20"}
                          color={theme.colors.red[400]}
                        />
                      </InputLeftElement>
                      <Input
                        borderRadius={6}
                        placeholder="Instagram"
                        defaultValue={doctorDetails?.insta_link}
                        {...register("insta_link")}
                      />
                      <InputRightElement
                        cursor={"pointer"}
                        onClick={() => {
                          const isValidUrl =
                            /^(ftp|http|https):\/\/[^ "]+$/.test(
                              doctorDetails?.insta_link
                            );
                          if (isValidUrl) {
                            window.open(doctorDetails?.insta_link, "_blank");
                          } else {
                            ShowToast(
                              toast,
                              "error",
                              "This is not a valid url"
                            );
                          }
                        }}
                      >
                        <BiLinkExternal size={"16"} />
                      </InputRightElement>
                    </InputGroup>
                    <InputGroup mt={3} size="sm">
                      <InputLeftElement pointerEvents="none">
                        <AiFillYoutube
                          size={20}
                          color={theme.colors.red[600]}
                        />
                      </InputLeftElement>
                      <Input
                        borderRadius={6}
                        placeholder="Youtube"
                        defaultValue={doctorDetails?.you_tube_link}
                        {...register("you_tube_link")}
                      />
                      <InputRightElement
                        cursor={"pointer"}
                        onClick={() => {
                          const isValidUrl =
                            /^(ftp|http|https):\/\/[^ "]+$/.test(
                              doctorDetails?.you_tube_link
                            );
                          if (isValidUrl) {
                            window.open(doctorDetails?.you_tube_link, "_blank");
                          } else {
                            ShowToast(
                              toast,
                              "error",
                              "This is not a valid url"
                            );
                          }
                        }}
                      >
                        <BiLinkExternal size={"16"} />
                      </InputRightElement>
                    </InputGroup>
                  </CardBody>
                </Card>
                <FeesForm
                  doctorDetails={doctorDetails}
                  register={register}
                  setValue={setValue}
                />
              </Box>
            </Flex>
          </TabPanel>
          <TabPanel p={0}>
            <TimeSlotes doctorID={param.id} />
            <Divider my={10} />
            <VideoTimeSlotes doctorID={param.id} />
          </TabPanel>
          <TabPanel p={0}>
            <Review doctID={param.id} doctorDetails={doctorDetails} />
          </TabPanel>
          <TabPanel p={0}>
            <DoctAppointments doctID={param.id} />
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

// fees form
const FeesForm = ({ doctorDetails, register, setValue }) => {
  // Initialize state with doctorDetails or default values
  const [appointments, setAppointments] = useState({
    video_appointment: doctorDetails?.video_appointment,
    clinic_appointment: doctorDetails?.clinic_appointment,
    emergency_appointment: doctorDetails?.emergency_appointment,
  });

  // Handle toggle switch change
  const handleToggle = (type) => {
    setAppointments((prev) => {
      const updatedValue = prev[type] === 1 ? 0 : 1;
      setValue(type, updatedValue); // Update form state
      return { ...prev, [type]: updatedValue };
    });
  };

  useEffect(() => {
    setAppointments({
      video_appointment: doctorDetails?.video_appointment,
      clinic_appointment: doctorDetails?.clinic_appointment,
      emergency_appointment: doctorDetails?.emergency_appointment,
    });
  }, [doctorDetails]);

  return (
    <Card
      mt={5}
      bg={useColorModeValue("white", "gray.700")}
      h="fit-content"
      pb={5}
    >
      <CardBody p={2}>
        <Heading as="h3" size="sm">
          Fees
        </Heading>
        <Divider mt={2} mb={2} />

        {/* Toggle Switches */}
        <FormControl display="flex" alignItems="center" mb={2}>
          <FormLabel mb="0">Lịch hẹn OPD - </FormLabel>
          <Switch
            isChecked={appointments.clinic_appointment === 1}
            onChange={() => handleToggle("clinic_appointment")}
            size={"sm"}
          />
        </FormControl>
        {appointments.clinic_appointment === 1 && (
          <FormControl>
            <FormLabel>Phí OPD</FormLabel>
            <Input
              size="sm"
              borderRadius={6}
              type="number"
              placeholder="Phí OPD"
              {...register("opd_fee")}
              defaultValue={doctorDetails?.opd_fee}
            />
          </FormControl>
        )}

        <Divider my={3} />

        <FormControl display="flex" alignItems="center" mb={2}>
          <FormLabel mb="0">Lịch hẹn Video - </FormLabel>
          <Switch
            isChecked={appointments.video_appointment === 1}
            onChange={() => handleToggle("video_appointment")}
            size={"sm"}
          />
        </FormControl>
        {appointments.video_appointment === 1 && (
          <FormControl mt={3}>
            <FormLabel>Phí Video</FormLabel>
            <Input
              size="sm"
              borderRadius={6}
              type="number"
              placeholder="Phí Video"
              {...register("video_fee")}
              defaultValue={doctorDetails?.video_fee}
            />
          </FormControl>
        )}

        <Divider my={3} />
        <FormControl display="flex" alignItems="center" mb={2}>
          <FormLabel mb="0">Lịch hẹn khẩn cấp - </FormLabel>
          <Switch
            isChecked={appointments.emergency_appointment === 1}
            onChange={() => handleToggle("emergency_appointment")}
            size={"sm"}
          />
        </FormControl>
        {appointments.emergency_appointment === 1 && (
          <FormControl mt={3}>
            <FormLabel>Phí khẩn cấp</FormLabel>
            <Input
              size="sm"
              borderRadius={6}
              type="number"
              placeholder="Phí khẩn cấp"
              {...register("emg_fee")}
              defaultValue={doctorDetails?.emg_fee}
            />
          </FormControl>
        )}

        {/* Input Fields (Shown Conditionally) */}
      </CardBody>
    </Card>
  );
};

const IsActiveSwitch = ({ id, isActive }) => {
  const { hasPermission } = useHasPermission();
  const toast = useToast();
  const queryClient = useQueryClient();
  const handleActive = async (id, active) => {
    let data = { id, active };
    try {
      const res = await UPDATE(admin.token, "update_doctor", data);
      if (res.response === 200) {
        ShowToast(toast, "success", "Hồ sơ đã được cập nhật!");
        queryClient.invalidateQueries("doctors");
        queryClient.invalidateQueries(["doctors", "dashboard"]);
        queryClient.invalidateQueries(["doctor", id]);
      } else {
        ShowToast(toast, "error", res.message);
      }
    } catch (error) {
      ShowToast(toast, "error", JSON.stringify(error));
    }
  };

  const mutation = useMutation({
    mutationFn: async (data) => {
      await handleActive(data.id, data.active);
    },
  });

  return (
    <FormControl display="flex" alignItems="center">
      <Switch
        isDisabled={!hasPermission("DOCTOR_UPDATE")}
        defaultChecked={isActive === 1}
        size={"sm"}
        onChange={(e) => {
          let active = e.target.checked ? 1 : 0;

          mutation.mutate({ id, active });
        }}
      />
    </FormControl>
  );
};
const StopBooking = ({ id, isStop_booking }) => {
  const { hasPermission } = useHasPermission();
  const toast = useToast();
  const queryClient = useQueryClient();
  const handleActive = async (id, stop_booking) => {
    let data = { id, stop_booking };
    try {
      const res = await UPDATE(admin.token, "update_doctor", data);
      if (res.response === 200) {
        ShowToast(toast, "success", "Hồ sơ đã được cập nhật!");
        queryClient.invalidateQueries("doctors");
        queryClient.invalidateQueries(["doctors", "dashboard"]);
        queryClient.invalidateQueries(["doctor", id]);
      } else {
        ShowToast(toast, "error", res.message);
      }
    } catch (error) {
      ShowToast(toast, "error", JSON.stringify(error));
    }
  };

  const mutation = useMutation({
    mutationFn: async (data) => {
      await handleActive(data.id, data.stop_booking);
    },
  });

  return (
    <FormControl display="flex" alignItems="center">
      <Switch
        isDisabled={!hasPermission("DOCTOR_UPDATE")}
        defaultChecked={isStop_booking === 1}
        size={"sm"}
        onChange={(e) => {
          let stop_booking = e.target.checked ? 1 : 0;

          mutation.mutate({ id, stop_booking });
        }}
      />
    </FormControl>
  );
};

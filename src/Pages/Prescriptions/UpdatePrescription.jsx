import Loading from "../../Components/Loading";
import { MedicineAutocomplete } from "../../Components/MedicineAutocomplete";
import { GET, UPDATE } from "../../Controllers/ApiControllers";
import showToast from "../../Controllers/ShowToast";
import admin from "../../Controllers/admin";
import api from "../../Controllers/api";
import imageBaseURL from "../../Controllers/image";
import useMedicineData from "../../Hooks/Medicines";
import AddMedicine from "../Medicines/AddMedicine";
import {
  Box,
  Button,
  Flex,
  Heading,
  useColorModeValue,
  FormControl,
  FormLabel,
  Input,
  CardBody,
  Card,
  Divider,
  Select,
  HStack,
  Textarea,
  IconButton,
  useToast,
  useDisclosure,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from "@chakra-ui/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { BiPrinter } from "react-icons/bi";

/* eslint-disable react-hooks/rules-of-hooks */
import { BiPlus } from "react-icons/bi";
import { BsFillTrashFill } from "react-icons/bs";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

function hasEmptyValue(arr) {
  return arr.some((item) =>
    Object.entries(item).some(
      ([key, value]) =>
        key !== "notes" &&
        (value === null || value === "" || value === undefined)
    )
  );
}

function UpdatePrescription() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { register, getValues } = useForm();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const appointment_id = searchParams.get("appointmentID");
  const patient_id = searchParams.get("patientID");
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const { medicinesData } = useMedicineData();
  const getData = async () => {
    const res = await GET(admin.token, `get_prescription/${id}`);
    return res.data;
  };

  const { data: prescriptionData, isLoading } = useQuery({
    queryKey: ["prescription", id],
    queryFn: getData,
  });

  const [medicines, setMedicines] = useState(prescriptionData?.items || []);
  const [medicine, setMedicine] = useState({
    medicine_name: "",
    dosage: "",
    duration: "",
    time: "",
    dose_interval: "",
    notes: "",
  });
  useEffect(() => {
    setMedicines(
      prescriptionData?.items || [
        {
          medicine_name: "",
          dosage: "",
          duration: "",
          time: "",
          dose_interval: "",
          notes: "",
        },
      ]
    );
  }, [prescriptionData]);

  const handleMedicineChange = (index, field, value) => {
    console.log(field, value, medicines);
    setMedicines((prevMedicines) => {
      // Update the specific medicine entry
      const updatedMedicines = prevMedicines.map((med, i) =>
        i === index ? { ...med, [field]: value } : med
      );
      return updatedMedicines;
    });
  };

  const handleAdd = () => {
    setMedicines([...medicines, medicine]);
    setMedicine({
      medicine_name: "",
      dosage: "",
      duration: "",
      time: "",
      dose_interval: "",
      notes: "",
    });
  };
  const handleDelete = (indexToRemove) => {
    setMedicines((prevItems) =>
      prevItems.filter((_, index) => index !== indexToRemove)
    );
  };

  const handleUpdate = async () => {
    if (hasEmptyValue(medicines)) {
      return showToast(toast, "error", "Vui lòng điền đầy đủ thông tin thuốc");
    }
    const values = getValues();

    console.log(values);
    const data = {
      ...values,
      id: id,
      appointment_id: appointment_id,
      patient_id: patient_id,
      medicines: medicines,
    };

    try {
      const res = await UPDATE(admin.token, "update_prescription", data);
      if (res.response === 200) {
        showToast(toast, "success", "Đã cập nhật đơn thuốc thành công!");
      } else {
        showToast(toast, "error", res.message);
      }
    } catch (error) {
      showToast(toast, "error", JSON.stringify(error));
    }
  };

  const mutation = useMutation({
    mutationFn: async () => {
      await handleUpdate();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["prescription", id]);
      queryClient.invalidateQueries(["prescriptios", appointment_id]);
    },
  });

  const printPdf = () => {
    const pdfUrl = `${api}/prescription/generatePDF/${id}`;
    const newWindow = window.open(pdfUrl, "_blank");
    if (newWindow) {
      newWindow.focus();
      newWindow.onload = () => {
        newWindow.load();
        newWindow.onafterprint = () => {
          newWindow.close();
        };
      };
    }
  };

  if (isLoading || mutation.isPending) return <Loading />;

  if (!prescriptionData)
    return (
      <Alert status="error">
        <AlertIcon />
        <AlertTitle>Không tìm thấy đơn thuốc!</AlertTitle>
        <AlertDescription>
          Đơn thuốc bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.
        </AlertDescription>
      </Alert>
    );

  if (prescriptionData?.pdf_file)
    return (
      <Box p={5}>
        <Alert status="warning" borderRadius="md">
          <AlertIcon />
          <Box flex="1">
            <AlertTitle>Đơn thuốc viết tay</AlertTitle>
            <AlertDescription>
              Đơn thuốc này chứa một tệp PDF viết tay không thể chỉnh sửa trên web. Vui lòng mở nó trên máy tính bảng của bạn để chỉnh sửa.
            </AlertDescription>
          </Box>
          <Button
            as="a"
            href={imageBaseURL + "/" + prescriptionData?.pdf_file}
            target="_blank"
            colorScheme="blue"
            ml={4}
          >
            Mở PDF
          </Button>
        </Alert>
      </Box>
    );

  return (
    <Box>
      <Flex justify={"space-between"} alignItems={"center"}>
        <Heading as={"h1"} size={"lg"}>
          Cập nhật đơn thuốc
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
      <Box>
        {" "}
        <Card mt={5} bg={useColorModeValue("white", "gray.700")}>
          <CardBody p={3} as={"form"}>
            <Flex justify={"space-between"}>
              {" "}
              <Heading as={"h3"} size={"sm"}>
                Thuốc
              </Heading>{" "}
              <Flex gap={3}>
                {" "}
                <Button
                  size="sm"
                  colorScheme={"facebook"}
                  onClick={printPdf}
                  leftIcon={<BiPrinter fontSize={18} />}
                >
                  In
                </Button>{" "}
                <Button size="sm" colorScheme={"blue"} onClick={onOpen}>
                  Thêm thuốc mới
                </Button>
              </Flex>
            </Flex>

            <Divider mt={2} mb={5} />

            {medicines.map((med, index) => (
              <HStack
                key={index}
                spacing={4}
                w="full"
                mb={5}
                align={"flex-end"}
              >
                <FormControl>
                  <FormLabel fontSize={"sm"} mb={0}>
                    Tên thuốc
                  </FormLabel>
                  <MedicineAutocomplete
                    name={"Thuốc"}
                    data={medicinesData}
                    defaultName={med.medicine_name}
                    handleChange={handleMedicineChange}
                    mainIndex={index}
                  />
                </FormControl>
                <FormControl w={"150px"}>
                  <FormLabel fontSize={"sm"} mb={0}>
                    Liều lượng
                  </FormLabel>
                  <Select
                    name="dosage"
                    value={med.dosage}
                    onChange={(e) =>
                      handleMedicineChange(index, "dosage", e.target.value)
                    }
                    size={"md"}
                    placeholder="Chọn"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </Select>
                </FormControl>
                <FormControl>
                  <FormLabel fontSize={"sm"} mb={0}>
                    Thời gian
                  </FormLabel>
                  <Select
                    name="duration"
                    value={med.duration}
                    onChange={(e) =>
                      handleMedicineChange(index, "duration", e.target.value)
                    }
                    size={"md"}
                    placeholder="Chọn"
                  >
                    <option value="Trong 3 ngày">Trong 3 ngày</option>
                    <option value="Trong 5 ngày">Trong 5 ngày</option>
                    <option value="Trong 7 ngày">Trong 7 ngày</option>
                    <option value="Trong 10 ngày">Trong 10 ngày</option>
                    <option value="Trong 15 ngày">Trong 15 ngày</option>
                    <option value="Trong 30 ngày">Trong 30 ngày</option>
                  </Select>
                </FormControl>
                <FormControl>
                  <FormLabel fontSize={"sm"} mb={0}>
                    Thời điểm uống
                  </FormLabel>

                  <Select
                    size={"md"}
                    name="time"
                    value={med.time}
                    onChange={(e) =>
                      handleMedicineChange(index, "time", e.target.value)
                    }
                    placeholder="Chọn"
                  >
                    <option value="Sau bữa ăn">Sau bữa ăn</option>
                    <option value="Trước bữa ăn">Trước bữa ăn</option>
                  </Select>
                </FormControl>
                <FormControl>
                  <FormLabel fontSize={"sm"} mb={0}>
                    Khoảng cách liều
                  </FormLabel>
                  <Select
                    size={"md"}
                    name="dose_interval"
                    value={med.dose_interval}
                    onChange={(e) =>
                      handleMedicineChange(
                        index,
                        "dose_interval",
                        e.target.value
                      )
                    }
                    placeholder="Chọn"
                  >
                    <option value="Một lần một ngày">Một lần một ngày</option>
                    <option value="Hai lần một ngày">Hai lần một ngày</option>
                    <option value="Ba lần một ngày">Ba lần một ngày</option>
                    <option value="Bốn lần một ngày">Bốn lần một ngày</option>
                  </Select>
                </FormControl>
                <FormControl>
                  <FormLabel fontSize={"sm"} mb={0}>
                    Ghi chú
                  </FormLabel>
                  <Input
                    size={"md"}
                    name="notes"
                    value={med.notes}
                    onChange={(e) =>
                      handleMedicineChange(index, "notes", e.target.value)
                    }
                  />
                </FormControl>{" "}
                <Flex mb={"2px"} gap={3}>
                  <IconButton
                    size={"sm"}
                    colorScheme={"blue"}
                    icon={<BiPlus fontSize={20} />}
                    onClick={handleAdd}
                  />
                  {medicines?.length > 1 && (
                    <IconButton
                      size={"sm"}
                      colorScheme={"red"}
                      icon={<BsFillTrashFill />}
                      onClick={() => {
                        handleDelete(index);
                      }}
                    />
                  )}
                </Flex>
              </HStack>
            ))}
          </CardBody>
        </Card>
        {/* tests and advise  */}
        <Card mt={5} bg={useColorModeValue("white", "gray.700")}>
          <CardBody p={3} as={"form"}>
            <Flex justify={"space-between"}>
              {" "}
              <Heading as={"h3"} size={"sm"}>
                Thông tin thể chất -
              </Heading>{" "}
            </Flex>
            <Divider mt={2} mb={5} />
            <Flex flexWrap={"wrap"} gap={5}>
              <FormControl mt={3} w={"300px"}>
                <FormLabel fontSize={"sm"}>Dị ứng thực phẩm</FormLabel>
                <Input
                  size={"md"}
                  {...register("food_allergies")}
                  defaultValue={prescriptionData.food_allergies}
                />
              </FormControl>
              <FormControl mt={3} w={"300px"}>
                <FormLabel fontSize={"sm"}>Xu hướng chảy máu</FormLabel>
                <Input
                  size={"md"}
                  {...register("tendency_bleed")}
                  defaultValue={prescriptionData.tendency_bleed}
                />
              </FormControl>
              <FormControl mt={3} w={"300px"}>
                <FormLabel fontSize={"sm"}>Bệnh tim</FormLabel>
                <Input
                  size={"md"}
                  {...register("heart_disease")}
                  defaultValue={prescriptionData.heart_disease}
                />
              </FormControl>
              <FormControl mt={3} w={"300px"}>
                <FormLabel fontSize={"sm"}>Huyết áp cao</FormLabel>
                <Input
                  size={"md"}
                  {...register("blood_pressure")}
                  defaultValue={prescriptionData.blood_pressure}
                />
              </FormControl>
              <FormControl mt={3} w={"300px"}>
                <FormLabel fontSize={"sm"}>Tiểu đường</FormLabel>
                <Input
                  size={"md"}
                  {...register("diabetic")}
                  defaultValue={prescriptionData.diabetic}
                />
              </FormControl>
              <FormControl mt={3} w={"300px"}>
                <FormLabel fontSize={"sm"}>Phẫu thuật</FormLabel>
                <Input
                  size={"md"}
                  {...register("surgery")}
                  defaultValue={prescriptionData.surgery}
                />
              </FormControl>
              <FormControl mt={3} w={"300px"}>
                <FormLabel fontSize={"sm"}>Tai nạn</FormLabel>
                <Input
                  size={"md"}
                  {...register("accident")}
                  defaultValue={prescriptionData.accident}
                />
              </FormControl>
              <FormControl mt={3} w={"300px"}>
                <FormLabel fontSize={"sm"}>Khác</FormLabel>
                <Input
                  size={"md"}
                  {...register("others")}
                  defaultValue={prescriptionData.others}
                />
              </FormControl>
              <FormControl mt={3} w={"300px"}>
                <FormLabel fontSize={"sm"}>Tiền sử bệnh</FormLabel>
                <Input
                  size={"md"}
                  {...register("medical_history")}
                  defaultValue={prescriptionData.medical_history}
                />
              </FormControl>
              <FormControl mt={3} w={"300px"}>
                <FormLabel fontSize={"sm"}>Thuốc đang dùng</FormLabel>
                <Input
                  size={"md"}
                  {...register("current_medication")}
                  defaultValue={prescriptionData.current_medication}
                />
              </FormControl>
              <FormControl mt={3} w={"300px"}>
                <FormLabel fontSize={"sm"}>Mang thai</FormLabel>
                <Input
                  size={"md"}
                  {...register("female_pregnancy")}
                  defaultValue={prescriptionData.female_pregnancy}
                />
              </FormControl>
              <FormControl mt={3} w={"300px"}>
                <FormLabel fontSize={"sm"}>Cho con bú</FormLabel>
                <Input
                  size={"md"}
                  {...register("breast_feeding")}
                  defaultValue={prescriptionData.breast_feeding}
                />
              </FormControl>
              <FormControl mt={3} w={"300px"}>
                <FormLabel fontSize={"sm"}>Nhịp tim</FormLabel>
                <Input
                  size={"md"}
                  {...register("pulse_rate")}
                  defaultValue={prescriptionData.pulse_rate}
                />
              </FormControl>
              <FormControl mt={3} w={"300px"}>
                <FormLabel fontSize={"sm"}>Nhiệt độ</FormLabel>
                <Input
                  size={"md"}
                  {...register("temperature")}
                  defaultValue={prescriptionData.temperature}
                />
              </FormControl>
            </Flex>
          </CardBody>
        </Card>
        <Card mt={5} bg={useColorModeValue("white", "gray.700")}>
          <CardBody p={3} as={"form"}>
            <Flex justify={"space-between"}>
              {" "}
              <Heading as={"h3"} size={"sm"}>
                Khác -
              </Heading>{" "}
            </Flex>
            <Divider mt={2} mb={5} />
            <FormControl>
              <FormLabel fontSize={"md"} mb={1}>
                Vấn đề -
              </FormLabel>
              <Textarea
                height={100}
                {...register("problem_desc")}
                defaultValue={prescriptionData.problem_desc}
              />
            </FormControl>
            <FormControl>
              <FormLabel fontSize={"md"} mb={1}>
                Xét nghiệm -
              </FormLabel>
              <Textarea
                height={100}
                {...register("tests")}
                defaultValue={prescriptionData.test}
              />
            </FormControl>
            <FormControl mt={4}>
              <FormLabel fontSize={"md"} mb={1}>
                Lời khuyên -
              </FormLabel>
              <Textarea
                height={100}
                {...register("advice")}
                defaultValue={prescriptionData.advice}
              />
            </FormControl>
            <FormControl mt={4}>
              <FormLabel fontSize={"md"} mb={1}>
                Tái khám -
              </FormLabel>
              <Flex gap={5} alignItems={"center"}>
                Sau
                <Input
                  w={16}
                  type="number"
                  {...register("next_visit")}
                  min={1}
                  defaultValue={prescriptionData.next_visit}
                />
                ngày
              </Flex>
            </FormControl>
          </CardBody>
        </Card>
        <Flex w={"100%"} justify={"end"} mt={5}>
          <Button
            w={96}
            colorScheme={"green"}
            size={"sm"}
            onClick={() => {
              mutation.mutate();
            }}
          >
            Lưu
          </Button>
        </Flex>
      </Box>

      <AddMedicine isOpen={isOpen} onClose={onClose} />
    </Box>
  );
}

export default UpdatePrescription;

import Loading from "../../Components/Loading";
import { MedicineAutocomplete } from "../../Components/MedicineAutocomplete";
import { ADD } from "../../Controllers/ApiControllers";
import ShowToast from "../../Controllers/ShowToast";
import admin from "../../Controllers/admin";
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
} from "@chakra-ui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { BsFillClipboardPlusFill } from "react-icons/bs";

/* eslint-disable react-hooks/rules-of-hooks */
import { BsFillTrashFill } from "react-icons/bs";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

const handleUpdate = async (data) => {
  const res = await ADD(admin.token, "add_prescription", data);
  if (res.response !== 200) {
    throw new Error(res.message);
  }
  return res;
};
function hasEmptyValue(arr) {
  return arr.some((item) =>
    Object.entries(item).some(
      ([key, value]) =>
        key !== "notes" &&
        (value === null || value === "" || value === undefined)
    )
  );
}

function AddPrescription() {
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

  const [medicines, setMedicines] = useState([
    {
      medicine_name: "",
      dosage: 1,
      duration: "For 3 days",
      time: "After Meal",
      dose_interval: "Once a Day",
      notes: "",
    },
  ]);
  const [medicine, setMedicine] = useState({
    medicine_name: "",
    dosage: 1,
    duration: "For 3 days",
    time: "After Meal",
    dose_interval: "Once a Day",
    notes: "",
  });

  const handleMedicineChange = (index, field, value) => {
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
      dosage: 1,
      duration: "For 3 days",
      time: "After Meal",
      dose_interval: "Once a Day",
      notes: "",
    });
  };
  const handleDelete = (indexToRemove) => {
    setMedicines((prevItems) =>
      prevItems.filter((_, index) => index !== indexToRemove)
    );
  };

  const mutation = useMutation({
    mutationFn: async () => {
      if (hasEmptyValue(medicines)) {
        throw new Error("Vui lòng điền đầy đủ các trường trong phần thuốc");
      }
      const values = getValues();
      const formData = {
        ...values,
        appointment_id: appointment_id,
        patient_id: patient_id,
        medicines: medicines,
      };
      await handleUpdate(formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["prescription", id]);
      queryClient.invalidateQueries(["prescriptios", appointment_id]);
      navigate(`/appointment/${appointment_id}`);
    },
    onError: (error) => {
      ShowToast(toast, "error", error.message);
    },
  });

  if (mutation.isPending) return <Loading />;

  return (
    <Box>
      <Flex justify={"space-between"} alignItems={"center"}>
        <Heading as={"h1"} size={"md"}>
          Thêm đơn thuốc
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
              <Button size="sm" colorScheme={"blue"} onClick={onOpen}>
                Thuốc mới
              </Button>
            </Flex>

            <Divider mt={2} mb={5} />

            {medicines.map((med, index) => (
              <Box key={index}>
                {" "}
                <HStack spacing={4} w="full" mb={5} align={"flex-end"}>
                  <FormControl>
                    <FormLabel fontSize={"sm"} mb={0}>
                      Tên thuốc
                    </FormLabel>
                    <MedicineAutocomplete
                      name={"Medicine"}
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
                    >
                      <option value="For 3 days">Trong 3 ngày</option>
                      <option value="For 5 days">Trong 5 ngày</option>
                      <option value="For 7 days">Trong 7 ngày</option>
                      <option value="For 10 days">Trong 10 ngày</option>
                      <option value="For 14 days">Trong 14 ngày</option>
                      <option value="For 1 month">Trong 1 tháng</option>
                    </Select>
                  </FormControl>
                  <FormControl>
                    <FormLabel fontSize={"sm"} mb={0}>
                      Thời điểm
                    </FormLabel>

                    <Select
                      size={"md"}
                      name="time"
                      value={med.time}
                      onChange={(e) =>
                        handleMedicineChange(index, "time", e.target.value)
                      }
                    >
                      <option value="After Meal">Sau bữa ăn</option>
                      <option value="Before Meal">Trước bữa ăn</option>
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
                    >
                      {" "}
                      <option value="Once a Day">Một lần một ngày</option>
                      <option value="Every Morning & Evening">
                        Buổi sáng và tối
                      </option>
                      <option value="3 Times a day">3 lần một ngày</option>
                      <option value="4 Times a day">4 lần một ngày</option>
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
                  <Flex mb={"2px"}>
                    {" "}
                    {medicines.length > 1 && (
                      <IconButton
                        size={"md"}
                        colorScheme={"red"}
                        icon={<BsFillTrashFill />}
                        onClick={() => {
                          handleDelete(index);
                        }}
                      />
                    )}
                  </Flex>
                </HStack>
              </Box>
            ))}
            <Button
              onClick={handleAdd}
              size={"sm"}
              colorScheme={"facebook"}
              rightIcon={<BsFillClipboardPlusFill />}
            >
              Thêm thuốc mới
            </Button>
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
                <Input size={"md"} {...register("food_allergies")} />
              </FormControl>
              <FormControl mt={3} w={"300px"}>
                <FormLabel fontSize={"sm"}>Tendency to Bleed</FormLabel>
                <Input size={"md"} {...register("tendency_bleed")} />
              </FormControl>
              <FormControl mt={3} w={"300px"}>
                <FormLabel fontSize={"sm"}>Bệnh tim</FormLabel>
                <Input size={"md"} {...register("heart_disease")} />
              </FormControl>
              <FormControl mt={3} w={"300px"}>
                <FormLabel fontSize={"sm"}>Huyết áp</FormLabel>
                <Input size={"md"} {...register("blood_pressure")} />
              </FormControl>
              <FormControl mt={3} w={"300px"}>
                <FormLabel fontSize={"sm"}>Đái tháo đường</FormLabel>
                <Input size={"md"} {...register("diabetic")} />
              </FormControl>
              <FormControl mt={3} w={"300px"}>
                <FormLabel fontSize={"sm"}>Phẫu thuật</FormLabel>
                <Input size={"md"} {...register("surgery")} />
              </FormControl>
              <FormControl mt={3} w={"300px"}>
                <FormLabel fontSize={"sm"}>Tai nạn</FormLabel>
                <Input size={"md"} {...register("accident")} />
              </FormControl>
              <FormControl mt={3} w={"300px"}>
                <FormLabel fontSize={"sm"}>Khác</FormLabel>
                <Input size={"md"} {...register("others")} />
              </FormControl>
              <FormControl mt={3} w={"300px"}>
                <FormLabel fontSize={"sm"}>Lịch sử bệnh</FormLabel>
                <Input size={"md"} {...register("medical_history")} />
              </FormControl>
              <FormControl mt={3} w={"300px"}>
                <FormLabel fontSize={"sm"}>Thuốc hiện tại</FormLabel>
                <Input size={"md"} {...register("current_medication")} />
              </FormControl>
              <FormControl mt={3} w={"300px"}>
                <FormLabel fontSize={"sm"}>Mang thai</FormLabel>
                <Input size={"md"} {...register("female_pregnancy")} />
              </FormControl>
              <FormControl mt={3} w={"300px"}>
                <FormLabel fontSize={"sm"}>Cho con bú</FormLabel>
                <Input size={"md"} {...register("breast_feeding")} />
              </FormControl>
              <FormControl mt={3} w={"300px"}>
                <FormLabel fontSize={"sm"}>Nhịp tim</FormLabel>
                <Input size={"md"} {...register("pulse_rate")} />
              </FormControl>
              <FormControl mt={3} w={"300px"}>
                <FormLabel fontSize={"sm"}>Nhiệt độ</FormLabel>
                <Input size={"md"} {...register("temperature")} />
              </FormControl>
            </Flex>
          </CardBody>
        </Card>
        <Card mt={5} bg={useColorModeValue("white", "gray.700")}>
          <CardBody p={3} as={"form"}>
            <Flex justify={"space-between"}>
              {" "}
              <Heading as={"h3"} size={"sm"}>
                Vấn đề & Lời khuyên -
              </Heading>{" "}
            </Flex>
            <Divider mt={2} mb={5} />
            <FormControl>
              <FormLabel fontSize={"md"} mb={1}>
                Vấn đề -
              </FormLabel>
              <Textarea height={100} {...register("problem_desc")} />
            </FormControl>
            <FormControl>
              <FormLabel fontSize={"md"} mb={1}>
                Xét nghiệm -
              </FormLabel>
              <Textarea height={100} {...register("test")} />
            </FormControl>
            <FormControl mt={4}>
              <FormLabel fontSize={"md"} mb={1}>
                Lời khuyên -
              </FormLabel>
              <Textarea height={100} {...register("advice")} />
            </FormControl>
            <FormControl mt={4}>
              <FormLabel fontSize={"md"} mb={1}>
                Lần tái khám sau -
              </FormLabel>
              <Flex gap={5} alignItems={"center"}>
                Sau
                <Input
                  w={16}
                  type="number"
                  {...register("next_visit")}
                  min={1}
                  defaultValue={1}
                />
                Ngày
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

export default AddPrescription;

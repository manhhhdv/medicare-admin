import { ClinicComboBox } from "../../Components/ClinicComboBox";
import { useSelectedClinic } from "../../Context/SelectedClinic";
import { ADD } from "../../Controllers/ApiControllers";
import ShowToast from "../../Controllers/ShowToast";
import admin from "../../Controllers/admin";
import UseClinicsData from "../../Hooks/UseClinicsData";

/* eslint-disable react/prop-types */
import {
  Box,
  Button,
  Center,
  CloseButton,
  Divider,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  VisuallyHidden,
  useToast,
} from "@chakra-ui/react";
import { useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { AiOutlineUpload } from "react-icons/ai";

export default function AddPatientFiles({ isOpen, onClose, id }) {
  const [isLoading, setisLoading] = useState();
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef();
  const { register, handleSubmit, reset } = useForm();
  const queryClient = useQueryClient();
  const toast = useToast();
  const MAX_FILE_SIZE = 5 * 1024 * 1024;
  const { selectedClinic } = useSelectedClinic();
  const { clinicsData } = UseClinicsData();
  const [selectedClinicID, setselectedClinicID] = useState();

  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && file.size > MAX_FILE_SIZE) {
      ShowToast(toast, "error", "Vui lòng chọn tệp nhỏ hơn 5 MB.");
    } else {
      setSelectedFile(file);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.size > MAX_FILE_SIZE) {
      ShowToast(toast, "error", "Vui lòng chọn tệp nhỏ hơn 5 MB.");
    } else {
      setSelectedFile(file);
    }
  };

  const AddNewFile = async (data) => {
    if (!selectedClinicID) {
      return ShowToast(toast, "error", "Vui lòng chọn phòng khám");
    }

    let formData = {
      ...data,
      patient_id: id,
      file: selectedFile,
      clinic_id: selectedClinicID.id,
    };
    try {
      setisLoading(true);
      const res = await ADD(admin.token, "add_patient_file", formData);
      setisLoading(false);
      if (res.response === 200) {
        ShowToast(toast, "success", "Đã thêm tệp!");
        queryClient.invalidateQueries(["patient-files", id]);
        setSelectedFile(null);
        reset();
        onClose();
      } else {
        ShowToast(toast, "error", res.message);
      }
    } catch (error) {
      setisLoading(false);
      ShowToast(toast, "error", JSON.stringify(error));
    }
  };
  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size={"lg"}>
      <ModalOverlay />
      <ModalContent as={"form"} onSubmit={handleSubmit(AddNewFile)}>
        <ModalHeader fontSize={18} py={2}>
          Thêm tệp bệnh nhân
        </ModalHeader>
        <ModalCloseButton />
        <Divider />
        <ModalBody>
          <Box pb={3}>
            <FormControl isRequired>
              <FormLabel>Tên</FormLabel>
              <Input
                placeholder="Tên"
                {...register("file_name", { required: true })}
              />
            </FormControl>
            <FormControl isRequired mt={5}>
              <FormLabel>Phòng khám</FormLabel>
              <ClinicComboBox
                data={clinicsData}
                name={"clinic"}
                defaultData={selectedClinic}
                setState={setselectedClinicID}
              />
            </FormControl>

            <Box
              mt={5}
              p={4}
              border="2px dashed"
              borderColor="gray.300"
              borderRadius="md"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => {
                if (fileInputRef.current) {
                  fileInputRef.current.click();
                }
              }}
              cursor={"pointer"}
            >
              {selectedFile ? (
                <Box position={"relative"}>
                  <Text>Tệp đã chọn: {selectedFile.name}</Text>
                  <CloseButton
                    position={"absolute"}
                    right={-2}
                    top={-2}
                    size={"sm"}
                    onClick={() => {
                      setSelectedFile(null);
                    }}
                  />
                </Box>
              ) : (
                <Box>
                  <VisuallyHidden>
                    {" "}
                    <Input
                      ref={fileInputRef}
                      type="file"
                      onChange={handleFileChange}
                      accept="*"
                      mb={4}
                    />
                  </VisuallyHidden>

                  <Center>
                    {" "}
                    <AiOutlineUpload fontSize={32} />
                  </Center>
                  <Text textAlign={"center"} mt={3}>
                    <b>Chọn một tệp</b> hoặc kéo thả vào đây.
                    <br />
                    Tối đa 5 MB
                  </Text>
                </Box>
              )}
            </Box>
          </Box>
        </ModalBody>
        <Divider />
        <ModalFooter py={3}>
          <Button colorScheme="gray" mr={3} onClick={onClose} size={"sm"}>
            Đóng
          </Button>
          <Button
            variant="solid"
            size={"sm"}
            colorScheme="blue"
            type="submit"
            isLoading={isLoading}
          >
            Thêm tệp
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

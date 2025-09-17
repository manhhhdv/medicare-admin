/* eslint-disable react/prop-types */
import ISDCODEMODAL from "../../Components/IsdModal";
import UsersCombobox from "../../Components/UsersComboBox";
import { UPDATE } from "../../Controllers/ApiControllers";
import ShowToast from "../../Controllers/ShowToast";
import admin from "../../Controllers/admin";
import todayDate from "../../Controllers/today";
import useUserData from "../../Hooks/Users";
import {
  Box,
  Button,
  Divider,
  Flex,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputLeftAddon,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { useQueryClient } from "@tanstack/react-query";
import moment from "moment";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { AiOutlineDown } from "react-icons/ai";

function AddFamily({ isOpen, onClose, user }) {
  const [isLoading, setisLoading] = useState();
  const { register, handleSubmit } = useForm();
  const queryClient = useQueryClient();
  const toast = useToast();
  const { usersData } = useUserData();
  const [selectedUser, setselectedUser] = useState();
  const [isd_code, setisd_code] = useState("+91");
  const {
    isOpen: isIsdOpen,
    onOpen: onIsdOpen,
    onClose: onIsdClose,
  } = useDisclosure();

  const AddNewDepartment = async (Inputdata) => {
    if (!selectedUser) {
      ShowToast(toast, "error", "Chọn người dùng");
    }
    let formData = {
      ...Inputdata,
      dob: moment(Inputdata.dob).format("YYYY-MM-DD"),
      isd_code: isd_code,
      user_id: selectedUser.id,
    };

    try {
      setisLoading(true);
      const res = await UPDATE(admin.token, "add_family_member", formData);
      setisLoading(false);
      if (res.response === 200) {
        ShowToast(toast, "success", "Đã thêm thành viên gia đình!");
        queryClient.invalidateQueries(["family-members"]);
        queryClient.invalidateQueries(["family-members"]);
        onClose();
      } else {
        ShowToast(toast, "error", res.message);
      }
    } catch (error) {
      setisLoading(false);
      ShowToast(toast, "error", JSON.stringify(error));
    }
  };

  //   deleteImage

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      isCentered
      size={"4xl"}
      scrollBehavior="inside"
    >
      <ModalOverlay />
      <ModalContent as={"form"} onSubmit={handleSubmit(AddNewDepartment)}>
        <ModalHeader fontSize={18} py={2}>
          Thêm thành viên gia đình
        </ModalHeader>
        <ModalCloseButton />
        <Divider />
        <ModalBody>
          <Box pb={3}>
            <Flex gap={3}>
              <FormControl isRequired>
                <FormLabel>Người dùng</FormLabel>
                <UsersCombobox
                  data={usersData}
                  name={"Người dùng"}
                  setState={setselectedUser}
                  isUser
                  defaultData={user}
                />
              </FormControl>
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
            <Flex gap={3} mt={5}>
              <FormControl isRequired>
                <FormLabel>Số điện thoại</FormLabel>
                <InputGroup>
                  <InputLeftAddon
                    cursor={"pointer"}
                    onClick={(e) => {
                      e.stopPropagation();
                      onIsdOpen();
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
                <FormLabel>Giới tính</FormLabel>
                <Select
                  placeholder="Chọn giới tính"
                  {...register("gender", { required: true })}
                >
                  <option value="Male">Nam</option>
                  <option value="Female">Nữ</option>
                </Select>
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Ngày sinh</FormLabel>
                <Input
                  max={todayDate()}
                  type="date"
                  placeholder="Ngày sinh"
                  {...register("dob", { required: true })}
                />
              </FormControl>
            </Flex>
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
            Thêm thành viên
          </Button>
        </ModalFooter>
      </ModalContent>
      <ISDCODEMODAL
        isOpen={isIsdOpen}
        onClose={onIsdClose}
        setisd_code={setisd_code}
      />
    </Modal>
  );
}

export default AddFamily;

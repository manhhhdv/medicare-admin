/* eslint-disable react/prop-types */
import Loading from "../../Components/Loading";
import { GET, UPDATE } from "../../Controllers/ApiControllers";
import ShowToast from "../../Controllers/ShowToast";
import admin from "../../Controllers/admin";
import todayDate from "../../Controllers/today";
import {
  Box,
  Button,
  Divider,
  Flex,
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
  Select,
  useToast,
} from "@chakra-ui/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import moment from "moment";
import { useState } from "react";
import { useForm } from "react-hook-form";

function EditFamily({ data, isOpen, onClose }) {
  const [isLoading, setisLoading] = useState();
  const { register, handleSubmit } = useForm();
  const queryClient = useQueryClient();
  const toast = useToast();

  const { isLoading: isDataLoading, data: memberData } = useQuery({
    queryKey: ["family-member", data.id],
    queryFn: async () => {
      const res = await GET(admin.token, `get_family_members/${data.id}`);
      return res.data;
    },
  });

  const AddNewDepartment = async (Inputdata) => {
    let formData = {
      ...Inputdata,
      dob: moment(Inputdata.dob).format("YYYY-MM-DD"),
      id: data.id,
    };

    try {
      setisLoading(true);
      const res = await UPDATE(admin.token, "update_family_member", formData);
      setisLoading(false);
      if (res.response === 200) {
        ShowToast(toast, "success", "Đã cập nhật thành viên gia đình!");
        queryClient.invalidateQueries(["family-member", data.id]);
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

  if (isDataLoading) return <Loading />;
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      isCentered
      size={"2xl"}
      scrollBehavior="inside"
    >
      <ModalOverlay />
      <ModalContent as={"form"} onSubmit={handleSubmit(AddNewDepartment)}>
        <ModalHeader fontSize={18} py={2}>
          Cập nhật thành viên gia đình
        </ModalHeader>
        <ModalCloseButton />
        <Divider />
        <ModalBody>
          <Box pb={3}>
            <Flex gap={3}>
              {" "}
              <FormControl isRequired>
                <FormLabel>Tên</FormLabel>
                <Input
                  defaultValue={memberData?.f_name}
                  placeholder="Tên"
                  {...register("f_name", { required: true })}
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Họ</FormLabel>
                <Input
                  defaultValue={memberData?.l_name}
                  placeholder="Họ"
                  {...register("l_name", { required: true })}
                />
              </FormControl>
            </Flex>
            <Flex gap={3} mt={5}>
              {" "}
              <FormControl isRequired>
                <FormLabel>Giới tính</FormLabel>
                <Select
                  defaultValue={memberData?.gender}
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
                  defaultValue={memberData?.dob}
                  placeholder="Ngày sinh"
                  {...register("dob", { required: true })}
                />
              </FormControl>
            </Flex>
            <Flex gap={3} mt={5}>
              {" "}
              <FormControl isRequired>
                <FormLabel>Số điện thoại</FormLabel>
                <Input
                  defaultValue={memberData?.phone}
                  placeholder="Số điện thoại"
                  {...register("phone", { required: true })}
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
            Cập nhật thành viên
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default EditFamily;

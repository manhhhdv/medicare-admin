/* eslint-disable react/prop-types */
import DynamicTable from "../../Components/DataTable";
import { GET, UPDATE } from "../../Controllers/ApiControllers";
import ShowToast from "../../Controllers/ShowToast";
import admin from "../../Controllers/admin";
import {
  Box,
  Button,
  Flex,
  IconButton,
  Input,
  Skeleton,
  theme,
  useDisclosure,
  useToast,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Divider,
  FormControl,
  FormLabel,
} from "@chakra-ui/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { FiEdit } from "react-icons/fi";

export default function Fees({ currentTab, activeTab }) {
  const [SelectedData, setSelectedData] = useState();

  const {
    isOpen: EditisOpen,
    onOpen: EditonOpen,
    onClose: EditonClose,
  } = useDisclosure();
  const toast = useToast();
  const id = "Errortoast";

  const getData = async () => {
    const res = await GET(admin.token, "get_fee");
    return res.data;
  };

  const handleActionClick = (rowData) => {
    setSelectedData(rowData);
  };

  const { isLoading, data, error } = useQuery({
    queryKey: ["fees"],
    queryFn: getData,
    enabled: currentTab == activeTab,
  });

  if (error) {
    if (!toast.isActive(id)) {
      toast({
        id,
        title: "Ôi!.",
        description: "Có lỗi xảy ra.",
        status: "error",
        duration: 2000,
        isClosable: true,
        position: "top",
      });
    }
  }

  return (
    <Box>
      {isLoading || !data ? (
        <Box>
          <Flex mb={5} justify={"space-between"}>
            <Skeleton w={400} h={8} />
            <Skeleton w={50} h={8} />
          </Flex>
          <Skeleton h={300} w={"100%"} />
        </Box>
      ) : (
        <DynamicTable
          data={data}
          onActionClick={
            <YourActionButton
              onClick={handleActionClick}
              EditonOpen={EditonOpen}
            />
          }
        />
      )}
      {EditisOpen && (
        <Update isOpen={EditisOpen} onClose={EditonClose} data={SelectedData} />
      )}
    </Box>
  );
}

const YourActionButton = ({ onClick, rowData, EditonOpen }) => {
  return (
    <Flex justify={"center"}>
      <IconButton
        aria-label="Chỉnh sửa"
        size={"sm"}
        variant={"ghost"}
        _hover={{
          background: "none",
        }}
        onClick={() => {
          onClick(rowData);
          EditonOpen();
        }}
        icon={<FiEdit fontSize={18} color={theme.colors.blue[500]} />}
      />
    </Flex>
  );
};

const Update = ({ isOpen, onClose, data }) => {
  const [isLoading, setisLoading] = useState();

  const { register, handleSubmit, reset } = useForm();
  const queryClient = useQueryClient();
  const toast = useToast();

  const updateRole = async (Inputdata) => {
    let formData = {
      ...Inputdata,
      id: data.id,
    };
    try {
      setisLoading(true);
      const res = await UPDATE(
        admin.token,
        `update_fee?id=${data.id}&fee=${Inputdata.fee}&service_charge=${Inputdata.service_charge}`,
        formData
      );
      setisLoading(false);
      if (res.response === 200) {
        ShowToast(toast, "success", "Đã cập nhật!");
        queryClient.invalidateQueries("fees");
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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      isCentered
      size={"lg"}
      scrollBehavior="inside"
    >
      <ModalOverlay />
      <ModalContent as={"form"} onSubmit={handleSubmit(updateRole)}>
        <ModalHeader fontSize={18} py={2}>
          Cập nhật phí
        </ModalHeader>
        <ModalCloseButton />
        <Divider />
        <ModalBody>
          <Box pb={3}>
            <FormControl isRequired>
              <FormLabel>Tiêu đề</FormLabel>
              <Input
                defaultValue={data?.title}
                placeholder="Tiêu đề"
                {...register("title", { required: true })}
                isReadOnly
              />
            </FormControl>
            <FormControl isRequired mt={3}>
              <FormLabel>Phí</FormLabel>
              <Input
                defaultValue={data?.fee}
                placeholder="Phí"
                {...register("fee", { required: true })}
                type="number"
              />
            </FormControl>
            <FormControl isRequired mt={3}>
              <FormLabel>Phí dịch vụ</FormLabel>
              <Input
                defaultValue={data?.service_charge}
                placeholder="Phí dịch vụ"
                {...register("service_charge", { required: true })}
                type="number"
              />
            </FormControl>
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
            Cập nhật
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

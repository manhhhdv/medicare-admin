/* eslint-disable react-hooks/rules-of-hooks */

/* eslint-disable react/prop-types */
import MaskedCell from "../../../Components/MaskedCell";
import { GET, UPDATE } from "../../../Controllers/ApiControllers";
import ShowToast from "../../../Controllers/ShowToast";
import admin from "../../../Controllers/admin";
import UpdatePaymentGetways from "./Update";
import {
  Box,
  Flex,
  IconButton,
  Skeleton,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Switch,
  useColorModeValue,
  useToast,
  useDisclosure,
  FormControl,
  theme,
} from "@chakra-ui/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { FiEdit } from "react-icons/fi";

const getData = async () => {
  const res = await GET(admin.token, "get_payment_gateway");

  return res.data;
};

function PaymentGetways({ currentTab, activeTab }) {
  const toast = useToast();
  const id = "Errortoast";
  const [selectedData, setselectedData] = useState();
  const {
    isOpen: EditisOpen,
    onOpen: EditonOpen,
    onClose: EditonClose,
  } = useDisclosure();

  const { isLoading, data, error } = useQuery({
    queryKey: ["payment-getways"],
    queryFn: getData,
    enabled: currentTab == activeTab,
  });

  if (error) {
    if (!toast.isActive(id)) {
      toast({
        id,
        title: "Ôi!",
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
        <Box>
          <TableContainer
            border={"1px solid"}
            borderColor={useColorModeValue("gray.100", "gray.600")}
            borderRadius={"lg"}
            padding={3}
          >
            <Table
              variant="simple"
              colorScheme="gray"
              fontSize={12}
              size={"sm"}
              fontWeight={500}
            >
              <Thead background={useColorModeValue("blue.50", "blue.700")}>
                <Tr>
                  <Th
                    color={useColorModeValue("#000", "#fff")}
                    py={3}
                    textAlign={"center"}
                  >
                    Hành động
                  </Th>
                  <Th
                    color={useColorModeValue("#000", "#fff")}
                    py={3}
                    textAlign={"center"}
                  >
                    ID
                  </Th>
                  <Th
                    color={useColorModeValue("#000", "#fff")}
                    py={3}
                    textAlign={"center"}
                  >
                    Tiêu đề
                  </Th>
                  <Th
                    color={useColorModeValue("#000", "#fff")}
                    py={3}
                    textAlign={"center"}
                  >
                    Khóa
                  </Th>
                  <Th
                    color={useColorModeValue("#000", "#fff")}
                    py={3}
                    textAlign={"center"}
                  >
                    Bí mật
                  </Th>
                  <Th
                    color={useColorModeValue("#000", "#fff")}
                    py={3}
                    textAlign={"center"}
                  >
                    Khóa bí mật Webhook
                  </Th>
                  <Th
                    color={useColorModeValue("#000", "#fff")}
                    py={3}
                    textAlign={"center"}
                  >
                    Kích hoạt
                  </Th>
                  <Th
                    color={useColorModeValue("#000", "#fff")}
                    py={3}
                    textAlign={"center"}
                  >
                    Tạo lúc
                  </Th>
                  <Th
                    color={useColorModeValue("#000", "#fff")}
                    py={3}
                    textAlign={"center"}
                  >
                    Cập nhật lúc
                  </Th>
                </Tr>
              </Thead>
              <Tbody>
                {data.map((item) => (
                  <Tr key={item.id}>
                    <Td>
                      {" "}
                      <Flex justify={"center"}>
                        <IconButton
                          aria-label="Chỉnh sửa"
                          size={"sm"}
                          variant={"ghost"}
                          _hover={{
                            background: "none",
                          }}
                          onClick={() => {
                            setselectedData(item);
                            EditonOpen();
                          }}
                          icon={
                            <FiEdit
                              fontSize={18}
                              color={theme.colors.blue[500]}
                            />
                          }
                        />
                      </Flex>
                    </Td>
                    <Td>{item.id}</Td>
                    <Td>{item.title}</Td>
                    <Td>
                      <MaskedCell value={item.key} />
                    </Td>
                    <Td>
                      <MaskedCell value={item.secret} />
                    </Td>
                    <Td>
                      <MaskedCell value={item.webhook_secret_key} />
                    </Td>
                    <Td>
                      <IsActive id={item.id} isActive={item.is_active} />
                    </Td>
                    <Td>{item.created_at}</Td>
                    <Td>{item.updated_at}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>
        </Box>
      )}

      {EditisOpen && (
        <UpdatePaymentGetways
          isOpen={EditisOpen}
          onClose={EditonClose}
          data={selectedData}
        />
      )}
    </Box>
  );
}

const IsActive = ({ id, isActive }) => {
  const toast = useToast();
  const queryClient = useQueryClient();
  const handleActive = async (id, active) => {
    let data = { id, is_active: active };
    try {
      const res = await UPDATE(admin.token, "update_payment_gateway", data);
      if (res.response === 200) {
        return res;
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
    onSuccess: () => {
      ShowToast(toast, "success", "Cổng thanh toán đã được cập nhật!");
      queryClient.invalidateQueries("payment-getways");
    },
  });

  return (
    <FormControl display="flex" alignItems="center">
      <Switch
        isChecked={isActive === 1}
        size={"sm"}
        onChange={(e) => {
          let active = e.target.checked ? 1 : 0;
          mutation.mutate({ id, active });
        }}
      />
    </FormControl>
  );
};

export default PaymentGetways;

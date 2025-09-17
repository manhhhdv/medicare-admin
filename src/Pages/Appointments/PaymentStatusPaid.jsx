/* eslint-disable react-hooks/rules-of-hooks */
import Loading from "../../Components/Loading";
import { UPDATE } from "../../Controllers/ApiControllers";
import ShowToast from "../../Controllers/ShowToast";
import admin from "../../Controllers/admin";

/* eslint-disable react/prop-types */
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Divider,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Flex,
  useColorModeValue,
  useToast,
} from "@chakra-ui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ChevronDownIcon } from "lucide-react";
import { useState } from "react";
import { FaCreditCard, FaMoneyBillAlt } from "react-icons/fa";
import { HiCurrencyRupee } from "react-icons/hi";
import { MdOnlinePrediction } from "react-icons/md";

const paymentModes = [
  {
    id: 1,
    name: "Tiền mặt",
    icon: <FaMoneyBillAlt />,
  },
  {
    id: 2,
    name: "Thanh toán trực tuyến",
    icon: <MdOnlinePrediction />,
  },
  {
    id: 3,
    name: "Khác",
    icon: <MdOnlinePrediction />,
  },
  {
    id: 4,
    name: "Ví điện tử",
    icon: <FaCreditCard />, // Assuming wallet uses a similar icon to credit/debit cards
  },
  {
    id: 5,
    name: "Chuyển khoản/QR",
    icon: <HiCurrencyRupee />,
  },
];

const handlePaymetToPaid = async (data) => {
  const res = await UPDATE(admin.token, "update_appointment_to_paid", data);
  if (res.response !== 200) {
    throw new Error(res.message);
  }
  return res;
};
export default function PaymentStatusPaid({ id, isOpen, onClose }) {
  const [paymentMode, setpaymentMode] = useState();
  const toast = useToast();
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async () => {
      let data = {
        appointment_id: id,
        payment_method: paymentMode.name,
      };

      if (!paymentMode) {
        ShowToast(toast, "error", "Vui lòng chọn hình thức thanh toán");
      } else {
        handlePaymetToPaid(data);
      }
    },
    onSuccess: () => {
      ShowToast(toast, "success", "Success");
      queryClient.invalidateQueries("appointments");
      queryClient.invalidateQueries(["appointment", id]);
      queryClient.invalidateQueries(["payment", id]);
      queryClient.invalidateQueries(["transaction", id]);
      queryClient.invalidateQueries(["invoice", id]);
      onClose();
    },
  });

  if (mutation.isPending) return <Loading />;
  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered size={"sm"}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader fontSize={"md"} py={3}>
          Số tiền thanh toán
        </ModalHeader>
        <ModalCloseButton top={2} />
        <Divider mt={0} />
        <ModalBody>
          <Menu>
            <MenuButton
              as={Button}
              rightIcon={<ChevronDownIcon />}
              w={"full"}
              bg={"transparent"}
              textAlign={"center"}
              pl={0}
              pt={0}
              h={8}
              _hover={{
                bg: "transparent",
              }}
              _focus={{
                bg: "transparent",
              }}
              borderBottom={"1px solid"}
              borderBottomRadius={0}
              borderColor={useColorModeValue("gray.200", "gray.600")}
            >
              {paymentMode ? (
                <Flex gap={3} align={"center"}>
                  {" "}
                  {paymentMode.icon} {paymentMode.name}
                </Flex>
              ) : (
                "Chọn hình thức thanh toán"
              )}
            </MenuButton>
            <MenuList>
              {paymentModes.map((item) => (
                <MenuItem
                  key={item.id}
                  onClick={() => {
                    setpaymentMode(item);
                  }}
                >
                  <Flex gap={3} align={"center"}>
                    {" "}
                    {item.icon} {item.name}
                  </Flex>
                </MenuItem>
              ))}
            </MenuList>
          </Menu>
        </ModalBody>

        <ModalFooter>
          <Button colorScheme="gray" mr={3} onClick={onClose} size={"sm"}>
            Đóng
          </Button>
          <Button
            colorScheme={"blue"}
            size={"sm"}
            onClick={() => {
              mutation.mutate();
            }}
          >
            Đặt số tiền thanh toán
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

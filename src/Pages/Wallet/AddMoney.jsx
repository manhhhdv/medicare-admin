/* eslint-disable react/prop-types */
import NotAuth from "../../Components/NotAuth";
import { ADD } from "../../Controllers/ApiControllers";
import showToast from "../../Controllers/ShowToast";
import admin from "../../Controllers/admin";
import useHasPermission from "../../Hooks/HasPermission";
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
  FormControl,
  FormLabel,
  Input,
  Textarea,
  useToast,
  Box,
  Text,
  Select,
} from "@chakra-ui/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";

const addMoney = async (data) => {
  const res = await ADD(admin.token, "add_wallet_money", data);
  if (res.response !== 200) {
    throw new Error(res.message);
  }
  return res;
};

export default function AddMony({ isOpen, onClose, userID }) {
  const { hasPermission } = useHasPermission();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const toast = useToast();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (data) => {
      await addMoney(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries("Wallet", userID);
      showToast(toast, "success", "Thành công!");
      onClose(); // Optionally close the modal on success
    },
    onError: (error) => {
      showToast(toast, "error", error.message);
    },
  });

  const onSubmit = (data) => {
    let formData = {
      user_id: userID,
      amount: data.amount,
      payment_transaction_id: "admin_wallet_recharge",
      payment_method: data.payment_method,
      transaction_type: "Credited",
      description: data.description || "Số tiền được ghi có vào ví người dùng",
    };
    mutation.mutate(formData);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay />
      <ModalContent as={"form"} onSubmit={handleSubmit(onSubmit)}>
        <ModalHeader fontSize={"md"}>
          Nạp tiền vào ví cho người dùng ID #{userID}
        </ModalHeader>
        <ModalCloseButton top={3} />
        <Divider />
        <ModalBody>
          <Box>
            {hasPermission("WALLET_ADD") ? (
              <>
                {" "}
                <FormControl isRequired>
                  <FormLabel fontSize="sm">Số tiền</FormLabel>
                  <Input
                    size="md"
                    name="amount"
                    type="number"
                    {...register("amount", {
                      required: "Số tiền là bắt buộc",
                      valueAsNumber: true,
                      min: { value: 1, message: "Số tiền phải ít nhất là 1" },
                    })}
                    placeholder="Nhập số tiền"
                  />
                  {errors.amount && (
                    <Text color="red.500">{errors.amount.message}</Text>
                  )}
                </FormControl>
                <FormControl isRequired mt={3}>
                  <FormLabel fontSize="sm">Phương thức thanh toán</FormLabel>
                  <Select
                    size="md"
                    name="payment_method"
                    {...register("payment_method", {
                      required: "Phương thức thanh toán là bắt buộc",
                    })}
                    placeholder="Chọn phương thức thanh toán"
                  >
                    <option value="Online">Trực tuyến</option>
                    <option value="Cash">Tiền mặt</option>
                    <option value="Card">Thẻ</option>
                    <option value="UPI">UPI</option>
                  </Select>
                  {errors.payment_method && (
                    <Text color="red.500">{errors.payment_method.message}</Text>
                  )}
                </FormControl>
                <FormControl mt={3}>
                  <FormLabel fontSize="sm">Mô tả</FormLabel>
                  <Textarea
                    size="md"
                    name="description"
                    {...register("description")}
                    placeholder="Nhập mô tả (ví dụ: Số tiền được ghi có vào ví người dùng)"
                  />
                </FormControl>
              </>
            ) : (
              <NotAuth />
            )}
          </Box>
        </ModalBody>

        <ModalFooter>
          <Button colorScheme="gray" mr={3} onClick={onClose} size={"sm"}>
            Đóng
          </Button>
          <Button
            colorScheme={"blue"}
            size={"sm"}
            w={32}
            type="submit"
            isLoading={mutation.isPending}
          >
            Thêm
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

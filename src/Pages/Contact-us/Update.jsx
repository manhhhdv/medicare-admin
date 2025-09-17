/* eslint-disable react/prop-types */
import {
  Box,
  Button,
  Divider,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
} from "@chakra-ui/react";
import moment from "moment";

export default function UpdateDepartmentModel({ isOpen, onClose, data }) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      isCentered
      size={"lg"}
      scrollBehavior="inside"
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader fontSize={18} py={2}>
          Liên hệ - {data?.name}
        </ModalHeader>
        <ModalCloseButton />
        <Divider />
        <ModalBody>
          <Box pb={3}>
            <Text fontSize="lg" fontWeight="bold">
              Yêu cầu liên hệ
            </Text>
            <Text>
              <strong>Tên:</strong> {data?.name}
            </Text>
            <Text>
              <strong>Email:</strong> {data?.email}
            </Text>
            <Text>
              <strong>Chủ đề:</strong> {data?.subject}
            </Text>
            <Text>
              <strong>Tin nhắn:</strong> {data?.message}
            </Text>
            <Text mt={2} fontSize="sm" color="gray.500">
              <strong>Tạo lúc:</strong>{" "}
              {moment(data?.created_at).format("DD MMM YY HH:MM A")}
            </Text>
          </Box>
        </ModalBody>
        <Divider />
        <ModalFooter py={3}>
          <Button colorScheme="gray" mr={3} onClick={onClose} size={"sm"}>
            Đóng
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

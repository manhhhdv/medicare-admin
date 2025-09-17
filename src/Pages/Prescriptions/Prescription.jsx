import { GET } from "../../Controllers/ApiControllers";
import admin from "../../Controllers/admin";
import api from "../../Controllers/api";
import imageBaseURL from "../../Controllers/image";
import useHasPermission from "../../Hooks/HasPermission";
import useSearchFilter from "../../Hooks/UseSearchFilter";
import DeletePrescription from "./DeletePrescription";

/* eslint-disable react/prop-types */
import {
  Box,
  Button,
  Flex,
  IconButton,
  Input,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Text,
  Skeleton,
  Link,
  useDisclosure,
} from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { SearchIcon } from "lucide-react";
import { useState } from "react";
import { AiFillEye } from "react-icons/ai";
import { BiPrinter } from "react-icons/bi";
import { BiTrash } from "react-icons/bi";
import { Link as RouterLink } from "react-router-dom";

function PrescriptionByAppID({ appointmentID, appointmntData }) {
  const { hasPermission } = useHasPermission();
  const [selectedData, setselectedData] = useState();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const getData = async () => {
    const res = await GET(
      admin.token,
      `get_prescription?appointment_id=${appointmentID}`
    );

    return res.data;
  };

  const { isLoading, data, error } = useQuery({
    queryKey: ["prescriptions", appointmentID],
    queryFn: getData,
  });

  const { handleSearchChange, filteredData } = useSearchFilter(data);
  if (error) {
    return <Text color="red.500">Lỗi tải dữ liệu</Text>;
  }

  const printPdf = (pdfUrl) => {
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

  return (
    <Box>
      {isLoading ? (
        <Box>
          <Flex mb={5} justify={"space-between"}>
            <Skeleton w={400} h={8} />
            <Skeleton w={200} h={8} />
          </Flex>
          <Skeleton h={10} w={"100%"} mt={2} />
          <Skeleton h={10} w={"100%"} mt={2} />
          <Skeleton h={10} w={"100%"} mt={2} />
          <Skeleton h={10} w={"100%"} mt={2} />
          <Skeleton h={10} w={"100%"} mt={2} />
          <Skeleton h={10} w={"100%"} mt={2} />
          <Skeleton h={10} w={"100%"} mt={2} />
          <Skeleton h={10} w={"100%"} mt={2} />
          <Skeleton h={10} w={"100%"} mt={2} />
          <Skeleton h={10} w={"100%"} mt={2} />
        </Box>
      ) : (
        <Box p={5}>
          <Flex mb={4} alignItems="center" justify={"space-between"}>
            <Input
              placeholder="Tìm kiếm"
              width="300px"
              mr={2}
              icon={<SearchIcon />}
              onChange={(e) => handleSearchChange(e.target.value)}
              size={"sm"}
            />

            {hasPermission("PRESCRIPTION_ADD") && (
              <Button
                colorScheme="blue"
                size={"sm"}
                as={RouterLink}
                to={`/add-prescription/?appointmentID=${appointmentID}&patientID=${appointmntData?.patient_id}`}
              >
                Đơn thuốc mới
              </Button>
            )}
          </Flex>
          <Box
            borderWidth="1px"
            borderRadius="lg"
            overflow="scroll"
            maxW={"100%"}
          >
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Bệnh nhân</Th>
                  <Th>Bác sĩ</Th>
                  <Th>Ngày</Th>
                  <Th>Nhịp tim</Th>
                  <Th>Nhiệt độ</Th>
                  <Th>Hành động</Th>
                </Tr>
              </Thead>
              <Tbody>
                {data.length > 0 ? (
                  filteredData.map((prescription) => (
                    <Tr key={prescription.id}>
                      <Td>{`${prescription.patient_f_name} ${prescription.patient_l_name}`}</Td>
                      <Td>{`${appointmntData.doct_f_name} ${appointmntData.doct_l_name}`}</Td>
                      <Td>{prescription.date}</Td>
                      <Td>{prescription.pulse_rate}</Td>
                      <Td>{prescription.temperature}</Td>

                      <Td>
                        <Flex alignItems={"center"}>
                          {" "}
                          <IconButton
                            as={Link}
                            aria-label="In"
                            icon={<BiPrinter fontSize={22} />}
                            colorScheme="whatsapp"
                            size={"sm"}
                            variant={"ghost"}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => {
                              if (prescription.pdf_file) {
                                printPdf(
                                  `${imageBaseURL}/${prescription.pdf_file}`
                                );
                              } else {
                                printPdf(
                                  `${api}/prescription/generatePDF/${prescription.id}`
                                );
                              }
                            }}
                          />
                          {hasPermission("PRESCRIPTION_UPDATE") && (
                            <IconButton
                              as={RouterLink}
                              aria-label="Xem"
                              icon={<AiFillEye fontSize={24} />}
                              colorScheme="blue"
                              size={"sm"}
                              variant={"ghost"}
                              to={`/prescription/${prescription?.id}/?appointmentID=${prescription?.appointment_id}&patientID=${prescription?.patient_id}`}
                            />
                          )}
                          <IconButton
                            aria-label="Xóa"
                            icon={<BiTrash fontSize={20} />}
                            colorScheme="red"
                            size={"sm"}
                            variant={"ghost"}
                            onClick={() => {
                              onOpen();
                              setselectedData(prescription);
                            }}
                          />{" "}
                        </Flex>
                      </Td>
                    </Tr>
                  ))
                ) : (
                  <Tr>
                    <Td colSpan="7">
                      <Text align="center">Không có dữ liệu trong bảng</Text>
                    </Td>
                  </Tr>
                )}
              </Tbody>
            </Table>
          </Box>
        </Box>
      )}

      {isOpen && (
        <DeletePrescription
          isOpen={isOpen}
          onClose={onClose}
          data={selectedData}
        />
      )}
    </Box>
  );
}

export default PrescriptionByAppID;

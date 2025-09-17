/* eslint-disable react-hooks/rules-of-hooks */
import DateRangeCalender from "../../Components/DateRangeCalender";
import NotAuth from "../../Components/NotAuth";
import Pagination from "../../Components/Pagination";
import { useSelectedClinic } from "../../Context/SelectedClinic";
import { GET } from "../../Controllers/ApiControllers";
import admin from "../../Controllers/admin";
import api from "../../Controllers/api";
import imageBaseURL from "../../Controllers/image";
import useHasPermission from "../../Hooks/HasPermission";
import DeletePrescription from "./DeletePrescription";
import useDebounce from "@/Hooks/useDebounce.jsx";
import {
  Box,
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
  useColorModeValue,
  theme,
  useDisclosure,
} from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { SearchIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { AiFillEye } from "react-icons/ai";
import { BiPrinter } from "react-icons/bi";
import { FaTrash } from "react-icons/fa";
import { Link as RouterLink } from "react-router-dom";

// Helper function to calculate pagination indices
const getPageIndices = (currentPage, itemsPerPage) => {
  const startIndex = (currentPage - 1) * itemsPerPage;
  let endIndex = startIndex + itemsPerPage - 1;
  return { startIndex, endIndex };
};

function AllPrescription() {
  const { hasPermission } = useHasPermission();
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 1000);
  const [dateRange, setDateRange] = useState({
    startDate: null,
    endDate: null,
  });
  const { startIndex, endIndex } = getPageIndices(page, 50); // 10 items per page
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedData, setSelectedData] = useState();
  const { selectedClinic } = useSelectedClinic();

  const getData = async () => {
    const res = await GET(
      admin.token,
      `get_prescription?start=${startIndex}&end=${endIndex}&search=${debouncedSearchQuery}&start_date=${
        dateRange.startDate || ""
      }&end_date=${dateRange.endDate || ""}&clinic_id=${
        selectedClinic?.id || ""
      }&doctor_id=${admin.role.name === "Doctor" ? admin.id : ""}`
    );
    return {
      data: res.data,
      total_record: res.total_record,
    };
  };

  const { isLoading, data, error } = useQuery({
    queryKey: [
      "prescriptions",
      page,
      debouncedSearchQuery,
      dateRange,
      selectedClinic,
    ],
    queryFn: getData,
  });

  const totalPage = Math.ceil(data?.total_record / 50); // Adjusted based on items per page

  useEffect(() => {
    if (data) {
      setPage(1); // Reset to first page when data changes
    }
  }, [data]);

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

  if (!hasPermission("PRESCRIPTION_VIEW")) return <NotAuth />;

  return (
    <Box>
      {isLoading ? (
        <Box>
          <Skeleton w={400} h={8} />
          <Skeleton h={300} w={"100%"} />
        </Box>
      ) : (
        <Box>
          <Flex mb={4} alignItems="center" justify={"space-between"}>
            <Flex align={"center"} gap={4}>
              {" "}
              <Input
                placeholder="Tìm kiếm"
                w={400}
                maxW={"50vw"}
                mr={2}
                icon={<SearchIcon />}
                onChange={(e) => setSearchQuery(e.target.value)}
                size={"md"}
              />
              <DateRangeCalender
                dateRange={dateRange}
                setDateRange={setDateRange}
                size={"md"}
              />
            </Flex>
          </Flex>
          <Box
            borderWidth="1px"
            borderRadius="lg"
            overflow="scroll"
            maxW={"100%"}
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
                  <Th padding={2}>ID</Th>
                  <Th padding={2}>Mã lịch hẹn</Th>
                  <Th padding={2}>Bệnh nhân</Th>
                  <Th padding={2}>Bác sĩ</Th>
                  <Th padding={2}>Ngày</Th>
                  <Th padding={2}>Nhịp tim</Th>
                  <Th padding={2}>Nhiệt độ</Th>
                  <Th padding={2} textAlign={"center"}>
                    Hành động
                  </Th>
                </Tr>
              </Thead>
              <Tbody>
                {data?.data.length > 0 ? (
                  data?.data.map((prescription) => (
                    <Tr key={prescription.id}>
                      <Td py={3} px={2}>
                        {prescription.id}
                      </Td>
                      <Td py={3} px={2}>
                        {prescription.appointment_id}
                      </Td>
                      <Td
                        py={3}
                        px={2}
                      >{`${prescription.patient_f_name} ${prescription.patient_l_name}`}</Td>
                      <Td
                        py={3}
                        px={2}
                      >{`${prescription.doctor_f_name} ${prescription.doctor_l_name}`}</Td>
                      <Td py={3} px={2}>
                        {prescription.date}
                      </Td>
                      <Td py={3} px={2}>
                        {prescription.pulse_rate}
                      </Td>
                      <Td py={3} px={2}>
                        {prescription.temperature}
                      </Td>
                      <Td py={3} px={2} maxW={10}>
                        <Flex alignItems={"center"} justifyContent={"center"}>
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
                              to={`/prescription/${prescription?.id}?appointmentID=${prescription?.appointment_id}&patientID=${prescription?.patient_id}`}
                            />
                          )}
                          {hasPermission("PRESCRIPTION_DELETE") && (
                            <IconButton
                              size={"sm"}
                              variant={"ghost"}
                              _hover={{ background: "none" }}
                              onClick={() => {
                                onOpen();
                                setSelectedData(prescription);
                              }}
                              icon={
                                <FaTrash
                                  fontSize={18}
                                  color={theme.colors.red[500]}
                                />
                              }
                            />
                          )}
                        </Flex>
                      </Td>
                    </Tr>
                  ))
                ) : (
                  <Tr>
                    <Td colSpan="8">
                      <Text align="center">Không có dữ liệu trong bảng</Text>
                    </Td>
                  </Tr>
                )}
              </Tbody>
            </Table>
          </Box>
        </Box>
      )}

      <Flex justify={"center"} mt={4}>
        <Pagination
          currentPage={page}
          onPageChange={setPage}
          totalPages={totalPage}
        />
      </Flex>

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

export default AllPrescription;

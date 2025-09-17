/* eslint-disable react/prop-types */
import DynamicTable from "../../Components/DataTable";
import ErrorPage from "../../Components/ErrorPage";
import NotAuth from "../../Components/NotAuth";
import Pagination from "../../Components/Pagination";
import { GET } from "../../Controllers/ApiControllers";
import admin from "../../Controllers/admin";
import getCancellationStatusBadge from "../../Hooks/CancellationReqBadge";
import useHasPermission from "../../Hooks/HasPermission";
import getStatusBadge from "../../Hooks/StatusBadge";
import AddNewAppointment from "../Appointments/AddNewAppointment";
import useDebounce from "@/Hooks/useDebounce.jsx";
import {
  Badge,
  Box,
  Button,
  Checkbox,
  CheckboxGroup,
  Flex,
  IconButton,
  Input,
  Skeleton,
  theme,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { FiEdit } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const getPageIndices = (currentPage, itemsPerPage) => {
  const startIndex = (currentPage - 1) * itemsPerPage;
  let endIndex = startIndex + itemsPerPage - 1;
  return { startIndex, endIndex };
};

export default function DoctAppointments({ doctID }) {
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const id = "Errortoast";
  const [page, setPage] = useState(1);
  const boxRef = useRef(null);
  const [searchQuery, setsearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 1000);
  const [statusFilters, setStatusFilters] = useState([]); // Track status filters
  const { startIndex, endIndex } = getPageIndices(page, 50);
  const { hasPermission } = useHasPermission();

  const handleStatusChange = (selectedStatuses) => {
    setStatusFilters(selectedStatuses); // Update the state when checkboxes change
  };

  const getData = async () => {
    const url = `get_appointments?doctor_id=${doctID}&start=${startIndex}&end=${endIndex}`;
    const res = await GET(admin.token, url);
    const rearrangedArray = res?.data.map((item) => {
      const {
        id,
        status,
        date,
        time_slots,
        type,
        payment_status,
        current_cancel_req_status,
        patient_f_name,
        patient_l_name,
        patient_phone,
        doct_f_name,
        doct_l_name,
        doct_image,
        source,
      } = item;

      return {
        id: id,
        image: doct_image,
        Doctor: `${doct_f_name} ${doct_l_name}`,
        Patient: `${patient_f_name} ${patient_l_name}`,
        phone: patient_phone,
        Status: getStatusBadge(status),
        Date: date,
        "Time Slots": time_slots,
        Type:
          type === "Emergency" ? (
            <Badge colorScheme="red">Khẩn cấp</Badge>
          ) : (
            <Badge colorScheme="green">{type}</Badge>
          ),
        "Trạng thái thanh toán":
          payment_status === "Paid" ? (
            <Badge colorScheme="green">Đã thanh toán</Badge>
          ) : payment_status === "Refunded" ? (
            <Badge colorScheme="blue">Đã hoàn tiền</Badge>
          ) : (
            <Badge colorScheme="red">Chưa thanh toán</Badge>
          ),
        "Trạng thái hủy": getCancellationStatusBadge(
          current_cancel_req_status
        ),
        "Nguồn": source,
        status: status, // Add status field for filtering
        filterStatus: status,
        current_cancel_req_status: current_cancel_req_status,
      };
    });

    // Filter based on selected statuses
    const filteredData = statusFilters.length
      ? rearrangedArray.filter((item) => {
          return (
            statusFilters.includes(item.filterStatus) ||
            (statusFilters.includes("Cancellation") &&
              item.current_cancel_req_status !== null)
          );
        })
      : rearrangedArray;

    return {
      data: filteredData.sort((a, b) => b.id - a.id),
      total_record: res.total_record,
    };
  };

  const { isLoading, data, error } = useQuery({
    queryKey: [
      "appointments",
      page,
      debouncedSearchQuery,
      statusFilters,
      doctID,
    ],
    queryFn: getData,
  });

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };
  const totalPage = Math.ceil(data?.total_record / 50);

  useEffect(() => {
    if (boxRef.current) {
      boxRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [page]);

  if (error) {
    if (!toast.isActive(id)) {
      toast({
        id,
        title: "Rất tiếc!",
        description: "Đã xảy ra lỗi.",
        status: "error",
        duration: 2000,
        isClosable: true,
        position: "top",
      });
    }
    return <ErrorPage errorCode={error.name} />;
  }

  if (!hasPermission("APPOINTMENT_VIEW")) return <NotAuth />;

  return (
    <Box ref={boxRef} mt={5}>
      {isLoading || !data ? (
        <Box>
          <Flex mb={5} justify={"space-between"}>
            <Skeleton w={400} h={8} />
            <Skeleton w={200} h={8} />
          </Flex>
          {/* Loading skeletons */}
          {[...Array(10)].map((_, index) => (
            <Skeleton key={index} h={10} w={"100%"} mt={2} />
          ))}
        </Box>
      ) : (
        <Box>
          <Flex mb={5} justify={"space-between"} align={"center"}>
            <Input
              size={"md"}
              placeholder="Tìm kiếm"
              w={400}
              maxW={"50vw"}
              onChange={(e) => setsearchQuery(e.target.value)}
              value={searchQuery}
            />
            <Box>
              <Button
                size={"sm"}
                colorScheme="blue"
                onClick={() => {
                  onOpen();
                }}
              >
                Thêm mới
              </Button>
            </Box>
          </Flex>

          {/* Status checkboxes */}
          <CheckboxGroup
            colorScheme="blue"
            onChange={handleStatusChange}
            value={statusFilters}
          >
            <Flex mb={5} gap={4}>
              <Checkbox value="Confirmed">Đã xác nhận</Checkbox>
              <Checkbox value="Visited">Đã đến khám</Checkbox>
              <Checkbox value="Completed">Đã hoàn thành</Checkbox>
              <Checkbox value="Pending">Đang chờ xử lý</Checkbox>
              <Checkbox value="Cancelled">Đã hủy</Checkbox>
              <Checkbox value="Rejected">Đã từ chối</Checkbox>
              <Checkbox value="Cancellation">Yêu cầu hủy</Checkbox>
            </Flex>
          </CheckboxGroup>

          <DynamicTable
            minPad={"10px 10px"}
            data={data?.data}
            onActionClick={
              <YourActionButton onClick={() => {}} navigate={navigate} />
            }
          />
        </Box>
      )}

      <Flex justify={"center"} mt={4}>
        <Pagination
          currentPage={page}
          onPageChange={handlePageChange}
          totalPages={totalPage}
        />
      </Flex>

      {/* Add New Appointment */}
      {isOpen && <AddNewAppointment isOpen={isOpen} onClose={onClose} />}
    </Box>
  );
}

const YourActionButton = ({ onClick, rowData, navigate }) => {
  const { hasPermission } = useHasPermission();
  return (
    <Flex justify={"center"}>
      <IconButton
        isdisabled={!hasPermission("APPOINTMENT_UPDATE")}
        size={"sm"}
        variant={"ghost"}
        _hover={{ background: "none" }}
        onClick={() => {
          onClick(rowData);
          navigate(`/appointment/${rowData.id}`);
        }}
        icon={<FiEdit fontSize={18} color={theme.colors.blue[500]} />}
      />
    </Flex>
  );
};

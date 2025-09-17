/* eslint-disable react/prop-types */
import DynamicTable from "../../Components/DataTable";
import DateRangeCalender from "../../Components/DateRangeCalender";
import NotAuth from "../../Components/NotAuth";
import Pagination from "../../Components/Pagination";
import { useSelectedClinic } from "../../Context/SelectedClinic";
import { GET } from "../../Controllers/ApiControllers";
import admin from "../../Controllers/admin";
import useHasPermission from "../../Hooks/HasPermission";
import useDebounce from "@/Hooks/useDebounce.jsx";
import {
  Badge,
  Box,
  Flex,
  IconButton,
  Input,
  Skeleton,
  useToast,
} from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import moment from "moment";
import { useEffect, useRef, useState } from "react";
import { FiEdit } from "react-icons/fi";
import { Link } from "react-router-dom";

const txnBadge = (txn) => {
  switch (txn) {
    case "Credited":
      return (
        <Badge
          colorScheme="green"
          fontSize={12}
          letterSpacing={0.5}
          p={"5px"}
          size={"sm"}
        >
          Đã ghi có
        </Badge>
      );
    case "Debited":
      return (
        <Badge colorScheme="red" fontSize={12} letterSpacing={0.5} p={"5px"}>
          Đã ghi nợ
        </Badge>
      );
    default:
      return (
        <Badge colorScheme="yellow" fontSize={12} letterSpacing={0.5} p={"5px"}>
          Không áp dụng
        </Badge>
      );
  }
};
export default function Transactions() {
  return (
    <>
      <AllTransactions />
    </>
  );
}

const getPageIndices = (currentPage, itemsPerPage) => {
  const startIndex = (currentPage - 1) * itemsPerPage;
  let endIndex = startIndex + itemsPerPage - 1;
  return { startIndex, endIndex };
};

function AllTransactions() {
  const { hasPermission } = useHasPermission();
  const [page, setPage] = useState(1);
  const boxRef = useRef(null);
  const [searchQuery, setsearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 1000);
  const toast = useToast();
  const id = "Errortoast";
  const [dateRange, setdateRange] = useState({
    startDate: null,
    endDate: null,
  });

  const { selectedClinic } = useSelectedClinic();

  const getData = async () => {
    const { startIndex, endIndex } = getPageIndices(page, 50);
    const url = `get_all_transaction?start=${startIndex}&end=${endIndex}&search=${debouncedSearchQuery}&start_date=${
      dateRange.startDate || ""
    }&end_date=${dateRange.endDate || ""}&doctor_id=${
      admin.role.name === "Doctor" ? admin.id : ""
    }&clinic_id=${selectedClinic?.id || ""}`;
    const res = await GET(admin.token, url);
    const rearrangedTransactions = res?.data.map((transaction) => {
      const {
        id,
        user_id,
        patient_id,
        appointment_id,
        payment_transaction_id,
        amount,
        transaction_type,
        is_wallet_txn,
        notes,
        created_at,
        patient_f_name,
        patient_l_name,
        user_f_name,
        user_l_name,
      } = transaction;

      return {
        id,
        patient: patient_id ? (
          <Link to={`/patient/${patient_id}`}>
            {`${patient_f_name} ${patient_l_name}`}
          </Link>
        ) : (
          "N/A"
        ),
        user: user_id ? (
          <Link to={`/user/${user_id}`}>{`${user_f_name} ${user_l_name}`}</Link>
        ) : (
          "N/A"
        ),
        "app ID": (
          <Link to={`/appointment/${appointment_id}`}>{appointment_id}</Link>
        ),
        "txn ID": payment_transaction_id || "N/A",
        amount,
        "txn type": txnBadge(transaction_type),
        "wallet Txn": is_wallet_txn == 1 ? "Yes" : "No",
        notes: notes || "N/A",
        createdAt: moment(created_at).format("D MMM YY hh:mmA"),
      };
    });
    return {
      data: rearrangedTransactions,
      total_record: res.total_record,
    };
  };

  const { isLoading, data, error } = useQuery({
    queryKey: [
      "transactions",
      page,
      debouncedSearchQuery,
      dateRange,
      selectedClinic,
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
        title: "Lỗi!",
        description: "Đã có lỗi xảy ra.",
        status: "error",
        duration: 2000,
        isClosable: true,
        position: "top",
      });
    }
  }

  if (!hasPermission("ALL_TRANSACTION_VIEW")) return <NotAuth />;

  return (
    <Box ref={boxRef}>
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
          <Flex mb={5} justify={"space-between"} align={"center"}>
            <Flex align={"center"} gap={4}>
              <Input
                size={"md"}
                placeholder="Tìm kiếm"
                w={400}
                maxW={"50vw"}
                onChange={(e) => setsearchQuery(e.target.value)}
                value={searchQuery}
              />
              <DateRangeCalender
                dateRange={dateRange}
                setDateRange={setdateRange}
                size={"md"}
              />
            </Flex>
          </Flex>
          <DynamicTable
            data={data?.data}
            onActionClick={<YourActionButton />}
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
    </Box>
  );
}

const YourActionButton = ({ onClick, rowData }) => {
  return (
    <Flex justify={"center"}>
      <IconButton
        size={"sm"}
        variant={"ghost"}
        _hover={{
          background: "none",
        }}
        onClick={() => {
          onClick(rowData);
        }}
        icon={<FiEdit fontSize={18} color={"blue.500"} />}
        aria-label="Chỉnh sửa giao dịch"
      />
    </Flex>
  );
};

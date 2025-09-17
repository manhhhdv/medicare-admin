/* eslint-disable react/prop-types */
import DynamicTable from "../../Components/DataTable";
import DateRangeCalender from "../../Components/DateRangeCalender";
import NotAuth from "../../Components/NotAuth";
import Pagination from "../../Components/Pagination";
import { useSelectedClinic } from "../../Context/SelectedClinic";
import { GET } from "../../Controllers/ApiControllers";
import admin from "../../Controllers/admin";
import api from "../../Controllers/api";
import printPDF from "../../Controllers/printPDF";
import useHasPermission from "../../Hooks/HasPermission";
import useDebounce from "@/Hooks/useDebounce.jsx";
import {
  Box,
  Flex,
  IconButton,
  Input,
  Skeleton,
  theme,
  useToast,
} from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import moment from "moment";
import { useEffect, useRef, useState } from "react";
import { TbDownload } from "react-icons/tb";
import { Link } from "react-router-dom";

const getPageIndices = (currentPage, itemsPerPage) => {
  const startIndex = (currentPage - 1) * itemsPerPage;
  let endIndex = startIndex + itemsPerPage - 1;
  return { startIndex, endIndex };
};

export default function AppointmentPayments() {
  const { hasPermission } = useHasPermission();
  const [SelectedData, setSelectedData] = useState();
  const [page, setPage] = useState(1);
  const boxRef = useRef(null);
  const [searchQuery, setsearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 1000);
  const [dateRange, setdateRange] = useState({
    startDate: null,
    endDate: null,
  });
  const toast = useToast();
  const id = "Errortoast";
  const { selectedClinic } = useSelectedClinic();

  const getData = async () => {
    const { startIndex, endIndex } = getPageIndices(page, 50);
    const url = `get_appointment_payment?start=${startIndex}&end=${endIndex}&search=${debouncedSearchQuery}&start_date=${
      dateRange.startDate || ""
    }&end_date=${dateRange.endDate || ""}&doctor_id=${
      admin.role.name === "Doctor" ? admin.id : ""
    }&clinic_id=${selectedClinic?.id || ""}`;
    const res = await GET(admin.token, url);

    const rearrangedTransactions = res?.data.map((transaction) => {
      const {
        id,
        txn_id,
        invoice_id,
        amount,
        payment_time_stamp,
        payment_method,
        created_at,
        user_id,
        patient_id,
        appointment_id,
        patient_f_name,
        patient_l_name,
        user_f_name,
        user_l_name,
      } = transaction;

      return {
        id,
        "txn ID": txn_id,
        invoiceID: invoice_id,
        patient: patient_f_name ? (
          <Link to={`/patient/${patient_id}`}>
            {`${patient_f_name} ${patient_l_name}`}
          </Link>
        ) : (
          "N/A"
        ),
        user: user_f_name ? (
          <Link to={`/user/${user_id}`}>{`${user_f_name} ${user_l_name}`}</Link>
        ) : (
          "N/A"
        ),
        "APP ID": (
          <Link to={`/appointment/${appointment_id}`}>{appointment_id}</Link>
        ),
        amount,
        "payment Method": payment_method,
        "payment Time stamp":
          moment(payment_time_stamp).format("D MMM YY hh.mmA"),
        "created At": moment(created_at).format("D MMM YY hh:mmA"),
      };
    });

    return {
      data: rearrangedTransactions,
      total_record: res.total_record,
    };
  };

  const handleActionClick = (rowData) => {
    setSelectedData(rowData);
  };

  const { isLoading, data, error } = useQuery({
    queryKey: [
      "appointment-payments",
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
        title: "Ôi!.",
        description: "Có lỗi xảy ra.",
        status: "error",
        duration: 2000,
        isClosable: true,
        position: "top",
      });
    }
  }

  if (!hasPermission("APPOINTMENT_PAYMENTS_VIEW")) return <NotAuth />;

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
          <Flex mb={5} justify={"space-between"} align={"center"}>
            <Flex align={"center"} gap={4}>
              {" "}
              <Input
                size={"md"}
                placeholder="Tìm kiếm"
                w={400}
                maxW={"50vw"}
                onChange={(e) => setsearchQuery(e.target.value)}
              />
              <DateRangeCalender
                dateRange={dateRange}
                setDateRange={setdateRange}
                size={"md"}
              />
            </Flex>
          </Flex>
          <DynamicTable
            data={data ? data.data : []}
            onActionClick={
              <YourActionButton
                onClick={handleActionClick}
                rowData={SelectedData}
              />
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
          printPDF(`${api}/invoice/generatePDF/${rowData.invoiceID}`);
        }}
        icon={<TbDownload fontSize={18} color={theme.colors.blue[500]} />}
      />
    </Flex>
  );
};

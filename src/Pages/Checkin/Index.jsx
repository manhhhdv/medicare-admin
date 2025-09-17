import DynamicTable from "../../Components/DataTable";
import DateRangeCalender from "../../Components/DateRangeCalender";
import NotAuth from "../../Components/NotAuth";
import Pagination from "../../Components/Pagination";
import { useSelectedClinic } from "../../Context/SelectedClinic";
import { GET } from "../../Controllers/ApiControllers";
import admin from "../../Controllers/admin";
import useHasPermission from "../../Hooks/HasPermission";
import AddCheckin from "./Add";
import DeleteCheckin from "./Delete";
import UpdateCheckin from "./Update";
import useDebounce from "@/Hooks/useDebounce.jsx";

/* eslint-disable react/prop-types */
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
} from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import moment from "moment";
import { useRef, useState } from "react";
import { BiLinkExternal } from "react-icons/bi";
import { FaTrash } from "react-icons/fa";
import { FiEdit } from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";

const getPageIndices = (currentPage, itemsPerPage) => {
  const startIndex = (currentPage - 1) * itemsPerPage;
  let endIndex = startIndex + itemsPerPage - 1;
  return { startIndex, endIndex };
};
export default function Checkin() {
  const { hasPermission } = useHasPermission();
  const [SelectedData, setSelectedData] = useState();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [page, setPage] = useState(1);
  const { startIndex, endIndex } = getPageIndices(page, 50);
  const boxRef = useRef(null);
  const [searchQuery, setsearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 1000);
  const [dateRange, setdateRange] = useState({
    startDate: null,
    endDate: null,
  });
  const { selectedClinic } = useSelectedClinic();

  const {
    isOpen: EditisOpen,
    onOpen: EditonOpen,
    onClose: EditonClose,
  } = useDisclosure();

  const {
    isOpen: DeleteisOpen,
    onOpen: DeleteonOpen,
    onClose: DeleteonClose,
  } = useDisclosure();
  const navigate = useNavigate();

  const toast = useToast();
  const id = "Errortoast";
  const getData = async () => {
    const url = `get_appointment_check_in?start=${startIndex}&end=${endIndex}&search=${debouncedSearchQuery}&start_date=${
      dateRange.startDate || ""
    }&end_date=${dateRange.endDate || ""}&doctor_id=${
      admin.role.name === "Doctor" ? admin.id : ""
    }&clinic_id=${selectedClinic?.id || ""}`;
    const res = await GET(admin.token, url);
    const rearrangedArray = res?.data.map((doctor) => {
      const {
        id,
        appointment_id,
        time,
        date,
        created_at,
        updated_at,
        doct_f_name,
        doct_l_name,
        patient_f_name,
        patient_l_name,
        clinic_id,
      } = doctor;
      return {
        id,
        clinic_id,
        app_id: (
          <Link to={`/appointment/${appointment_id}`}>
            <Flex gap={1} align={"center"}>
              {appointment_id} <BiLinkExternal />
            </Flex>
          </Link>
        ),
        doctor: `${doct_f_name} ${doct_l_name}`,
        patient: `${patient_f_name} ${patient_l_name}`,
        Date: moment(date).format("DD MMM YYYY"),
        Time: moment(time, "HH:mm:ss").format("hh:mm A"),
        created_at,
        updated_at,
      };
    });
    return { data: rearrangedArray, total_record: res.total_record };
  };

  const handleActionClick = (rowData) => {
    setSelectedData(rowData);
  };

  const { isLoading, data, error } = useQuery({
    queryKey: [
      "checkins",
      page,
      debouncedSearchQuery,
      dateRange,
      selectedClinic?.id,
    ],
    queryFn: getData,
  });

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };
  const totalPage = Math.ceil(data?.total_record / 50);

  if (error) {
    if (!toast.isActive(id)) {
      toast({
        id,
        title: "Rất tiếc!.",
        description: "Có lỗi xảy ra.",
        status: "error",
        duration: 2000,
        isClosable: true,
        position: "top",
      });
    }
  }

  if (!hasPermission("CHECKIN_VIEW")) return <NotAuth />;

  return (
    <Box ref={boxRef}>
      {isLoading || !data ? (
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
        <Box>
          <Flex mb={5} justify={"space-between"} align={"center"}>
            <Flex gap={4}>
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
            <Box>
              <Flex align={"center"} gap={5}>
                {" "}
                <Button
                  size={"sm"}
                  colorScheme="blue"
                  onClick={() => {
                    const baseUrl = `${window.location.protocol}//${window.location.host}`;
                    const isDoctor = admin.role.name.toLowerCase() === "doctor";
                    const queryParams = new URLSearchParams({
                      clinic_id: selectedClinic?.id || "",
                      ...(isDoctor && { doct: admin.id }),
                      ...(isDoctor && { isSelectedDoctor: admin.id }),
                    }).toString();

                    window.open(
                      `${baseUrl}/admin/queue?${queryParams}`,
                      "_blank"
                    );
                  }}
                  rightIcon={<BiLinkExternal />}
                >
                  Hiển thị màn hình Check-in
                </Button>
                <Button
                  isDisabled={!hasPermission("CHECKIN_ADD")}
                  size={"sm"}
                  colorScheme="blue"
                  onClick={() => {
                    onOpen();
                  }}
                >
                  Check-in Mới
                </Button>
              </Flex>
            </Box>
          </Flex>
          <DynamicTable
            data={data.data}
            onActionClick={
              <YourActionButton
                onClick={handleActionClick}
                navigate={navigate}
                EditonOpen={EditonOpen}
                DeleteonOpen={DeleteonOpen}
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

      {isOpen && <AddCheckin isOpen={isOpen} onClose={onClose} />}
      {EditisOpen && (
        <UpdateCheckin
          data={SelectedData}
          isOpen={EditisOpen}
          onClose={EditonClose}
        />
      )}

      {DeleteisOpen && (
        <DeleteCheckin
          isOpen={DeleteisOpen}
          onClose={DeleteonClose}
          data={SelectedData}
        />
      )}
    </Box>
  );
}

const YourActionButton = ({ onClick, rowData, DeleteonOpen, EditonOpen }) => {
  const { hasPermission } = useHasPermission();
  return (
    <Flex justify={"center"}>
      <IconButton
        isDisabled={!hasPermission("CHECKIN_UPDATE")}
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
      <IconButton
        isDisabled={!hasPermission("CHECKIN_DELETE")}
        size={"sm"}
        variant={"ghost"}
        _hover={{
          background: "none",
        }}
        onClick={() => {
          onClick(rowData);
          DeleteonOpen();
        }}
        icon={<FaTrash fontSize={18} color={theme.colors.red[500]} />}
      />
    </Flex>
  );
};

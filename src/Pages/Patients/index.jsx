/* eslint-disable react/prop-types */
import DynamicTable from "../../Components/DataTable";
import NotAuth from "../../Components/NotAuth";
import Pagination from "../../Components/Pagination";
import { useSelectedClinic } from "../../Context/SelectedClinic";
import { GET } from "../../Controllers/ApiControllers";
import admin from "../../Controllers/admin";
import useHasPermission from "../../Hooks/HasPermission";
import AddRefer from "../Patient Refer/AddRefer";
import AddPatients from "./AddPatients";
import DeletePatient from "./DeletePatient";
import useDebounce from "@/Hooks/useDebounce.jsx";
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
import { useEffect, useRef, useState } from "react";
import { FaTrash } from "react-icons/fa";
import { FiEdit } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const ITEMS_PER_PAGE = 50;

const getPageIndices = (currentPage, itemsPerPage) => {
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage - 1;
  return { startIndex, endIndex };
};

const transformData = (data) => {
  return data?.map((item) => {
    const { id, f_name, l_name, phone, gender, dob, email, image, created_at } =
      item;
    return {
      id,
      name: `${f_name} ${l_name}`,
      phone,
      gender,
      date_Of_Birth: dob ? moment(dob).format("DD MMM YYYY") : "N/A",
      email: email || "N/A",
      image,
      created_At: moment(created_at).format("DD MMM YYYY hh:mm a"),
    };
  });
};

const Patients = () => {
  const { hasPermission } = useHasPermission();
  const [selectedData, setSelectedData] = useState(null);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 1000);
  const { startIndex, endIndex } = getPageIndices(page, ITEMS_PER_PAGE);
  const { selectedClinic } = useSelectedClinic();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: referisOpen,
    onOpen: referonOpen,
    onClose: referonClose,
  } = useDisclosure();
  const {
    isOpen: DeleteisOpen,
    onOpen: DeleteonOpen,
    onClose: DeleteonClose,
  } = useDisclosure();
  const toast = useToast();
  const navigate = useNavigate();
  const boxRef = useRef(null);

  const { isLoading, data, error } = useQuery({
    queryKey: ["patients", page, debouncedSearchQuery, selectedClinic?.id],
    queryFn: async () => {
      const res = await GET(
        admin.token,
        `get_patients?start=${startIndex}&end=${endIndex}&clinic_id=${
          selectedClinic?.id || ""
        }&search=${debouncedSearchQuery}`
      );
      return { data: res.data, totalRecord: res.total_record };
    },
  });

  const handlePageChange = (newPage) => setPage(newPage);

  useEffect(() => {
    if (boxRef.current) {
      boxRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [page]);

  useEffect(() => {
    if (error && !toast.isActive("Errortoast")) {
      toast({
        id: "Errortoast",
        title: "Ôi!",
        description: "Đã có lỗi xảy ra.",
        status: "error",
        duration: 2000,
        isClosable: true,
        position: "top",
      });
    }
  }, [error, toast]);

  const transformedData = transformData(data?.data);
  const totalPage = Math.ceil(data?.totalRecord / ITEMS_PER_PAGE);
  const handleActionClick = (rowData) => setSelectedData(rowData);

  if (!hasPermission("PATIENT_VIEW")) return <NotAuth />;

  return (
    <Box>
      {isLoading || !data ? (
        <SkeletonList />
      ) : (
        <Box>
          <Flex mb={5} justify="space-between" align="center">
            <Input
              size="md"
              placeholder="Tìm kiếm"
              w={400}
              maxW="50vw"
              onChange={(e) => setSearchQuery(e.target.value)}
            />

            <Button
              size="sm"
              colorScheme="blue"
              onClick={onOpen}
              isDisabled={!hasPermission("PATIENT_ADD")}
            >
              Thêm Mới
            </Button>
          </Flex>
          <DynamicTable
            imgLast={true}
            minPad="1px 20px"
            data={transformedData}
            onActionClick={
              <YourActionButton
                onClick={handleActionClick}
                navigate={navigate}
                rowData={selectedData}
                onOpen={referonOpen}
                DeleteonOpen={DeleteonOpen}
              />
            }
          />
        </Box>
      )}
      <Flex justify="center" mt={4}>
        <Pagination
          currentPage={page}
          onPageChange={handlePageChange}
          totalPages={totalPage}
        />
      </Flex>
      <AddPatients isOpen={isOpen} onClose={onClose} />
      {referisOpen ? (
        <AddRefer
          isOpen={referisOpen}
          onClose={referonClose}
          patient={selectedData}
        />
      ) : null}

      {DeleteisOpen && (
        <DeletePatient
          isOpen={DeleteisOpen}
          onClose={DeleteonClose}
          data={selectedData}
        />
      )}
    </Box>
  );
};

const SkeletonList = () => (
  <Box>
    <Flex mb={5} justify="space-between">
      <Skeleton w={400} h={8} />
      <Skeleton w={200} h={8} />
    </Flex>
    {Array.from({ length: 10 }).map((_, index) => (
      <Skeleton key={index} h={10} w="100%" mt={2} />
    ))}
  </Box>
);

const YourActionButton = ({
  onClick,
  rowData,
  navigate,
  onOpen,
  DeleteonOpen,
}) => {
  const { hasPermission } = useHasPermission();
  return (
    <Flex justify="center" align={"center"} gap={2}>
      <Button
        isDisabled={!hasPermission("PATIENT_UPDATE")}
        size="xs"
        onClick={() => {
          onClick(rowData);
          onOpen();
        }}
        colorScheme="orange"
      >
        Giới thiệu
      </Button>
      <IconButton
        isDisabled={!hasPermission("PATIENT_UPDATE")}
        size="sm"
        variant="ghost"
        _hover={{ background: "none" }}
        onClick={() => {
          onClick(rowData);
          navigate(`/patient/${rowData.id}`);
        }}
        icon={<FiEdit fontSize={18} color={theme.colors.blue[500]} />}
      />
      <IconButton
        isDisabled={!hasPermission("PATIENT_DELETE")}
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

export default Patients;

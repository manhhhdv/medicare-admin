/* eslint-disable react/prop-types */
import DynamicTable from "../../Components/DataTable";
import NotAuth from "../../Components/NotAuth";
import Pagination from "../../Components/Pagination";
import { GET } from "../../Controllers/ApiControllers";
import admin from "../../Controllers/admin";
import useHasPermission from "../../Hooks/HasPermission";
import AddFamily from "./Add";
import DeleteFamily from "./Delete";
import EditFamily from "./Edit";
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
    const {
      id,
      user_id,
      f_name,
      l_name,
      phone,
      gender,
      dob,
      created_at,
      user_f_name,
      user_l_name,
      user_phone,
    } = item;
    return {
      id,
      user_id,
      "Member name": `${f_name} ${l_name}`,
      "Member Phone": phone,
      "parent Name": `${user_f_name} ${user_l_name}`,
      "parent Phone": user_phone,
      gender,
      dateOfBirth: dob ? moment(dob).format("DD MMM YYYY") : "N/A",
      createdAt: moment(created_at).format("DD MMM YYYY hh:mm a"),
    };
  });
};

const FamilyMembers = () => {
  const { hasPermission } = useHasPermission();
  const [selectedData, setSelectedData] = useState(null);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 1000);
  const { startIndex, endIndex } = getPageIndices(page, ITEMS_PER_PAGE);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: DeleteisOpen,
    onOpen: DeleteonOpen,
    onClose: DeleteonClose,
  } = useDisclosure();
  const {
    isOpen: EditisOpen,
    onOpen: EditonOpen,
    onClose: EditonClose,
  } = useDisclosure();
  const toast = useToast();
  const navigate = useNavigate();
  const boxRef = useRef(null);

  const { isLoading, data, error } = useQuery({
    queryKey: ["family-members", page, debouncedSearchQuery],
    queryFn: async () => {
      const res = await GET(
        admin.token,
        `get_family_member/page?start=${startIndex}&end=${endIndex}`
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
        title: "Lỗi!",
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

  if (!hasPermission("FAMILY_VIEW")) return <NotAuth />;

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
              value={searchQuery}
            />

            <Button
              size="sm"
              colorScheme="blue"
              onClick={onOpen}
              isDisabled={!hasPermission("FAMILY_ADD")}
            >
              Thêm mới
            </Button>
          </Flex>
          <DynamicTable
            minPad="1px 20px"
            data={transformedData}
            onActionClick={
              <YourActionButton
                onClick={handleActionClick}
                navigate={navigate}
                rowData={selectedData}
                DeleteonOpen={DeleteonOpen}
                EditonOpen={EditonOpen}
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

      {isOpen && <AddFamily isOpen={isOpen} onClose={onClose} />}

      {DeleteisOpen && (
        <DeleteFamily
          isOpen={DeleteisOpen}
          onClose={DeleteonClose}
          data={selectedData}
        />
      )}
      {EditisOpen && (
        <EditFamily
          isOpen={EditisOpen}
          onClose={EditonClose}
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

const YourActionButton = ({ onClick, rowData, DeleteonOpen, EditonOpen }) => {
  const { hasPermission } = useHasPermission();
  return (
    <Flex justify="center">
      <IconButton
        isDisabled={!hasPermission("FAMILY_UPDATE")}
        size="sm"
        variant="ghost"
        _hover={{ background: "none" }}
        onClick={() => {
          onClick(rowData);
          EditonOpen();
        }}
        icon={<FiEdit fontSize={18} color={theme.colors.blue[500]} />}
      />

      <IconButton
        isDisabled={!hasPermission("FAMILY_DELETE")}
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

export default FamilyMembers;

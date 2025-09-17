/* eslint-disable react/prop-types */
import DynamicTable from "../../Components/DataTable";
import NotAuth from "../../Components/NotAuth";
import Pagination from "../../Components/Pagination";
import { useSelectedClinic } from "../../Context/SelectedClinic";
import { GET } from "../../Controllers/ApiControllers";
import admin from "../../Controllers/admin";
import useHasPermission from "../../Hooks/HasPermission";
import AddMedicine from "./AddMedicine";
import DeleteMedicine from "./DeleteMedicine";
import UpdateMedicine from "./UpdateMedicine";
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
import { useEffect, useRef, useState } from "react";
import { FaTrash } from "react-icons/fa";
import { FiEdit } from "react-icons/fi";

const getPageIndices = (currentPage, itemsPerPage) => {
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage - 1;
  return { startIndex, endIndex };
};

export default function Medicines() {
  const { hasPermission } = useHasPermission();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedData, setSelectedData] = useState();
  const [page, setPage] = useState(1);
  const boxRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 1000);
  const { selectedClinic } = useSelectedClinic();

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
  const id = "Errortoast";

  const getData = async () => {
    const { startIndex, endIndex } = getPageIndices(page, 50);
    const url = `get_prescribe_medicines?start=${startIndex}&end=${endIndex}&search=${debouncedSearchQuery}&clinic_id=${
      selectedClinic?.id || ""
    }`;
    const res = await GET(admin.token, url);
    return {
      data: res.data,
      total_record: res.total_record,
    };
  };

  const { isLoading, data, error } = useQuery({
    queryKey: ["medicines", page, debouncedSearchQuery, selectedClinic],
    queryFn: getData,
  });

  const handleActionClick = (rowData) => {
    setSelectedData(rowData);
  };

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

  if (!hasPermission("MEDICINE_VIEW")) return <NotAuth />;

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
                onChange={(e) => setSearchQuery(e.target.value)}
                value={searchQuery}
              />
            </Flex>
            <Box>
              <Button
                size={"sm"}
                colorScheme="blue"
                onClick={onOpen}
                isDisabled={!hasPermission("MEDICINE_ADD")}
              >
                Thêm mới
              </Button>
            </Box>
          </Flex>
          <DynamicTable
            data={data?.data}
            onActionClick={
              <YourActionButton
                onClick={handleActionClick}
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

      <AddMedicine isOpen={isOpen} onClose={onClose} />
      {EditisOpen && (
        <UpdateMedicine
          isOpen={EditisOpen}
          onClose={EditonClose}
          data={selectedData}
        />
      )}
      {DeleteisOpen && (
        <DeleteMedicine
          isOpen={DeleteisOpen}
          onClose={DeleteonClose}
          data={selectedData}
        />
      )}
    </Box>
  );
}

const YourActionButton = ({ onClick, rowData, EditonOpen, DeleteonOpen }) => {
  const { hasPermission } = useHasPermission();
  return (
    <Flex justify={"center"}>
      <IconButton
        isDisabled={!hasPermission("MEDICINE_UPDATE")}
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
        isDisabled={!hasPermission("MEDICINE_DELETE")}
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

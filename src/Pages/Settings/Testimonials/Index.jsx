/* eslint-disable react/prop-types */
import DynamicTable from "../../../Components/DataTable";
import ErrorPage from "../../../Components/ErrorPage";
import NotAuth from "../../../Components/NotAuth";
import Pagination from "../../../Components/Pagination";
import { useSelectedClinic } from "../../../Context/SelectedClinic";
import { GET } from "../../../Controllers/ApiControllers";
import admin from "../../../Controllers/admin";
import useHasPermission from "../../../Hooks/HasPermission";
import AddTestimonial from "./Add";
import UpdateTastimonials from "./Update";
import useDebounce from "@/Hooks/useDebounce.jsx";
import DeleteSocial from "@/Pages/Settings/Social-Media/Delete.jsx";
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
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { RefreshCwIcon } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { FaTrash } from "react-icons/fa";
import { FiEdit } from "react-icons/fi";

const Testimonials = () => {
  const toast = useToast();
  const id = "ErrorToast";
  const queryClient = useQueryClient();
  const boxRef = useRef(null);

  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 1000);
  const [SelectedData, setSelectedData] = useState(null);

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

  const { hasPermission } = useHasPermission();

  const getPageIndices = (currentPage, itemsPerPage) => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage - 1;
    return { startIndex, endIndex };
  };
  const { startIndex, endIndex } = getPageIndices(page, 50);
  const { selectedClinic } = useSelectedClinic();

  const fetchTestimonials = async () => {
    const url = `get_testimonial?start=${startIndex}&end=${endIndex}&search=${debouncedSearchQuery}&clinic_id=${
      selectedClinic?.id || ""
    }`;
    const res = await GET(admin.token, url);

    return {
      data: res.data.map((item) => {
        const { id, title, sub_title, description, rating, image } = item;
        return {
          id,
          name: title,
          sub_title,
          rating,
          image,
          description,
        };
      }),
      totalRecord: res.total_record,
    };
  };

  const { data, error, isLoading, isFetching } = useQuery({
    queryKey: ["testimonials", page, debouncedSearchQuery, selectedClinic],
    queryFn: fetchTestimonials,
  });

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const totalPages = Math.ceil((data?.totalRecord || 0) / 50);

  useEffect(() => {
    if (boxRef.current) {
      boxRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [page]);

  if (error) {
    if (!toast.isActive(id)) {
      toast({
        id,
        title: "Lỗi",
        description: "Không thể tải các lời chứng thực.",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
    }
    return <ErrorPage errorCode={error.name} />;
  }

  if (!hasPermission("TESTIMONIAL_VIEW")) return <NotAuth />;
  return (
    <Box ref={boxRef}>
      {isLoading ? (
        <Box>
          <Skeleton height={8} width={400} mb={4} />
          {[...Array(10)].map((_, index) => (
            <Skeleton key={index} height={8} width="100%" mb={2} />
          ))}
        </Box>
      ) : (
        <Box>
          <Flex justifyContent="space-between" mb={4}>
            <Flex gap={4}>
              <Input
                placeholder="Tìm kiếm lời chứng thực"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </Flex>
            <Flex gap={2}>
              <Button
                size="sm"
                colorScheme="blue"
                onClick={onOpen}
                isDisabled={!hasPermission("TESTIMONIAL_ADD")}
              >
                Thêm mới
              </Button>
              <Button
                isLoading={isFetching}
                onClick={() => queryClient.invalidateQueries(["testimonials"])}
                rightIcon={<RefreshCwIcon size={16} />}
                size="sm"
                colorScheme="blue"
              >
                Làm mới
              </Button>
            </Flex>
          </Flex>

          <DynamicTable
            minPad={3}
            data={data?.data}
            onActionClick={
              <SocialMediaActionButton
                onClick={setSelectedData}
                DeleteonOpen={DeleteonOpen}
                EditonOpen={EditonOpen}
              />
            }
          />

          <Flex justifyContent="center" mt={4}>
            <Pagination
              currentPage={page}
              onPageChange={handlePageChange}
              totalPages={totalPages}
            />
          </Flex>
        </Box>
      )}

      <AddTestimonial isOpen={isOpen} onClose={onClose} />
      <DeleteSocial
        isOpen={DeleteisOpen}
        onClose={DeleteonClose}
        data={SelectedData}
      />
      {EditisOpen && (
        <UpdateTastimonials
          isOpen={EditisOpen}
          onClose={EditonClose}
          data={SelectedData}
        />
      )}
    </Box>
  );
};

export default Testimonials;
const SocialMediaActionButton = ({
  onClick,
  rowData,
  DeleteonOpen,
  EditonOpen,
}) => {
  const { hasPermission } = useHasPermission();
  return (
    <Flex justify={"center"}>
      <IconButton
        aria-label="Sửa"
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
        isDisabled={!hasPermission("TESTIMONIAL_UPDATE")}
      />

      <IconButton
        aria-label="Xóa"
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
        isDisabled={!hasPermission("TESTIMONIAL_DELETE")}
      />
    </Flex>
  );
};

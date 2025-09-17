/* eslint-disable react/prop-types */
import DynamicTable from "../../Components/DataTable";
import NotAuth from "../../Components/NotAuth";
import Pagination from "../../Components/Pagination";
import { useSelectedClinic } from "../../Context/SelectedClinic";
import { GET, UPDATE } from "../../Controllers/ApiControllers";
import ShowToast from "../../Controllers/ShowToast";
import admin from "../../Controllers/admin";
import useHasPermission from "../../Hooks/HasPermission";
import DeleteClinic from "./DeleteClinic";
import useDebounce from "@/Hooks/useDebounce.jsx";
import {
  Box,
  Button,
  Flex,
  FormControl,
  IconButton,
  Input,
  Skeleton,
  Switch,
  theme,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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

export default function Clinics() {
  const { hasPermission } = useHasPermission();
  const [selectedData, setSelectedData] = useState();
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const debouncedSearchQuery = useDebounce(searchQuery, 1000);
  const { startIndex, endIndex } = getPageIndices(page, ITEMS_PER_PAGE);
  const navigate = useNavigate();
  const toast = useToast();
  const id = "Errortoast";
  const boxRef = useRef(null);
  const { selectedClinic } = useSelectedClinic();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const getData = async () => {
    const res = await GET(
      admin.token,
      `get_clinic_page?start=${startIndex}&end=${endIndex}&search=${debouncedSearchQuery}&clinic_id=${
        admin?.role?.name?.toLowerCase() === "super admin"
          ? selectedClinic?.id
          : selectedClinic?.id || ""
      }`
    );
    let data = res.data;
    console.log(data);
    const FormatedData = data?.map((item) => {
      const {
        image,
        id,
        title,
        active,
        updated_at,
        city_title,
        state_title,
        phone,
        address,
      } = item;
      return {
        image,
        id,
        active: <IsActive id={id} isActive={active} />,
        title,
        phone,
        address,
        City: city_title,
        State: state_title,
        updated_at,
      };
    });
    return {
      data: FormatedData,
      total_record: res.total_record,
    };
  };

  const { isLoading, data, error } = useQuery({
    queryKey: [
      "clinics",
      "main-clinics",
      debouncedSearchQuery,
      page,
      selectedClinic,
    ],
    queryFn: getData,
  });

  const handleActionClick = (rowData) => {
    setSelectedData(rowData);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };
  const totalPage = Math.ceil(data?.total_record / ITEMS_PER_PAGE);

  useEffect(() => {
    if (boxRef.current) {
      boxRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [page]);

  if (error) {
    if (!toast.isActive(id)) {
      toast({
        id,
        title: "Rất tiếc!",
        description: "Đã có lỗi xảy ra.",
        status: "error",
        duration: 2000,
        isClosable: true,
        position: "top",
      });
    }
  }

  if (!hasPermission("CLINIC_VIEW")) return <NotAuth />;

  return (
    <Box>
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
            <Input
              size={"md"}
              placeholder="Tìm kiếm"
              w={400}
              maxW={"50vw"}
              onChange={(e) => setSearchQuery(e.target.value)}
              value={searchQuery}
            />
            <Box>
              <Button
                isDisabled={!hasPermission("CLINIC_ADD")}
                size={"sm"}
                colorScheme="blue"
                onClick={() => {
                  navigate("/clinic/add");
                }}
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
                navigate={navigate}
                DeleteonOpen={onOpen}
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

      {/* delete */}
      {isOpen && (
        <DeleteClinic isOpen={isOpen} onClose={onClose} data={selectedData} />
      )}
    </Box>
  );
}

const YourActionButton = ({ onClick, rowData, navigate, DeleteonOpen }) => {
  const { hasPermission } = useHasPermission();
  return (
    <Flex justify={"center"}>
      <IconButton
        isDisabled={!hasPermission("CLINIC_UPDATE")}
        size={"sm"}
        variant={"ghost"}
        _hover={{
          background: "none",
        }}
        onClick={() => {
          onClick(rowData);
          navigate(`/clinic/update/${rowData.id}`);
        }}
        icon={<FiEdit fontSize={18} color={theme.colors.blue[500]} />}
      />
      <IconButton
        isDisabled={!hasPermission("CLINIC_DELETE")}
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

export const IsActive = ({ id, isActive }) => {
  const { hasPermission } = useHasPermission();
  const toast = useToast();
  const queryClient = useQueryClient();

  const handleActive = async (id, active) => {
    let data = { id, active };
    try {
      const res = await UPDATE(admin.token, "update_clinic", data);
      if (res.response === 200) {
        ShowToast(toast, "success", "Đã cập nhật phòng khám!");
        queryClient.invalidateQueries("clinics");
      } else {
        ShowToast(toast, "error", res.message);
      }
    } catch (error) {
      ShowToast(toast, "error", JSON.stringify(error));
    }
  };

  const mutation = useMutation({
    mutationFn: async (data) => {
      await handleActive(data.id, data.active);
    },
  });

  return (
    <FormControl display="flex" alignItems="center">
      <Switch
        isDisabled={!hasPermission("CLINIC_UPDATE")}
        defaultChecked={isActive === 1}
        size={"sm"}
        onChange={(e) => {
          let active = e.target.checked ? 1 : 0;
          mutation.mutate({ id, active });
        }}
      />
    </FormControl>
  );
};

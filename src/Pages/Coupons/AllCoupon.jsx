/* eslint-disable react/prop-types */
import DynamicTable from "../../Components/DataTable";
import NotAuth from "../../Components/NotAuth";
import Pagination from "../../Components/Pagination";
import { useSelectedClinic } from "../../Context/SelectedClinic";
import { GET, UPDATE } from "../../Controllers/ApiControllers";
import ShowToast from "../../Controllers/ShowToast";
import admin from "../../Controllers/admin";
import useHasPermission from "../../Hooks/HasPermission";
import AddCoupon from "./Add";
import DeleteCoupons from "./Delete";
import UpdateDepartmentModel from "./Update";
import useDebounce from "@/Hooks/useDebounce.jsx";
import {
  Box,
  Button,
  Divider,
  Flex,
  FormControl,
  Heading,
  IconButton,
  Input,
  Skeleton,
  Switch,
  theme,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { FaTrash } from "react-icons/fa";
import { FiEdit } from "react-icons/fi";

const getPageIndices = (currentPage, itemsPerPage) => {
  const startIndex = (currentPage - 1) * itemsPerPage;
  let endIndex = startIndex + itemsPerPage - 1;
  return { startIndex, endIndex };
};

export default function AllCoupons() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [SelectedData, setSelectedData] = useState();
  const { hasPermission } = useHasPermission();
  const toast = useToast();
  const id = "Errortoast";
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

  const [page, setPage] = useState(1);
  const boxRef = useRef(null);
  const [searchQuery, setsearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 1000);
  const { startIndex, endIndex } = getPageIndices(page, 50);
  const { selectedClinic } = useSelectedClinic();

  const getData = async () => {
    const res = await GET(
      admin.token,
      `get_coupon?start=${startIndex}&end=${endIndex}&search=${debouncedSearchQuery}&clinic_id=${
        selectedClinic?.id || ""
      }`
    );
    const rearrangedArray = res?.data.map((doctor) => {
      const {
        id,
        active,
        clinic_id,
        title,
        value,
        description,
        updated_at,
        start_date,
        end_date,
      } = doctor;
      return {
        active: <IsActive id={id} isActive={active} />,
        id,
        clinic_id,
        title,
        value,
        description,
        start_date,
        end_date,
        updated_at,
      };
    });
    return {
      data: rearrangedArray,
      total_record: res.total_record,
    };
  };

  const handleActionClick = (rowData) => {
    setSelectedData(rowData);
  };

  const { isLoading, data, error } = useQuery({
    queryKey: ["coupons", page, debouncedSearchQuery, selectedClinic?.id],
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
        title: "Rất tiếc!",
        description: "Đã có lỗi xảy ra.",
        status: "error",
        duration: 2000,
        isClosable: true,
        position: "top",
      });
    }
  }

  useEffect(() => {
    if (boxRef.current) {
      boxRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [page]);

  if (!hasPermission("COUPON_VIEW")) return <NotAuth />;

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
          <Heading as={"h1"} size={"md"} mb={2}>
            Tất cả phiếu giảm giá
          </Heading>{" "}
          <Divider mb={2} />
          <Flex mb={5} justify={"space-between"} align={"center"}>
            <Input
              size={"md"}
              placeholder="Tìm kiếm"
              w={400}
              maxW={"50vw"}
              onChange={(e) => setsearchQuery(e.target.value)}
            />
            {hasPermission("COUPON_ADD") && (
              <Box>
                <Button size={"sm"} colorScheme="blue" onClick={onOpen}>
                  Thêm mới
                </Button>
              </Box>
            )}
          </Flex>
          <DynamicTable
            minPad={"8px 8px"}
            data={data?.data}
            onActionClick={
              <YourActionButton
                onClick={handleActionClick}
                DeleteonOpen={DeleteonOpen}
                EditonOpen={EditonOpen}
              />
            }
          />
        </Box>
      )}

      <AddCoupon isOpen={isOpen} onClose={onClose} />
      <DeleteCoupons
        isOpen={DeleteisOpen}
        onClose={DeleteonClose}
        data={SelectedData}
      />
      {EditisOpen && (
        <UpdateDepartmentModel
          isOpen={EditisOpen}
          onClose={EditonClose}
          data={SelectedData}
        />
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

const YourActionButton = ({ onClick, rowData, DeleteonOpen, EditonOpen }) => {
  const { hasPermission } = useHasPermission();
  return (
    <Flex justify={"center"}>
      {hasPermission("COUPON_UPDATE") && (
        <IconButton
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
      )}
      {hasPermission("COUPON_DELETE") && (
        <IconButton
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
      )}
    </Flex>
  );
};
const IsActive = ({ id, isActive }) => {
  const { hasPermission } = useHasPermission();
  const toast = useToast();
  const queryClient = useQueryClient();
  const handleActive = async (id, active) => {
    let data = { id, active };
    try {
      const res = await UPDATE(admin.token, "update_coupon", data);
      if (res.response === 200) {
        ShowToast(toast, "success", "Đã cập nhật!");
        queryClient.invalidateQueries("coupons");
        queryClient.invalidateQueries(["coupons", "dashboard"]);
        queryClient.invalidateQueries(["coupons", id]);
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
        isDisabled={!hasPermission("COUPON_UPDATE")}
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

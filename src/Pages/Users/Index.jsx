/* eslint-disable react/prop-types */
import DynamicTable from "../../Components/DataTable";
import NotAuth from "../../Components/NotAuth";
import Pagination from "../../Components/Pagination";
import { useSelectedClinic } from "../../Context/SelectedClinic";
import { GET } from "../../Controllers/ApiControllers";
import admin from "../../Controllers/admin";
import useHasPermission from "../../Hooks/HasPermission";
import useRolesData from "../../Hooks/UserRolesData";
import DeleteUser from "./DeleteUser";
import useDebounce from "@/Hooks/useDebounce.jsx";
import {
  Box,
  Button,
  Flex,
  IconButton,
  Input,
  Radio,
  RadioGroup,
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
      clinic_id,
      f_name,
      l_name,
      phone,
      email,
      image,
      wallet_amount,
      created_at,
      role_name,
    } = item;

    return {
      id: id,
      clinic_id,
      image: image,
      name: `${f_name} ${l_name}`,
      role_name,
      Phone: `${phone}`,
      Email: email,
      "Wallet Balance": wallet_amount,
      CreatedAt: moment(created_at).format("DD MMM YYYY hh:mm a"),
    };
  });
};

export default function Users() {
  const [SelectedData, setSelectedData] = useState();
  const navigate = useNavigate();
  const { hasPermission } = useHasPermission();
  const toast = useToast();
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 1000);
  const { startIndex, endIndex } = getPageIndices(page, ITEMS_PER_PAGE);
  const boxRef = useRef(null);
  const { Roles, rolesLoading } = useRolesData();
  const [selectedRole, setSelectedRole] = useState("");
  const { selectedClinic } = useSelectedClinic();
  const {
    isOpen: DeleteisOpen,
    onOpen: DeleteonOpen,
    onClose: DeleteonClose,
  } = useDisclosure();
  const getData = async () => {
    const res = await GET(
      admin.token,
      `get_users/page?start=${startIndex}&end=${endIndex}&search=${debouncedSearchQuery}&role_id=${selectedRole}&clinic_id=${
        selectedClinic?.id || ""
      }`
    );
    return {
      data: res.data,
      total_record: res.total_record,
    };
  };

  const { isLoading, data, error } = useQuery({
    queryKey: [
      "users",
      page,
      debouncedSearchQuery,
      selectedRole,
      selectedClinic,
    ],
    queryFn: getData,
  });

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };
  const totalPage = Math.ceil(data?.total_record / ITEMS_PER_PAGE);
  const handleActionClick = (rowData) => {
    setSelectedData(rowData);
    return SelectedData; // only for avoidind error  , ye line kuch bhi nahi karta hai
  };

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

  if (!hasPermission("USER_VIEW")) return <NotAuth />;

  return (
    <Box>
      {isLoading || !data || rolesLoading ? (
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
                isDisabled={!hasPermission("USER_ADD")}
                size={"sm"}
                colorScheme="blue"
                onClick={() => {
                  navigate("/users/add");
                }}
              >
                Thêm mới
              </Button>
            </Box>
          </Flex>
          <Box my={2}>
            <RadioGroup onChange={setSelectedRole} value={selectedRole}>
              <Flex direction="row" gap={4} wrap="wrap">
                <Radio value={''}>Tất cả</Radio>
                {Roles.map((role) => (
                  <Radio key={role.id} value={role.id.toString()}>
                    {role.name}
                  </Radio>
                ))}
              </Flex>
            </RadioGroup>
          </Box>
          <DynamicTable
            minPad={"1px 20px"}
            data={transformData(data.data)}
            onActionClick={
              <YourActionButton
                onClick={handleActionClick}
                navigate={navigate}
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

      {DeleteisOpen && (
        <DeleteUser
          isOpen={DeleteisOpen}
          onClose={DeleteonClose}
          data={SelectedData}
        />
      )}
    </Box>
  );
}

const YourActionButton = ({ onClick, rowData, DeleteonOpen, navigate }) => {
  const { hasPermission } = useHasPermission();
  return (
    <Flex justify={"center"}>
      <IconButton
        isDisabled={!hasPermission("USER_UPDATE")}
        size={"sm"}
        variant={"ghost"}
        _hover={{
          background: "none",
        }}
        onClick={() => {
          onClick(rowData);
          navigate(`/user/update/${rowData.id}`);
        }}
        icon={<FiEdit fontSize={18} color={theme.colors.blue[500]} />}
        aria-label="Chỉnh sửa người dùng"
      />
      <IconButton
        isDisabled={!hasPermission("USER_DELETE")}
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
        aria-label="Xóa người dùng"
      />
    </Flex>
  );
};

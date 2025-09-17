/* eslint-disable react/prop-types */
import DynamicTable from "../../Components/DataTable";
import NotAuth from "../../Components/NotAuth";
import { GET } from "../../Controllers/ApiControllers";
import admin from "../../Controllers/admin";
import useHasPermission from "../../Hooks/HasPermission";
import useSearchFilter from "../../Hooks/UseSearchFilter";
import useRolesData from "../../Hooks/UserRolesData";
import AddRoleModel from "./Add";
import AssignRole from "./AssignRole";
import DeleteAssignRole from "./DeleteAssignRole";
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
import { useState } from "react";
import { FaTrash } from "react-icons/fa";

const getData = async () => {
  const res = await GET(admin.token, "get_assign_roles");
  const rearrangedArray = res?.data.map((item) => {
    const {
      id,
      user_id,
      role_id,
      role_name,
      f_name,
      l_name,
      phone,
      isd_code,
      updated_at,
      created_at,
    } = item;

    return {
      id: id,
      user_id,
      role_id,
      role_name: role_name,
      name: `${f_name} ${l_name}`,
      phone: `${phone}`,
      created_at,
      updated_at,
      serchQuery:
        id +
        user_id +
        role_id +
        role_name +
        f_name +
        l_name +
        phone +
        isd_code +
        updated_at +
        created_at,
    };
  });
  return rearrangedArray.sort((a, b) => {
    return b.id - a.id;
  });
};

export default function AssignedUsers() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [SelectedData, setSelectedData] = useState();
  const { Roles } = useRolesData();
  const {
    isOpen: DeleteisOpen,
    onOpen: DeleteonOpen,
    onClose: DeleteonClose,
  } = useDisclosure();

  const {
    isOpen: AssignisOpen,
    onOpen: AssignonOpen,
    onClose: AssignonClose,
  } = useDisclosure();
  const toast = useToast();
  const id = "Errortoast";

  const handleActionClick = (rowData) => {
    setSelectedData(rowData);
  };

  const { isLoading, data, error } = useQuery({
    queryKey: ["assigned-roles"],
    queryFn: getData,
  });

  const { handleSearchChange, filteredData } = useSearchFilter(data);

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
  const { hasPermission } = useHasPermission();
  if (!hasPermission("ROLE_VIEW")) return <NotAuth />;

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
            <Input
              size={"md"}
              placeholder="Tìm kiếm"
              w={400}
              maxW={"50vw"}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
            {hasPermission("ROLE_ADD") && (
              <Flex align={"center"} gap={5}>
                <Button size={"sm"} colorScheme="teal" onClick={AssignonOpen}>
                  Gán vai trò cho người dùng
                </Button>
                <Button size={"sm"} colorScheme="blue" onClick={onOpen}>
                  Thêm vai trò mới
                </Button>
              </Flex>
            )}
          </Flex>
          <DynamicTable
            data={filteredData}
            onActionClick={
              <YourActionButton
                onClick={handleActionClick}
                DeleteonOpen={DeleteonOpen}
              />
            }
          />
        </Box>
      )}

      <AddRoleModel isOpen={isOpen} onClose={onClose} />
      {DeleteisOpen && (
        <DeleteAssignRole
          isOpen={DeleteisOpen}
          onClose={DeleteonClose}
          data={SelectedData}
        />
      )}

      {AssignisOpen && (
        <AssignRole
          isOpen={AssignisOpen}
          onClose={AssignonClose}
          Roles={Roles}
        />
      )}
    </Box>
  );
}

const YourActionButton = ({ onClick, rowData, DeleteonOpen }) => {
  const { hasPermission } = useHasPermission();
  return (
    <Flex justify={"center"}>
      {hasPermission("ROLE_DELETE") && (
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
        />
      )}
    </Flex>
  );
};

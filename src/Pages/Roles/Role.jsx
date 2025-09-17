/* eslint-disable react/prop-types */
import DynamicTable from "../../Components/DataTable";
import NotAuth from "../../Components/NotAuth";
import useHasPermission from "../../Hooks/HasPermission";
import useSearchFilter from "../../Hooks/UseSearchFilter";
import useRolesData from "../../Hooks/UserRolesData";
import AddRoleModel from "./Add";
import AssignRole from "./AssignRole";
import DeleteRole from "./Delete";
import UpdateRoleModel from "./Update";
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
import { Badge } from "@chakra-ui/react";
import { useState } from "react";
import { FaTrash } from "react-icons/fa";
import { FiEdit } from "react-icons/fi";

const transformData = (data) => {
  return data?.map((item) => {
    const { id, name, created_at, is_super_admin_role } = item;

    return {
      id,
      name,
      Role_Type: (
        <Badge
          colorScheme={is_super_admin_role === 1 ? "purple" : "green"}
          variant={"solid"}
        >
          {is_super_admin_role === 1 ? "Vai trò đặc biệt" : "Vai trò thông thường"}
        </Badge>
      ),
      created_at,
    };
  });
};

export default function Roles() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [SelectedData, setSelectedData] = useState();
  const { Roles, rolesLoading, rolesError } = useRolesData();
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

  const { handleSearchChange, filteredData } = useSearchFilter(
    transformData(Roles)
  );

  if (rolesError) {
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
      {rolesLoading || !Roles ? (
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
                  Thêm mới
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
                EditonOpen={EditonOpen}
              />
            }
          />
        </Box>
      )}

      <AddRoleModel isOpen={isOpen} onClose={onClose} />
      <DeleteRole
        isOpen={DeleteisOpen}
        onClose={DeleteonClose}
        data={SelectedData}
      />
      {EditisOpen && (
        <UpdateRoleModel
          isOpen={EditisOpen}
          onClose={EditonClose}
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

const YourActionButton = ({ onClick, rowData, DeleteonOpen, EditonOpen }) => {
  const { hasPermission } = useHasPermission();
  return (
    <Flex justify={"center"}>
      {hasPermission("ROLE_UPDATE") && (
        <IconButton
          aria-label="Chỉnh sửa"
          isDisabled={rowData?.name === "Admin" || rowData?.name === "admin"}
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
      {hasPermission("ROLE_DELETE") && (
        <IconButton
          aria-label="Xóa"
          isDisabled={rowData?.name === "Admin" || rowData?.name === "admin"}
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

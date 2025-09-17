/* eslint-disable react/prop-types */
import DynamicTable from "../../../Components/DataTable";
import ErrorPage from "../../../Components/ErrorPage";
import NotAuth from "../../../Components/NotAuth";
import { GET } from "../../../Controllers/ApiControllers";
import admin from "../../../Controllers/admin";
import useHasPermission from "../../../Hooks/HasPermission";
import useSearchFilter from "../../../Hooks/UseSearchFilter";
import AddLoginScreen from "./Add";
import DeleteLoginImage from "./Delete";
import {
  Box,
  Button,
  Flex,
  IconButton,
  Input,
  Skeleton,
  theme,
  useDisclosure,
} from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { FaTrash } from "react-icons/fa";

export default function Files() {
  const [selectedData, setselectedData] = useState();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { hasPermission } = useHasPermission();
  const {
    isOpen: DeleteisOpen,
    onOpen: DeleteonOpen,
    onClose: DeleteonClose,
  } = useDisclosure();
  const handleActionClick = (rowData) => {
    setselectedData(rowData);
  };

  const getPatientFiles = async () => {
    const res = await GET(admin.token, `get_login_screen_images`);
    return res.data;
  };
  const {
    data,
    isLoading: patientFilesLoading,
    error,
  } = useQuery({
    queryKey: ["login-screen"],
    queryFn: getPatientFiles,
  });

  const { handleSearchChange, filteredData } = useSearchFilter(data);

  if (error) return <ErrorPage errorCode={error.name} />;
  if (!hasPermission("LOGINSCREEN_VIEW")) return <NotAuth />;

  return (
    <Box>
      {patientFilesLoading || !data ? (
        <Box>
          <Flex mb={5} justify={"space-between"}>
            <Skeleton w={400} h={8} />
            <Skeleton w={200} h={8} />
          </Flex>
          {/* Loading skeletons */}
          {[...Array(10)].map((_, index) => (
            <Skeleton key={index} h={10} w={"100%"} mt={2} />
          ))}
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
            <Box>
              <Button
                isDisabled={!hasPermission("LOGINSCREEN_ADD")}
                size={"sm"}
                colorScheme="blue"
                onClick={() => {
                  onOpen();
                }}
              >
                Thêm mới
              </Button>
            </Box>
          </Flex>

          <DynamicTable
            minPad={"8px 8px"}
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

      {isOpen && <AddLoginScreen isOpen={isOpen} onClose={onClose} />}
      {DeleteisOpen && (
        <DeleteLoginImage
          isOpen={DeleteisOpen}
          onClose={DeleteonClose}
          data={selectedData}
        />
      )}
    </Box>
  );
}

const YourActionButton = ({ onClick, rowData, DeleteonOpen }) => {
  const { hasPermission } = useHasPermission();
  return (
    <Flex justify={"center"}>
      <IconButton
        aria-label="Xóa"
        isDisabled={!hasPermission("LOGINSCREEN_DELETE")}
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

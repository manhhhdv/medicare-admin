/* eslint-disable react/prop-types */
import DynamicTable from "../../Components/DataTable";
import ErrorPage from "../../Components/ErrorPage";
import NotAuth from "../../Components/NotAuth";
import Pagination from "../../Components/Pagination";
import { useSelectedClinic } from "../../Context/SelectedClinic";
import { GET, UPDATE } from "../../Controllers/ApiControllers";
import ShowToast from "../../Controllers/ShowToast";
import admin from "../../Controllers/admin";
import useHasPermission from "../../Hooks/HasPermission";
import AddRefer from "./AddRefer";
import DeleteRefer from "./Delete";
import useDebounce from "@/Hooks/useDebounce.jsx";
import {
  Badge,
  Box,
  Button,
  Flex,
  IconButton,
  Input,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Skeleton,
  Spinner,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  theme,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { RefreshCwIcon } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { FaTrash } from "react-icons/fa";

const ReferPatient = () => {
  const toast = useToast();
  const id = "ErrorToast";
  const queryClient = useQueryClient();
  const boxRef = useRef(null);

  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 1000);
  const [SelectedData, setSelectedData] = useState(null);
  const [activeTab, setActiveTab] = useState(0); // 0 for "Referred to You", 1 for "Referred by You"

  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: DeleteisOpen,
    onOpen: DeleteonOpen,
    onClose: DeleteonClose,
  } = useDisclosure();

  const { hasPermission } = useHasPermission();

  const getPageIndices = (currentPage, itemsPerPage) => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage - 1;
    return { startIndex, endIndex };
  };
  const { startIndex, endIndex } = getPageIndices(page, 50);
    const { selectedClinic } = useSelectedClinic();

  const translateStatus = (status) => {
    switch (status) {
      case "Pending":
        return "Đang chờ xử lý";
      case "Approved":
        return "Đã phê duyệt";
      case "Rejected":
        return "Đã từ chối";
      default:
        return status;
    }
  };

  const fetchData = async () => {
    const url = `get_referral_clinic?start=${startIndex}&end=${endIndex}&search=${debouncedSearchQuery}&to_clinic_id=${
      activeTab === 1 ? selectedClinic?.id || "" : ""
    }&from_clinic_id=${activeTab === 0 ? selectedClinic?.id || "" : ""}`;
    const res = await GET(admin.token, url);

    return {
      data: res.data.map((item) => {
        const {
          id,
          patient_id,
          from_clinic_id,
          to_clinic_id,
          status,
          requested_by,
          approved_by,
          updated_at,
          patient_f_name,
          patient_l_name,
          from_clinic_title,
          to_clinic_title,
          requested_by_f_name,
          requested_by_l_name,
          approved_by_f_name,
          approved_by_l_name,
        } = item;

        return {
          id: `${id}`,
          status: (
            <HandleStatus
              id={id}
              status={status}
              isDisabled={activeTab === 0}
              translateStatus={translateStatus}
            />
          ),
          patient: `${patient_f_name} ${patient_l_name} #${patient_id}`,
          from_Clinic: `${from_clinic_title}`,
          from_clinic_id,
          to_Clinic: `${to_clinic_title} #${to_clinic_id}`,
          "requested By": `#${requested_by} ${requested_by_f_name} ${requested_by_l_name}`,
          "approved By": approved_by
            ? `#${approved_by} ${
                approved_by_f_name
                  ? `${approved_by_f_name} ${approved_by_l_name}`
                  : ""
              }`
            : null,
          updated_at: updated_at,
        };
      }),
      totalRecord: res.total_record,
    };
  };

  const { data, error, isLoading, isFetching } = useQuery({
    queryKey: [
      "referals",
      page,
      debouncedSearchQuery,
      selectedClinic,
      activeTab,
    ],
    queryFn: fetchData,
  });

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const totalPages = Math.ceil((data?.totalRecord || 0) / 50);

  useEffect(() => {
    if (boxRef.current) {
      boxRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [page, activeTab]);

  if (error) {
    if (!toast.isActive(id)) {
      toast({
        id,
        title: "Lỗi",
        description: "Không thể tải dữ liệu chuyển tuyến.",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
    }
    return <ErrorPage errorCode={error.name} />;
  }

  if (!hasPermission("REFER_VIEW")) return <NotAuth />;
  return (
    <Box ref={boxRef}>
      <Tabs index={activeTab} onChange={setActiveTab} mb={4}>
        <TabList>
          {" "}
          <Tab>Chuyển đi bởi bạn</Tab>
          <Tab>Chuyển đến bạn</Tab>
        </TabList>
        <TabPanels>
          <TabPanel p={0} mt={5}>
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
                      placeholder="Tìm kiếm chuyển tuyến"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </Flex>
                  <Flex gap={2}>
                    <Button
                      size="sm"
                      colorScheme="blue"
                      onClick={onOpen}
                      isDisabled={!hasPermission("REFER_ADD")}
                    >
                      Thêm mới chuyển tuyến
                    </Button>
                    <Button
                      isLoading={isFetching}
                      onClick={() =>
                        queryClient.invalidateQueries(["referals"])
                      }
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
                      isDisabled={activeTab === 1}
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
          </TabPanel>
          <TabPanel p={0} mt={5}>
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
                      placeholder="Tìm kiếm chuyển tuyến"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </Flex>
                  <Flex gap={2}>
                    <Button
                      size="sm"
                      colorScheme="blue"
                      onClick={onOpen}
                      isDisabled={!hasPermission("REFER_ADD")}
                    >
                      Thêm mới chuyển tuyến
                    </Button>
                    <Button
                      isLoading={isFetching}
                      onClick={() =>
                        queryClient.invalidateQueries(["referals"])
                      }
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
                      isDisabled={activeTab === 1}
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
          </TabPanel>
        </TabPanels>
      </Tabs>

      {isOpen ? <AddRefer isOpen={isOpen} onClose={onClose} /> : null}
      {DeleteisOpen ? (
        <DeleteRefer
          isOpen={DeleteisOpen}
          onClose={DeleteonClose}
          data={SelectedData}
        />
      ) : null}
    </Box>
  );
};

export default ReferPatient;

const SocialMediaActionButton = ({
  onClick,
  rowData,
  DeleteonOpen,
  isDisabled,
}) => {
  console.log("rowData", rowData, "isDisabled", isDisabled);
  const { hasPermission } = useHasPermission();
  return (
    <Flex justify={"center"}>
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
        isDisabled={!hasPermission("REFER_DELETE") || isDisabled}
      />
    </Flex>
  );
};

const HandleStatus = ({ id, status, isDisabled, translateStatus }) => {
  const toast = useToast();
  const queryClient = useQueryClient();
  const getBadgeColor = (status) => {
    switch (status) {
      case "Pending":
        return "yellow";
      case "Approved":
        return "green";
      case "Rejected":
        return "red";
      default:
        return "gray";
    }
  };
  const handleUpdate = async (data) => {
    try {
      const res = await UPDATE(admin.token, "update_referral_clinic", data);
      if (res.response === 200) {
        ShowToast(toast, "success", "Đã cập nhật!");
        queryClient.invalidateQueries("referals");
        queryClient.invalidateQueries(["referals", id]);
      } else {
        ShowToast(toast, "error", res.message);
      }
    } catch (error) {
      ShowToast(toast, "error", JSON.stringify(error));
    }
  };

  const mutation = useMutation({
    mutationFn: async (data) => {
      await handleUpdate(data);
    },
  });
  const handleStatusChange = (newStatus) => {
    mutation.mutate({
      referral_id: id,
      status: newStatus,
      approved_by: admin.id,
    });
  };

  return (
    <Menu>
      <MenuButton
        isDisabled={status !== "Pending" || isDisabled}
        as={Button}
        p={0}
        style={{ all: "unset", cursor: "pointer" }}
        cursor={"pointer"}
        _disabled={{
          cursor: "not-allowed",
        }}
      >
        {mutation.isPending ? (
          <Spinner />
        ) : (
          <Button colorScheme={getBadgeColor(status)} p={1} px={3} size={"sm"}>
            {translateStatus(status)}
          </Button>
        )}
      </MenuButton>
      <MenuList>
        <MenuItem onClick={() => handleStatusChange("Pending")}>
          <Badge
            colorScheme={getBadgeColor("Pending")}
            p={1}
            px={3}
            w={"100%"}
            variant={"subtle"}
          >
            {translateStatus("Pending")}
          </Badge>
        </MenuItem>
        <MenuItem onClick={() => handleStatusChange("Approved")}>
          <Badge
            colorScheme={getBadgeColor("Approved")}
            p={1}
            px={3}
            w={"100%"}
            variant={"subtle"}
          >
            {translateStatus("Approved")}
          </Badge>
        </MenuItem>
        <MenuItem onClick={() => handleStatusChange("Rejected")}>
          <Badge
            colorScheme={getBadgeColor("Rejected")}
            p={1}
            px={3}
            w={"100%"}
            variant={"subtle"}
          >
            {translateStatus("Rejected")}
          </Badge>
        </MenuItem>
      </MenuList>
    </Menu>
  );
};

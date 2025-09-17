/* eslint-disable react/prop-types */
import DynamicTable from "../../Components/DataTable";
import NotAuth from "../../Components/NotAuth";
import Pagination from "../../Components/Pagination";
import { useSelectedClinic } from "../../Context/SelectedClinic";
import { GET, UPDATE } from "../../Controllers/ApiControllers";
import ShowToast from "../../Controllers/ShowToast";
import admin from "../../Controllers/admin";
import t from "../../Controllers/configs";
import useHasPermission from "../../Hooks/HasPermission";
import DeleteDoctor from "./Delete";
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
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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

export default function Doctors() {
  const { hasPermission } = useHasPermission();
  const [SelectedData, setSelectedData] = useState();
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const debouncedSearchQuery = useDebounce(searchQuery, 1000);
  const { startIndex, endIndex } = getPageIndices(page, ITEMS_PER_PAGE);
  const boxRef = useRef(null);
  const {
    isOpen: DeleteisOpen,
    onOpen: DeleteonOpen,
    onClose: DeleteonClose,
  } = useDisclosure();
  const navigate = useNavigate();
  const { selectedClinic } = useSelectedClinic();

  const toast = useToast();
  const id = "Errortoast";
  const getData = async () => {
    await t();
    const res = await GET(
      admin.token,
      `get_doctor?start=${startIndex}&end=${endIndex}&search=${debouncedSearchQuery}&clinic_id=${
        selectedClinic?.id || ""
      }`
    );

    const rearrangedArray = res?.data.map((doctor) => {
      const {
        user_id,
        image,
        f_name,
        l_name,
        phone,
        email,
        specialization,
        department_name,
        clinic_title,
        active,
        stop_booking,
        clinic_id,
        city_title,
        state_title,
      } = doctor;
      return {
        id: user_id,
        active: <IsActive id={user_id} isActive={active} />,
        "Stop Booking": (
          <StopBooking id={user_id} isStop_booking={stop_booking} />
        ),

        image,
        name: `${f_name} ${l_name}`,
        clinic: `${clinic_title} -#${clinic_id}`,
        phone,
        email,
        specialization,
        dept: department_name,
        city: city_title,
        state: state_title,
      };
    });
    return {
      data: rearrangedArray,
      total_record: res.total_record,
    };
  };
  const { isLoading, data, error } = useQuery({
    queryKey: ["doctors-main", selectedClinic?.id, debouncedSearchQuery],
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
        title: "Lỗi!",
        description: "Đã xảy ra lỗi.",
        status: "error",
        duration: 2000,
        isClosable: true,
        position: "top",
      });
    }
  }

  if (!hasPermission("DOCTOR_VIEW")) return <NotAuth />;

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
              placeholder="Tìm kiếm bác sĩ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              w={400}
            />
            <Box>
              <Button
                isDisabled={!hasPermission("DOCTOR_CREATE")}
                size={"sm"}
                colorScheme="blue"
                onClick={() => navigate("/doctors/add")}
              >
                Thêm mới bác sĩ
              </Button>
            </Box>
          </Flex>
          <DynamicTable
            data={data?.data}
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

      {DeleteonOpen && (
        <DeleteDoctor
          isOpen={DeleteisOpen}
          onClose={DeleteonClose}
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

const YourActionButton = ({ onClick, rowData, DeleteonOpen, navigate }) => {
  const { hasPermission } = useHasPermission();
  return (
    <Flex justify={"center"}>
      <IconButton
        isDisabled={!hasPermission("DOCTOR_UPDATE")}
        size={"sm"}
        variant={"ghost"}
        _hover={{
          background: "none",
        }}
        onClick={() => {
          onClick(rowData);
          navigate(`/doctor/update/${rowData.id}`);
        }}
        icon={<FiEdit fontSize={18} color={theme.colors.blue[500]} />}
      />
      <IconButton
        isDisabled={!hasPermission("DOCTOR_UPDATE")}
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
      const res = await UPDATE(admin.token, "update_doctor", data);
      if (res.response === 200) {
        ShowToast(toast, "success", "Đã cập nhật bác sĩ!");
        queryClient.invalidateQueries("doctors");
        queryClient.invalidateQueries(["doctors", "dashboard"]);
        queryClient.invalidateQueries(["doctor", id]);
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
        isDisabled={!hasPermission("DOCTOR_UPDATE")}
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
export const StopBooking = ({ id, isStop_booking }) => {
  const { hasPermission } = useHasPermission();
  const toast = useToast();
  const queryClient = useQueryClient();
  const handleActive = async (id, stop_booking) => {
    let data = { id, stop_booking };
    try {
      const res = await UPDATE(admin.token, "update_doctor", data);
      if (res.response === 200) {
        ShowToast(toast, "success", "Đã cập nhật bác sĩ!");
        queryClient.invalidateQueries("doctors");
        queryClient.invalidateQueries(["doctors", "dashboard"]);
        queryClient.invalidateQueries(["doctor", id]);
      } else {
        ShowToast(toast, "error", res.message);
      }
    } catch (error) {
      ShowToast(toast, "error", JSON.stringify(error));
    }
  };

  const mutation = useMutation({
    mutationFn: async (data) => {
      await handleActive(data.id, data.stop_booking);
    },
  });

  return (
    <FormControl display="flex" alignItems="center">
      <Switch
        isDisabled={!hasPermission("DOCTOR_UPDATE")}
        defaultChecked={isStop_booking === 1}
        size={"sm"}
        onChange={(e) => {
          let stop_booking = e.target.checked ? 1 : 0;

          mutation.mutate({ id, stop_booking });
        }}
      />
    </FormControl>
  );
};

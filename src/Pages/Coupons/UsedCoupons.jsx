/* eslint-disable react/prop-types */
import DynamicTable from "../../Components/DataTable";
import NotAuth from "../../Components/NotAuth";
import Pagination from "../../Components/Pagination";
import { useSelectedClinic } from "../../Context/SelectedClinic";
import { GET } from "../../Controllers/ApiControllers";
import admin from "../../Controllers/admin";
import useHasPermission from "../../Hooks/HasPermission";
import useSearchFilter from "../../Hooks/UseSearchFilter";
import AddCoupon from "./Add";
import DeleteUsedCoupons from "./DeleteUsedCoupons";
import UpdateDepartmentModel from "./Update";
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
  Heading,
  Divider,
} from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { FaTrash } from "react-icons/fa";

const getPageIndices = (currentPage, itemsPerPage) => {
  const startIndex = (currentPage - 1) * itemsPerPage;
  let endIndex = startIndex + itemsPerPage - 1;
  return { startIndex, endIndex };
};

export default function UsedCoupons() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [SelectedData, setSelectedData] = useState();
  const { hasPermission } = useHasPermission();
  const { selectedClinic } = useSelectedClinic();
  const [page, setPage] = useState(1);
  const { startIndex, endIndex } = getPageIndices(page, 50);
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
    const res = await GET(
      admin.token,
      `get_coupon_use?start=${startIndex}&end=${endIndex}&clinic_id=${
        selectedClinic?.id || ""
      }`
    );
    const rearrangedArray = res?.data.map((item) => {
      const {
        id,
        coupon_id,
        user_id,
        appointment_id,
        updated_at,
        f_name,
        l_name,
        clinic_id,
      } = item;
      return {
        id,
        coupon_id,
        user_id,
        clinic_id,
        user_name: `${f_name} ${l_name}`,
        appointment_id,
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
    queryKey: ["used-coupons", selectedClinic?.id],
    queryFn: getData,
  });

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };
  const totalPage = Math.ceil(data?.total_record / 50);

  const { handleSearchChange, filteredData } = useSearchFilter(data?.data);

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
            Phiếu giảm giá đã sử dụng
          </Heading>{" "}
          <Divider mb={2} />
          <Flex mb={5} justify={"space-between"} align={"center"}>
            <Input
              size={"md"}
              placeholder="Tìm kiếm"
              w={400}
              maxW={"50vw"}
              onChange={(e) => handleSearchChange(e.target.value)}
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

      <AddCoupon isOpen={isOpen} onClose={onClose} />
      <DeleteUsedCoupons
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

const YourActionButton = ({ onClick, rowData, DeleteonOpen }) => {
  const { hasPermission } = useHasPermission();
  return (
    <Flex justify={"center"}>
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

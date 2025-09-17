import DynamicTable from "../../Components/DataTable";
import DateRangeCalender from "../../Components/DateRangeCalender";
import ErrorPage from "../../Components/ErrorPage";
import Pagination from "../../Components/Pagination";
import { useSelectedClinic } from "../../Context/SelectedClinic";
import { GET } from "../../Controllers/ApiControllers";
import admin from "../../Controllers/admin";
import useDebounce from "@/Hooks/useDebounce.jsx";
import {
  Badge,
  Box,
  Button,
  Flex,
  Input,
  Skeleton,
  useToast,
} from "@chakra-ui/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { RefreshCwIcon } from "lucide-react";
import moment from "moment";
import { useState, useEffect, useRef } from "react";

const ReviewsPage = () => {
  const toast = useToast();
  const id = "ErrorToast";
  const [page, setPage] = useState(1);
  const boxRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 1000);
  const queryClient = useQueryClient();
  const [dateRange, setDateRange] = useState({
    startDate: null,
    endDate: null,
  });
  const getPageIndices = (currentPage, itemsPerPage) => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage - 1;
    return { startIndex, endIndex };
  };
  const { startIndex, endIndex } = getPageIndices(page, 50);
  const { selectedClinic } = useSelectedClinic();

  const fetchReviews = async () => {
    const url =
      admin.role.name === "Doctor"
        ? `get_all_doctor_review?start=${startIndex}&end=${endIndex}&start_date=${
            dateRange.startDate || ""
          }&end_date=${
            dateRange.endDate || ""
          }&search=${debouncedSearchQuery}&doctor_id=${admin.id}&clinic_id=${
            selectedClinic?.id || ""
          }`
        : `get_all_doctor_review?start=${startIndex}&end=${endIndex}&start_date=${
            dateRange.startDate || ""
          }&end_date=${
            dateRange.endDate || ""
          }&search=${debouncedSearchQuery}&clinic_id=${
            selectedClinic?.id || ""
          }`;
    const response = await GET(admin.token, url);
    return {
      data: response.data,
      totalRecord: response.total_record,
    };
  };

  const { data, error, isLoading, isFetching } = useQuery({
    queryKey: [
      "reviews",
      page,
      debouncedSearchQuery,
      dateRange,
      selectedClinic?.id,
    ],
    queryFn: fetchReviews,
  });

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const totalPages = Math.ceil((data?.totalRecord || 0) / 50);

  useEffect(() => {
    if (boxRef.current) {
      boxRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [page]);

  if (error) {
    if (!toast.isActive(id)) {
      toast({
        id,
        title: "Lỗi",
        description: "Không thể tải các bài đánh giá.",
        status: "error",
        duration: 3000,
        isClosable: true,
        position: "top",
      });
    }
    return <ErrorPage errorCode={error.name} />;
  }

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
                placeholder="Tìm kiếm đánh giá"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <DateRangeCalender
                dateRange={dateRange}
                setDateRange={setDateRange}
                size={"md"}
              />
            </Flex>
            <Button
              isLoading={isFetching}
              onClick={() => queryClient.invalidateQueries(["reviews"])}
              rightIcon={<RefreshCwIcon size={16} />}
              size={"sm"}
              colorScheme={"blue"}
            >
              Làm mới
            </Button>
          </Flex>

          <DynamicTable
            minPad={3}
            data={data?.data?.map((review) => ({
              ID: review.id,
              "Tên bác sĩ": `${review.doct_f_name} ${review.doct_l_name}`,
              "Tên bệnh nhân": `${review.f_name} ${review.l_name}`,
              "ID cuộc hẹn": review.appointment_id,
              "Điểm": (
                <Badge
                  colorScheme={
                    review.points >= 4
                      ? "green"
                      : review.points >= 2
                      ? "yellow"
                      : "red"
                  }
                >
                  {review.points}
                </Badge>
              ),
              "Mô tả": review.description,
              "Ngày": moment(review.created_at).format("DD MMM YYYY, hh:mm A"),
            }))}
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
    </Box>
  );
};

export default ReviewsPage;

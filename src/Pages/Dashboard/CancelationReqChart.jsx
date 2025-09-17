/* eslint-disable react/prop-types */
import { Box, Text } from "@chakra-ui/react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

const CancellationPieChart = ({ cancelData }) => {
  // Data structure using props
  const data = {
    labels: [
      "Yêu cầu hủy đã được gửi",
      "Yêu cầu hủy đã bị từ chối",
      "Yêu cầu hủy đã được chấp thuận",
      "Đang xử lý yêu cầu hủy",
    ],
    datasets: [
      {
        label: "Số lượt hủy lịch hẹn",
        data: [
          cancelData?.total_cancel_req_initiated_appointment || 0,
          cancelData?.total_cancel_req_rejected_appointment || 0,
          cancelData?.total_cancel_req_approved_appointment || 0,
          cancelData?.total_cancel_req_processing_appointment || 0,
        ],
        backgroundColor: [
          "#f39c12", // Color for initiated
          "#e74c3c", // Color for rejected
          "#2ecc71", // Color for approved
          "#3498db", // Color for processing
        ],
        hoverBackgroundColor: [
          "#f39c12aa",
          "#e74c3caa",
          "#2ecc71aa",
          "#3498dbaa",
        ],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
      },
      tooltip: {
        enabled: true,
      },
    },
  };

  return (
    <Box p={4} borderRadius="md" boxShadow="md">
      <Text fontSize="lg" fontWeight="bold" mb={4}>
        Trạng thái hủy lịch hẹn
      </Text>
      <Box h="300px">
        <Doughnut data={data} options={options} />
      </Box>
    </Box>
  );
};

export default CancellationPieChart;

/* eslint-disable react-hooks/rules-of-hooks */

/* eslint-disable react/prop-types */
import {
  Box,
  Grid,
  GridItem,
  Text,
  Flex,
  useColorModeValue,
} from "@chakra-ui/react";
import { AiOutlineCheckCircle } from "react-icons/ai";
import { BiBeenHere } from "react-icons/bi";
import { BiCalendar } from "react-icons/bi";
import { FaUserMd } from "react-icons/fa";
import { ImCancelCircle } from "react-icons/im";
import { MdOutlineUpdate } from "react-icons/md";
import { MdPendingActions } from "react-icons/md";

export function AppointmentCardsTop({ data }) {
  const cardData = [
    {
      title: "Lịch hẹn hôm nay",
      value: data?.total_today_appointment || 0,
      icon: <FaUserMd fontSize="32px" />,
      color: "blue.600",
    },
    {
      title: "Lịch hẹn sắp tới",
      value: data?.total_upcoming_appointments || 0,
      icon: <MdOutlineUpdate fontSize="32px" />,
      color: "blue.600",
    },
    {
      title: "Lịch hẹn đang chờ",
      value: data?.total_pending_appointment || 0,
      icon: <MdPendingActions fontSize="32px" />,
      color: "blue.600",
    },
    {
      title: "Lịch hẹn đã xác nhận",
      value: data?.total_confirmed_appointment || 0, // You may need to replace this with actual data
      icon: <BiCalendar fontSize="32px" />,
      color: "blue.600",
    },
  ];

  return (
    <Grid templateColumns="repeat(2, 1fr)" gap={8}>
      {cardData.map((card, index) => (
        <GridItem key={index}>
          <Box
            boxShadow="md"
            p={8}
            borderRadius={8}
            bg={useColorModeValue("#fff", "gray.900")}
          >
            <Flex justify="space-between">
              <Box>
                <Text fontSize="sm" fontWeight={600}>
                  {card.title}
                </Text>
                <Text fontSize="3xl" fontWeight={700} color={card.color}>
                  {card.value}
                </Text>
              </Box>
              <Flex
                p={2}
                borderRadius="50%"
                bg="blue.700"
                w={16}
                h={16}
                align="center"
                justify="center"
                color="#fff"
              >
                {card.icon}
              </Flex>
            </Flex>
          </Box>
        </GridItem>
      ))}
    </Grid>
  );
}
export function AppointmentCardsOthers({ data }) {
  const cardData = [
    {
      title: "Lịch hẹn đã hủy",
      value: data?.total_cancelled_appointment || 0,
      icon: <ImCancelCircle fontSize="32px" />,
      color: "red.500",
    },
    {
      title: "Lịch hẹn đã từ chối",
      value: data?.total_rejected_appointment || 0,
      icon: <ImCancelCircle fontSize="32px" />,
      color: "red.400",
    },

    {
      title: "Lịch hẹn đã hoàn thành",
      value: data?.total_completed_appointment || 0,
      icon: <AiOutlineCheckCircle fontSize="32px" />,
      color: "blue.600",
    },

    {
      title: "Lịch hẹn đã đến khám",
      value: data?.total_visited_appointment || 0,
      icon: <BiBeenHere fontSize="32px" />,
      color: "blue.600",
    },
  ];
  return (
    <Grid templateColumns="repeat(auto-fit, minmax(300px, 1fr))" gap={4}>
      {cardData.map((card, index) => (
        <GridItem key={index}>
          <Box
            boxShadow="md"
            p={8}
            borderRadius={8}
            bg={useColorModeValue("#fff", "gray.900")}
          >
            <Flex justify="space-between">
              <Box>
                <Text fontSize="sm" fontWeight={600}>
                  {card.title}
                </Text>
                <Text fontSize="3xl" fontWeight={700} color={card.color}>
                  {card.value}
                </Text>
              </Box>
              <Flex
                p={2}
                borderRadius="50%"
                bg="blue.700"
                w={16}
                h={16}
                align="center"
                justify="center"
                color="#fff"
              >
                {card.icon}
              </Flex>
            </Flex>
          </Box>
        </GridItem>
      ))}
    </Grid>
  );
}

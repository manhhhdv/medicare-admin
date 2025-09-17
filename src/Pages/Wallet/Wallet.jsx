/* eslint-disable react/prop-types */
import DynamicTable from "../../Components/DataTable";
import NotAuth from "../../Components/NotAuth";
import { GET } from "../../Controllers/ApiControllers";
import { walletMinAmount } from "../../Controllers/Wallet";
import admin from "../../Controllers/admin";
import useHasPermission from "../../Hooks/HasPermission";
import AddMony from "./AddMoney";
import {
  Badge,
  Box,
  Button,
  Flex,
  Input,
  Skeleton,
  Text,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import moment from "moment";
import { useState } from "react";

export default function Wallet({ userID }) {
  const { hasPermission } = useHasPermission();
  const [searchTerm, setsearchTerm] = useState();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();
  const id = "Errortoast";
  const getData = async () => {
    const res = await GET(
      admin.token,
      `get_all_transaction?is_wallet_txn=1&user_id=${userID}`
    );
    const rearrangedArray = res?.data.map((transaction) => {
      const {
        id,
        patient_id,
        appointment_id,
        payment_transaction_id,
        amount,
        transaction_type,

        last_wallet_amount,
        new_wallet_amount,
        notes,
        updated_at,
      } = transaction;

      return {
        id,
        Patient_ID: patient_id,
        Appointment_ID: appointment_id,
        Transaction_ID: payment_transaction_id,
        Amount: transaction_type === "Credited" ? `+${amount}` : `-${amount}`,
        Txn_Type: (
          <Badge
            colorScheme={transaction_type === "Credited" ? "green" : "red"}
          >
            {transaction_type}
          </Badge>
        ),
        Last_Amount: last_wallet_amount,
        update_Amount: new_wallet_amount,
        Notes: (
          <Text mt="2" whiteSpace="pre-wrap" wordBreak="break-word" minW={200}>
            {notes}
          </Text>
        ),
        Updated_At: moment(updated_at).format("DD MMM YY hh:mm A"),
      };
    });
    return rearrangedArray;
  };

  const { isLoading, data, error } = useQuery({
    queryKey: userID ? ["wallet", userID] : ["Wallet"],
    queryFn: getData,
  });

  const { data: userDetails, isLoading: isUserLoading } = useQuery({
    queryKey: ["user", userID],
    queryFn: async () => {
      const res = await GET(admin.token, `get_user/${userID}`);
      return res.data;
    },
  });

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

  function filterData(data, searchKey = "") {
    // If the search key is empty or a string, return all data
    if (!searchKey) {
      return data;
    }

    // Filter the data based on the search key matching any key or value
    return data.filter((doctor) => {
      for (const key in doctor) {
        const value = doctor[key]?.toString().toLowerCase();
        if (value && value.includes(searchKey.toLowerCase())) {
          return true;
        }
      }
      return false;
    });
  }

  if (!hasPermission("WALLET_VIEW")) return <NotAuth />;

  return (
    <Box>
      {isLoading || !data || isUserLoading ? (
        <Box>
          <Flex mb={5} justify={"space-between"}>
            <Skeleton w={400} h={8} />
            <Skeleton w={200} h={8} />
          </Flex>
          <Skeleton w={400} h={8} my={2} />
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
              onChange={(e) => {
                setsearchTerm(e.target.value);
              }}
            />
            <Box>
              <Button
                isDisabled={!hasPermission("WALLET_ADD")}
                size={"sm"}
                colorScheme="blue"
                onClick={() => {
                  onOpen();
                }}
              >
                Nạp tiền vào ví
              </Button>
            </Box>
          </Flex>

          <Badge
            p={2}
            w={200}
            fontSize="sm"
            textAlign="center"
            borderRadius={6}
            colorScheme={
              userDetails.wallet_amount < walletMinAmount ? "red" : "green"
            }
            mb={2}
          >
            Số dư ví - {userDetails.wallet_amount}
          </Badge>
          <DynamicTable
            data={filterData(data, searchTerm)}
            minPad={"16px 14px"}
          />
        </Box>
      )}

      {isOpen && <AddMony isOpen={isOpen} onClose={onClose} userID={userID} />}
    </Box>
  );
}

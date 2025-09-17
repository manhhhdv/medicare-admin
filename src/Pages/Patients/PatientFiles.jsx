/* eslint-disable react/prop-types */
import Loading from "../../Components/Loading";
import { GET } from "../../Controllers/ApiControllers";
import admin from "../../Controllers/admin";
import imageBaseURL from "../../Controllers/image";
import AddPatientFiles from "./AddPatientFiles";
import DeletePatientFiles from "./DeletePatientFile";
import UpdatePatientFiles from "./UpdatePatientFiles";
import {
  Box,
  Button,
  Divider,
  Flex,
  Heading,
  IconButton,
  Link,
  ListItem,
  OrderedList,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import moment from "moment";
import { useState } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";

export default function PatientFiles({ id }) {
  const [selectedData, setselectedData] = useState();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: EditisOpen,
    onOpen: EditonOpen,
    onClose: EditonClose,
  } = useDisclosure();
  const {
    isOpen: DeleteisOpen,
    onOpen: DeleteonOpen,
    onClose: DeleteonClose,
  } = useDisclosure();

  const getPatientFiles = async () => {
    const res = await GET(admin.token, `get_patient_file?patient_id=${id}`);
    return res.data;
  };
  const { data: patientFiles, isLoading: patientFilesLoading } = useQuery({
    queryKey: ["patient-files", id],
    queryFn: getPatientFiles,
  });
  if (patientFilesLoading) return <Loading />;

  return (
    <Box>
      <Flex alignItems={"center"} justify={"space-between"}>
        {" "}
        <Heading as={"h3"} size={"sm"}>
          Tệp & Tài liệu -{" "}
        </Heading>
        <Button size={"xs"} colorScheme={"blue"} onClick={onOpen}>
          Thêm Mới
        </Button>
      </Flex>

      <Divider mt={2} mb={5} />
      <Box>
        <OrderedList spacing={3}>
          {patientFiles?.map((file, index) => (
            <ListItem key={index}>
              <Flex alignItems={"center"} gap={5}>
                <Link
                  fontWeight={600}
                  href={`${imageBaseURL}/${file.file}`}
                  isExternal
                >
                  {file.file_name}
                </Link>
                <IconButton
                  size={"xs"}
                  icon={<FaEdit />}
                  colorScheme={"blue"}
                  onClick={() => {
                    setselectedData(file);
                    EditonOpen();
                  }}
                />{" "}
                <IconButton
                  size={"xs"}
                  icon={<FaTrash />}
                  colorScheme={"red"}
                  onClick={() => {
                    setselectedData(file);
                    DeleteonOpen();
                  }}
                />
              </Flex>
              <Text fontSize={"xs"} fontWeight={600}>
                Cập nhật vào -{" "}
                {moment(file.updated_at).format("DD-MM-YY HH:mm A")})
              </Text>
            </ListItem>
          ))}
        </OrderedList>
      </Box>

      <AddPatientFiles isOpen={isOpen} onClose={onClose} id={id} />
      {EditisOpen ? (
        <UpdatePatientFiles
          isOpen={EditisOpen}
          onClose={EditonClose}
          data={selectedData}
        />
      ) : null}
      {DeleteisOpen ? (
        <DeletePatientFiles
          isOpen={DeleteisOpen}
          onClose={DeleteonClose}
          data={selectedData}
        />
      ) : null}
    </Box>
  );
}

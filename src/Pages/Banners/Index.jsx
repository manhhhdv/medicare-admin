import NotAuth from "../../Components/NotAuth";
import { GET } from "../../Controllers/ApiControllers";
import admin from "../../Controllers/admin";
import imageBaseURL from "../../Controllers/image";
import useHasPermission from "../../Hooks/HasPermission";
import AddBanners from "./Add";
import DeleteBanner from "./Delete";
import UpdateDepartmentModel from "./Update";
import {
  Box,
  Button,
  Flex,
  IconButton,
  Skeleton,
  theme,
  useDisclosure,
  useToast,
  Image,
  SimpleGrid,
  Text,
  Badge,
} from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import moment from "moment";
import { useState } from "react";
import { FaTrash } from "react-icons/fa";
import { FiEdit } from "react-icons/fi";

const getData = async () => {
  const res = await GET(admin.token, `get_banner`);
  return res.data;
};

export default function Banners() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [SelectedData, setSelectedData] = useState();
  const { hasPermission } = useHasPermission();

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

  const handleActionClick = (rowData) => {
    setSelectedData(rowData);
  };

  const { isLoading, data, error } = useQuery({
    queryKey: ["banners"],
    queryFn: () => getData(),
  });

  if (error) {
    if (!toast.isActive(id)) {
      toast({
        id,
        title: "Rất tiếc!.",
        description: "Có lỗi xảy ra.",
        status: "error",
        duration: 2000,
        isClosable: true,
        position: "top",
      });
    }
  }

  if (!hasPermission("BANNER_VIEW")) return <NotAuth />;

  return (
    <Box>
      <Flex px={2} mb={5} justify="flex-end" align="center">
        {hasPermission("BANNER_ADD") && (
          <Button size="sm" colorScheme="blue" onClick={onOpen}>
            Thêm mới
          </Button>
        )}
      </Flex>

      {isLoading || !data ? (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4} px={2}>
          {" "}
          {Array(6)
            .fill(1)
            .map((_, i) => (
              <Box
                key={i}
                borderWidth="5px"
                borderRadius="lg"
                overflow="hidden"
              >
                <Skeleton h="200px" />
                <Flex p={3} justify="space-between" align="center">
                  <Box>
                    <Skeleton h="10px" w="50%" />
                    <Skeleton h="10px" w="30%" />
                  </Box>
                  <Flex gap={2} align="center">
                    <Skeleton h="10px" w="10px" />
                    <Skeleton h="10px" w="10px" />
                  </Flex>
                </Flex>
              </Box>
            ))}
        </SimpleGrid>
      ) : (
        <Box>
          <Box
            maxH="90vh"
            overflow="scroll"
            overflowX="hidden"
            overflowY="scroll"
            sx={{
              "::-webkit-scrollbar": {
                display: "none",
              },
              "-ms-overflow-style": "none",
              "scrollbar-width": "none",
            }}
          >
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4} px={2}>
              {data.map((banner) => (
                <Box
                  key={banner.id}
                  borderWidth="5px"
                  borderRadius="lg"
                  overflow="hidden"
                >
                  <Box position="relative" h="200px">
                    <Image
                      src={`${imageBaseURL}/${banner.image}?w=400`}
                      srcSet={`${imageBaseURL}/${banner.image}?w=200 200w, ${imageBaseURL}/${banner.image}?w=400 400w, ${imageBaseURL}/${banner.image}?w=800 800w`}
                      sizes="(max-width: 600px) 200px, (max-width: 1200px) 400px, 800px"
                      alt={`Banner ${banner.id}`}
                      w="100%"
                      h="100%"
                      objectFit="cover"
                      loading="lazy"
                      fallbackSrc="imagePlaceholder.png"
                    />
                  </Box>
                  <Flex p={3} justify="space-between" align="center">
                    <Box>
                      <Text fontSize="sm">
                        Thứ tự ưu tiên: {banner.preferences}
                      </Text>
                      <Text fontSize="sm">
                        Loại:{" "}
                        <Badge
                          colorScheme={banner.type === "Web" ? "blue" : "green"}
                          fontSize="xs"
                        >
                          {banner.type}
                        </Badge>
                      </Text>
                      <Text fontSize="xs" color="gray.500">
                        {moment(banner.created_at).format("DD MMM YYYY")}
                      </Text>
                    </Box>
                    <Flex gap={2} align="center">
                      {hasPermission("BANNER_UPDATE") && (
                        <IconButton
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            handleActionClick(banner);
                            EditonOpen();
                          }}
                          icon={
                            <FiEdit
                              fontSize={18}
                              color={theme.colors.blue[500]}
                            />
                          }
                        />
                      )}
                      {hasPermission("BANNER_DELETE") && (
                        <IconButton
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            handleActionClick(banner);
                            DeleteonOpen();
                          }}
                          icon={
                            <FaTrash
                              fontSize={18}
                              color={theme.colors.red[500]}
                            />
                          }
                        />
                      )}
                    </Flex>
                  </Flex>
                </Box>
              ))}
            </SimpleGrid>
          </Box>
        </Box>
      )}

      <AddBanners isOpen={isOpen} onClose={onClose} />
      <DeleteBanner
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
    </Box>
  );
}

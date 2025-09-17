/* eslint-disable react/prop-types */
import { Button, HStack, useStyleConfig } from "@chakra-ui/react";
import ReactPaginate from "react-paginate";

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const handlePageClick = (event) => {
    onPageChange(event.selected + 1);
  };

  const paginationStyle = useStyleConfig("Pagination");

  return (
    <HStack spacing={2} mt={4}>
      <ReactPaginate
        previousLabel={
          <Button variant="link" mr={5} size={"sm"}>
            Trước
          </Button>
        }
        nextLabel={
          <Button variant="link" ml={5} size={"sm"}>
            Tiếp theo
          </Button>
        }
        breakLabel={"..."}
        breakClassName={"break-me"}
        pageCount={totalPages}
        marginPagesDisplayed={2}
        pageRangeDisplayed={5}
        onPageChange={handlePageClick}
        containerClassName={"pagination"}
        pageClassName={"page-item"}
        pageLinkClassName={"page-link"}
        previousClassName={"previous-item"}
        nextClassName={"next-item"}
        activeClassName={"active"}
        disabledClassName={"disabled"}
        renderOnZeroPageCount={null}
        style={paginationStyle}
        forcePage={currentPage - 1}
      />
    </HStack>
  );
};

export default Pagination;

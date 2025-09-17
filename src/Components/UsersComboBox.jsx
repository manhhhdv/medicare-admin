/* eslint-disable react/prop-types */
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "./ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover";
import { Box, Button, Text, useColorMode } from "@chakra-ui/react";
import { Check, ChevronsUpDown } from "lucide-react";
import { useEffect, useState } from "react";

export default function UsersCombobox({
  data: items,
  setState,
  name,
  defaultData,
  addNew,
  addOpen,
}) {
  const [open, setOpen] = useState(false);
  const [, setValue] = useState("");
  const { colorMode } = useColorMode();
  const [selected, setselected] = useState();
  console.log(defaultData);
  useEffect(() => {
    if (defaultData) {
      const selectedItem = items?.find((item) => {
        if (typeof defaultData === "string") {
          return item.id === Number(defaultData);
        } else if (typeof defaultData === "object" && defaultData !== null) {
          return item.id === Number(defaultData.id);
        }
        return false;
      });
      if (selectedItem) {
        setValue(selectedItem);
        setState(selectedItem);
        setselected(selectedItem);
      }
    }
  }, [defaultData, items, setState]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          isDisabled={defaultData}
          _disabled={{ bg: "transparent", color: "inherit" }}
          fontWeight={"500"}
          justifyContent={"space-between"}
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={`w-[100%] h-8 justify-between bg-transparent hover:bg-transparent hover:text-inherit rounded-[6px] capitalize text-sm ${
            colorMode === "dark" ? "border-[#ffffff3d]" : "border-[#E2e8f0]"
          }}`}
        >
          Chọn người dùng
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 " />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className={`w-[300px] p-0 max-h-[240px] overflow-y-scroll hideScrollbar z-[1500] ${
          colorMode === "dark" ? "bg-[#2D3748]" : "bg-[#ffffff]"
        }`}
      >
        <Command
          className={`${
            colorMode === "dark" ? "bg-[#2D3748]" : "bg-[#ffffff]"
          }`}
        >
          <CommandInput
            placeholder={`Tìm kiếm người dùng${name}`}
            className={colorMode === "dark" ? "text-[#fff]" : "text-[#000]"}
          />
          <CommandEmpty>
            <Text>Không tìm thấy người dùng nào.</Text>
            {addNew && (
              <Box w={"100%"} px={4} mt={2}>
                <Button
                  size={"sm"}
                  w={"100%"}
                  colorScheme={"blue"}
                  onClick={() => {
                    setOpen(false);
                    addOpen();
                  }}
                >
                  Thêm {name}
                </Button>
              </Box>
            )}
          </CommandEmpty>
          <CommandGroup>
            {items?.map((item) => (
              <CommandItem
                key={item.id}
                value={`${item.f_name.toString()} ${item.l_name.toString()} ${
                  item.phone
                }`}
                onSelect={() => {
                  setOpen(false);
                  setValue(item);
                  setselected(item);
                  setState(item);
                }}
                className="dark:text-white capitalize"
              >
                <Check
                  className={`mr-2 h-4 w-4 ${
                    item.id === selected?.id ? "opacity-100" : "opacity-0"
                  }`}
                />
                {item.f_name} {item.l_name} {item.phone}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

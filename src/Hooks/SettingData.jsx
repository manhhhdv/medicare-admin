// Adjust the import according to your project structure
import { GET } from "../Controllers/ApiControllers";
import admin from "../Controllers/admin";
import { useQuery } from "@tanstack/react-query";

const getData = async () => {
  try {
    const res = await GET(admin ? admin : "", `get_configurations`);
    if (res && res.data) {
      return res.data;
    } else {
      console.error("Invalid response format:", res);
      throw new Error("Invalid response format");
    }
  } catch (error) {
    console.error("Failed to fetch settings data:", error);
    throw error;
  }
};

const useSettingsData = () => {
  const {
    isLoading: settingsLoading,
    data: settingsData,
    error: settingsError,
  } = useQuery({
    queryKey: ["settings"],
    queryFn: getData,
  });

  return { settingsData, settingsLoading, settingsError };
};

export default useSettingsData;

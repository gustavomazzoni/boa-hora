import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY_DATA = "@BoaHora_Data";

export const saveData = async (data: unknown) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY_DATA, JSON.stringify(data));
  } catch (e) {
    const errorMsg = "Failed to save data";
    console.error(errorMsg, e);
    throw e;
  }
};

export const getData = async () => {
  try {
    const savedData = await AsyncStorage.getItem(STORAGE_KEY_DATA);

    return savedData ? JSON.parse(savedData) : savedData;
  } catch (e) {
    const errorMsg = "Failed to get data";
    console.error(errorMsg, e);
    throw e;
  }
};

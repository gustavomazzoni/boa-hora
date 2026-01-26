import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY_STATE = "@BoaHora_State";

export const saveState = async (state: unknown) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY_STATE, JSON.stringify(state));
  } catch (e) {
    const errorMsg = "Failed to save state";
    console.error(errorMsg, e);
    throw e;
  }
};

export const getState = async () => {
  try {
    const savedState = await AsyncStorage.getItem(STORAGE_KEY_STATE);

    return savedState ? JSON.parse(savedState) : savedState;
  } catch (e) {
    const errorMsg = "Failed to get state";
    console.error(errorMsg, e);
    throw e;
  }
};

import AsyncStorage from '@react-native-async-storage/async-storage';

export type TravelEntry = {
  id: string;
  title: string;
  description: string;
  date: string;
  location: {
    name: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
  images: string[];
};

const STORAGE_KEY = 'travel_entries';

export const saveEntry = async (entry: Omit<TravelEntry, 'id'>) => {
  try {
    // Get existing entries
    const existingEntriesJSON = await AsyncStorage.getItem(STORAGE_KEY);
    const existingEntries: TravelEntry[] = existingEntriesJSON
      ? JSON.parse(existingEntriesJSON)
      : [];

    // Create new entry with ID
    const newEntry: TravelEntry = {
      ...entry,
      id: Date.now().toString(),
    };

    // Save updated entries
    const updatedEntries = [newEntry, ...existingEntries];
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedEntries));

    return newEntry;
  } catch (error) {
    console.error('Error saving entry:', error);
    throw error;
  }
};

export const getEntries = async (): Promise<TravelEntry[]> => {
  try {
    const entriesJSON = await AsyncStorage.getItem(STORAGE_KEY);
    return entriesJSON ? JSON.parse(entriesJSON) : [];
  } catch (error) {
    console.error('Error getting entries:', error);
    return [];
  }
};

export const getEntryById = async (id: string): Promise<TravelEntry | null> => {
  try {
    const entries = await getEntries();
    return entries.find((entry) => entry.id === id) || null;
  } catch (error) {
    console.error('Error getting entry by ID:', error);
    return null;
  }
};

export const deleteEntry = async (id: string): Promise<boolean> => {
  try {
    const entries = await getEntries();
    const updatedEntries = entries.filter((entry) => entry.id !== id);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedEntries));
    return true;
  } catch (error) {
    console.error('Error deleting entry:', error);
    return false;
  }
};

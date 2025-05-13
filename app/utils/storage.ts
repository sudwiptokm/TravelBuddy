import { supabase } from './supabase';

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

export const saveEntry = async (entry: Omit<TravelEntry, 'id'>) => {
  try {
    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error('User not authenticated');

    // Insert travel entry
    const { data: entryData, error: entryError } = await supabase
      .from('travel_entries')
      .insert({
        user_id: user.id,
        title: entry.title,
        description: entry.description,
        date: entry.date,
        location_name: entry.location.name,
        latitude: entry.location.coordinates.latitude,
        longitude: entry.location.coordinates.longitude,
      })
      .select()
      .single();

    if (entryError) throw entryError;

    // Upload images
    const imageUrls = [];
    for (const imageUri of entry.images) {
      // Extract filename from URI
      const fileName = imageUri.split('/').pop() || '';
      const fileExt = fileName.split('.').pop() || 'jpg';
      const filePath = `${user.id}/${entryData.id}/${Date.now()}.${fileExt}`;

      // Upload to Supabase Storage
      const response = await fetch(imageUri);
      const blob = await response.blob();
      const { error: uploadError } = await supabase.storage
        .from('travel_images')
        .upload(filePath, blob, {
          contentType: `image/${fileExt}`,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from('travel_images').getPublicUrl(filePath);

      imageUrls.push(publicUrl);

      // Save image reference in database
      const { error: imageError } = await supabase.from('travel_images').insert({
        entry_id: entryData.id,
        storage_path: filePath,
      });

      if (imageError) throw imageError;
    }

    // Return formatted entry
    return {
      id: entryData.id,
      title: entryData.title,
      description: entryData.description,
      date: entryData.date,
      location: {
        name: entryData.location_name,
        coordinates: {
          latitude: entryData.latitude,
          longitude: entryData.longitude,
        },
      },
      images: imageUrls,
    };
  } catch (error) {
    console.error('Error saving entry:', error);
    throw error;
  }
};

export const getEntries = async (): Promise<TravelEntry[]> => {
  try {
    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new Error('User not authenticated');

    // Get entries
    const { data: entries, error } = await supabase
      .from('travel_entries')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false });

    if (error) throw error;

    // Get images for each entry
    const formattedEntries = await Promise.all(
      entries.map(async (entry) => {
        const { data: images, error: imagesError } = await supabase
          .from('travel_images')
          .select('storage_path')
          .eq('entry_id', entry.id);

        if (imagesError) throw imagesError;

        // Get public URLs for images
        const imageUrls = images.map((img) => {
          const {
            data: { publicUrl },
          } = supabase.storage.from('travel_images').getPublicUrl(img.storage_path);
          return publicUrl;
        });

        return {
          id: entry.id,
          title: entry.title,
          description: entry.description,
          date: entry.date,
          location: {
            name: entry.location_name,
            coordinates: {
              latitude: entry.latitude,
              longitude: entry.longitude,
            },
          },
          images: imageUrls,
        };
      })
    );

    return formattedEntries;
  } catch (error) {
    console.error('Error getting entries:', error);
    return [];
  }
};

export const getEntryById = async (id: string): Promise<TravelEntry | null> => {
  try {
    // Get entry
    const { data: entry, error } = await supabase
      .from('travel_entries')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    // Get images
    const { data: images, error: imagesError } = await supabase
      .from('travel_images')
      .select('storage_path')
      .eq('entry_id', id);

    if (imagesError) throw imagesError;

    // Get public URLs for images
    const imageUrls = images.map((img) => {
      const {
        data: { publicUrl },
      } = supabase.storage.from('travel_images').getPublicUrl(img.storage_path);
      return publicUrl;
    });

    return {
      id: entry.id,
      title: entry.title,
      description: entry.description,
      date: entry.date,
      location: {
        name: entry.location_name,
        coordinates: {
          latitude: entry.latitude,
          longitude: entry.longitude,
        },
      },
      images: imageUrls,
    };
  } catch (error) {
    console.error('Error getting entry by ID:', error);
    return null;
  }
};

export const deleteEntry = async (id: string): Promise<boolean> => {
  try {
    // Get images to delete from storage
    const { data: images } = await supabase
      .from('travel_images')
      .select('storage_path')
      .eq('entry_id', id);

    // Delete from storage
    if (images && images.length > 0) {
      const paths = images.map((img) => img.storage_path);
      const { error: storageError } = await supabase.storage.from('travel_images').remove(paths);

      if (storageError) throw storageError;
    }

    // Delete entry (will cascade delete images from database)
    const { error } = await supabase.from('travel_entries').delete().eq('id', id);

    if (error) throw error;

    return true;
  } catch (error) {
    console.error('Error deleting entry:', error);
    return false;
  }
};

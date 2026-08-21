import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

export const uploadImage = async (
  file: File,
  folder: string = "general"
): Promise<string> => {
  const formData = new FormData();
  formData.append("image", file);

  const response = await API.post(
    `/upload/image?folder=${folder}`,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    }
  );

  return response.data.url;
};
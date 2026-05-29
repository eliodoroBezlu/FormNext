import { uploadImageToCloudinary } from "@/lib/actions/cloudinary";

export const uploadImageAdapter = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("file", file);
  const { url } = await uploadImageToCloudinary(formData);
  return url;
};

import cloudinary from "../../config/cloudinary";

class UploadService {
  async uploadImage(
    fileBuffer: Buffer,
    folder: string = "synapse"
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: "image",
          transformation: [
            { quality: "auto", fetch_format: "auto" },
          ],
        },
        (error, result) => {
          if (error) return reject(error);
          if (!result) return reject(new Error("Upload failed"));
          resolve(result.secure_url);
        }
      );

      stream.end(fileBuffer);
    });
  }

  async deleteImage(imageUrl: string): Promise<void> {
    // Extract public_id from URL
    // e.g. https://res.cloudinary.com/xxx/image/upload/v123/synapse/abc.jpg
    const parts = imageUrl.split("/");
    const filename = parts[parts.length - 1];
    const folder = parts[parts.length - 2];
    const publicId = `${folder}/${filename.split(".")[0]}`;

    try {
      await cloudinary.uploader.destroy(publicId);
    } catch (err) {
      console.error("Failed to delete image:", err);
    }
  }
}

export default new UploadService();
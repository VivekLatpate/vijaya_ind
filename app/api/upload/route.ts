import { NextRequest } from "next/server";
import { v2 as cloudinary, UploadApiResponse } from "cloudinary";
import { ensureAdminRequest } from "@/lib/admin";
import { errorResponse, successResponse } from "@/lib/api";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const adminCheck = await ensureAdminRequest();
  if (!adminCheck.ok) {
    return adminCheck.response;
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return errorResponse("No file provided", 400);
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadResult: UploadApiResponse = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "vijaya_ind_products",
          resource_type: "auto",
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result as UploadApiResponse);
        }
      );
      uploadStream.end(buffer);
    });

    return successResponse({ url: uploadResult.secure_url });
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    return errorResponse("Failed to upload image", 500);
  }
}

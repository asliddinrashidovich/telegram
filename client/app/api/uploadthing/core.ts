import { authOptions } from "@/lib/auth-options";
import { getServerSession } from "next-auth";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";

const f = createUploadthing();

export const ourFileRouter = {
  imageUploader: f({
    image: {
      maxFileSize: "4MB",
    },
  })
    // Set permissions and file types for this FileRoute
    .middleware(async () => {
      const token = await getServerSession(authOptions);
      if (!token) throw new UploadThingError("Unauthoried");
      return { token };
    })
    .onUploadComplete(async ({ file }) => {
      return {
        url: file.url,
        name: file.name,
        size: file.size,
      };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;

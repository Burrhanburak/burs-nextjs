import { createUploadthing, type FileRouter } from 'uploadthing/next'
import { z } from 'zod'

const f = createUploadthing()

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  // Define as many FileRoutes as you like, each with a unique routeSlug
  documentUploader: f({ image: { maxFileSize: '4MB' }, pdf: { maxFileSize: '4MB' } })
    // Set permissions and file types for this FileRoute
    .input(z.object({ scholarshipApplicationId: z.string().optional() }))
    .middleware(({ input }) => {
      // This code runs on your server before upload
      console.log("UploadThing middleware called", input)

      // Whatever is returned here is accessible in onUploadComplete as `metadata`
      return { userId: "test-user", scholarshipApplicationId: input.scholarshipApplicationId }
    })
    .onUploadComplete(({ metadata, file }) => {
      // This code RUNS ON YOUR SERVER after upload
      console.log("Upload complete for userId:", metadata.userId, "scholarshipApplicationId:", metadata.scholarshipApplicationId)

      // !!! Whatever is returned here is sent to the clientside `onClientUploadComplete` callback
      return { 
        uploadedBy: metadata.userId, 
        url: file.url,
        scholarshipApplicationId: metadata.scholarshipApplicationId
      }
    }),
    
  // Image uploader for profile pictures and general images
  imageUploader: f({ image: { maxFileSize: '4MB' } })
    .middleware(() => {
      return { userId: "test-user" };
    })
    .onUploadComplete(({ file }) => {
      return { url: file.url };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
import { createRouteHandler } from "uploadthing/next"
import { ourFileRouter } from "./core"

// Make sure UPLOADTHING_TOKEN is set in your .env file!
// Get yours at: https://uploadthing.com/dashboard
export const { GET, POST } = createRouteHandler({
  router: ourFileRouter,
})
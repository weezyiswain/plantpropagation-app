import { getExpressApp } from "../server/index";

// Cache the Express app instance across invocations
let appPromise: Promise<any> | null = null;

async function getApp() {
  if (!appPromise) {
    appPromise = getExpressApp();
  }
  return appPromise;
}

// Vercel serverless function handler
export default async function handler(req: any, res: any) {
  const app = await getApp();
  return app(req, res);
}

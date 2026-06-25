import app from "../server";

export default (req: any, res: any) => {
  // If Vercel rewrote the URL to the base /api destination, restore the full path 
  // so Express routes like /api/auth/google match correctly.
  const originalPath = req.headers['x-invoke-path'];
  if (originalPath && typeof originalPath === 'string') {
    req.url = originalPath;
  }
  return app(req, res);
};

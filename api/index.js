import app from "../dist/server.cjs";

export default (req, res) => {
  try {
    const originalPath = req.headers['x-invoke-path'];
    if (originalPath && typeof originalPath === 'string') {
      req.url = originalPath;
    }
    return app(req, res);
  } catch (error) {
    console.error("Fatal Serverless Error:", error);
    res.status(500).json({ status: "error", message: "A fatal backend error occurred", details: error?.message || String(error) });
  }
};

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

export async function generateServerViteMiddleware(app: express.Express) {
  if (process.env.NODE_ENV !== "production") {
    console.log("[TradeEdge Dev] Setting up dynamic Vite hot development core middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("[TradeEdge Prod] Setting up static asset routes...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }
}

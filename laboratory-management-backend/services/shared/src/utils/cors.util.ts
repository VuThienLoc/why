const allowedOrigins = [
  process.env.WEB_URL,
  "https://ojt-project-ya2d.vercel.app",
  "http://localhost:5173",
  "http://localhost:3000",
].filter(Boolean) as string[];

export const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Allow non-browser / server-to-server requests with no origin
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Internal-API-Key",
    "X-Access-Token",
  ],
};

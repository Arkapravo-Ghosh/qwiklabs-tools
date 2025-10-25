import express from "express";
import http from "http";
import path from "path";
import cookieParser from "cookie-parser";
import logger from "morgan";
import checkJSON from "./middlewares/checkJSON";

// Express Configuration
const app = express();

// CORS Configuration
import cors, { CorsOptions } from "cors";

const corsOptions: CorsOptions = {
  origin: [
  ],
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

// Logger Configuration
app.use(process.env.PRODUCTION ? logger("combined") : logger("dev"));

// Global Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.resolve("public")));
app.use(checkJSON);

// MongoDB Connection
import connectDB from "./configs/dbConfig";
connectDB();

// Server Configuration
const server = http.createServer(app);
const port: number = Number(process.env.PORT) || 8000;

// Index Router Import
import indexRouter from "./indexRouter";

app.use("/", indexRouter);

// Error Handler Middleware
import errorHandler from "./middlewares/errorHandler";
app.use(errorHandler);

server.listen(port, (): void => {
  console.log("Server listening on port " + port);
});

// Close server
const closeServer = (): void => {
  server.close(() => {
    console.log("\nProcess terminated, closing server.");
    process.exit(0);
  });
};

process.on("SIGINT", closeServer);
process.on("SIGTERM", closeServer);
process.once("SIGUSR2", closeServer);

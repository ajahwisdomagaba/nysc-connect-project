import dotenv from 'dotenv';
dotenv.config();

import express from "express";
import cors from "cors";
import helmet from "helmet";
import apiRouter from "./src/routes/index.js";
import { response } from "express";
import connectDB from "./src/config/db.js";

// Connect to MongoDB
connectDB();


const app = express();


//Base Security and Parsing Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());

//API vi Namespace
app.use("/api/v1", apiRouter);

//API Health check
app.get("/", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Welcome to NYSC Connect API",
  });
});


//API Health check
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Nysc Connect api is healthy",
  });
});

//404 Catch-all Route
app.use((req, res) => {
  res.status(404).json({
    status: "fail",
    message: `Endpoint ${req.originalUrl} not found on this server`,
  });
});


//Global Error handler
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    status: 'error',
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(
    `Server is running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`,
  );
});

export default app;

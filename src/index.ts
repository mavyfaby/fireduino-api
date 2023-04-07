import express from "express";
import dotenv from "dotenv";

import cors from "cors";
import helmet from "helmet";
import routes from "./routes";

import type { HttpMethod } from "./types";

import { data, getPathname, isApiExist } from "./utils";
import { handleNotFound, handleUnimplemented } from "./routes/handlers";
import { FireduinoDatabase } from "./classes/database";

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

const domain = process.env.NODE_ENV === "production" ? "https://fireduino.cloud" : "http://127.0.0.1:3000";

app.use(cors({
  origin: domain
}));

app.use(helmet());
app.use(express.json());

// Catch all routes
app.use("*", (request, response) => {
  // Get pathname
  const pathname = getPathname(request.originalUrl);

  // Set default content type
  response.setHeader("Content-Type", "application/json");

  // If pathame is not an API
  if (!isApiExist(pathname)) {
    // Return 404
    handleNotFound(request, response);
    return;
  }
  
  // Otherwise, call the requested API
  for (const route of routes) {
    if (pathname === route.path) {
      // If the method is not allowed
      if (!route.methods.includes(request.method as HttpMethod)) {
        // Return 405
        handleUnimplemented(request, response);
        break;
      }

      // Otherwise, call the handler
      route.handler(request, response);
      break;
    }
  }
});

// Start the server
app.listen(port, () => {
  // Initialize database
  FireduinoDatabase.getInstance();
  console.log(`Fireduino API is listening on port ${port}`);
});

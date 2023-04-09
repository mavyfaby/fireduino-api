import express from "express";
import dotenv from "dotenv";

import cors from "cors";
import helmet from "helmet";
import routes from "./routes";

import type { HttpMethod } from "./types";
import type { Request, Response } from "express";

import { handleNotFound, handleUnimplemented, handleUnauthorized } from "./routes/handlers";
import { getPathname, isApiExist } from "./utils";
import { FireduinoDatabase } from "./classes/database";
import { FireduinoSession } from "./classes/session";

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 4000;
const domain = process.env.NODE_ENV === "production" ? "https://fireduino.cloud" : "http://127.0.0.1:3000";

// Initialize session
const session = FireduinoSession.getInstance();

app.use(cors({
  origin: domain
}));

app.use(helmet());
app.use(express.urlencoded({ extended: true }));

// Attach session middleware
app.use(session.getMiddleware());

// Catch all routes
app.use("*", (request: Request, response: Response) => {
  // If the session is unauthorized
  if (response.locals.isUnauthorized) {
    return handleUnauthorized(request, response);
  }

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
  // Log test
  console.log(`Fireduino API is listening on port ${port}`);
});

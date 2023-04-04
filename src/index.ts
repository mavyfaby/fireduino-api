import express from "express";

import { data, getPathname, isApiExist } from "./utils";
import routes from "./routes";
import helmet from "helmet";

const app = express();
const port = process.env.PORT || 3000;

app.use(helmet());

// Catch all routes
app.use("*", (request, response) => {
  // Get pathname
  const pathname = getPathname(request.originalUrl);

  // Set default content type
  response.setHeader("Content-Type", "application/json");

  // If pathame is not an API
  if (!isApiExist(pathname)) {
    // Return 404
    response.status(404).send(data(false, "Not found"));
    return;
  }
  
  // Otherwise, call the requested API
  for (const route of routes) {
    if (pathname === route.path) {
      route.handler(request, response);
      break;
    }
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Fireduino API is listening on port ${port}`);
});

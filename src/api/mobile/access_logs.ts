import type { Request, Response } from "express";

import { data } from "../../utils";
import { FireduinoDatabase } from "../../classes/database";

/**
 * Device Access Logs API
 * @param request  
 * @param response 
 */
export async function accessLogs(request: Request, response: Response) {
  // Get database instance
  const db = FireduinoDatabase.getInstance();
  
  // Query the database
  db.getAccessLogs(response.locals.token, (result) => {
    // If there is an error
    if (result === null) {
      // Send error
      response.status(500).send(data.error("Failed to get device access logs!"));
      return;
    }

    // Send data
    response.send(data.success("Success!", result));
  });
}
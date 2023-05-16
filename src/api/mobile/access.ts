import type { Request, Response } from "express";

import { data } from "../../utils";
import { FireduinoDatabase } from "../../classes/database";

/**
 * Device Access Logs API
 * @param request  
 * @param response 
 */
export async function accessDevice(request: Request, response: Response) {
  // Get device id
  const deviceId = request.body.id;

  // If device id is not provided
  if (!deviceId) {
    // Send error
    response.status(400).send(data.error("Invalid request!"));
    return;
  }

  // Get database instance
  const db = FireduinoDatabase.getInstance();
  
  // Query the database
  db.addAccessLog(response.locals.token, Number(deviceId), (result) => {
    // If there is an error
    if (result === null) {
      // Send error
      response.status(500).send(data.error("Failed to log device!"));
      return;
    }

    // Send data
    response.send(data.success("Success"));
  });
}
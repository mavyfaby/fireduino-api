import type { Request, Response } from "express";

import { data } from "../../utils";
import { FireduinoDatabase } from "../../classes/database";

/**
 * Get Fireduinos API
 * @param request  
 * @param response 
 */
export async function fireduinos(request: Request, response: Response) {
  // Get params
  const { estbID } = request.query;

  // If there is no token
  if (!estbID) {
    // Send error
    response.status(400).send(data.error("Invalid request!"));
    return;
  }

  // Convert id to number
  const est = Number(estbID);

  // Get database instance
  const db = FireduinoDatabase.getInstance();

  // Query the database
  db.getFireduinos(est, (result) => {
    if (result === null) {
      // Send error
      response.status(500).send(data.error("System Error [GT_FRDS]: Please report this bug!"));
      return;
    }
    
    // Otherwise, send the fireduino's data
    response.send(data.success(result));
  });
}
import type { Request, Response } from "express";

import { data } from "../../utils";
import { FireduinoDatabase } from "../../classes/database";

/**
 * Fetch edit logs
 * @param request  
 * @param response 
 */
export async function edit_history(request: Request, response: Response) {
  // Get database instance
  const db = FireduinoDatabase.getInstance();
  
  // Query the database
  db.getEditHistory(response.locals.token, (result) => {
    // If there is an error
    if (result === null) {
      // Send error
      response.status(500).send(data.error("Failed to get edit history!"));
      return;
    }

    // Send data
    response.send(data.success("Success!", result));
  });
}
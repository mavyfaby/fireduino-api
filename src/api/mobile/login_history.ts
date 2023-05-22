import type { Request, Response } from "express";

import { data } from "../../utils";
import { FireduinoDatabase } from "../../classes/database";

/**
 * Login History logs
 * @param request  
 * @param response 
 */
export async function login_history(request: Request, response: Response) {
  // Get database instance
  const db = FireduinoDatabase.getInstance();
  
  // Query the database
  db.getLoginHistory(response.locals.token, (result) => {
    // If there is an error
    if (result === null) {
      // Send error
      response.status(500).send(data.error("Failed to get login history!"));
      return;
    }

    // Send data
    response.send(data.success("Success!", result));
  });
}
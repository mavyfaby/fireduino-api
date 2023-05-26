import type { Request, Response } from "express";

import { data } from "../../utils";
import { FireduinoDatabase } from "../../classes/database";

/**
 * Login History logs
 * @param request  
 * @param response 
 */
export async function sms_history(request: Request, response: Response) {
  // Get database instance
  const db = FireduinoDatabase.getInstance();
  
  // Query the database
  db.getSmsHistory(response.locals.token, (result) => {
    // If there is an error
    if (result === null) {
      // Send error
      response.status(500).send(data.error("Failed to get sms history!"));
      return;
    }

    // Send data
    response.send(data.success("Success!", result));
  });
}
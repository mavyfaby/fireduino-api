import type { Request, Response } from "express";

import { data } from "../../utils";
import { FireduinoDatabase } from "../../classes/database";

/**
 * Get Incident Reports API
 * @param request  
 * @param response 
 */
export async function incidentReports(request: Request, response: Response) {
  // Get database instance
  const db = FireduinoDatabase.getInstance();

  // Query the database
  db.getReports(response.locals.token, (result) => {
    if (result === null) {
      // Send error
      response.status(500).send(data.error("System Error [GT_RPT]: Please report this bug!"));
      return;
    }
    
    // Otherwise, send the fireduino's data
    response.send(data.success("Success", result));
  });
}
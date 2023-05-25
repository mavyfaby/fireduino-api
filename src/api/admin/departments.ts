import type { Request, Response } from "express";

import { data } from "../../utils";
import { FireduinoDatabase } from "../../classes/database";

/**
 * Get Fire Departments
 * @param request  
 * @param response 
 */
export async function departments(request: Request, response: Response) {
  // Get database instance
  const db = FireduinoDatabase.getInstance();
  
  // Query the database
  db.getFireDepartments(undefined, undefined, (result) => {
    // If there is an error
    if (result === null) {
      // Send error
      response.status(500).send(data.error("Failed to get fire departments!"));
      return;
    }

    // Send data
    response.send(data.success("Success!", result));
  });
}
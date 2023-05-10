import type { Request, Response } from "express";

import { data } from "../../utils";
import { FireduinoDatabase } from "../../classes/database";

/**
 * Validate email 
 * @param request  
 * @param response 
 */
export async function validateEmail(request: Request, response: Response) {
  // Get request params
  let { email } = request.body;

  // If there is no email
  if (!email) {
    // Send error
    response.status(400).send(data.error("Invalid request!"));
    return;
  }
  
  // Get database instance
  const db = FireduinoDatabase.getInstance();

  // Query the database
  db.isEmailTaken(email, (result) => {
    // If there is an error
    if (result === null) {
      // Send error
      response.status(500).send(data.error("System Error: [VLE] Failed to validate email!"));
      return;
    }

    // Send data
    response.send(data.success("Success!", result));
  });
}
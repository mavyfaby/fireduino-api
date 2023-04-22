import type { Request, Response } from "express";

import { data } from "../../utils";
import { FireduinoDatabase } from "../../classes/database";

/**
 * Verify Establishment invite key
 * @param request  
 * @param response 
 */
export async function verify(request: Request, response: Response) {
  // Get request params
  const { id, inviteKey } = request.body;

  // If there is no id or invite key
  if (!id || !inviteKey) {
    // Send error
    response.status(400).send(data.error("Invalid request!"));
    return;
  }

  // Get database instance
  const db = FireduinoDatabase.getInstance();

  // Query the database
  db.getEstablishmentById(id, (result) => {
    // If there is an error
    if (result === null) {
      // Send error
      response.status(500).send(data.error("Failed to get establishment!"));
      return;
    }

    // Declare result
    let res = data.error("Invalid invite key!");

    // Is the establishment verified?
    if (result.invite_key.toLowerCase() === inviteKey.toLowerCase()) {
      // Set result
      res = data.success("Success!");
    }

    // Send data
    response.send(res);
  });
}
import type { Request, Response } from "express";

import { data } from "../../utils";
import { FireduinoDatabase } from "../../classes/database";

/**
 * Get Establishments 
 * @param request  
 * @param response 
 */
export async function establishment(request: Request, response: Response) {
  // Get request params
  let { id } = request.query;

  // If id is undifined
  if (!id) {
    // Send error
    response.status(400).send(data.error("Invalid request!"));
    return;
  }

  // Get database instance
  const db = FireduinoDatabase.getInstance();

  // Query the database
  db.getEstablishmentById(Number(id), (result) => {
    // If there is an error
    if (result === null) {
      // Send error
      response.status(500).send(data.error("Failed to get establishment!"));
      return;
    }

    const estb = {
      a: result.id,
      b: result.invite_key,
      c: result.name,
      d: result.phone,
      e: result.address,
      f: result.latitude,
      g: result.longitude,
    };

    // Send data
    response.send(data.success("Success!", estb));
  });
}
import type { Request, Response } from "express";

import { data } from "../../utils";
import { FireduinoDatabase } from "../../classes/database";

/**
 * Get Establishments 
 * @param request  
 * @param response 
 */
export async function establishments(request: Request, response: Response) {
  // Get request params
  let { search, nameOnly } = request.query;

  // If there is no search param, set to empty string
  if (!search) search = "";
  // Set {nameOnly} to boolean
  const isNameOnly = nameOnly === "1";
  // Get database instance
  const db = FireduinoDatabase.getInstance();

  // Query the database
  db.getEstablishments({ search: search.toString(), isNameOnly, limit: 5 }, (result) => {
    // If there is an error
    if (result === null) {
      // Send error
      response.status(500).send(data.error("Failed to get establishments!"));
      return;
    }

    // Send data
    response.send(data.success("Success!", result));
  });
}
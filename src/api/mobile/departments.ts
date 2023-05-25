import type { Request, Response } from "express";

import { data } from "../../utils";
import { FireduinoDatabase } from "../../classes/database";
import LatLng from "../../models/latlng";

/**
 * Get Fire Departments
 * @param request  
 * @param response 
 */
export async function departments(request: Request, response: Response) {
  // Get request data
  let { location, search } = request.query;
  // Get database instance
  const db = FireduinoDatabase.getInstance();

  // Check if location is undefined
  if (typeof location !== "string") {
    // Set location to undefined
    location = undefined;
  }

  // Check if searcg is undefined
  if (typeof search !== "string") {
    // Set location to undefined
    search = "";
  }

  // Query the database
  db.getFireDepartments(location, search, (result) => {
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
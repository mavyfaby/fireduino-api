import type { Request, Response } from "express";

import { data } from "../../utils";
import { isTelPhone } from "../../utils/string";
import { FireduinoDatabase } from "../../classes/database";
import { FireDepartment } from "../../types";

/**
 * Fire Department API
 * @param request  
 * @param response 
 */
export async function department(request: Request, response: Response) {
  // Identify request method
  switch (request.method) {
    case "GET":
      return _getDepartment(request, response);
    case "POST":
      return _addDepartment(request, response);
  }
}

/**
 * Get Fire Department
 * @param request
 * @param response
 */
function _getDepartment(request: Request, response: Response) {
  // Intentionally left blank
  response.send(data.success());
}

/**
 * Add Fire Department
 * @param request
 * @param response
 */
function _addDepartment(request: Request, response: Response) {
  // Get inputs
  let { name, phone, address, latitude, longitude } = request.body;

  // If one of them is not provided
  if (name === undefined ||
      phone === undefined ||
      address === undefined ||
      latitude === undefined ||
      longitude === undefined) {
    
    // Return error
    response.send(data.error("Incomplete request!"));
    return;
  }

  // Trim the inputs  
  name = name.trim();
  phone = phone.trim();
  address = address.trim();
  latitude = latitude.trim();
  longitude = longitude.trim();

  // Validate inputs
  const errorMessage = _validate(name, phone, address, latitude, longitude);

  // If there's an error
  if (errorMessage.length > 0) {
    response.send(data.error(errorMessage));
    return;
  }

  // Fire Department data
  const department: FireDepartment = {
    name, phone, address, latitude, longitude
  };

  // Get database instance
  const db = FireduinoDatabase.getInstance();
  // Add department
  db.addFireDepartment(department, (result) => {
    // If has error
    if (result === null) {
      response.status(500).send(data.error("Failed to add fire department!"));
      return;
    }

    // Otherwise, return 200
    response.send(data.success("Fire department added!"));
  });
}

/**
 * Validate inputs
 */
function _validate(name: string, phone: string, address: string, latitude: string, longitude: string) {
  if (name.length === 0) return "Name is required";
  if (phone.length === 0) return "Phone is required";
  if (!isTelPhone(phone)) return "Must be a valid telephone number";
  if (address.length === 0) return "Address is required";

  // TODO: Validate latitude and longitude if it's in range

  if (latitude.length === 0) return "Latitude is required";
  if (isNaN(Number(latitude))) return "Latitude must be a number";
  if (longitude.length === 0) return "Longitude is required";
  if (isNaN(Number(longitude))) return "Longitude must be a number";

  return "";
}

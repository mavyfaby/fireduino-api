import type { Request, Response } from "express";

import { Establishment } from "../../types";
import { FireduinoDatabase } from "../../classes/database";
import { data, validateEstablishment } from "../../utils";

/**
 * Establishment API
 * @param request  
 * @param response 
 */
export async function establishment(request: Request, response: Response) {
  // Identify request method
  switch (request.method) {
    case "GET":
      return _getEstablishment(request, response);
    case "POST":
      return _addEstablishment(request, response);
    case "PUT":
      return _editEstablishment(request, response);
  }
}

/**
 * Get Establishment
 * @param request
 * @param response
 */
function _getEstablishment(request: Request, response: Response) {
  // Intentionally left blank
  response.send(data.success());
}

/**
 * Edit Establishment
 * @param request
 * @param response
 */
function _editEstablishment(request: Request, response: Response) {
  // Intentionally left blank
  response.send(data.success());
}

/**
 * Add Establishment
 * @param request
 * @param response
 */
function _addEstablishment(request: Request, response: Response) {
  // Get inputs
  let { name, phone, address, inviteKey } = request.body;

  // If one of them is not provided
  if (name === undefined ||
      phone === undefined ||
      address === undefined ||
      inviteKey === undefined) {
    
    // Return error
    response.send(data.error("Incomplete request!"));
    return;
  }

  // Trim the inputs  
  name = name.trim();
  phone = phone.trim();
  address = address.trim();
  inviteKey = inviteKey.trim();

  // Validate inputs
  const errorMessage = validateEstablishment(name, phone, address, inviteKey);

  // If there's an error
  if (errorMessage.length > 0) {
    response.send(data.error(errorMessage));
    return;
  }

  // Establishment data
  const establishment: Establishment = {
    name, phone, invite_key: inviteKey, address
  };

  // Get database instance
  const db = FireduinoDatabase.getInstance();

  // Add Establishment
  db.addEstablishment(establishment, (result) => {
    // If has error
    if (result === null) {
      response.status(500).send(data.error("Failed to add establishment!"));
      return;
    }

    // Otherwise, return 200
    response.send(data.success("Establishment added!"));
  });
}


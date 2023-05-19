import type { Request, Response } from "express";

import { data } from "../../utils";
import { FireduinoDatabase } from "../../classes/database";
import { ErrorCode } from "../../types";

/**
 * Fireduino Management API
 * @param request  
 * @param response 
 */
export async function fireduino(request: Request, response: Response) {
  // If POST request
  if (request.method === "POST") {
    // Create a fireduino
    return createFireduino(request, response);
  }

  // If PUT request
  if (request.method === "PUT") {
    // Edit a fireduino
    return editFireduino(request, response);
  }

  // Otherwise, get the fireduino's data
  return getFireduino(request, response);
}

/**
 * Create a fireduino
 */
function createFireduino(request: Request, response: Response) {
  // Get params
  let { estbID, mac, name } = request.body;

  // If there is no token
  if (!estbID || !mac || !name) {
    // Send error
    response.status(400).send(data.error("Invalid request!"));
    return;
  }

  // Trim id's
  estbID = estbID.toString().trim();
  mac = mac.toString().trim();
  name = name.toString().trim();

  // Check if the fireduino is already registered
  isFireduinoRegistered(estbID, mac, (result) => {
    // If there is an error
    if (result === null) {
      // Send error
      response.status(400).send(data.error("System Error [CHK_FRD]: Please report this bug!"));
      return;
    }

    // If the fireduino is already registered
    if (result) {
      // Send error
      response.status(400).send(data.error("The fireduino is already registered!"));
      return;
    }

    // Otherwise, get database instance
    const db = FireduinoDatabase.getInstance();

    // Create the fireduino
    db.addFireduino(estbID, mac, name, (result) => {
      // If there is an error
      if (result === null) {
        // Send error
        response.status(500).send(data.error("System Error [CR_FRD]: Please report this bug!"));
        return;
      }

      // Otherwise, send the fireduino's data
      response.send(data.success(result));
    });
  });
}

/**
 * Edit fireduino
 */
function editFireduino(request: Request, response: Response) {
  // Get name param
  let { estbID, mac, deviceID, name } = request.body;

  // If one of the params is not defined
  if (!estbID || !mac || !deviceID || !name) {
    // Send error
    response.status(400).send(data.error("Invalid request!"));
    return;
  }

  // Trim inputs
  estbID = estbID.toString().trim();
  deviceID = deviceID.toString().trim();
  mac = mac.toString().trim();
  name = name.toString().trim();

  // Check if the fireduino is already registered
  isFireduinoRegistered(estbID, mac, (result) => {
    // If there is an error
    if (result === null) {
      // Send error
      response.status(400).send(data.error("System Error [CHK_FRD]: Please report this bug!"));
      return;
    }

    // If the fireduino is not found
    if (!result) {
      // Send error
      response.status(400).send(data.error("The fireduino doesn't exist!"));
      return;
    }

    // Otherwise, get database instance
    const db = FireduinoDatabase.getInstance();

    // Edit fireduino device
    // Create the fireduino
    db.editFireduino(estbID, mac, name, (result, errorCode) => {
      // If there is an error
      if (result === null) {
        let message = "System Error [EDT_FRD]: Please report this bug!";

        switch (errorCode) {
          case ErrorCode.DEVICE_NOT_FOUND:
            message = "The fireduino doesn't exist!";
            break;
          case ErrorCode.SYSTEM_ERROR:
            message = "System Error [EDT_FRD]: Please report this bug!";
            break;
          case ErrorCode.NAME_TAKEN:
            message = "The name is already taken!";
            break;
        }

        // Send error
        response.status(500).send(data.error(message));
        return;
      }

      // Otherwise, send the fireduino's data
      response.send(data.success("Name has been edited successfully!"));
    });
  });
}

/**
 * Get the fireduino's data
 */
function getFireduino(request: Request, response: Response) {
  // Get params
  let { estbID, mac } = request.body;

  // If there is no token
  if (!estbID || !mac) {
    // Send error
    response.status(400).send(data.error("Invalid request!"));
    return;
  }

  // Trim id's
  estbID = estbID.toString().trim();
  mac = mac.toString().trim();

  // Get database instance
  const db = FireduinoDatabase.getInstance();

  // Query the database
  db.getFireduino(estbID, mac, (result) => {
    if (result === null) {
      // Send error
      response.status(500).send(data.error("System Error [GT_FRD]: Please report this bug!"));
      return;
    }

    // If the fireduino is not registered
    if (typeof result === "boolean") {
      // Send error
      response.send(data.error("The fireduino is not registered!"));
      return;
    }

    // Otherwise, send the fireduino's data
    response.send(data.success(result));
  });
}

/**
 * Check if the fireduino is already registered
 */ 
function isFireduinoRegistered(estbId: number, mac: string, callback: (result: boolean | null) => void) {
  // Get database instance
  const db = FireduinoDatabase.getInstance();

  // Query the database
  db.getFireduino(estbId, mac, (result) => {
    if (result === null) {
      // Send error
      callback(null);
      return;
    }

    // If the fireduino is not registered
    if (typeof result === "boolean") {
      // Send error
      callback(false);
      return;
    }

    // Otherwise, the fireduino is registered
    callback(true);
  });
}
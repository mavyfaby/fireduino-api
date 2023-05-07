import type { Request, Response } from "express";

import { data } from "../../utils";
import { FireduinoDatabase } from "../../classes/database";
import { DatabaseTable } from "../../types";

/**
 * Get Dashboard data
 * @param request  
 * @param response 
 */
export async function dashboard(request: Request, response: Response) {
  // Get request data
  let { year, isQuarter12 } = request.query;

  // If the year is not defined or isQuarter12 is not defined
  if (!year || !isQuarter12) {
    // Send error
    response.status(400).send(data.error("ERR [DSH]: Invalid request!"));
    return;
  }

  // Get database instance
  const db = FireduinoDatabase.getInstance();

  // Get user data
  db.getUserById(response.locals.uid, (user) => {
    // If there is an error
    if (user === null) {
      // Send error
      response.status(500).send(data.error("ERR [DSH_USR]: Failed to get dashboard data!"));
      return;
    }

    // Query the database
    db.getDevicesCount(user.establishment_id, (result) => {
      // Data
      const resultData = {
        devices: 0,
        incidents: [0, 0, 0, 0, 0, 0],
        departments: 0,
        date: ''
      };
  
      // If there is an error
      if (result === null) {
        // Send error
        response.status(500).send(data.error("ERR [DSH_DEV]: Failed to get dashboard data!"));
        return;
      }
  
      // Set the devices count
      resultData.devices = result;
  
      // Get the fire department count
      db.getDepartmentsCount((result) => {
        // If there is an error
        if (result === null) {
          // Send error
          response.status(500).send(data.error("ERR [DSH_DEP]: Failed to get dashboard data!"));
          return;
        }
  
        // Set the fire department count
        resultData.departments = result;
  
        // Get incidents count
        db.getIncidentsCount(user.establishment_id, Number(year), isQuarter12 === '1', (result) => {
          // If there is an error
          if (result === null) {
            // Send error
            response.status(500).send(data.error("ERR [DSH_INC]: Failed to get dashboard data!"));
            return;
          }

          // If result has null
          if (result[0] !== null) {
            // Set the incidents count
            resultData.incidents = result;
          }
  
          // Set the date
          resultData.date = new Date().toISOString();

          // Send data
          response.send(data.success("Success!", resultData));
        });
      });
    });
  });

}
import type { Request, Response } from "express";

import { data } from "../../utils";
import { FireduinoDatabase } from "../../classes/database";
import { ErrorCode } from "../../types";

/**
 * Get Incident Report API
 * @param request  
 * @param response 
 */
export async function incidentReport(request: Request, response: Response) {
  // If POST request
  if (request.method === "POST") {
    return createReport(request, response);
  }

  return editReport(request, response);
}

/**
 * Create Incident Report API
 * @param request
 * @param Response
 */
async function createReport(request: Request, response: Response) {
  // Get report data
  let { incidentID, report } = request.body;

  // If no data
  if (!incidentID || !report) {
    // Send error
    response.status(400).send(data.error("Invalid request!"));
    return;
  }

  // Trim data
  incidentID = incidentID.toString().trim();
  report = report.toString().trim();

  // Get database
  const db = FireduinoDatabase.getInstance();

  // Create report
  db.createReport(response.locals.token, incidentID, report, (result, error) => {
    // If error
    if (result == null) {
      // Declare message
      let message = "System Error";

      // If error
      switch (error) {
        case ErrorCode.CREATE_REPORT:
          message = "System Error [CRT_RPT]: Failed to create report!";
          break;
      }

      // Send error
      response.status(500).send(data.error(message));
      return;
    }

    // Send success
    response.status(200).send(data.success("Incident Report for #" + incidentID + " saved!"));
  });
}

/**
 * Edit Incident Report API
 * @param request
 * @param Response
 */
async function editReport(request: Request, response: Response) {
  // Get report data
  let { incidentID, reportID, report } = request.body;

  // If no data
  if (!incidentID || !reportID || !report) {
    // Send error
    response.status(400).send(data.error("Invalid request!"));
    return;
  }

  // Trim data
  incidentID = incidentID.toString().trim();
  reportID = reportID.toString().trim();
  report = report.toString().trim();

  // Get database
  const db = FireduinoDatabase.getInstance();

  // Edit report
  db.editReport(response.locals.token, reportID, report, (result, error) => {
    // If error
    if (result == null) {
      // Declare message
      let message = "System Error";

      // If error
      switch (error) {
        case ErrorCode.EDIT_REPORT:
          message = "System Error [EDT_RPT]: Failed to edit report!";
          break;
      }

      // Send error
      response.status(500).send(data.error(message));
      return;
    }

    // Send success
    response.status(200).send(data.success("Incident Report for #" + incidentID + " saved!"));
  });
}
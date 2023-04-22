import type { Request, Response } from "express";

import { data, rb64 } from "../utils";
import { FireduinoSession } from "../classes/session";

/**
 * Validate JWT token
 * @param request  
 * @param response 
 */
export async function validate(request: Request, response: Response) {
  // Get token
  const { token } = request.body;

  // If there is no token
  if (!token) {
    // Send error
    response.status(400).send(data.error("Invalid request!"));
    return;
  }

  // Get session instance
  const session = FireduinoSession.getInstance();
  // Validate token
  const isValid = session.validateToken(rb64(token));
  // Send result
  response.send(isValid ? data.success("Valid token!") : data.error("Invalid token!"));
}
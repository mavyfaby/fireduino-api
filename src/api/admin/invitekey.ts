import type { Request, Response } from "express";
import { randomBytes } from "crypto";
import { data } from "../../utils";

/**
 * Generate Invite Key API
 * @param request  
 * @param response 
 */
export async function inviteKey(request: Request, response: Response) {
  // Generate and Send invite key
  response.send(data.success(randomBytes(4).toString("hex")));
}

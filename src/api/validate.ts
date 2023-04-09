import type { Request, Response } from "express";

import { data } from "../utils";

/**
 * Validate Token
 * @param request  
 * @param response 
 */
export async function validate(request: Request, response: Response) {
    // Intentionally left blank
    response.send(data(true, ""));
}
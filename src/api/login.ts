import type { Request, Response } from "express";
import { data } from "../utils";

/**
 * Login API
 * @param request  
 * @param response 
 */
export function login(request: Request, response: Response) {
    response.send(data(true, "I am in login page!"));
}
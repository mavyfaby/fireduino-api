import type { Request, Response } from "express";
import { data } from "../utils";

/**
 * Handle 404 Not Found
 * @param request
 * @param response 
 */
export function handleNotFound(request: Request, response: Response) {
    response.status(404).send(data.error('Request Not Found'));
}

/**
 * Handle 401 Unauthorized
 * @param request 
 * @param response 
 */
export function handleUnauthorized(request: Request, response: Response) {
    response.status(401).send(data.error('Unauthorized'));
}

/**
 * Handle Unimplemented Methods
 * @param request 
 * @param response 
 */
export function handleUnimplemented(request: Request, response: Response) {
    response.status(405).send(data.error('Method Not Allowed'));
}
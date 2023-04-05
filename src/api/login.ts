import type { Request, Response } from "express";

import { data } from "../utils";
import { FireduinoDatabase } from "../classes/database";

/**
 * Login API
 * @param request  
 * @param response 
 */
export async function login(request: Request, response: Response) {
    // Get username and password
    let { user, pass } = request.body;

    // If one of them is not provided
    if (!user || !pass) {
        response.status(400).send(data(false, "Incomplete request!"));
        return;
    }

    // Trim the username and password
    user = user.trim();
    pass = pass.trim();

    // Check if username and password is valid
    FireduinoDatabase.checkLoginCredentials(user, pass, (result) => {
        // If the credentials is not valid
        if (!result) {
            if (typeof result === "boolean") {
                response.status(401).send(data(false, "Invalid credentials!"));
                return;
            }

            response.status(500).send(data(false, "Internal server error!"));
            return;
        }

        // Otherwise, return 200
        response.send(data(true, "Login successful!"));    
    });
}
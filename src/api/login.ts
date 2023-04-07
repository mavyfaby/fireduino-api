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
    if (user === undefined || pass === undefined) {
        response.send(data(false, "Incomplete request!"));
        return;
    }
    
    // Get database
    const db = FireduinoDatabase.getInstance();

    // Trim the username and password
    user = user.trim();
    pass = pass.trim();

    // Check if username and password is valid
    db.checkLoginCredentials(user, pass, (result) => {
        // If has error
        if (result === null) {
            response.status(500).send(data(false, "Internal server error!"));
            return;
        }

        // If invalid credentials
        if (!result) {
            response.send(data(false, "Invalid credentials!"));
            return;
        }

        // Otherwise, return 200
        response.send(data(true, "Login successful!"));    
    });
}
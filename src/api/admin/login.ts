import type { Request, Response } from "express";

import { data, tb64 } from "../../utils";
import { FireduinoDatabase } from "../../classes/database";
import { FireduinoSession } from "../../classes/session";
import { AccountType } from "../../types";

/**
 * Admin Login API
 * @param request  
 * @param response 
 */
export async function login(request: Request, response: Response) {
    // Get username and password
    let { user, pass } = request.body;

    // If one of them is not provided
    if (user === undefined || pass === undefined) {
        response.send(data.error("Incomplete request!"));
        return;
    }
    
    // Get database
    const db = FireduinoDatabase.getInstance();

    // Trim the username and password
    user = user.trim();
    pass = pass.trim();

    // Check if username and password is valid
    db.checkLoginCredentials(AccountType.ADMIN, user, pass, (userid) => {
        // If has error
        if (userid === null) {
            response.status(500).send(data.error("Internal server error!"));
            return;
        }

        // If invalid credentials
        if (typeof userid === "boolean" && !userid) {
            response.send(data.error("Invalid credentials!"));
            return;
        }

        // Get session instance
        const session = FireduinoSession.getInstance();
        // Generate a JWT token
        const token = session.generateToken({ uid: userid });
        // Otherwise, return 200
        response.send(data.success("Login successful!", token));
    });
}
import type { Request, Response } from "express";

import { data, tb64 } from "../../utils";
import { FireduinoDatabase } from "../../classes/database";
import { FireduinoSession } from "../../classes/session";
import { AccountType } from "../../types";

/**
 * Mobile Login API
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
  db.checkLoginCredentials(AccountType.USER, user, pass, async (account) => {
    // If has error
    if (account === null) {
        response.status(500).send(data.error("Internal server error!"));
        return;
    }

    // If invalid credentials
    if (typeof account === "boolean") {
        response.send(data.error("Invalid credentials!"));
        return;
    }

    // Obfuscate account data keys
    const obfuscated = {
      a: account.id,
      b: account.establishment_id,
      c: account.username,
      d: account.first_name,
      e: account.last_name,
      f: account.email,
      g: account.createdAt,
    };

    // Get session instance
    const session = FireduinoSession.getInstance();
    // Generate a JWT token
    const token = await session.generateToken(account.id, 60 * 24 * 30); // 30 days
    // Otherwise, return 200
    response.send(data.success("Login successful!", obfuscated, token));
  });
}
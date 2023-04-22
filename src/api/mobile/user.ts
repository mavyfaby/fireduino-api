import type { Request, Response } from "express";

import { data } from "../../utils";
import { FireduinoDatabase } from "../../classes/database";
import { ErrorCode } from "../../types";

/**
 * Account Management API
 * @param request  
 * @param response 
 */
export async function user(request: Request, response: Response) {
  // Get request method
  if (request.method === "POST") {
    // Create an account
    return createAccount(request, response);
  }

  // Otherwise, get the user's account
  return getAccount(request, response);
}

/**
 * Get the user's account data
 * @param request 
 * @param response 
 */
function getAccount(request: Request, response: Response) {
  // Get token from request
  let { token } = request.query;

  // If there is no token
  if (!token) {
    // Send error
    response.status(400).send(data.error("Invalid request!"));
    return;
  }

  // Trim token
  token = token.toString().trim();

  // Get database instance
  const db = FireduinoDatabase.getInstance();

  // Query the database
  db.getUserByToken(token, (account, errorCode) => {
    // If there is an error
    if (account === null) {
      // Declare default message 
      let message = "Something went wrong!";

      switch (errorCode) {
        case ErrorCode.INVALID_TOKEN:
          message = "Invalid token!";
          break;
        case ErrorCode.USER_NOT_FOUND:
          message = "The user you requested does not exist!";
          break;
        case ErrorCode.SYSTEM_ERROR:
          message = "System error [GT_USR]: Please report this bug!";
      }

      // Send error
      response.status(400).send(data.error(message));
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

    // Send data
    response.send(data.success("Success!", obfuscated));
  });
}

/**
 * Create an account
 * @param request 
 * @param response 
 * @returns 
 */
function createAccount(request: Request, response: Response) {
  // Get request params
  const {
    firstName, lastName, email, username,
    password, establishmentId, inviteKey
  } = request.body;

  // If there is one or more missing params
  if (!firstName || !lastName || !email || !username || !password || !establishmentId || !inviteKey) {
    // Send error
    response.status(400).send(data.error("Invalid request!"));
    return;
  }

  // Get database instance
  const db = FireduinoDatabase.getInstance();

  // Query the database
  db.addUser({
    email, username, password,
    first_name: firstName, last_name: lastName,
    establishment_id: establishmentId, invite_key: inviteKey
  }, (insertId, errorCode) => {
    // If there is an error
    if (insertId === null) {
      // Declare default message 
      let message = "Something went wrong!";

      switch (errorCode) {
        case ErrorCode.INVITE_KEY:
          message = "The invite key you entered is invalid!";
          break;
        case ErrorCode.ESTABLISHMENT_NOT_FOUND:
          message = "The establishment you entered does not exist!";
          break;
        case ErrorCode.USERNAME_TAKEN:
          message = "The username you entered is already taken!";
          break;
        case ErrorCode.SYSTEM_ERROR:
          message = "System error [SYS]: Please report this bug!";
          break;
        case ErrorCode.PASSWORD_HASH:
          message = "System error [SYS_PASS]: Please report this bug!";
          break;
        case ErrorCode.ACCOUNT_CREATE:
          message = "System error [SYS_ACC]: Please report this bug!";
      }

      // Send error
      response.status(400).send(data.error(message));
      return;
    }

    // Send data
    response.send(data.success("Success!", "You have successfully created an account!"));
  });
}
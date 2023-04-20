import type { Secret } from 'jsonwebtoken';
import type { Request, Response } from 'express';
import { sign, verify } from "jsonwebtoken";

import routes from "../routes";
import { rb64 } from '../utils';

export class FireduinoSession {
  private static instance: FireduinoSession;
  private secret: Secret;

  private static adminLoginPath = '/admin/login';

  private constructor() {
    // If the JWT secret is not defined
    if (!process.env.JWT_SECRET) {
      // Throw an error
      throw new Error("JWT_SECRET is not defined");
    }

    // Set the secret
    this.secret = process.env.JWT_SECRET;
  }

  /**
   * Get the instance of the session class
   */
  public static getInstance(): FireduinoSession {
    // If the instance is not created
    if (!FireduinoSession.instance) {
      // Create the instance
      FireduinoSession.instance = new FireduinoSession();
    }

    // Return the instance
    return FireduinoSession.instance;
  }

  /**
   * Get the middleware for session handling
   */
  public getMiddleware() {
    return (request: Request, response: Response, next: Function) => {
      // Set {isLogin} to true if the request is in login API
      response.locals.isLogin = request.originalUrl === FireduinoSession.adminLoginPath;

      // If the request is NOT in login API
      if (request.originalUrl !== routes.find(r => r.path === FireduinoSession.adminLoginPath)?.path) {
        // Get the token from the request header
        const token = request.headers.authorization?.split(" ")[1];

        // If the token is not provided
        if (!token) {
          response.locals.isUnauthorized = true;
          return next();
        }

        // Verify the token
        try {
          const data: any = verify(rb64(token), this.secret, { algorithms: ["HS256"] });
          response.locals.uid = data.uid;
        }
        
        // If the token is invalid
        catch (error) {
          response.locals.isUnauthorized = true;
        }

        return next();
      }

      next();
    }
  }

  /**
   * Generate a JWT token
   */
  public generateToken(data: any) {
    return sign(data, this.secret, { expiresIn: "10m" });
  }
}

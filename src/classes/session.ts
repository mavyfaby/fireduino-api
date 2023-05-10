import type { Request, Response } from 'express';
import { SignJWT, jwtVerify } from 'jose';
import { getPathname } from '../utils';

export class FireduinoSession {
  private static instance: FireduinoSession;
  private static loginPath = '/admin/login';

  private static unauthPaths = [
    this.loginPath,
    '/mobile/establishments',
    '/mobile/verify',
    '/mobile/user',
    '/mobile/login',
    '/mobile/validate',
    '/mobile/validateEmail',
    '/admin/validate',
    '/ws/establishments'
  ];

  private secret: Uint8Array;

  private constructor() {
    // If the JWT secret is not defined
    if (!process.env.JWT_SECRET) {
      // Throw an error
      throw new Error("JWT_SECRET is not defined");
    }

    // Set the secret
    this.secret = new TextEncoder().encode(process.env.JWT_SECRET);
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
    return async (request: Request, response: Response, next: Function) => {
      // Get pathname
      const pathname = getPathname(request.originalUrl);

      // Set {isLogin} to true if the request is in login API
      response.locals.isLogin = pathname === FireduinoSession.loginPath;
      // Set {needsAuth} to true
      response.locals.needsAuth = true;

      // If the request is NOT in login API
      if (pathname !== FireduinoSession.loginPath) {
        // If the request doesn't need authentication
        if (FireduinoSession.unauthPaths.includes(pathname)) {
          // Set {needsAuth} to true
          response.locals.needsAuth = false;
          // Return next
          return next();
        }

        // Get the token from the request header
        const token = request.headers.authorization?.split(" ")[1];

        // If the token is not provided
        if (!token) {
          response.locals.isUnauthorized = true;
          return next();
        }

        // Verify the token
        try {
          const data: any = await jwtVerify(token, this.secret, { algorithms: ["HS256"]});
          response.locals.id = data.payload.id;
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
   * Validate a JWT token if not expired
   * @param token 
   */
  public async validateToken(token: any) {
    try {
      return await jwtVerify(token, this.secret, { algorithms: ["HS256"] });
    }
    
    // If the token is invalid
    catch (error) {
      return false;
    }
  }

  /**
   * Generate a JWT token
   * @param data
   * @param expiresIn In minutes
   */
  public async generateToken(data: any, expiresIn = 10) {
    const iat = Math.floor(Date.now() / 1000);
    const exp = iat + 60 * expiresIn;

    return await new SignJWT({ id: data, exp, iat })
      .setProtectedHeader({alg: 'HS256', typ: 'JWT'})
      .setNotBefore(iat)
      .sign(this.secret);
  }
}

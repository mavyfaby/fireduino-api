import type { Request, Response } from "express";

export type FireduinoRoutes = {
  path: string;
  handler: (request: Request, response: Response) => void;
}

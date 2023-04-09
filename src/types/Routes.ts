import type { Request, Response } from "express";

export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "OPTIONS" | "HEAD";

export type FireduinoRoutes = {
  id?: number,
  path: string;
  methods: HttpMethod[];
  handler: (request: Request, response: Response) => void;
}

import type { Request, Response } from "express";

export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "OPTIONS" | "HEAD";

export type FireduinoRoutes = {
  id?: number,
  path: string;
  methods: HttpMethod[];
  handler: (request: Request, response: Response) => void;
}

export type FireDepartment = {
  id?: number;
  name: string;
  phone: string;
  address: string;
  latitude: string;
  longitude: string;
}

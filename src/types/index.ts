import type { Request, Response } from "express";

export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "OPTIONS" | "HEAD";

export type FireduinoRoutes = {
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
};

export type Establishment = {
  id?: number;
  name: string;
  phone: string;
  address: string;
  invite_key: string;
}

export type SearchParams = {
  search?: string;
  isNameOnly?: boolean;
  sortBy?: string;
  sortDirection?: string;
  limit?: number;
};
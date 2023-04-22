import type { Request, Response } from "express";

export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "OPTIONS" | "HEAD";

export type FireduinoRoutes = {
  path: string;
  methods: HttpMethod[];
  handler: (request: Request, response: Response) => void;
}

export enum ErrorCode {
  SYSTEM_ERROR = 0,
  ESTABLISHMENT_NOT_FOUND = 1,
  INVITE_KEY = 2,
  PASSWORD_HASH = 3,
  ACCOUNT_CREATE = 4,
  USERNAME_TAKEN = 5,
}

export enum AccountType {
  ADMIN = 0,
  USER = 1,
}

export type Account = {
  id?: number;
  establishment_id: number;
  first_name: string;
  last_name: string;
  email: string;
  username: string;
  password?: string;
  createdAt?: string;
};

export type CreateAccountData = Account & {
  invite_key: string;
};

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
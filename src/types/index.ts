import type { Request, Response } from "express";

export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "OPTIONS" | "HEAD";

export type FireduinoRoutes = {
  path: string;
  methods: HttpMethod[];
  handler: (request: Request, response: Response) => void;
}

export enum DatabaseTable {
  ADMIN = "admin",
  DEVICES = "devices",
  ESTABLISHMENTS = "establishments",
  DEPARTMENTS = "fire_departments",
  INCIDENTS = "incidents",
  REPORTS = "reports",
  USERS = "users",
}

export enum ErrorCode {
  SYSTEM_ERROR,
  ESTABLISHMENT_NOT_FOUND,
  INVITE_KEY,
  PASSWORD_HASH,
  ACCOUNT_CREATE,
  USERNAME_TAKEN,
  USER_NOT_FOUND,
  DEVICE_NOT_FOUND,
  PASSWORD_UPDATE,
  USERNAME_UPDATE,
  PASSWORD_LENGTH,
  ACCESS_LOGS,
  REPORTS,
  NAME_TAKEN,
  ADD_EDIT_HISTORY,
  ACCESS_LOG_ADD,
  CREATE_REPORT,
  EDIT_HISTORY,
  EDIT_REPORT,
  LOGIN_HISTORY,
  INVALID_TOKEN
}

export enum EditUserType {
  USERNAME = 1,
  PASSWORD = 2,
}

export enum AccountType {
  ADMIN = 0,
  USER = 1,
}

export type User = {
  id?: number;
  establishment_id: number;
  first_name: string;
  last_name: string;
  email: string;
  username: string;
  password?: string;
  createdAt?: string;
};

export type CreateUserData = User & {
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
  latitude: string;
  longitude: string;
  invite_key: string;
}

export type IncidentReport = {
  iid: number;
  rid: number;
  dept_name: string;
  sms_id: number;
  device_name: string;
  user_name: string;
  cause: string;
  idate: string;
  rdate: string;
}

export type SearchParams = {
  search?: string;
  isNameOnly?: boolean;
  sortBy?: string;
  sortDirection?: string;
  limit?: number;
  isFromSignUp?: boolean;
};

export type EditHistory = {
  name: string;
  before: string;
  after: string;
}

export enum EditType {
  FIREDUINO = 1,
}
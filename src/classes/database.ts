import {
  AccountType, CreateUserData, DatabaseTable, ErrorCode,
  Establishment, FireDepartment, SearchParams, User
} from "../types";

import mysql from "mysql";
import bcrypt from "bcrypt";
import { FireduinoSession } from "./session";

/**
 * Singleton class for fireduino database
 */
export class FireduinoDatabase {
  private static instance: FireduinoDatabase;
  private static pool: mysql.Pool;

  /**
   * Create a database connection pool
   */
  private constructor() {
    // Create a database connection pool
    FireduinoDatabase.pool = mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
    });
  }

  /**
   * Get the instance of the database class
   * @returns The instance of the database class
   */
  public static getInstance(): FireduinoDatabase {
    if (!FireduinoDatabase.instance) {
      FireduinoDatabase.instance = new FireduinoDatabase();
    }

    return FireduinoDatabase.instance;
  }

  /**
   * Query the database 
   * @param query Query string
   * @param values Query values
   * @param callback Callback function
   */
  public query(query: string, values: any[], callback: (error: mysql.MysqlError | null, results: any) => void) {
    return FireduinoDatabase.pool.query(query, values, callback);
  }

  /**
   * Check if the login credentials is valid
   * @param type Account type
   * @param username Username
   * @param password Password
   * @param callback Callback function
   */
  public checkLoginCredentials(type: AccountType, username: string, password: string, callback: (result: boolean | User | null) => void) {
    this.query(`SELECT * FROM ${type === AccountType.ADMIN ? 'admin' : 'users'} WHERE username = ?`, [username], (error, results) => {
      // If there is an error
      if (error) {
        // Reject the promise
        console.error(error);
        callback(null);
        return;
      }

      // If there is no result
      if (results.length === 0) {
        // Reject the promise
        callback(false);
        return;
      }

      // Otherwise, check the password
      bcrypt.compare(password, results[0].password, (error, result) => {
        // If there is an error
        if (error) {
          // Reject the promise
          console.error(error);
          callback(null);
          return;
        }


        // If the password is correct
        if (result) {
          // Create user data
          const user: User = {
            id: results[0].id,
            username: results[0].username,
            first_name: results[0].firstname,
            last_name: results[0].lastname,
            email: results[0].email,
            establishment_id: results[0].establishment_id,
            createdAt: results[0].date_stamp,
          };

          // Resolve the promise
          callback(user);
          return;
        }

        // Otherwise, resolve the promise
        callback(false);
      });
    });
  }

  /**
   * Add a fire department
   * @param department Fire department
   */
  public addFireDepartment(department: FireDepartment, callback: (result: boolean | number | null) => void) {
    const { name, phone, address, latitude, longitude } = department;

    this.query(
      "INSERT INTO fire_departments (name, phone, address, latitude, longitude, date_stamp) VALUES (?, ?, ?, ?, ?, NOW())",
      [name, phone, address, latitude, longitude], (error, results) => {
        // If there is an error
        if (error) {
          // Reject the promise
          console.error(error);
          callback(null);
          return;
        }

        // Otherwise, resolve the promise
        callback(results.insertId);
      }
    );
  }

  /**
   * Update a fire department
   * @param department Fire department
   */
  public updateFireDepartment(department: FireDepartment, callback: (result: boolean | null) => void) {
    const { id, name, phone, address, latitude, longitude } = department;

    this.query(
      "UPDATE fire_departments SET name = ?, phone = ?, address = ?, latitude = ?, longitude = ? WHERE id = ?",
      [name, phone, address, latitude, longitude, id], (error, results) => {
        // If there is an error
        if (error) {
          // Reject the promise
          console.error(error);
          callback(null);
          return;
        }

        // Otherwise, resolve the promise
        callback(true);
      }
    );
  }

  /**
   * Get all fire departments
   * @param callback Callback function
   */
  public getFireDepartments(callback: (result: FireDepartment[] | null) => void) {
    this.query("SELECT id AS a, name AS b, phone AS c, address AS d, latitude AS e, longitude AS f, date_stamp AS g FROM fire_departments", [], (error, results) => {
      // If there is an error
      if (error) {
        // Reject the promise
        console.error(error);
        callback(null);
        return;
      }

      // Otherwise, resolve the promise
      callback(results);
    });
  }

  /**
   * Add establishment
   * @param establishment Establishment
   * @param callback Callback function
   */
  public addEstablishment(establishment: Establishment, callback: (result: boolean | number | null) => void) {
    const { name, phone, address, latitude, longitude, invite_key } = establishment;

    this.query(
      "INSERT INTO establishments (name, latitude, longitude, invite_key, phone, address, date_stamp) VALUES (?, ?, ?, ?, ?, ?, NOW())",
      [name, latitude, longitude, invite_key, phone, address], (error, results) => {
        // If there is an error
        if (error) {
          // Reject the promise
          console.error(error);
          callback(null);
          return;
        }

        // Otherwise, resolve the promise
        callback(results.insertId);
      }
    );
  }

  /**
   * Update establishment
   * @param establishment Establishment
   * @param callback Callback function
   */
  public updateEstablishment(establishment: Establishment, callback: (result: boolean | null) => void) {
    const { id, name, phone, address, latitude, longitude } = establishment;

    this.query(
      "UPDATE establishments SET name = ?, latitude = ?, longitude = ?, phone = ?, address = ? WHERE id = ?",
      [name, latitude, longitude, phone, address, id], (error, results) => {
        // If there is an error
        if (error) {
          // Reject the promise
          console.error(error);
          callback(null);
          return;
        }

        // Otherwise, resolve the promise
        callback(true);
      }
    );
  }

  /**
   * Get establishment by id
   * @param id Establishment id
   * @param callback Callback function
   */
  public getEstablishmentById(id: number, callback: (result: Establishment | null) => void) {
    this.query(
      "SELECT id, name, phone, address, latitude, longitude, invite_key, date_stamp FROM establishments WHERE id = ?",
      [id], (error, results) => {
        // If there is an error
        if (error) {
          // Reject the promise
          console.error(error);
          callback(null);
          return;
        }

        // If there is no result
        if (results.length === 0) {
          // Reject the promise
          callback(null);
          return;
        }

        // Otherwise, resolve the promise
        callback(results[0]);
      }
    );
  }

  /**
   * Get all establishments
   * @param params Search parameters
   * @param callback Callback function
   */
  public getEstablishments(params: SearchParams, callback: (result: Establishment[] | null) => void) {
    // Default search column
    let columns = "invite_key AS b, name AS c, phone AS d, address AS e, latitude AS f, longitude AS g, date_stamp AS h";
    let postFix = "ORDER BY date_stamp DESC";
    let where = "";

    // If has {search}
    if (params.search) {
        where = `WHERE name LIKE '%${params.search}%'`;
    }

    // If {nameOnly}
    if (params.isNameOnly) {
      columns = "name AS c";
    }

    // If has {sortBy}
    if (params.sortBy) {
      postFix = `ORDER BY ${params.sortBy} `;

      // If has {sortOrder}
      if (params.sortDirection) {
        postFix += params.sortDirection;
      }
    }

    // If has {limit}
    if (params.limit) {
      postFix += ` LIMIT ${params.limit}`;
    }

    // Query the databaes
    this.query(`SELECT id AS a, ${columns} FROM establishments ${where} ${postFix}`, [], (error, results) => {
      // If there is an error
      if (error) {
        // Reject the promise
        console.error(error);
        callback(null);
        return;
      }

      // Otherwise, resolve the promise
      callback(results);
    });
  }

  /**
   * Get fireduinos by establishment id 
   * @param estbId
   * @param callback
   */
  public getFireduinos(estbId: number, callback: (result: [] | null) => void) {
    this.query(
      "SELECT id AS a, serial_id AS b, estb_id AS c, name AS d, date_stamp AS e FROM devices WHERE estb_id = ?", [estbId], (error, results) => {
        // If there is an error
        if (error) {
          // Reject the promise
          console.error(error);
          callback(null);
          return;
        }
        
        // Otherwise, resolve the promise
        callback(results);
      }
    );
  }

  /**
   * Get establishment by establishment id and serial id 
   * @param estbId
   * @param serialId
   * @param callback
   */
  public getFireduino(estbId: number, serialId: string, callback: (result: boolean | null) => void) {
    this.query(
      "SELECT * FROM devices WHERE estb_id = ? AND serial_id = ?", [estbId, serialId], (error, results) => {
        // If there is an error
        if (error) {
          // Reject the promise
          console.error(error);
          callback(null);
          return;
        }

        // If there is no result
        if (results.length === 0) {
          // Reject the promise
          callback(false);
          return;
        }

        // Otherwise, resolve the promise
        callback(results[0]);
      }
    );
  }

  /**
   * Add fireduino 
   * @param estbId
   * @param serialId
   * @param name
   * @param callback
   */
  public addFireduino(estbId: number, serialId: string, name: string, callback: (result: boolean | null) => void) {
    this.query(
      "INSERT INTO devices (serial_id, estb_id, name, date_stamp) VALUES (?, ?, ?, NOW())", [serialId, estbId, name], (error, results) => {
        // If there is an error
        if (error) {
          // Reject the promise
          console.error(error);
          callback(null);
          return;
        }

        // Otherwise, resolve the promise
        callback(true);
      }
    );
  }

  /**
   * Check if username is taken
   * @param username
   * @param callback
   */
  public isUsernameTaken(username: string, callback: (result: boolean | null) => void) {
    this.query("SELECT id FROM users WHERE username = ?", [username], (error, results) => {
      // If there is an error
      if (error) {
        // Reject the promise
        console.error(error);
        callback(null);
        return;
      }

      // If there is no result
      if (results.length === 0) {
        // Reject the promise
        callback(false);
        return;
      }

      // Otherwise, resolve the promise
      callback(true);
    });
  }

  /**
   * Get user by id
   * @param id 
   * @param callback 
   */
  public getUserById(id: number, callback: (result: User | null, errorCode: ErrorCode | null) => void) {
    this.query(
      "SELECT id, username, email, firstname, lastname, establishment_id, date_stamp FROM users WHERE id = ?",
      [id], (error, results) => {
        // If there is an error
        if (error) {
          // Reject the promise
          console.error(error);
          callback(null, ErrorCode.SYSTEM_ERROR);
          return;
        }

        // If there is no result
        if (results.length === 0) {
          // Reject the promise
          callback(null, ErrorCode.USER_NOT_FOUND);
          return;
        }

        // Create user data
        const user: User = {
          id: results[0].id,
          username: results[0].username,
          first_name: results[0].firstname,
          last_name: results[0].lastname,
          email: results[0].email,
          establishment_id: results[0].establishment_id,
          createdAt: results[0].date_stamp,
        };

        // Otherwise, resolve the promise
        callback(user, null);
      }
    );
  }

  /**
   * Get user by token
   * @param token 
   * @param callback 
   */
  public getUserByToken(token: string, callback: (result: User | null, errorCode: ErrorCode | null) => void) {
    // Get session
    const session = FireduinoSession.getInstance();
    // Get session data
    const data = session.validateToken(token);

    // If session data is an object
    if (!data || typeof data !== "object") {
      // Reject the promise
      callback(null, ErrorCode.INVALID_TOKEN);
      return;
    }

    // Convert uid to number
    const uid = parseInt(data.uid);
    // Get user by id
    this.getUserById(uid, callback);
  }

  /**
   * Add user account
   * @param data
   * @param callback
   */
  public addUser(data: CreateUserData, callback: (result: number | null, errorCode: ErrorCode | null) => void) {
    const { username, password, email, first_name, last_name, establishment_id, invite_key } = data;

    // Get establishment
    this.getEstablishmentById(establishment_id, (establishment) => {
      // If establishment not found
      if (!establishment) {
        callback(null, ErrorCode.ESTABLISHMENT_NOT_FOUND);
        return;
      }

      // If the invite key is not valid
      if (establishment.invite_key !== invite_key) {
        // Reject the promise
        callback(null, ErrorCode.INVITE_KEY);
        return;
      }

      // Check if username is taken
      this.isUsernameTaken(username, (isTaken) => {
        // If username checking failed
        if (isTaken === null) {
          // Reject the promise
          callback(null, ErrorCode.SYSTEM_ERROR);
          return;
        }

        // If username is taken
        if (isTaken) {
          // Reject the promise
          callback(null, ErrorCode.USERNAME_TAKEN);
          return;
        }

        // Hash the password
        bcrypt.hash(password!, 10, (error, hash) => {
          // If there is an error
          if (error) {
            // Reject the promise
            console.error(error);
            callback(null, ErrorCode.PASSWORD_HASH);
            return;
          }
    
          // Otherwise, insert the account
          this.query(
            "INSERT INTO users (establishment_id, username, firstname, lastname, email, password, date_stamp) VALUES (?, ?, ?, ?, ?, ?, NOW())",
            [establishment_id, username, first_name, last_name, email, hash], (error, results) => {
              // If there is an error
              if (error) {
                // Reject the promise
                console.error(error);
                callback(null, ErrorCode.ACCOUNT_CREATE);
                return;
              }
    
              // Otherwise, resolve the promise
              callback(results.insertId, null);
            }
          );
        });
      });
    });
  }

  /**
   * Get row count by table
   * @param table 
   * @param estbID
   * @param callback 
   */
  public getCount(table: DatabaseTable, estbID: number| null, callback: (result: number | null) => void) {
    this.query("SELECT COUNT(*) AS count FROM " + table + (estbID == null ? '' : " WHERE estb_id = ?"), [estbID], (error, results) => {
      // If there is an error
      if (error) {
        // Reject the promise
        console.error(error);
        callback(null);
        return;
      }

      // Otherwise, resolve the promise
      callback(results[0].count);
    });
  }

  public getDevicesCount(estbID: number, callback: (result: number | null) => void) {
    this.getCount(DatabaseTable.DEVICES, estbID, callback);
  }

  public getDepartmentsCount(callback: (result: number | null) => void) {
    this.getCount(DatabaseTable.DEPARTMENTS, null, callback);
  }

  /**
   * Get incident count by year and quarter
   * @param callback 
   */
  public getIncidentsCount(estbID: number, year: number, isQuarter12: boolean, callback: (result: number[] | null) => void) {
    const col = "SUM(IF(MONTH(date_stamp) = ?, 1, 0))";
    const query = `
      SELECT ${col} AS a, ${col} AS b, ${col} AS c, ${col} AS d, ${col} AS e, ${col} AS f FROM incidents
      WHERE estb_id = ? AND YEAR(date_stamp) = ? AND QUARTER(date_stamp) IN (?, ?)
    `;

    this.query(query, [ ...Array.from({ length: 6 }, (_, i) => i + (isQuarter12 ? 1 : 7)), estbID, year, isQuarter12 ? 1 : 3, isQuarter12 ? 2 : 4], (error, results) => {
      // If there is an error
      if (error) {
        // Reject the promise
        console.error(error);
        callback(null);
        return;
      }

      // Otherwise, resolve the promise
      callback(Object.values(results[0]));
    });
  }
}
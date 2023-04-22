import type { Establishment, FireDepartment, SearchParams } from "../types";

import mysql from "mysql";
import bcrypt from "bcrypt";

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
   */
  public query(query: string, values: any[], callback: (error: mysql.MysqlError | null, results: any) => void) {
    return FireduinoDatabase.pool.query(query, values, callback);
  }

  /**
   * Check if the login credentials is valid
   */
  public checkLoginCredentials(username: string, password: string, callback: (result: boolean | number | null) => void) {
    this.query("SELECT id, password FROM admin WHERE username = ?", [username], (error, results) => {
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
          // Get user id
          const id = results[0].id;
          // Resolve the promise
          callback(id);
          return;
        }

        // Otherwise, resolve the promise
        callback(false);
      });
    });
  }

  /**
   * Add a fire department
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
   * Get all fire departments
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
   */
  public addEstablishment(establishment: Establishment, callback: (result: boolean | number | null) => void) {
    const { name, phone, address, invite_key } = establishment;

    this.query(
      "INSERT INTO establishments (name, invite_key, phone, address, date_stamp) VALUES (?, ?, ?, ?, NOW())",
      [name, invite_key, phone, address], (error, results) => {
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
   * Get all establishments
   * @param params Search parameters
   */
  public getEstablishments(params: SearchParams, callback: (result: Establishment[] | null) => void) {
    // Default search column
    let columns = "invite_key AS b, name AS c, phone AS d, address AS e, date_stamp AS f";
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
}
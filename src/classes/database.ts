import type { FireDepartment } from "../types";

import mysql from "mysql";
import bcrypt from "bcrypt";

/**
 * Singleton class for fireduino database
 */
export class FireduinoDatabase {
  private static instance: FireduinoDatabase;
  private static pool: mysql.Pool;

  private static QUERIES = {
    LOGIN: "SELECT id, password FROM admin WHERE username = ?",
    ADD_FIRE_DEPARTMENT: "INSERT INTO fire_departments (name, phone, address, latitude, longitude, date_stamp) VALUES (?, ?, ?, ?, ?, NOW())"
  };

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
    this.query(FireduinoDatabase.QUERIES.LOGIN, [username], (error, results) => {
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

    this.query(FireduinoDatabase.QUERIES.ADD_FIRE_DEPARTMENT, [name, phone, address, latitude, longitude], (error, results) => {
      // If there is an error
      if (error) {
        // Reject the promise
        console.error(error);
        callback(null);
        return;
      }

      // Otherwise, resolve the promise
      callback(results.insertId);
    });
  }
}
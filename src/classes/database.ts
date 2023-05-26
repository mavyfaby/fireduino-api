import {
  AccountType, CreateUserData, DatabaseTable, EditUserType, ErrorCode,
  Establishment, FireDepartment, IncidentReport, SearchParams, User,
  EditHistory, EditType
} from "../types";

import mysql from "mysql";
import bcrypt from "bcrypt";
import { FireduinoSession } from "./session";
import LatLng from "../models/latlng";
import { getDistance, getNearestFireDepartment } from "../utils/maps";
import { sendSMS } from "../utils/sms";

/**
 * Singleton class for fireduino database
 */
export class FireduinoDatabase {
  private static instance: FireduinoDatabase;
  private static pool: mysql.Connection;

  /**
   * Create a database connection pool
   */
  private constructor() {
    // Create a database connection pool
    FireduinoDatabase.pool = mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      dateStrings: true
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

          // Log the user login in the database
          this.query("INSERT INTO login_history (user_id, date_stamp) VALUES (?, NOW())", [user.id], (error) => {
            // If there is an error
            if (error) {
              // Just log the error
              console.error("Failed to log user login!");
            }

            // Resolve the promise
            callback(user);
          });
          
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
  public getFireDepartments(location: string | undefined, search: string | undefined, callback: (result: any[] | null) => void) {
    let query = "SELECT id AS a, name AS b, phone AS c, address AS d, latitude AS e, longitude AS f, date_stamp AS g FROM fire_departments";
    let params = [];

    // If has search
    if (typeof search === "string" && search.trim().length > 0) {
      query += " WHERE name LIKE ?";
      params.push("%" + search.trim() + "%");
    }

    this.query(query, params, (error, results) => {
      // If there is an error
      if (error) {
        // Reject the promise
        console.error(error);
        callback(null);
        return;
      }

      // If there's location
      if (location != null) {
        // Split
        const spl = location.split(",");
        // Origin
        const origin = new LatLng(Number(spl[0]), Number(spl[1]));
  
        // Get distance and duration
        getDistance(origin, results.map((dep: any) => new LatLng(Number(dep.e), Number(dep.f))), (distance) => {
          // Loop through the results
          for (let i = 0; i < results.length; i++) {
            results[i].distance = distance[i].distance;
            results[i].duration = distance[i].duration;
          }

          // Otherwise, resolve the promise
          callback(results);
        });

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

    
    // Placeholders
    const placeholders = [];

    // If has {isFromSignUp}
    if (params.isFromSignUp) {
      where += "WHERE id NOT IN (SELECT establishment_id FROM users)";
    }

    // If has {search}
    if (params.search) {
        where += `${params.isFromSignUp ? ' AND' : 'WHERE'} name LIKE ?`;
        placeholders.push("%" + params.search + "%");
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
    this.query(`SELECT id AS a, ${columns} FROM establishments ${where} ${postFix}`, placeholders, (error, results) => {
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
      "SELECT id AS a, mac_address AS b, estb_id AS c, name AS d, date_stamp AS e FROM devices WHERE estb_id = ?", [estbId], (error, results) => {
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
   * Get establishment by establishment id and mac_address
   * @param estbId
   * @param mac
   * @param callback
   */
  public getFireduino(estbId: number, mac: string, callback: (result: any) => void) {
    this.query(
      "SELECT * FROM devices WHERE estb_id = ? AND mac_address = ?", [estbId, mac], (error, results) => {
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
   * @param mac
   * @param name
   * @param callback
   */
  public addFireduino(estbId: number, mac: string, name: string, callback: (result: boolean | null) => void) {
    this.query(
      "INSERT INTO devices (mac_address, estb_id, name, date_stamp) VALUES (?, ?, ?, NOW())", [mac, estbId, name], (error, results) => {
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
   * Edit fireduino
   */
  public editFireduino(token: string, estbId: number, mac: string, name: string, callback: (result: boolean | null, errorCode: ErrorCode | null) => void) {
    // Check if name is taken
    this.isFireduinoNameTaken(estbId, name, (isTaken) => {
      // If isTake is null
      if (isTaken === null) {
        // Reject the promise
        callback(null, ErrorCode.DEVICE_NOT_FOUND);
        return;
      }

      // If name is taken
      if (isTaken) {
        // Reject the promise
        callback(null, ErrorCode.NAME_TAKEN);
        return;
      }

      // Get current name
      this.getColumnByTableWhere("devices", "name", "mac_address", mac, currentName => {
        // If there is an error
        if (currentName === null) {
          // Reject the promise
          callback(null, ErrorCode.SYSTEM_ERROR);
          return;
        }
        
        // Otherwise, update the name
        this.query(
          "UPDATE devices SET name = ? WHERE estb_id = ? AND mac_address = ?", [name, estbId, mac], (error, results) => {
            // If there is an error
            if (error) {
              // Reject the promise
              console.error(error);
              callback(null, ErrorCode.SYSTEM_ERROR);
              return;
            }
  
            // Record the edit history
            this.recordEditHistory(token, EditType.FIREDUINO, currentName, name, (result, errorCode) => {
              // If there is an error
              if (result === null) {
                // Just log the error
                console.log("Failed to record edit history: " + errorCode);
              }

              // Otherwise, resolve the promise
              callback(true, null);
            });
          }
        );
      });
    });
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
   * Check if email is taken
   */
  public isEmailTaken(email: string, callback: (result: boolean | null) => void) {
    this.query("SELECT id FROM users WHERE email = ?", [email], (error, results) => {
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
   * Check if fireudino name is taken
   */
  public isFireduinoNameTaken(estbID: number, name: string, callback: (result: boolean | null) => void) {
    this.query("SELECT id FROM devices WHERE estb_id = ? AND name = ?", [estbID, name], (error, results) => {
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
  public async getUserByToken(token: string, callback: (result: User | null, errorCode: ErrorCode | null) => void) {
    // Get session
    const session = FireduinoSession.getInstance();
    // Get session data
    const data = await session.validateToken(token);

    // If session data is an object
    if (!data || typeof data !== "object") {
      // Reject the promise
      callback(null, ErrorCode.INVALID_TOKEN);
      return;
    }

    // Get user by id
    this.getUserById(data.payload.id as number, callback);
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
      if (establishment.invite_key.toLowerCase() !== invite_key.toLowerCase()) {
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

  /**
   * Update user
   */
  public updateUser(token: string, type: EditUserType, data: string, callback: (result: number | null, errorCode: ErrorCode | null) => void) {
    // Get user by token
    this.getUserByToken(token, (user, error) => {
      // If there is an error
      if (error || !user) {
        // Reject the promise
        callback(null, error);
        return;
      }

      // If the type is password
      if (type === EditUserType.PASSWORD) {
        // If password is less empty
        if (data.length < 8) {
          // Reject the promise
          callback(null, ErrorCode.PASSWORD_LENGTH);
          return;
        }

        // Hash the password
        bcrypt.hash(data, 10, (error, hash) => {
          // If there is an error
          if (error) {
            // Reject the promise
            console.error(error);
            callback(null, ErrorCode.PASSWORD_HASH);
            return;
          }
    
          // Otherwise, update the password
          this.query("UPDATE users SET password = ? WHERE id = ?", [hash, user.id], (error) => {
            // If there is an error
            if (error) {
              // Reject the promise
              console.error(error);
              callback(null, ErrorCode.PASSWORD_UPDATE);
              return;
            }
    
            // Otherwise, resolve the promise
            callback(0, null);
          });
        });
  
        return;
      }
  
      // Check if the username is taken
      this.isUsernameTaken(data, (isTaken) => {
        // IF username taken
        if (isTaken) {
          // Reject the promise
          callback(null, ErrorCode.USERNAME_TAKEN);
          return;
        }
  
        // Otherwise, update the data
        this.query("UPDATE users SET username = ? WHERE id = ?", [data, user.id], (error) => {
          // If there is an error
          if (error) {
            // Reject the promise
            console.error(error);
            callback(null, ErrorCode.USERNAME_UPDATE);
            return;
          }
  
          // Otherwise, resolve the promise
          callback(0, null);
        });
      });
    });
  }

  /**
   * Get login history
   * @param token 
   * @param callback 
   */
  public getLoginHistory(token: string, callback: (result: string[] | null, errorCode: ErrorCode | null) => void) {
    // Get user by token
    this.getUserByToken(token, (user, error) => {
      // If there is an error
      if (error || !user) {
        // Reject the promise
        callback(null, error);
        return;
      }

      // Otherwise, get the login history
      this.query("SELECT date_stamp FROM login_history WHERE user_id = ? ORDER BY date_stamp DESC", [user.id], (error, results) => {
        // If there is an error
        if (error) {
          // Reject the promise
          console.error(error);
          callback(null, ErrorCode.LOGIN_HISTORY);
          return;
        }

        // Otherwise, resolve the promise
        callback(results, null);
      });
    });
  }

  /**
   * Get access logs
   */
  public getAccessLogs(token: string, callback: (result: string[] | null, errorCode: ErrorCode | null) => void) {
    // Get user by token
    this.getUserByToken(token, (user, error) => {
      // If there is an error
      if (error || !user) {
        // Reject the promise
        callback(null, error);
        return;
      }

      // Otherwise, get the login history
      this.query("SELECT d.name, d.mac_address, a.date_stamp FROM access_logs a INNER JOIN devices d ON d.id = a.device_id WHERE user_id = ? ORDER BY a.date_stamp DESC", [user.id], (error, results) => {
        // If there is an error
        if (error) {
          // Reject the promise
          console.error(error);
          callback(null, ErrorCode.ACCESS_LOGS);
          return;
        }

        // Otherwise, resolve the promise
        callback(results, null);
      });
    });
  }

  /**
   * Add device access log
   */
  public addAccessLog(token: string, deviceID: number, callback: (result: number | null, errorCode: ErrorCode | null) => void) {
    // Get user by token
    this.getUserByToken(token, (user, error) => {
      // If there is an error
      if (error || !user) {
        // Reject the promise
        callback(null, error);
        return;
      }

      // Otherwise, add the access log
      this.query("INSERT INTO access_logs (user_id, device_id, date_stamp) VALUES (?, ?, NOW())", [user.id, deviceID], (error) => {
        // If there is an error
        if (error) {
          // Reject the promise
          console.error(error);
          callback(null, ErrorCode.ACCESS_LOG_ADD);
          return;
        }

        // Otherwise, resolve the promise
        callback(0, null);
      });
    });
  }

  /**
   * Get incident reports 
   */
  public getReports(token: string, callback: (result: IncidentReport[] | null, errorCode: ErrorCode | null) => void) {
    // Get user by token
    this.getUserByToken(token, (user, error) => {
      // Query for the reports (only ids)
      // SELECT i.id AS iid, r.id AS rid, i.dept_id, i.sms_id, i.device_id, r.user_id, r.cause, i.date_stamp AS i_date, r.date_stamp AS r_date FROM incidents i
      // LEFT JOIN reports r ON r.incident_id = i.id WHERE estb_id = 3 ORDER BY i.date_stamp DESC;

      // If there is an error
      if (error || !user) {
        // Reject the promise
        callback(null, error);
        return;
      }

      // Get the reports
      this.query(`
        SELECT i.id AS iid, r.id AS rid, fd.name AS dept_name, i.sms_id, d.name AS device_name,
          CONCAT(u.firstname, u.lastname) AS user_name, r.cause, i.date_stamp AS idate, r.date_stamp AS rdate
        FROM incidents i
          LEFT JOIN reports r ON r.incident_id = i.id
          LEFT JOIN fire_departments fd ON fd.id = i.dept_id
          LEFT JOIN devices d ON d.id = i.device_id
          LEFT JOIN users u ON u.id = r.user_id
        WHERE i.estb_id = ?
        ORDER BY i.date_stamp DESC
      `, [user?.establishment_id], (error, results) => {
        // If there is an error
        if (error) {
          // Reject the promise
          console.error(error);
          callback(null, ErrorCode.REPORTS);
          return;
        }

        // Otherwise, resolve the promise
        const reports: IncidentReport[] = results;
        // Otherwise, resolve the promise
        callback(reports, null);
      });
    });
  }

  /**
   * Create a report
   */
  public createReport(token: string, incidentID: number, report: string, callback: (result: number | null, errorCode: ErrorCode | null) => void) {
    // Get user by token
    this.getUserByToken(token, (user, error) => {
      // If there is an error
      if (error || !user) {
        // Reject the promise
        callback(null, error);
        return;
      }

      // Add the report
      this.query("INSERT INTO reports (incident_id, user_id, cause, date_stamp) VALUES (?, ?, ?, NOW())", [incidentID, user!.id, report], (error) => {
        // If there is an error
        if (error) {
          // Reject the promise
          console.error(error);
          callback(null, ErrorCode.CREATE_REPORT);
          return;
        }
  
        // Otherwise, resolve the promise
        callback(0, null);
      });
    });
  }

  /**
   * Edit a report
   */
  public editReport(token: string, reportID: number, report: string, callback: (result: number | null, errorCode: ErrorCode | null) => void) {
    // Get user by token
    this.getUserByToken(token, (user, error) => {
      // If there is an error
      if (error || !user) {
        // Reject the promise
        callback(null, error);
        return;
      }

      // Add the report
      this.query("UPDATE reports SET cause = ?, date_stamp = NOW() WHERE id = ? AND user_id = ?", [report, reportID, user!.id], (error) => {
        // If there is an error
        if (error) {
          // Reject the promise
          console.error(error);
          callback(null, ErrorCode.EDIT_REPORT);
          return;
        }
  
        // Otherwise, resolve the promise
        callback(0, null);
      });
    });
  }

  /**
   * Create an incident
   */
  public createIncident(estbID: number, mac: string, callback: (result: number | null, errorCode: ErrorCode | null) => void) {
    // Get fireduino
    this.getFireduino(estbID, mac, (fireduino) => {
      // If fireduino not found
      if (!fireduino) {
        // Reject the promise
        callback(null, ErrorCode.DEVICE_NOT_FOUND);
        return;
      }

      // Get establishment
      this.getEstablishmentById(estbID, (establishment) => {
        // If has error
        if (!establishment) {
          // Reject the promise
          callback(null, ErrorCode.SYSTEM_ERROR);
          return;
        }

        // Get establishment's coordinates
        const { latitude, longitude } = establishment;

        // Get nearest fire department
        getNearestFireDepartment(Number(latitude), Number(longitude), (dept) => {
          // If there is an error
          if (!dept) {
            // Reject the promise
            callback(null, ErrorCode.SYSTEM_ERROR);
            return;
          }

          // Send SMS
          this.sendSMS(establishment, dept, (smsID) => {
            // Add the incident
            this.query("INSERT INTO incidents (estb_id, device_id, dept_id, sms_id, date_stamp) VALUES (?, ?, ?, ?, NOW())", [estbID, fireduino.id, dept.id, smsID], (error, results) => {
              // If there is an error
              if (error) {
                // Reject the promise
                console.error(error);
                callback(null, ErrorCode.CREATE_INCIDENT);
                return;
              }
        
              // Otherwise, resolve the promise
              callback(results.insertId, null);
            });
          });
        });
      });
    });
  }

  /**
   * Send an SMS to the fire department
   */
  public sendSMS(estb: Establishment, dept: FireDepartment, callback: (smsID: number | null) => void) {
    // Get sms template
    this.getSmsTemplate(estb.id!, (template) => {
      // If there is an error
      if (template === null) {
        // Reject the promise
        callback(null);
        return;
      }

      // Send the SMS synchronously
      sendSMS(estb.phone, dept.phone, template);

      // Add the SMS to the database
      this.query("INSERT INTO sms_history (dept_id, date_stamp) VALUES (?, NOW())", [dept.id], (error, results) => {
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
    });
  }

  /**
   * Get SMS template
   */
  public getSmsTemplate(estbID: number, callback: (template: string | null) => void) {
    // Get sms template
    this.query("SELECT template FROM sms_template WHERE estb_id = ?", [estbID], (error, results) => {
      // If there is an error
      if (error) {
        // Reject the promise
        console.error(error);
        callback(null);
        return;
      }

      // If there is no result
      if (results.length === 0) {
        // Default template
        callback("Fire incident at {establishment} ({location}). Please respond immediately.");
        return;
      }

      // Otherwise, resolve the promise
      callback(results[0].template);
    });
  }

  /**
   * Get edit history
   */
  public getEditHistory(token: string, callback: (result: EditHistory[] | null, errorCode: ErrorCode | null) => void) {
    // Get user by token
    this.getUserByToken(token, (user, error) => {
      // If there is an error
      if (error || !user) {
        // Reject the promise
        callback(null, error);
        return;
      }

      // Get the edit history
      this.query(`
        SELECT t.name, e.before, e.after, e.date_stamp FROM edit_history e
          INNER JOIN edit_types t ON e.edit_type_id = t.id 
        WHERE user_id = ? ORDER BY date_stamp DESC
      `, [user.id], (error, results) => {
        // If there is an error
        if (error) {
          // Reject the promise
          console.error(error);
          callback(null, ErrorCode.EDIT_HISTORY);
          return;
        }

        // Otherwise, resolve the promise
        callback(results, null);
      });
    });
  }

  /**
   * Record edit history
   */
  public recordEditHistory(token: string, editType: EditType, before: string, after: string, callback: (result: number | null, errorCode: ErrorCode | null) => void) {
    // Get user by token
    this.getUserByToken(token, (user, error) => {
      // If there is an error
      if (error || !user) {
        // Reject the promise
        callback(null, error);
        return;
      }

      // Add the history
      this.query("INSERT INTO edit_history (user_id, edit_type_id, `before`, `after`, date_stamp) VALUES (?, ?, ?, ?, NOW())", [user.id, editType, before, after], (error) => {
        // If there is an error
        if (error) {
          // Reject the promise
          console.error(error);
          callback(null, ErrorCode.ADD_EDIT_HISTORY);
          return;
        }
  
        // Otherwise, resolve the promise
        callback(0, null);
      });
    });
  }

  /**
   * Get column by table where
   */
  public getColumnByTableWhere(table: string, column: string, columnWhere: string, columnValue: string, callback: (result: string | null) => void) {
    this.query(`SELECT ${column} FROM ${table} WHERE ${columnWhere} = ?`, [columnValue], (error, results) => {
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
      callback(results[0][column]);
    });
  }
}
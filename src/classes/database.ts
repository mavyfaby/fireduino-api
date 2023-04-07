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
    public checkLoginCredentials(username: string, password: string, callback: (result: boolean | null) => void) {
        this.query("SELECT password FROM admin WHERE username = ?", [username], (error, results) => {
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

                // Otherwise, resolve the promise
                callback(result);
            });
        });
    }
}
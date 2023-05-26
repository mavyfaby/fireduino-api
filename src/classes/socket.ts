import type { Socket } from "socket.io-client";
import { io } from "socket.io-client";
import { FireduinoDatabase } from "./database";

/**
 * Fireduino Socket Client
 */
export class FireduinoSocketClient {
  static instance: FireduinoSocketClient;

  private socket: Socket;

  private constructor() {
    let url = "http://127.0.0.1:5000/api";

    if (process.env.NODE_ENV === "production") {
      url = "https://fireduino-ws.azurewebsites.net/api";
    }

    console.log("Connecting to socket server...");
    this.socket = io(url, { transports: ["websocket"] });

    // Listen for connection
    this.socket.on("connect", () => {
      console.log("Connected to socket server!");
      this.socket.emit("api");
    });

    // Listen for event
    this.socket.on("fire_detected", (data: string) => {
      // Split data
      const [ estb, mac ] = data.split("_");
      // Log
      console.log("Fire detected:", mac);
      // Create incident
      this.createIncident(Number(estb), mac);
    });

    // Listen for event
    this.socket.on("smoke_detected", (data: string) => {
      // Split data
      const [ estb, mac ] = data.split("_");
      // Log
      console.log("Smoke detected:", mac);
    });
  }

  public static getInstance(): FireduinoSocketClient {
    if (!FireduinoSocketClient.instance) {
      FireduinoSocketClient.instance = new FireduinoSocketClient();
    }

    return FireduinoSocketClient.instance;
  }

  /**
   * Create incident
   */
  public createIncident(estb: number, mac: string) {
    // Get database
    const db = FireduinoDatabase.getInstance();
    // Log
    console.log("Creating incident...");
    // Create report
    db.createIncident(estb, mac, (result, errorCode) => {
      // If error
      if (result == null) {
        console.log("Error creating incident:", errorCode);
        return;
      }

      // Log
      console.log("Incident created!");
    });
  }
}

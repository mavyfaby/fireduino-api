import { FireduinoDatabase } from "../classes/database";
import LatLng from "../models/latlng";
import { ErrorCode, FireDepartment } from "../types";

/**
 * Get the street distance between two points
 * @param origin Origin's latitude and longitude
 * @param destination Destination's latitude and longitude
 */
export async function getDistance(origin: LatLng, destination: LatLng[], callback: (result: any) => void) {
  // API URL
  let api = `https://api.distancematrix.ai/maps/api/distancematrix/json?key=${process.env.DISTANCE_KEY}&origins=${origin.lat}%2C${origin.lng}&destinations=`;

  // Add destinations
  for (let i = 0; i < destination.length; i++) {
    api += `${destination[i].lat}%2C${destination[i].lng}`;

    if (i < destination.length - 1) {
      api += "%7C";
    }
  }

  // Fetch data
  const response = fetch(api);
  // Get json response
  const data = await (await response).json();
  // Return data
  callback(data.rows ? data.rows[0].elements : []);
}

/**
 * Get latest fire department
 */
export async function getNearestFireDepartment(latitude: number, longitude: number, callback: (result: FireDepartment | null) => void) {
  // Get database
  const db = FireduinoDatabase.getInstance();

  // Get nearest fire department
  db.getFireDepartments(undefined, undefined, (departments) => {
    // If error
    if (departments == null) {
      // Declare message
      console.error("System Error [GET_NFD]: Failed to get nearest fire department!");
      // Send error
      callback(null);
      return;
    }

    // Get distance
    getDistance(new LatLng(latitude, longitude), departments.map(d => new LatLng(Number(d.e), Number(d.f))), (depts) => {
      // If error
      if (depts == null) {
        // Declare message
        console.error("System Error [GET_NFD]: Failed to get nearest fire department!");
        // Send error
        callback(null);
        return;
      }

      // Get minimum distance
      const min = Math.min(...depts.map((r: any) => r.distance.value));
      // Get index of minimum distance
      const index = depts.findIndex((r: any) => r.distance.value === min);

      // Send success
      callback({
        id: departments[index].a,
        name: departments[index].b,
        phone: departments[index].c,
        address: departments[index].d,
        latitude: departments[index].e,
        longitude: departments[index].f,
      });
    });
  });
}
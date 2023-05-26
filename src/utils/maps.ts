import { FireduinoDatabase } from "../classes/database";
import { FireDepartment } from "../types";
import LatLng from "../models/latlng";
import axios from "axios";

/**
 * Get the street distance between two points
 * @param origin Origin's latitude and longitude
 * @param destination Destination's latitude and longitude
 */
export async function getDistance(origin: LatLng, destination: LatLng[], callback: (result: any[]) => void) {
  // // API URL
  let api = `https://dev.virtualearth.net/REST/v1/Routes/DistanceMatrix?travelMode=driving&key=${process.env.DISTANCE_KEY}&origins=${origin.lat}%2C${origin.lng}&destinations=`;

  // Add destinations
  for (let i = 0; i < destination.length; i++) {
    api += `${destination[i].lat}%2C${destination[i].lng}`;

    if (i < destination.length - 1) {
      api += "%3B";
    }
  }

  // Fetch data
  const response = await axios.get(api);
  // Return data
  callback(response.data.resourceSets[0].resources[0].results);
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
      if (depts == null || depts.length === 0) {
        // Declare message
        console.error("System Error [GET_NFD]: Failed to get nearest fire department!");
        // Send error
        callback(null);
        return;
      }

      // Get minimum distance
      const min = Math.min(...depts.map((r: any) => r.travelDistance));
      // Get index of minimum distance
      const index = depts.findIndex(r => r.travelDistance === min);

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
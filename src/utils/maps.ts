import LatLng from "../models/latlng";

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
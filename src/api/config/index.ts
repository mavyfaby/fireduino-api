import type { Request, Response } from "express";
import { data } from "../../utils";

/**
 * Get coniguration
 * @param request  
 * @param response 
 */
export async function config(request: Request, response: Response) {
  // Send configuration
  response.send(data.success({
    mapsApi: process.env.MAPS_API,
    reverseGeocodingApi: process.env.REVERSE_GEOCODING_API,
  }));
}

import routes from "../routes";

/**
 * Check if the path is an API
 * @param path What path to check
 */
export function isApiExist(path: string) {
    // For each route
    for (const route of routes) {
        // If the path is equal to the route path
        if (path === route.path) {
            // Return true
            return true;
        }
    }

    // Otherwise, false
    return false;
}

/**
 * Get the pathname from the URL path
 * @param path URL Path
 * @returns the pathname
 */
export function getPathname(path: string) {
    // remove query parameters from the path
    const queryIndex = path.indexOf('?');
    
    if (queryIndex !== -1) {
        path = path.slice(0, queryIndex);
    }

    // remove trailing slash from the path
    if (path.slice(-1) === '/') {
        path = path.slice(0, -1);
    }

    return path;
}
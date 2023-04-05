// Import types
import type { FireduinoRoutes } from '../types';

// Import endpoint functions
import { login } from '../api';

/**
 * Fireduino API routes
 */
const routes: FireduinoRoutes[] = [
    { path: '/login', methods: ["POST"], handler: login, },
];

export default routes;

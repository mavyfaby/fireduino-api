// Import types
import type { FireduinoRoutes } from '../types';

// Import endpoint functions
import { login, validate } from '../api';
import { department } from '../api/department';

/**
 * Fireduino API routes
 */
const routes: FireduinoRoutes[] = [
    { id: 0, path: '/validate', methods: ["POST"], handler: validate, },
    { id: 1, path: '/login', methods: ["POST"], handler: login, },
    { id: 2, path: '/department', methods: ["GET", "POST"], handler: department, },
];

export default routes;

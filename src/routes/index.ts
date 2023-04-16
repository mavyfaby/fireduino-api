// Import types
import type { FireduinoRoutes } from '../types';

// Import endpoint functions
import { login, validate } from '../api';
import { department } from '../api/department';
import { departments } from '../api/departments';
import { establishment } from '../api/establishment';
import { establishments } from '../api/establishments';
import { inviteKey } from '../api/invitekey';
import { config } from '../api/config';

/**
 * Fireduino API routes
 */
const routes: FireduinoRoutes[] = [
    { path: '/config', methods: ["GET"], handler: config, },
    { path: '/invitekey', methods: ["GET"], handler: inviteKey, },
    { path: '/validate', methods: ["POST"], handler: validate, },
    { path: '/login', methods: ["POST"], handler: login, },
    { path: '/department', methods: ["GET", "POST", "PUT"], handler: department, },
    { path: '/departments', methods: ["GET"], handler: departments, },
    { path: '/establishment', methods: ["GET", "POST", "PUT"], handler: establishment, },
    { path: '/establishments', methods: ["GET"], handler: establishments, },
];

export default routes;

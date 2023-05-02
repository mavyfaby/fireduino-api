// Import types
// Import types
import type { FireduinoRoutes } from '../types';

// Import endpoint functions
import { login as loginAdmin, department, departments, establishment, establishments as aEstablishments, inviteKey, config } from '../api/admin';
import { login as loginMobile, establishments as mEstablishments, verify, user, fireduino } from '../api/mobile';

// Import validation functions
import { validate } from '../api/validate';

/**
 * Fireduino API routes
 */
const routes: FireduinoRoutes[] = [
    // Admin API
    { path: '/admin/config', methods: ["GET"], handler: config, },
    { path: '/admin/invitekey', methods: ["GET"], handler: inviteKey, },
    { path: '/admin/validate', methods: ["POST"], handler: validate, },
    { path: '/admin/login', methods: ["POST"], handler: loginAdmin, },
    { path: '/admin/department', methods: ["GET", "POST", "PUT"], handler: department, },
    { path: '/admin/departments', methods: ["GET"], handler: departments, },
    { path: '/admin/establishment', methods: ["GET", "POST", "PUT"], handler: establishment, },
    { path: '/admin/establishments', methods: ["GET"], handler: aEstablishments, },
    
    // Mobile Client API
    { path: '/mobile/establishments', methods: ["GET"], handler: mEstablishments, },
    { path: '/mobile/verify', methods: ["POST"], handler: verify, },
    { path: '/mobile/user', methods: ["GET", "POST"], handler: user, },
    { path: '/mobile/login', methods: ["POST"], handler: loginMobile, },
    { path: '/mobile/validate', methods: ["POST"], handler: validate, },
    { path: '/mobile/fireduino', methods: ["POST", "GET"], handler: fireduino },
];

export default routes;

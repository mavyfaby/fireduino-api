// Import types
import type { FireduinoRoutes } from '../types';

// Import endpoint functions
import {
    login as loginAdmin,
    departments as aDepartments,
    department, establishment as aEstablishment,
    establishments as aEstablishments, inviteKey, config
} from '../api/admin';

import {
    login as loginMobile,
    establishment as mEstablishment,
    establishments as mEstablishments,
    departments as mDepartments, edit_history,
    login_history, verify, user, fireduino, fireduinos, dashboard,
    accessLogs, accessDevice, incidentReports, incidentReport,
    validateEmail, sms_history
} from '../api/mobile';

import { establishments as wEstablishments } from '../api/ws';

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
    { path: '/admin/departments', methods: ["GET"], handler: aDepartments, },
    { path: '/admin/establishment', methods: ["GET", "POST", "PUT"], handler: aEstablishment, },
    { path: '/admin/establishments', methods: ["GET"], handler: aEstablishments, },
    
    // Mobile Client API
    { path: '/mobile/establishment', methods: ["GET", "POST", "PUT"], handler: mEstablishment, },
    { path: '/mobile/establishments', methods: ["GET"], handler: mEstablishments, },
    { path: '/mobile/departments', methods: ["GET"], handler: mDepartments, },
    { path: '/mobile/verify', methods: ["POST"], handler: verify, },
    { path: '/mobile/user', methods: ["GET", "POST", "PUT"], handler: user, },
    { path: '/mobile/login', methods: ["POST"], handler: loginMobile, },
    { path: '/mobile/validate', methods: ["POST"], handler: validate, },
    { path: '/mobile/fireduino', methods: ["POST", "PUT", "GET"], handler: fireduino },
    { path: '/mobile/fireduinos', methods: ["GET"], handler: fireduinos },
    { path: '/mobile/loginhistory', methods: ["GET"], handler: login_history },
    { path: '/mobile/edithistory', methods: ["GET"], handler: edit_history },
    { path: '/mobile/dashboard', methods: ["GET"], handler: dashboard },
    { path: '/mobile/validateEmail', methods: ["POST"], handler: validateEmail },
    { path: '/mobile/accesslogs', methods: ["GET"], handler: accessLogs },
    { path: '/mobile/access', methods: ["POST"], handler: accessDevice },
    { path: '/mobile/reports', methods: ["GET"], handler: incidentReports },
    { path: '/mobile/report', methods: ["POST", "PUT"], handler: incidentReport },
    { path: '/mobile/smshistory', methods: ["GET"], handler: sms_history },

    // WebSocket API
    { path: '/ws/establishments', methods: ["GET"], handler: wEstablishments }
];

export default routes;

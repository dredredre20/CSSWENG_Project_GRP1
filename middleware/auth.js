// Updated and corrected route permissions mapping
const ROUTE_PERMISSIONS = {
    '/home': ['admin', 'supervisor', 'sdw'],
    '/delete': ['sdw','supervisor', 'admin'],
    '/register': ['admin'],
    '/download': ['supervisor', 'sdw'],
    '/upload': ['sdw'],
    '/reports': ['sdw'], // This matches your router mounting
    '/sdw': ['supervisor'], // For /sdw/:sdw_id routes
    '/logout': ['admin', 'supervisor', 'sdw']

    // will admin routes here when ready
};

// Base authentication check
export function requireAuth(req, res, next) {
    if (!req.session.logged_user) {
        return res.redirect('/login');
    }
    next();
}

// Role-based authorization
export function requireRole(...allowedRoles) {
    // Prevents access to other pages if not logged in
    return (req, res, next) => {
        if (!req.session.logged_user) {
            return res.redirect('/login');
        }
        
        const userRole = req.session.logged_user.staff_type;
        // Check if current user role is allowed to access specified route
        if (!allowedRoles.includes(userRole)) {
            /*return res.status(403).render('error', { 
                message: 'Access denied. You do not have permission to access this page.',
                user: req.session.logged_user
            });*/
        }
        
        next();
    };
}

// Route protection middleware
export function protectRoutes(req, res, next) {
    const publicRoutes = ['/login', '/public'];
    const requestPath = req.path;
    
    // Allow public routes
    if (publicRoutes.some(route => requestPath.startsWith(route))) {
        return next();
    }
    
    // Block all other routes if not logged in
    if (!req.session.logged_user) {
        return res.redirect('/login');
    }
    
    // Get logged in user role
    const userRole = req.session.logged_user.staff_type;
    
    let hasPermission = true;
    let matchedRoute = null;
    
    // Find if current path matches any protected route
    for (const [route, allowedRoles] of Object.entries(ROUTE_PERMISSIONS)) {
        if (requestPath.startsWith(route)) {
            matchedRoute = route;
            if (!allowedRoles.includes(userRole)) {
                hasPermission = false;
                break;
            }
        }
    }
    
    // If we found a matching route but user doesn't have permission
    if (matchedRoute && !hasPermission) {
        //return res.status(403).render('error', {
        //    message: `Access denied. ${userRole}s cannot access ${matchedRoute}.`,
        //    user: req.session.logged_user
        //});
        return res.redirect('/home'); // Temporary fix to redirect to home, error page is not working
    }
    
    next();
}

// Prevent logged-in users from accessing login/register pages
export function redirectIfAuthenticated(req, res, next) {
    if (req.session.logged_user) {
        return res.redirect('/home');
    }
    next();
}
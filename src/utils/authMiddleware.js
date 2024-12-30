import jwt from 'jsonwebtoken';
export function authenticateToken(req) {
    return new Promise((resolve, reject) => {
        const authHeaderold = Array.from(req.headers);
        const AuthValue = authHeaderold.map((item) => {
            if (item[1].includes('Bearer')) {
                return item[1];
            }
        });
        let token = null;

        for (let i = 0; i < AuthValue.length; i++) {
            const element = AuthValue[i];
            if (element && element.startsWith('Bearer')) {
                token = element.split(' ')[1];
                break;
            }
        }

        try {
            const decoded = jwt.verify(token, process.env.API_SECRET_KEY);
            req.userId = decoded.data.id; // Extract user ID from token payload
            resolve(req);
        } catch (error) {
            reject({ error: 'Invalid Token' });
        }
    });
}
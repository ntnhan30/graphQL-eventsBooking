const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const authHeader = req.get('Authorization');
    if (!authHeader) {
        req.isAuth = false;
        return next();
    }
    const token = authHeader.split(' ')[1]; // Bearer efghjj
    if(!token || token == '') {
        req.isAuth = false;
        return next();
    }
    let decodedToken;
    try{
        decodedToken =  jwt.verify(token, 'somesupersecretkey');
    } catch (err) {
        req.isAuth = flase;
        return next();
    }
    if (!decodedToken) {
        req.isAuth = flase;
        return next();
    }
    req.isAuth = true;
    req.userId = decodedToken;
    next();
    }
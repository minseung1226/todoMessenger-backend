const jwt=require("jsonwebtoken");

function authenticateToken(req,res,next){
    const token=req.headers.authorization?.split(' ')[1];
    if(!token){
        return res.status(401).send("not found Token");
    }

    jwt.verify(token,process.env.JWT_SECRET_KEY,(err,userId)=>{
        if(err) return res.status(403).send('Invalid token');
        req.userId=userId;
        next();
    })
}

module.exports = authenticateToken;
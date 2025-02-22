import jwt from "jsonwebtoken";


//this is authentication middleware
const auth = async (req, res, next) => {
  try {
    const token = req.headers.authorization;
    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.body.userId = decoded.id;
    next();
  } catch (error) {
    return res.status(500).json({ message: "Authentication Error" });
  }
};

export default auth;

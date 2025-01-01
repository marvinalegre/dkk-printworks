import jwt from "jsonwebtoken";

export default function () {
  return async function (req, res, next) {
    try {
      const decodedPayload = jwt.verify(
        req.cookies.token,
        process.env.JWT_SECRET,
        {
          algorithms: ["HS256"],
        }
      );

      req.jwtId = decodedPayload.id;
    } catch (err) {
      console.log(err.message);
    }

    next();
  };
}

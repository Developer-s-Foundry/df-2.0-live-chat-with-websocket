// middleware that uses jwt to authenticate requests
import * as jwt from "jsonwebtoken";
import {Request} from "express";


export interface AuthRequest extends Request {
  user?: any;
}

export const expressAuthentication = (req: AuthRequest, securityName: string, scopes?: string[]) : Promise<any> => {

    if (securityName !== "jwt") {
        return Promise.reject({message: "Unsupported security scheme"});
    }
    
    return new Promise((resolve, reject) => {
        const authHeader = req.headers["authorization"];
        if (!authHeader) {
            throw new Error("Authorization header missing");
        }

        const token = authHeader.split(" ")[1];
        if (!token) {
            reject({message: "Token missing"});
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
            req.user = decoded; // Attach decoded token to request object
            resolve(decoded);//
        } catch (error) {
            reject({message: "Invalid token"});
        }
}   );
};
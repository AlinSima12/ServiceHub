import jwt from 'jsonwebtoken';
import { configDotenv } from 'dotenv';

configDotenv();

export default class AuthManager {
    private secret: string = "";
    
    constructor() {
        // Load the secret from the environment
        this.secret = process.env.JWT_SECRET || "";

        if (this.secret === "") {
            throw new Error("JWT_SECRET is not set in the environment");
        }
    }

    public generateToken(username: string): string {
        return jwt.sign({ username }, this.secret, { expiresIn: "1h" });
    }

    public verifyToken(token: string): string | object {
        try {
            return jwt.verify(token, this.secret);
        } catch (error) {
            return "";
        }
    }
};
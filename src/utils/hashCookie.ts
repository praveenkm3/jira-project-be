import "dotenv/config";
import crypto from "crypto";

const CookieSecretKey = process.env.CookieSecretKey;
const ALGORITHM = process.env.ALGORITHM;

export function encryptToken(token: string) {
  try {
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv(ALGORITHM, CookieSecretKey, iv);
    let encrypted = cipher.update(token, "utf8", "hex");
    encrypted += cipher.final("hex");
    const authTag = cipher.getAuthTag().toString("hex");
    return `${iv.toString("hex")}:${authTag}:${encrypted}`;
  } catch {
    return "Tokens Invalid";
  }
}
export function decryptToken(cookieValue:any) {
    try {
      const [ivHex, authTagHex, encryptedHex] = cookieValue.split(':');
    
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, CookieSecretKey, iv);
    
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted; 
    } catch {
      return "Tokens Invalid";
    }
}
import type { loginType, registerType } from "../types/auth.types.ts";
import { unHashPassword } from "../utils/hashPassword.ts";
import { AppError } from "../middlewares/errorMiddleware.ts";
import { generateAccessToken, generateRefreshToken, validateAccessToken, validateRefreshToken } from "../utils/tokens.ts";
import type { tokenObject } from "../types/auth.types.ts";
import { decryptToken, encryptToken } from "../utils/hashCookie.ts";
import { usersRepo } from "../config/repos.ts";
import { hashPassword } from "../utils/hashPassword.ts";
import { UserRole } from "../config/entities/Users.ts";

export async function loginService(data: loginType) {
  try {
    const { email, password } = data;

    const checkUser = await usersRepo
      .createQueryBuilder()
      .select(["name", "email", "password", "role", "id"])
      .where("email = :email", { email })
      .execute();

    if (checkUser.length < 0) {
      throw new AppError(400, "Invalid Email");
    }
    const checkPassword = await unHashPassword(password, checkUser[0].password);

    if (checkPassword) {
      const { id, email, role }: tokenObject = checkUser[0];
      console.log(id, email, role);
      const access_token:string = generateAccessToken({ email, id, role });
      const refresh_token:string = generateRefreshToken({ email, id, role });
      const access_decrypt:string = encryptToken(access_token);
      const refresh_decrypt:string = encryptToken(refresh_token);
      return [access_decrypt, refresh_decrypt, { id, email, role }];
    } else {
      throw new AppError(401, "Incorrect Password");
    }
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }
    throw new AppError(500, "Something went wrong ,Unable to procee login");
  }
}
export async function registerService(data: registerType) {
  try {
    const { email, name, password, role } = data;
    let setRole: UserRole =
      role === "admin" ? UserRole.ADMIN : UserRole.DEVELOPER;

    const checkUser = await usersRepo
      .createQueryBuilder()
      .select("name")
      .where("email = :email", { email })
      .execute();

    if (checkUser.length > 0) {
      return {
        created: false,
        message: "Email Already Exists",
      };
    }
    const hashedPassword = await hashPassword(password);
    const createUser = usersRepo.create({
      email,
      password: hashedPassword,
      role: setRole,
      name,
    });

    usersRepo.save(createUser);
    return {
      created: true,
      message: "User Registered Successfully",
    };
  } catch (error) {
    throw new AppError(400, "Registration Failed");
  }
}
export async function refeshService(accessToken:string,refreshToken:string) {
  const accessTokenDecrypt = decryptToken(accessToken);
  const verifyAccess = validateAccessToken(accessTokenDecrypt);
  if (verifyAccess[0]) {
    return verifyAccess[1];
  } else {
    const refreshTokenDecrypt = decryptToken(refreshToken);
    const verifyRefresh = validateRefreshToken(refreshTokenDecrypt);
    if (verifyRefresh[0]) {
      const payload = verifyRefresh[1];
      const{email,role,id}=payload as tokenObject;
      const newAccess = await generateAccessToken({email,role,id});
      const accessTokenEncrypt = encryptToken(newAccess);
      return accessTokenEncrypt;
    } else {
      throw new AppError(404,"Tokens Expired");
    }
  }
}
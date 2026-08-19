import type { loginType, registerType } from "../types/auth.types.ts";
import { unHashPassword } from "../utils/hashPassword.ts";
import { AppError } from "../middlewares/errorMiddleware.ts";
import { generateAccessToken, generateRefreshToken } from "../utils/tokens.ts";
import type { tokenObject } from "../types/auth.types.ts";
import { encryptToken } from "../utils/hashCookie.ts";
import { roleRepository, usersRepo } from "../config/repos.ts";
import { hashPassword } from "../utils/hashPassword.ts"; 

export async function loginService(data: loginType) {
  try {
    const { email, password } = data;

    const checkUser = await usersRepo
      .createQueryBuilder("users")
      .innerJoin("users.role","role")
      .select(["name", "email", "password", "id"])
      .addSelect("role_name","role")
      .where("email = :email", { email })
      .execute();

    if (checkUser.length <= 0) {
      throw new AppError(400, "Invalid Email");
    }
    const checkPassword = await unHashPassword(password, checkUser[0].password);

    if (checkPassword) {
      const { id, email, role }: tokenObject = checkUser[0];
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
    const getRole=await roleRepository.findOne({
      where:{
        role_id:role
      }
    });
    if(!getRole){
      throw new AppError(400,"Invalid role selected");
    } 
    const createUser = usersRepo.create({
      email,
      password: hashedPassword,
      role: {
        role_id:getRole.role_id
      },
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
export async function getRoleService() {
  try {
    const response=await roleRepository.find();
    return response;
  } catch (error) {
    throw new AppError(500,"Unable to fetch roles");
  }
}

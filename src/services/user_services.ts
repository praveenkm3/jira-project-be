import { AppError } from "../middlewares/errorMiddleware.ts";
import { Users } from "../config/entities/Users.ts";
import { usersRepo } from "../config/repos.ts";
import type{ usersReturnType } from "../types/user.types.ts";



export const getUsersService = async (userId: string) => {
  try {
    const result:usersReturnType[]=await usersRepo
    .createQueryBuilder("user")
    .select(["user.id","user.name","user.email","user.role"])
    .where("user.id != :uid",{uid:userId})
    .getMany();
    return result;
  } catch (error) {
    throw new AppError(404,"users not found");
  }
};

export const getSpecificUserService = async (uid: string) => {
  try {
    const result:usersReturnType | null=await usersRepo
    .createQueryBuilder("user")
    .select(["user.id","user.name","user.email","user.role"])
    .where("user.id != :uid",{uid:uid})
    .getOne();
    return result;
  } catch (error) {
    throw new AppError(404,"user not found");
  }
}
import { AppError } from "../middlewares/errorMiddleware.ts";
import { usersRepo } from "../config/repos.ts";
import type { usersReturnType } from "../types/user.types.ts";

export const getUsersService = async (userId: string) => {
  try {
    const result: usersReturnType[] = await usersRepo
      .createQueryBuilder("user")
      .innerJoin("user.role", "role")
      .leftJoin("user.designation", "designation")
      .select("user.id", "id")
      .addSelect("user.name", "name")
      .addSelect("user.email", "email")
      .addSelect("role.role_name", "role")
      .addSelect("designation.designation_name", "designation")
      .where("user.id != :uid", { uid: userId })
      .getRawMany();
    return result;
  } catch {
    throw new AppError(404, "users not found");
  }
};

export const getSpecificUserService = async (uid: string) => {
  try {
    const result: usersReturnType[] | undefined = await usersRepo
      .createQueryBuilder("user")
      .innerJoin("user.role", "role")
      .leftJoin("user.designation", "designation")
      .select("user.id", "id")
      .addSelect("user.name", "name")
      .addSelect("user.email", "email")
      .addSelect("role.role_name", "role")
      .addSelect("designation.designation_name", "designation")
      .where("user.id = :uid", { uid })
      .getRawOne();

    return result;
  } catch {
    throw new AppError(404, "user not found");
  }
};

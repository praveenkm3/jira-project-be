import { designationRepository, usersRepo } from "../config/repos.ts";
import { AppError } from "../middlewares/errorMiddleware.ts";

export async function addDesignationService(
  user_id: string,
  designation_name: string,
) {
  try {
    const user = await usersRepo.findOne({
      where: { id: user_id }, 
      relations:{
        role:true
      }
    });

    if (!user) {
      throw new AppError(404, "User not found");
    }

    if (user.role.role_name !== "admin") {
      throw new AppError(
        403,
        "Only admins can create designations",
      );
    }
    if(!designation_name){
        throw new AppError(409, "Designation  Required");
    }

    const existingDesignation = await designationRepository.findOne({
      where: {
        designation_name: designation_name.trim(),
      },
    });

    if (existingDesignation) {
      throw new AppError(409, "Designation already exists");
    }

    const designation = designationRepository.create({
      designation_name: designation_name.trim(),
    });

    return await designationRepository.save(designation);
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError(500, "Unable to add designation");
  }
}
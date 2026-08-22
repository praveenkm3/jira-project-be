import { designationRepository, usersRepo } from "../config/repos.ts";
import { AppError } from "../middlewares/errorMiddleware.ts";

export async function addDesignationService(
  user_id: string,
  designation_name: string,
) {
  try {
    const user = await usersRepo.findOne({
      where: { id: user_id },
      relations: {
        role: true,
      },
    });

    if (!user) {
      throw new AppError(404, "User not found");
    }

    if (user.role.role_name !== "admin") {
      throw new AppError(403, "Only admins can create designations");
    }
    if (!designation_name) {
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
export async function updateDesignationService(
  designation_id: string,
  new_name: string,
) {
  try {
    if (!new_name.trim()) {
      throw new AppError(409, "Designation name required");
    }
    const existingDesignation = await designationRepository.findOne({
      where: {
        designation_name: new_name.trim(),
      },
    });
    if (existingDesignation) {
      throw new AppError(409, "Designation on that name already exists");
    }

    const query = await designationRepository.update(designation_id, {
      designation_name: new_name.trim(),
    });
    if (query.affected === 1) {
      return {
        success: true,
        message: "Designation updated successfully",
      };
    }

    return {
      success: false,
      message: "Designation not found",
    };
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError(500, "Unable to update designation");
  }
}
export async function deleteDesignationService(designation_id: string) {
  try {
    if (!designation_id) {
      throw new AppError(409, "Designation Id required");
    }
    const check1 = await usersRepo.find({
      where: {
        designation: {
          designation_id: designation_id,
        },
      },
    });
    if (check1.length > 0) {
      return {
        success: false,
        message: "Designation Currently in used",
      };
    }
    const query = await designationRepository.delete(designation_id);
    if (query.affected === 1) {
      return {
        success: true,
        message: "Designation deleted successfully",
      };
    }

    return {
      success: false,
      message: "Designation not found",
    };
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    throw new AppError(500, "Unable to delete designation");
  }
}

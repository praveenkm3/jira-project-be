import bcrypt from "bcrypt";

export const hashPassword=async(password:string)=>{
    const hashPassword = await bcrypt.hash(password, 10);
    return hashPassword;
};
export const unHashPassword=async (password:string,userPassword:string)=>{
    const checkPassword = await bcrypt.compare(password, userPassword);
    return checkPassword;
}
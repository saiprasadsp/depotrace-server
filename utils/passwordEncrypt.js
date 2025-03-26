import bcrypt from "bcryptjs";

export const passwordEncrypt = async (rawPassword) => {
  try {
    const SALT = await bcrypt.genSalt(10);
    const encryptedPassword = await bcrypt.hash(rawPassword, SALT);
    return encryptedPassword;
  } catch (error) {
    throw error;
  }
}
export default passwordEncrypt;
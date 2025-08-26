import { UserDBService } from "../services/database/userDBService.js";

export class UserService {
  async createUser(data) {
    if (!data.name || !data.email) {
      throw new Error("Name and email are required");
    }
    const existingUser = (await UserDBService.getUserByEmail(data.email))
      ? await UserDBService.getUserByEmail(data.email)
      : null;

    if (existingUser) {
      throw new Error("User with this email already exists");
    }
    const newUser = await UserDBService.createUser(data);

    return newUser;
  }

  async getAllUsers() {
    return UserDBService.getAllUsers();
  }

  async getUserById(id) {
    return UserDBService.getUserById(id);
  }

  async updateUser(id, data) {
    return UserDBService.updateUser(id, data);
  }

  async deleteUser(id) {
    return UserDBService.deleteUser(id);
  }
}
export const userService = new UserService();

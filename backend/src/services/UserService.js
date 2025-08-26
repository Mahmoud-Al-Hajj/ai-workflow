import { UserDBService } from "./database/userDBService.js";

export class UserService {
  constructor() {
    this.userDBService = new UserDBService();
  }

  async createUser(data) {
    if (!data.name || !data.email) {
      throw new Error("Name and email are required");
    }
    const existingUser = await this.userDBService.getUserByEmail(data.email);

    if (existingUser) {
      throw new Error("User with this email already exists");
    }
    const newUser = await this.userDBService.createUser(data);

    return newUser;
  }

  async getAllUsers() {
    return this.userDBService.getAllUsers();
  }

  async getUserById(id) {
    return this.userDBService.getUserById(id);
  }

  async updateUser(id, data) {
    return this.userDBService.updateUser(id, data);
  }

  async deleteUser(id) {
    return this.userDBService.deleteUser(id);
  }
}
export const userService = new UserService();

import { UserDBService } from "./database/userDBService.js";

export class UserService {
  constructor() {
    this.userDBService = new UserDBService();
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

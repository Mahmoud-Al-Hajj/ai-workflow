import { UserDBService } from "./database/userDBService.js";

export class UserService {
  constructor() {
    this.userDBService = new UserDBService();
  }

  async getAllUsers() {
    return this.userDBService.getAllUsers();
  }

  async getUserById(id) {
    // The profile endpoint shows a user's workflows, so it asks for them.
    return this.userDBService.getUserById(id, { withWorkflows: true });
  }

  async updateUser(id, data) {
    return this.userDBService.updateUser(id, data);
  }

  async deleteUser(id) {
    return this.userDBService.deleteUser(id);
  }
}
export const userService = new UserService();

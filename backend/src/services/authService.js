import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

class AuthService {
  async login(email, password) {
    const user = await User.findOne({ email });
    if (!user) throw new Error("User not found");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error("Invalid credentials");

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    return { token };
  }

  async register(userData) {
    const { email, password } = userData;
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ email, password: hashedPassword });
    await newUser.save();
    return { success: true };
  }
}

export { AuthService };

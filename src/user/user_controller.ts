import { Controller, Route, Post, Get, Path, Body, Res } from "tsoa";
import { userRepo } from "./user_repo";
import * as jwt from "jsonwebtoken";

@Route("api/users")
export class UserController extends Controller {
  private userService: typeof userRepo;

  constructor() {
    super();
    this.userService = userRepo;
  }

  @Post("register")
  public async registerUser(@Body() requestBody: { email: string; password: string }) {
    // revalidate email and password here as well
    if (requestBody.password.length < 6) {
      this.setStatus(400); // Bad Request
      return { message: "Password must be at least 6 characters long" };
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(requestBody.email)) {
      this.setStatus(400); // Bad Request
      return { message: "Please enter a valid email address" };
    }
    console.log("Registering user with data:", requestBody);
    const user = await this.userService.createUser(requestBody);
    return user
  }

  @Post("login")
  public async loginUser(@Body() requestBody: { email: string; password: string }) {
    
    const user = await this.userService.loginUser(requestBody.email, requestBody.password);

    // attach jwt token
    if (user) {
      const token = jwt.sign(
        { id: user._id, email: user.email, username: user.username} as any, 
        process.env.JWT_SECRET as string,
        { expiresIn: "1h" }
      );
       return {
        userId: user._id,
        username: user.username,
        token
      };
    }

    this.setStatus(401); // Unauthorized
    return { message: "Invalid credentials" };
  }

  @Post("upgrade/:userId")
  public async upgradeToAgent(@Path() userId: string) {
    return this.userService.upgradeToAgent(userId);
  }

  @Get("role/:role")
  public async fetchUsersByRole(@Path() role: string) {
    const user = await this.userService.fetchUserByRole(role);
    return user;
  }

  @Post("get-all-users/:userId")
  public async fetchAllUsers(@Path() userId: string) {
    return this.userService.fetchAllUsers(userId);
  }
}
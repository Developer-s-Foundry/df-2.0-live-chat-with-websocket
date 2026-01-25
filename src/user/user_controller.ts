import { Controller, Route, Post } from "tsoa";
import { userRepo } from "./user_repo";

@Route("users")
export class UserController extends Controller {
  private userService: typeof userRepo;

  constructor() {
    super();
    this.userService = userRepo;
  }

  @Post("register")
  public async registerUser(requestBody: { email: string; password: string }) {
    return this.userService.createUser(requestBody);
  }

  @Post("login")
  public async loginUser(requestBody: { email: string; password: string }) {
    return this.userService.loginUser(requestBody.email, requestBody.password);
  }

}
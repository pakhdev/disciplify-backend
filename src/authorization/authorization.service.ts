import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { LessThan, Repository } from "typeorm";
import * as bcrypt from "bcrypt";
import { JwtService } from "@nestjs/jwt";

import { User } from "./entities/user.entity";
import { LoginUserDto, CreateUserDto, UpdateUserDto } from "./dto/";
import { JwtPayload } from "./interfaces/jwt-payload.interface";

@Injectable()
export class AuthorizationService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    try {
      const { password, ...userData } = createUserDto;
      const user = this.userRepository.create({
        ...userData,
        password: bcrypt.hashSync(password, 10),
      });
      await this.userRepository.save(user);
      delete user.password;
      return {
        ...user,
        token: this.getJwtToken({ id: user.id }),
      };
    } catch (error) {
      console.log("AuthorizationModule", error);
    }
  }

  async findById(id: number): Promise<User> {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) throw new NotFoundException("User not found");
    return user;
  }

  async update(
    id: number,
    user: User,
    updateUserDto: UpdateUserDto,
  ): Promise<Object> {
    if (user.id !== id) throw new ForbiddenException();

    try {
      const { password } = updateUserDto;
      const user = await this.userRepository.preload({
        id,
        password: bcrypt.hashSync(password, 10),
      });

      if (!user) throw new NotFoundException("User not found");

      await this.userRepository.save(user);
      delete user.password;

      return {
        ...user,
        token: this.getJwtToken({ id: user.id }),
      };
    } catch (error) {
      console.log("AuthorizationModule", error);
    }
  }

  async login(loginUserDto: LoginUserDto) {
    const { password, name } = loginUserDto;
    const user = await this.userRepository.findOne({
      where: { name: name.toLowerCase().trim() },
      select: { id: true, name: true, password: true },
    });
    if (!user) {
      throw new UnauthorizedException("Credentials are not valid (email)");
    }
    if (!bcrypt.compareSync(password, user.password))
      throw new UnauthorizedException("Credentials are not valid (password)");

    delete user.password;
    return {
      ...user,
      token: this.getJwtToken({ id: user.id }),
    };
  }

  async checkAuthStatus(user: User) {
    return {
      ...user,
      token: this.getJwtToken({ id: user.id }),
    };
  }

  async findUsersWithOldStatisticDate(): Promise<User[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return this.userRepository.find({
      where: {
        statisticDate: LessThan(today),
      },
    });
  }

  private getJwtToken(payload: JwtPayload) {
    return this.jwtService.sign(payload);
  }
}

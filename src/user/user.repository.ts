import { CustomRepository } from "src/common/decorator/custom-repository.decorator";
import { Repository } from "typeorm";
import { User } from "./entities/user.entity";
import { ConflictException, InternalServerErrorException } from "@nestjs/common";
import { CreateUserDto } from "./dto/create-user.dto";

@CustomRepository(User)
export class UserRepository extends Repository<User>{

    async createUser(createUserDto: CreateUserDto): Promise<User> {
        try {
            return await this.save(createUserDto);
        } catch (e: any) {
            if (e.code === 'ER_DUP_ENTRY') throw new ConflictException('Existing id');
            else throw new InternalServerErrorException();
        }
    }

    async findUserById(id: string): Promise<User> {
        return await this.findOne({ where: { id: id } })
    }


}
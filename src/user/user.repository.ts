// image.repository.ts

import { CustomRepository } from "src/common/decorator/custom-repository.decorator";
import { Repository } from "typeorm";
import { User } from "./entities/user.entity";

@CustomRepository(User)
export class UserRepository extends Repository<User>{

    async findUserById(id: string): Promise<User> {
        return await this.findOne({ where: { id: id } })
    }
}
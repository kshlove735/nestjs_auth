import { CustomRepository } from "src/common/decorator/custom-repository.decorator";
import { DeepPartial, FindOneOptions, Repository, UpdateResult } from "typeorm";
import { User } from "./entities/user.entity";
import { ConflictException, InternalServerErrorException } from "@nestjs/common";
import { CreateUserDto } from "./dto/create-user.dto";

@CustomRepository(User)
export class UserRepository extends Repository<User>{

    async findOneOrCreate(conditions: FindOneOptions<User>, entityLike: DeepPartial<User>): Promise<User> {
        try {
            const findUser: User = await this.findOne(conditions);
            if (findUser) return findUser;
            let createUser: User = this.create(entityLike);
            createUser = await this.save(createUser);
            return createUser;
        } catch (error) {
            throw new Error('사용자를 찾거나 생성하는데 실패하였습니다.');
        }
    }

    async createUser(createUserDto: CreateUserDto): Promise<User> {
        try {
            return await this.save(createUserDto);
        } catch (e: any) {
            if (e.code === 'ER_DUP_ENTRY') throw new ConflictException('현재 계정으로 가입한 ID가 존재합니다.')
            else throw new InternalServerErrorException();
        }
    }

    async findUserById(id: string): Promise<User> {
        return await this.findOne({ where: { id: id } })
    }

    async findUserByEmail(email: string): Promise<User> {
        return await this.findOne({ where: { email: email } })
    }

    async setCurrentRefreshToken(userId: number, hashedCurrentRefreshToken: string, currentRefreshTokenExp: Date): Promise<UpdateResult> {
        return await this.update(userId, {
            currentRefreshToken: hashedCurrentRefreshToken,
            currentRefreshTokenExp: currentRefreshTokenExp
        })
    }

    async findUserByUserId(userId: number): Promise<User> {
        return await this.findOne({ where: { userId } })
    }

    async removeRefreshToken(userId: number): Promise<UpdateResult> {
        return await this.update(userId, {
            currentRefreshToken: null,
            currentRefreshTokenExp: null
        })
    }

}
import { DynamicModule, Provider } from "@nestjs/common";
import { TYPEORM_CUSTOM_REPOSITORY } from "../decorator/custom-repository.decorator";
import { getDataSourceToken } from "@nestjs/typeorm";
import { DataSource } from "typeorm";

export class TypeOrmExModule {
    public static forCustomRepository<T extends new (...args: any[]) => any>(repositories: T[]): DynamicModule {
        const providers: Provider[] = [];

        for (const repository of repositories) {
            const entitiy = Reflect.getMetadata(TYPEORM_CUSTOM_REPOSITORY, repository);

            if (!entitiy) continue;

            providers.push({
                inject: [getDataSourceToken()],
                provide: repository,
                useFactory: (dataSource: DataSource): typeof repository => {
                    const baseRepository = dataSource.getRepository<any>(entitiy);
                    return new repository(baseRepository.target, baseRepository.manager, baseRepository.queryRunner);
                }
            })
        }

        return {
            exports: providers,
            module: TypeOrmExModule,
            providers
        }

    }
}
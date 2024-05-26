import { classes } from '@automapper/classes';
import { AutomapperAsyncOptions } from '@automapper/nestjs';

export const automapperConfig: AutomapperAsyncOptions = {
    useFactory: async () => ({
        strategyInitializer: classes(),
    }),
};

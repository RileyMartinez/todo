import { classes } from '@automapper/classes';
import { AutomapperAsyncOptions } from '@automapper/nestjs';

export const AutomapperConfig: AutomapperAsyncOptions = {
    useFactory: async () => ({
        strategyInitializer: classes(),
    }),
};

import { test as teardown } from '@playwright/test';
import MCR from 'monocart-coverage-reports';
import coverageOptions from '../mcr.config';

teardown('teardown', async ({}) => {
    const mcr = MCR(coverageOptions);
    await mcr.generate();
});

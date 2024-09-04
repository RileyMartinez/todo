import { FullConfig } from '@playwright/test';
import MCR from 'monocart-coverage-reports';
import coverageOptions from './mcr.config';

function globalSetup(_: FullConfig) {
    const mcr = MCR(coverageOptions);
    mcr.cleanCache();
}

export default globalSetup;

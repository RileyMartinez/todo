import { test as setup } from '@playwright/test';
import MCR from 'monocart-coverage-reports';
import coverageOptions from '../mcr.config';

setup('setup', ({}) => {
    const mcr = MCR(coverageOptions);
    mcr.cleanCache();
});

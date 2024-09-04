import { CoverageReportOptions } from 'monocart-coverage-reports';

const coverageOptions: CoverageReportOptions = {
    name: 'Playwright Coverage Report',
    reports: ['console-details', 'v8', 'lcovonly'],
    outputDir: './ui/test/e2e/coverage-reports',
};

export default coverageOptions;

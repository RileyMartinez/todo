import { CoverageReportOptions } from 'monocart-coverage-reports';

const coverageOptions: CoverageReportOptions = {
    name: 'Playwright Coverage Report',
    reports: ['console-details', 'v8', 'lcovonly'],
    outputDir: './test-reports',
};

export default coverageOptions;

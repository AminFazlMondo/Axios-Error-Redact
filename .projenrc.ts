import { typescript, javascript, TextFile } from 'projen';

const workflowNodeVersion = '20';

const project = new typescript.TypeScriptProject({
  projenrcTs: true,
  defaultReleaseBranch: 'main',
  name: 'axios-error-redact',
  description: 'Library to redact sensitive information from Axios errors',
  keywords: [
    'axios',
    'error',
    'sensitive',
    'redact',
    'interceptor',
    'projen',
    'typescript',
  ],
  majorVersion: 1,
  packageName: 'axios-error-redact',
  packageManager: javascript.NodePackageManager.PNPM,
  pnpmVersion: '9',
  repository: 'https://github.com/AminFazlMondo/Axios-Error-Redact.git',
  authorEmail: 'amin.fazl@mondo.com.au',
  authorName: 'Amin Fazl',
  jest: true,
  jestOptions: {
    jestVersion: '^29.7.0',
    jestConfig: {
      preset: 'ts-jest',
      testEnvironment: 'node',
      testMatch: ['<rootDir>/test/**/*.test.ts'],
      collectCoverageFrom: [
        'src/**/*.ts',
      ],
      moduleFileExtensions: ['js', 'ts'],
    },
  },
  deps: [
    'axios',
  ],
  devDeps: [
    'jest@^29.7.0',
    'jest-junit@^16',
    'ts-jest@^29.4.6',
    '@types/jest@^29.5.14',
    'ts-eager',
    '@types/babel__core',
    'testcontainers',
    'wiremock-captain',
    '@types/node@^20',
  ],
  releaseToNpm: true,
  npmAccess: javascript.NpmAccess.PUBLIC,
  npmTrustedPublishing: true,
  minNodeVersion: '20.0.0',
  tsconfig: {
    compilerOptions: {
      target: 'ES2019',
      lib: ['ES2019'],
      skipLibCheck: true,
    },
  },
  docgen: true,
  npmignore: [
    'docs',
  ],
  publishTasks: true,
  autoApproveOptions: {
    allowedUsernames: ['AminFazlMondo'],
  },
  autoApproveUpgrades: true,
  workflowNodeVersion,
  releaseFailureIssue: true,
});

new TextFile(project, '.nvmrc', {
  lines: [workflowNodeVersion],
});

project.synth();
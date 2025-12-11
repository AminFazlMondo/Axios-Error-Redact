import { JsonFile, typescript, javascript, TextFile } from 'projen';

const workflowNodeVersion = '24';

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
  packageManager: javascript.NodePackageManager.NPM,
  repository: 'https://github.com/AminFazlMondo/Axios-Error-Redact.git',
  authorEmail: 'amin.fazl@mondo.com.au',
  authorName: 'Amin Fazl',
  jest: false,
  deps: [
    'axios',
  ],
  devDeps: [
    'chai',
    '@types/chai',
    'mocha',
    '@types/mocha',
    'ts-eager',
    '@types/babel__core',
    'testcontainers',
    'wiremock-captain',
  ],
  releaseToNpm: true,
  npmAccess: javascript.NpmAccess.PUBLIC,
  npmTrustedPublishing: true,
  minNodeVersion: '18.0.0',
  tsconfig: {
    compilerOptions: {
      target: 'ES2019',
      lib: ['ES2019'],
      skipLibCheck: true,
    },
  },
  docgen: true,
  npmignore: [
    '.mocharc.json',
    'docs',
  ],
  publishTasks: true,
  autoApproveOptions: {
    allowedUsernames: ['AminFazlMondo'],
  },
  autoApproveUpgrades: true,
  workflowNodeVersion,
  releaseFailureIssue: true,
  workflowBootstrapSteps: [
    {
      name: 'Set environment variable for reqres.in steps',
      run: 'echo "REQRES_API_KEY=${{ secrets.REQRES_API_KEY }}" >> $GITHUB_ENV',
    },
  ],
});

new JsonFile(project, '.mocharc.json', {
  obj: {
    recursive: true,
    require: ['ts-eager/register'],
    timeout: 30_000,
    slow: 3000,
    extension: ['ts'],
    spec: ['test/*.test.ts'],
  },
});

new TextFile(project, '.nvmrc', {
  lines: [workflowNodeVersion],
});

project.tasks.tryFind('test')?.exec('mocha');
project.synth();
const { TypeScriptProject, NodePackageManager, ProjectType, NpmAccess } = require('projen');

const project = new TypeScriptProject({
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
  majorVersion: 0,
  packageName: 'axios-error-redact',
  packageManager: NodePackageManager.NPM,
  projectType: ProjectType.LIB,
  repository: 'https://github.com/AminFazlMondo/Axios-Error-Redact.git',
  authorEmail: 'amin.fazl@mondo.com.au',
  authorName: 'Amin Fazl',
  jest: false,
  deps: [
    'axios',
    '@types/axios',
  ],
  devDeps: [
    'chai',
    '@types/chai',
    'mocha',
    '@types/mocha',
    'ts-eager',
    '@types/babel__core',
  ],
  releaseToNpm: true,
  npmAccess: NpmAccess.PUBLIC,
  npmTokenSecret: 'NPM_TOKEN',
  minNodeVersion: '14',
  tsconfig: {
    compilerOptions: {
      target: 'ES2019',
      lib: ['ES2019'],
    },
    exclude: [
      '.mocharc.json',
    ],
  },
});

project.tasks.tryFind('test').exec('mocha');
project.synth();
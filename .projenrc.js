const {TypeScriptProject, NodePackageManager, ProjectType, NpmAccess, JsonFile} = require('projen')

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
  ],
  releaseToNpm: true,
  npmAccess: NpmAccess.PUBLIC,
  npmTokenSecret: 'NPM_TOKEN',
  minNodeVersion: '14',
  tsconfig: {
    compilerOptions: {
      target: 'ES2019',
      lib: ['ES2019'],
      skipLibCheck: true,
    },
  },
  autoMergeOptions: {
    buildJob: 'build',
  },
  docgen: true,
  npmignore: [
    '.mocharc.json',
    'docs',
  ],
})

const additionalRules = {
  'curly': [
    'error',
    'multi',
    'consistent',
  ],
  'semi': [
    'error',
    'never',
  ],
  'object-curly-spacing': 'error',
  'nonblock-statement-body-position': ['error', 'below'],
}

project.eslint.addRules(additionalRules)

const mochaConfig = new JsonFile(project, '.mocharc.json', {
  obj: {
    recursive: true,
    require: ['ts-eager/register'],
    timeout: 8000,
    slow: 3000,
    extension: ['ts'],
    spec: ['test/*.test.ts'],
  },
})
project.files.push(mochaConfig)

project.tasks.tryFind('test').exec('mocha')
project.synth()
const fs = require('fs');
const babel = require('gulp-babel'),
  gulp = require('gulp'),
  sourcemaps = require('gulp-sourcemaps'),
  typescript = require('gulp-typescript'),
  revertPath = require('gulp-revert-path');

const typescriptFiles = ['./src/**/*.ts', '!./src/**/__tests__/*.ts'];

const babelrc = JSON.parse(fs.readFileSync('./.babelrc', {encoding: 'utf8'}));
const babelParseTypescriptConfig = {
  babelrc: false,
  plugins: ['@babel/syntax-typescript'],
};

const babelEs5Config = {
  presets: [
    '@babel/preset-stage-1',
    '@babel/preset-env',
    '@babel/preset-react',
  ],
  plugins: ['@babel/plugin-proposal-class-properties'],
};

function buildTypescriptProjectTo(tsProject, destination) {
  return gulp
    .src(typescriptFiles)
    .pipe(sourcemaps.init())
    .pipe(tsProject())
    .js.pipe(babel())
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(destination));
}

function buildOldJavascriptTo(destination) {
  return gulp
    .src('./src/**/*.js')
    .pipe(sourcemaps.init())
    .pipe(babel(babelEs5Config))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest(destination));
}

function dts() {
  return gulp
    .src(typescriptFiles)
    .pipe(babel(babelParseTypescriptConfig))
    .pipe(revertPath()) // keep .ts and .tsx extensions
    .pipe(gulp.dest('dist/dts'));
}

function es5() {
  const tsProject = typescript.createProject('tsconfig.json', {
    module: 'commonjs',
    target: 'es5',
    allowSyntheticDefaultImports: true,
  });

  buildTypescriptProjectTo(tsProject, 'dist/es5');
  return buildOldJavascriptTo('dist/es5');
}

function es5module() {
  const tsProject = typescript.createProject('tsconfig.json', {
    module: 'es6',
    target: 'es5',
    allowSyntheticDefaultImports: true,
  });

  buildTypescriptProjectTo(tsProject, 'dist/es5module');
  return buildOldJavascriptTo('dist/es5module');
}

function es6module() {
  const tsProject = typescript.createProject('tsconfig.json', {
    module: 'es6',
    target: 'es6',
    allowSyntheticDefaultImports: true,
  });

  buildTypescriptProjectTo(tsProject, 'dist/es6module');
  return buildOldJavascriptTo('dist/es6module');
}

gulp.task('default', gulp.series(es5, es5module, es6module, dts));

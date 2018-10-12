const fsx = require('fs-extra')
const gulp = require('gulp')
const exec = require('child_process').exec
const sequence = require('gulp-sequence')

const dest = 'build'
const env = process.env.NODE_ENV || 'local'

console.log(`///////////////////// ${env} /////////////////////\n`)

// 清空输出目录
gulp.task('clean', function () {
  fsx.emptyDirSync(dest)
  fsx.ensureDirSync(dest)
})

// 编译接口文档
gulp.task('build:apidoc', function (cb) {
  return exec('npm run apidoc', function (err, stdout, stderr) {
    console.log(stdout)
    console.log(stderr)
    cb(err)
  })
})

// 编译服务端
gulp.task('build:server', function (cb) {
  return exec('npm run binWn', function (err, stdout, stderr) {
    console.log(stdout)
    console.log(stderr)
    cb(err)
  })
})

// 复制其余文件
gulp.task('copy:others', function () {
  return gulp.src([
    // 'package.json',
    'Dockerfile'
  ]).pipe(gulp.dest(dest))
})

gulp.task('default', sequence('clean', 'build:apidoc', 'build:server', ['copy:others']))

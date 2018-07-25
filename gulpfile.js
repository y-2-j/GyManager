const gulp = require("gulp");
const sass = require('gulp-sass');

gulp.task('sass', () => {
    gulp.src('./src/styles/style.scss')
        .pipe(sass().on('error', sass.logError))
        .pipe(gulp.dest('./public/css'));
});

gulp.task('sass:watch', function () {
    gulp.watch('./src/styles/**/*.scss', ['sass']);
});
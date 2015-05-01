var gulp = require("gulp"),
    connect = require("gulp-connect"),
    opn = require("opn"),
    jade = require("gulp-jade"),
    sass = require("gulp-sass"),
    sourcemaps = require('gulp-sourcemaps'),
    csso = require('gulp-csso'),
    imagemin = require('gulp-imagemin'),
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat'),
    prefix = require('gulp-autoprefixer');

gulp.task('connect', function() {
    connect.server({
        root: 'public',
        livereload: true,
        port: 8888
    });
    opn('http://localhost:8888');
});

gulp.task('jade', function() {
    gulp.src(['./assets/template/**/*.jade', '!./assets/template/**/_*.jade'])
        .pipe(jade({
        pretty: true
    }))  // Собираем Jade только в папке ./assets/template/ исключая файлы с _*
        .on('error', console.log) // Если есть ошибки, выводим и продолжаем
        .pipe(gulp.dest('./public/')) // Записываем собранные файлы
        .pipe(connect.reload()); // даем команду на перезагрузку страницы
}); 

gulp.task('js', function() {
    gulp.src(['./assets/js/**/*.js', '!./assets/js/vendor/**/*.js'])
        .pipe(concat('main.js')) // Собираем все JS, кроме тех которые находятся в ./assets/js/vendor/**
        .pipe(gulp.dest('./public/js'))
        .pipe(connect.reload()); // даем команду на перезагрузку страницы
});

gulp.task('images', function() {
    gulp.src('./assets/img/**/*')
        .pipe(imagemin())
        .pipe(gulp.dest('./public/img'))
        .pipe(connect.reload());
});

gulp.task('sass', function () {
    gulp.src('./assets/scss/**/*.scss')
        .pipe(sourcemaps.init())
        .pipe(sass())
        .on('error', console.log) // Если есть ошибки, выводим и продолжаем
        .pipe(prefix("last 2 version", "> 1%", "ie 8"))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('./public/css'))
        .pipe(connect.reload());
});

gulp.task('build', function() {
    // css
    gulp.src('./assets/scss/screen.scss')
        .pipe(sass())
        .pipe(prefix('last 2 versions', '>1%', 'ie 8'))
        .pipe(concat('main.css'))
        .pipe(csso()) // минимизируем css
        .pipe(gulp.dest('./build/css/')) // записываем css

    // jade
    gulp.src(['./assets/template/*.jade', '!./assets/template/_*.jade'])
        .pipe(jade())
        .pipe(gulp.dest('./build/'))

    // js
    gulp.src(['./assets/js/**/*.js', '!./assets/js/vendor/**/*.js'])
        .pipe(concat('main.js'))
        .pipe(uglify())
        .pipe(gulp.dest('./build/js'));

    // image
    gulp.src('./assets/img/**/*')
        .pipe(imagemin())
        .pipe(gulp.dest('./build/img'))

});

gulp.task('watch', function () {
    gulp.watch(['./assets/template/**/*.jade'], ['jade']);
    gulp.watch(['./assets/scss/**/*.scss'], ['sass']);
    gulp.watch(['./assets/js/**/*'], ['js']);
    gulp.watch(['./assets/img/**/*'], ['images']);
});

gulp.task('default', ['connect', 'watch']);
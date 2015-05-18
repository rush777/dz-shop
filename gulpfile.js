'use strict';

var gulp = require("gulp"),
    jade = require('gulp-jade'),
    prettify = require('gulp-prettify'),
    wiredep = require('wiredep').stream,
    useref = require('gulp-useref'),    
    uglify = require('gulp-uglify'),
    clean = require('gulp-clean'),
    gulpif = require('gulp-if'),
    filter = require('gulp-filter'),
    size = require('gulp-size'),
    imagemin = require('gulp-imagemin'),
    concatCss = require('gulp-concat-css'),
    minifyCss = require('gulp-minify-css'),
    browserSync = require('browser-sync'),
    gutil = require('gulp-util'),
    ftp = require('vinyl-ftp'),
    sass = require('gulp-sass'),
    sourcemaps = require('gulp-sourcemaps'),
    prefix = require('gulp-autoprefixer'),
    reload = browserSync.reload;


// ====================================================
// ====================================================
// ============== Локальная разработка APP ============

// Компилируем Jade в html
gulp.task('jade', function() {
    gulp.src('app/templates/*.jade')
        .pipe(jade())
        .on('error', log)
        .pipe(prettify({indent_size: 4}))
        .pipe(gulp.dest('app/'))
        .pipe(reload({stream: true}));
});

// Подключаем ссылки на bower components
gulp.task('wiredep', function () {
    gulp.src('app/templates/_common/*.jade')
        .pipe(wiredep({
        ignorePath: /^(\.\.\/)*\.\./
    }))
        .pipe(gulp.dest('app/templates/_common/'))
});

// Компилируем sass
gulp.task('sass', function () {
    gulp.src('app/scss/**/*.scss')
        .pipe(sourcemaps.init())
        .pipe(sass())
        .on('error', console.log) // Если есть ошибки, выводим и продолжаем
        .pipe(prefix("last 2 version", "> 1%", "ie 8"))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('app/css/'))
});

// Запускаем локальный сервер (только после компиляции jade, sass)
gulp.task('server', ['jade', 'sass'], function () {  
    browserSync({
        notify: false,
        port: 9000,
        server: {
            baseDir: 'app'
        }
    });  
});

// слежка и запуск задач 
gulp.task('watch', function () {
    gulp.watch('app/templates/**/*.jade', ['jade']);
    gulp.watch('bower.json', ['wiredep']);
    gulp.watch('app/scss/**/*.scss', ['sass']);
    gulp.watch([
        'app/js/**/*.js',
        'app/css/**/*.css'
    ]).on('change', reload);
});

// Задача по-умолчанию 
gulp.task('default', ['server', 'watch']);


// ====================================================
// ====================================================
// ================= Сборка DIST ======================

// Очистка папки
gulp.task('clean', function () {
    return gulp.src('dist')
        .pipe(clean());
});

// Переносим HTML, CSS, JS в папку dist 
gulp.task('useref', function () {
    var assets = useref.assets();
    return gulp.src('app/*.html')
        .pipe(assets)
        .pipe(gulpif('*.js', uglify()))
        .pipe(gulpif('*.css', minifyCss()))
        .pipe(assets.restore())
        .pipe(useref())
        .pipe(gulp.dest('dist'));
});

// Перенос шрифтов
gulp.task('fonts', function() {
    gulp.src('app/fonts/*')
        .pipe(filter(['*.eot','*.svg','*.ttf','*.woff','*.woff2']))
        .pipe(gulp.dest('dist/fonts/'))
});

// Картинки
gulp.task('images', function () {
    return gulp.src('app/img/**/*')
        .pipe(imagemin({
        progressive: true,
        interlaced: true
    }))
        .pipe(gulp.dest('dist/img'));
});

// Остальные файлы, такие как favicon.ico и пр.
gulp.task('extras', function () {
    return gulp.src([
        'app/*.*',
        '!app/*.html'
    ]).pipe(gulp.dest('dist'));
});

// Сборка и вывод размера содержимого папки dist
gulp.task('dist', ['useref', 'images', 'fonts', 'extras'], function () {
    return gulp.src('dist/**/*').pipe(size({title: 'build'}));
});

// Собираем папку DIST (только после компиляции Jade)
gulp.task('build', ['clean', 'jade'], function () {
    gulp.start('dist');
});

// Проверка сборки 
gulp.task('server-dist', function () {  
    browserSync({
        notify: false,
        port: 9000,
        server: {
            baseDir: 'dist'
        }
    });
});


// ====================================================
// ====================================================
// ===================== Функции ======================

// Более наглядный вывод ошибок
var log = function (error) {
    console.log([
        '',
        "----------ERROR MESSAGE START----------",
        ("[" + error.name + " in " + error.plugin + "]"),
        error.message,
        "----------ERROR MESSAGE END----------",
        ''
    ].join('\n'));
    this.end();
}


// ====================================================
// ====================================================
// ===== Отправка проекта на сервер ===================

gulp.task( 'deploy', function() {

    var conn = ftp.create( {
        host:     '',
        user:     '',
        password: '',
        parallel: 10,
        log: gutil.log
    } );

    var globs = [
        'dist/**/*'
    ];

    return gulp.src(globs, { base: 'dist/', buffer: false })
        .pipe(conn.dest( '/'));

});


// ====================================================
// ====================================================
// =============== Важные моменты  ====================
// gulp.task(name, deps, fn) 
// deps - массив задач, которые будут выполнены ДО запуска задачи name
// внимательно следите за порядком выполнения задач!

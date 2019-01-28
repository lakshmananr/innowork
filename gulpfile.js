var gulp        = require('gulp'),
    browserSync = require('browser-sync').create(),
    connect = require('gulp-connect-php'),
    minifyHTML     = require('gulp-minify-html'),
    browserify  = require('browserify'),
    minifyJs = require('gulp-minify'),
    uglify      = require('gulp-uglify'),
    rename = require("gulp-rename"),
    pump        = require('pump'),
    clean = require('gulp-clean'),
    cleanCSS = require('gulp-clean-css'),
    concat = require('gulp-concat'),
    sourcemaps = require('gulp-sourcemaps'),
    imagemin = require('gulp-imagemin'),
    scss = require('gulp-sass'),
    templateCache = require('gulp-angular-templatecache');

var cssUrl  =   './assets/css/**/*.css',
    //scssUrl  =   './assets/scss/themes/**/*.scss',
    themeScssUrl  =   './assets/scss/themes/**/*.scss',
    scssFileUrl  =   './assets/scss/**/*.scss',
    jsUrl   =   './assets/js/**/*.js',
    ctrljsUrl   =   './assets/controllers/**/*.js',
    servicejsUrl   =   ['./assets/js/jquery.min.js','./assets/js/angular-1.6.5.min.js','./assets/js/app.js','./assets/js/services.js','./assets/js/directive.js','./assets/js/mkk-video.js'],    
    htmlUrl =   './assets/template/**/*.html',
    imgUrl  =   './assets/images/**/*',
    cssDist = './dist/css',
    jsDist = './dist/js',
    htmlDist = './ngviews',
    imgDist = './dist/images',
    otherDir=   ['./assets/brochures/**/*','./assets/charts/**/*','./assets/cover_letter/**/*','./assets/cv/**/*','./assets/explanatory/**/*','./assets/flyers/**/*','./assets/fonts/**/*','./assets/images/**/*','./assets/libs/**/*','./assets/plugins/**/*','./assets/templates/**/*','./assets/videos/**/*'],
    dist    =   './dist';


//Css Compressing
gulp.task('css',() => {
    return gulp.src([cssUrl,'!./assets/css/**/*.ignore.css'],{
        base: './assets/css'
    })
        .pipe(sourcemaps.init())
        .pipe(cleanCSS({rebase: false}))
        .pipe(concat('style.min.css'))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(cssDist))
        .pipe(browserSync.stream());
});

//Scss Compressing
gulp.task('scss',() => {
    return gulp.src([themeScssUrl])
        .pipe(sourcemaps.init())
        .pipe(scss().on('error', scss.logError))
        .pipe(cleanCSS({rebase: false}))
        .pipe(rename({ extname: '.min.css' }))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(cssDist))
        .pipe(browserSync.stream());
});

//JS Compressing
// gulp.task('js', function() {
//     gulp.src([jsUrl,'!./assets/js/**/*.ignore.js'])
//
//         .pipe(uglify())
//         // .pipe(minifyJs({
//         //     ext:{
//         //         min:'.js'
//         //     },
//         //     noSource: true
//         // }))
//         .pipe(gulp.dest(jsDist));
// });
gulp.task('js', function (cb) {
    pump([
            gulp.src([jsUrl,'!./assets/js/**/*.ignore.js','!./assets/js/jquery.min.js','!./assets/js/angular-1.6.5.min.js','!./assets/js/app.js','!./assets/js/services.js','!./assets/js/directive.js','!./assets/js/mkk-video.js']),
            uglify({
                compress: {
                    drop_console: true,
                    hoist_funs: false
                }
            }),
            sourcemaps.init(),
            concat('vendor.min.js'),
            sourcemaps.write(),
            gulp.dest(jsDist)
        ],
        cb
    );
});
gulp.task('ctrlJs', function (cb) {
    pump([
            gulp.src([ctrljsUrl,'!./assets/controllers/**/*.ignore.js']),
            sourcemaps.init(),
            concat('controllers.min.js'),
            //uglify(),
            sourcemaps.write(),
            gulp.dest(jsDist)
        ],
        cb
    );
});
//Service JS file
gulp.task('serviceJs', function (cb) {
    pump([
            gulp.src(servicejsUrl),
            sourcemaps.init(),
            concat('bundle.js'),
            // uglify(),
            sourcemaps.write(),
            gulp.dest(jsDist)
        ],
        cb
    );
});
//HTML minify
// gulp.task('html-min', function() {
//     return gulp.src([htmlUrl,'!./assets/template/**/*.ignore.html'])
//         .pipe(minifyHTML({empty: true}))
//         .pipe(gulp.dest(htmlDist));
// });
gulp.task('htmlCache', function() {
    return gulp.src([htmlUrl,'!./assets/template/**/*.ignore.html'])
        .pipe(minifyHTML({empty: true}))
        //.pipe(templateCache('templates.js', { module:'templates', standalone:true }))
        //.pipe(templateCache())
        .pipe(gulp.dest(htmlDist));
});
gulp.task('image', () =>
    gulp.src([imgUrl,'!./assets/images/**/*.ignore.{png,jpg,gif,svg}'])
        .pipe(imagemin([
            imagemin.jpegtran({progressive: true,optimizationLevel: 8}),
            imagemin.optipng({optimizationLevel: 8}),
            imagemin.svgo({
                plugins: [
                    {removeViewBox: true},
                    {cleanupIDs: false}
                ]
            })
        ]))
        .pipe(gulp.dest(imgDist))
);
//Copy Other Directories
gulp.task('copy', function () {
    return gulp.src(otherDir, {
        base: './assets'
    }).pipe(gulp.dest(dist));
});
//reloading
gulp.task('js-watch', ['js','ctrlJs','serviceJs'], function (done) {
    browserSync.reload();
    done();
});

gulp.task('default', ['dev']);
//clean DIST
gulp.task('clean', function () {
    return gulp.src(['./dist/','./ngviews/'], {read: false})
        .pipe(clean());
});
// Development Server + watching scss/html files
gulp.task('dev', ['css','js-watch','copy','htmlCache','scss'], function() {
    browserSync.init({
        proxy: "http://localhost/tc_v3.0/"
        // server: {
        //     baseDir: ["./", "./index.html"]
        // }
    });
    gulp.watch(cssUrl, ['css']);
    gulp.watch(scssFileUrl, ['scss']);
    gulp.watch(jsUrl, ['js-watch']);
    gulp.watch(ctrljsUrl, ['ctrlJs']);
    gulp.watch(servicejsUrl, ['serviceJs']);
    gulp.watch(htmlUrl, ['htmlCache']);
    gulp.watch("./ngviews/**/*.html").on('change', browserSync.reload);
});

/*********** Production ****************/
gulp.task('prodCss',() => {
    return gulp.src([cssUrl,'!./assets/css/**/*.ignore.css'],{
        base: './assets/css'
    })
        .pipe(cleanCSS({rebase: false}))
        .pipe(concat('style.min.css'))
        .pipe(gulp.dest(cssDist))
});

//scss compressing
// gulp.task('prodScss',() => {
//     return gulp.src([scssUrl])
//         .pipe(scss().on('error', scss.logError))
//         .pipe(cleanCSS({rebase: false}))
//         .pipe(rename({ extname: '.min.css' }))
//         .pipe(gulp.dest(cssDist))
// });

//Theme Scss Compressing
gulp.task('prodThemeScss',() => {
    return gulp.src([themeScssUrl])
        .pipe(scss().on('error', scss.logError))
        .pipe(cleanCSS({rebase: false}))
        .pipe(rename({ extname: '.min.css' }))
        .pipe(gulp.dest(cssDist))
});

//JS Compressing
gulp.task('prodJs', function (cb) {
    pump([
            gulp.src([jsUrl,'!./assets/js/**/*.ignore.js','!./assets/js/jquery.min.js','!./assets/js/angular-1.6.5.min.js','!./assets/js/app.js','!./assets/js/services.js','!./assets/js/directive.js','!./assets/js/mkk-video.js']),
            uglify({
                compress: {
                    drop_console: true,
                    hoist_funs: false
                }
            }),
            concat('vendor.min.js'),
            gulp.dest(jsDist)
        ],
        cb
    );
});
gulp.task('prodCtrlJs', function(cb) {
    pump([
            gulp.src([ctrljsUrl,'!./assets/controllers/**/*.ignore.js']),
            concat('controllers.min.js'),
            //uglify(),
            gulp.dest(jsDist)
        ],
        cb
    );
});
gulp.task('ProdServiceJs', function (cb) {
    pump([
            gulp.src(['./assets/js/jquery.min.js','./assets/js/angular-1.6.5.min.js','./assets/js/app.js','./assets/js/services.js','./assets/js/directive.js','./assets/js/mkk-video.js']),
            concat('bundle.js'),
            gulp.dest(jsDist)
        ],
        cb
    );
});
gulp.task('production', ['prodCss','prodThemeScss','prodJs','prodCtrlJs','htmlCache','copy','ProdServiceJs']);

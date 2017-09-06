/**
 * gulp 测试
 *
 * npm install gulp-less --save-dev
 * npm install gulp-connect --save-dev
 * npm install gulp-concat --save-dev
 * npm install gulp-rename --save-dev
 * npm install gulp-uglify --save-dev
 * npm install gulp-imagemin --save-dev
 * npm install gulp-minify-html --save-dev
 * npm install gulp-minify-css --save-dev
 * npm install jshint gulp-jshint --save-dev
 */
var gulp = require('gulp');
var $ = require('gulp-load-plugins')();



/*
 * 解析less文件
 */
gulp.task('less',function(){
    gulp.src('src/css/*.less').pipe($.less()).pipe(gulp.dest('dist/css'))
})



/*
 * 创建服务器
 */
gulp.task('server',function(){
    $.connect.server({
        root:'dist',     //设置服务器的根目录
        port:90,         //服务器的地址，没有此配置项默认是 8080
        livereload:true  //启用实时刷新的功能
    });
})
gulp.task('copy-html',function(){
    gulp.src('src/index.html')
        .pipe(gulp.dest('dist'))
        .pipe($.connect.reload())//重新刷新浏览器
})
gulp.task('watch',function(){
    //如果更改index.html,就重新拷贝index.html到生产环境
    gulp.watch('src/index.html',['copy-html'])
})



/*
 * 复制图片
 */
gulp.task('img-copy',function(){
    gulp.src('src/img/*.{jpg,png}').pipe(gulp.dest('dist/img'))
})



/**
 * {base:'src'}
 * 设置根目录，按照根目录结构进行拷贝
 */
gulp.task('group-copy',function(){
    gulp.src(['src/js/*','src/img/*'],{base:'src'}).pipe(gulp.dest('dist'));
})



/*
 * 压缩js文件
 * 0.获得文件源
 * 1.concat合并js文件
 * 2.保存文件
 * 3.uglify压缩js文件
 * 4.rename重命名文件
 * 5.保存文件
 */
gulp.task('uglify',function(){
    gulp.src(['src/js/*.js'])          //0.获得文件源
        .pipe($.concat('app.js'))      //1.concat合并文件
        .pipe(gulp.dest('dist/js'))    //2.保存文件
        .pipe($.uglify())              //3.uglify压缩js文件
        .pipe($.rename('app.min.js'))  //4.rename重命名文件
        .pipe(gulp.dest('dist/js'))    //5.保存文件
})



/*
 * 压缩css文件
 * 0.获得文件源
 * 1.编译less文件
 * 2.保存文件
 * 3.minifyCss压缩css文件
 * 4.rename重命名文件
 * 5.保存文件
 */
gulp.task('minify-css',function(){
    gulp.src(['src/css/index.less'])       //0.获得文件源
        .pipe($.less())                    //1.编译成css文件
        .pipe(gulp.dest('dist/css'))       //2.保存文件
        .pipe($.minifyCss())               //3.minifyCss压缩css文件
        .pipe($.rename('index.min.css'))   //4.rename重命名文件
        .pipe(gulp.dest('dist/css'))       //5.保存文件
})


/*
 * 压缩图片
 */
gulp.task('imagemin',function(){
    gulp.src('src/img/**/*.{jpg,png}')
        .pipe($.imagemin())
        .pipe(gulp.dest('dist/img'))
})


/*
 * 压缩html文件
 */
gulp.task('minify-html',function(){
    gulp.src('src/*.html')
        .pipe($.minifyHtml())
        .pipe(gulp.dest('dist'))
})

/*
 * 代码检查
 */
// var jshint = require("gulp-jshint");
gulp.task("jshintlist",function(){
    gulp.src('src/js/*.js')
        .pipe($.jshint())             //进行代码检查
        .pipe($.jshint.reporter())    // 输出检查结果
})

//gulp.task('default',['server','watch'])
gulp.task('default',['jshintlist'])
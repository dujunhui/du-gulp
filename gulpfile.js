
var gulp = require('gulp');
var less = require('gulp-less');                       //less转css
var concat = require('gulp-concat');                   //合并
var cleanCss = require('gulp-clean-css');              //压缩css
var del = require('del');                              //删除
var babel = require('gulp-babel');                     //es5->es6
var uglify = require('gulp-uglify');                   //压缩js
var rename = require('gulp-rename');                   //重命名
var imagemin = require('gulp-imagemin');               //压缩图片
var spriter = require('gulp-css-spriter');             //合并雪碧图
var base64 = require('gulp-base64');                   //base64


var browserSync = require('browser-sync').create();    //静态服务器
var reload = browserSync.reload;                       //刷新重新加载

var rev = require('gulp-rev');                         //版本控制
var revCollector = require('gulp-rev-collector');

var runSequence = require('run-sequence');

var build = {
	basePath:'./build/',
	common:'./build/common/',
	css:'./build/css/',
	images: './build/images/',
	js:'./build/js/'
};

var src = {
	basePath:'./src/',
	common:'./src/common/',
	css:'./src/css/',
	images: './src/images/',
	js:'./src/js/',
	less:'./src/less/'
};


/*************************************开发模式*************************************/

// 开发模式下静态服务器
gulp.task('server:dev', function() {
    browserSync.init({
        server: {
            baseDir: src.basePath,
            index:'index.html'
        },
        port: 8080
    });

    gulp.watch("src/*.html", ["html:dev"]);    //1.html文件复制 2.刷新
    gulp.watch("src/less/*.less", ["less"]);   //1.解析less     2.输出到src/css下 3.刷新
    gulp.watch("src/css/*.css", ["css:dev"]);  //1.合并css文件  2.输出  3.压缩 3.输出 4.刷新
    gulp.watch("src/js/*.js",['js:dev']);      //1.解析成es5    2.合并  3.输出 4.压缩 5.输出 6.刷新

});

gulp.task('html:dev' , function(){
	gulp.src([
		'./src/*.html'
	])
	.pipe(gulp.dest('./src/'))
	.pipe(reload({
		stream:true
	}));

});

gulp.task('less', function(){
	gulp.src(src.less+'*.less')
		.pipe(less())               //编译less
		.pipe(gulp.dest(src.css))   //输出到css文件夹
		.pipe(reload({              //刷新
			stream:true
		}));

});

gulp.task('css:dev',function(){
	gulp.src([src.css + '*.css', '!'+src.css +'all.min.css', '!'+src.css +'all.css'])
		.pipe(concat('all.css'))
		.pipe(spriter({
           'spriteSheet': src.images+'spritesheet.png',
           'pathToSpriteSheetFromCSS': '../images/spritesheet.png'
       	}))
       	.pipe(gulp.dest(src.css))      //输出一个未压缩版本
       	.pipe(cleanCss())              //压缩
       	.pipe(rename('./all.min.css')) //重命名
       	.pipe(gulp.dest(src.css))      //输出一个压缩版本
		.pipe(reload({                 //刷新
			stream:true
		}));
});

gulp.task('js:dev',function(){
	gulp.src([src.js+'*.js' , '!' + src.js + 'all.js', '!'+ src.js + 'all.min.js'])
		.pipe(babel({                  //转es5
            presets: ['es2015']
        }))
        .pipe(concat('all.js'))        //合并
        .pipe(gulp.dest(src.js))       //输出一个未压缩版本
        .pipe(uglify())                //压缩 
        .pipe(rename('./all.min.js'))  //重命名
        .pipe(gulp.dest(src.js))       //输出一个压缩版本
        .pipe(reload({                 //刷新
        	stream:true
        }));
});


/*************************************生产模式*************************************/

//生产模式下的服务器
gulp.task('server:product', function() {
	runSequence(['public:common','imagesmin','publish:html','publish:css','publish:js'], 'rev');
	browserSync.init({
	    server: {
	        baseDir: build.basePath,
	        index:'index.html'
	    },
	    port: 8081
	});
});

//拷贝公共库common
gulp.task('public:common', function(){
	gulp.src(src.common+'**/*')
		.pipe(gulp.dest(build.common));
});

//压缩图片，只限jpg和png
gulp.task('imagesmin', function(){
	gulp.src(src.images+'*.*')
		.pipe(imagemin())
		.pipe(gulp.dest(build.images));
});

//拷贝html文件
gulp.task('publish:html',function(){
	gulp.src(src.basePath + '*.html')
		.pipe(gulp.dest(build.basePath));
});

gulp.task('publish:css',function(){
	gulp.src(src.css + 'all.min.css')
		.pipe(rev())  //发布新版本
		.pipe(gulp.dest(build.css))
		.pipe(rev.manifest())
		.pipe(gulp.dest('./rev/css/'));
});

gulp.task('publish:js',function(){
	gulp.src(src.js + 'all.min.js')
		.pipe(rev())  //发布新版本
		.pipe(gulp.dest(build.js))
		.pipe(rev.manifest())
		.pipe(gulp.dest('./rev/js/'));
});


gulp.task('del:build',function(){
	del([
		build.basePath
	]);
});

gulp.task('rev', function () {
    return gulp.src(['./rev/**/*.json', build.basePath + '*.html'])
        .pipe( revCollector({}) )
        .pipe( gulp.dest(build.basePath) );
});


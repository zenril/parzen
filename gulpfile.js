var gulp = require('gulp');
var concat = require('gulp-concat');  
var rename = require('gulp-rename');  
var uglify = require('gulp-uglify');

var jsDest = 'dist/scripts';
var files = ['src/parzen-core.js', 'src/indefinite-article.js', 'src/plural.js','src/ntow.js','src/wton.js','src/wton.js','src/formatters.js'];

gulp.slurped = false; // step 1
gulp.task("watch", function(){

    if(!gulp.slurped){ // step 2
        gulp.watch(files, ["default"]);
        gulp.slurped = true; // step 3
    }
});

gulp.task('default', function() {  
    return gulp.src(files)
        .pipe(concat('parzen.js'))
        .pipe(gulp.dest(jsDest))
        .pipe(rename('parzen.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest(jsDest));  
});
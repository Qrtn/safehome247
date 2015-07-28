module.exports = function (grunt) {

  grunt.initConfig({
    concurrent: {
      tasks: ['nodemon:web', 'nodemon:alert', 'nodemon:logger', 'watch'],
      options: {
        logConcurrentOutput: true
      }
    },
    nodemon: {
      web: {
        script: 'index.js'
      },
      alert: {
        script: 'alert.js'
      },
      logger: {
        script: 'logger.js'
      }
    },
    watch: {
      files: ['index.js', 'views/**/*', 'public/**/*'],
      options: {
        livereload: true
      }
    },

    bower_concat: {
      all: {
        dest: 'public/js/bower.js',
        cssDest: 'public/css/bower.css',
        mainFiles: {
          'bootstrap': ['dist/css/bootstrap.css', 'dist/js/bootstrap.js']
        }
      }
    },
    uglify: {
      bower: {
        files: {
          'public/js/bower.min.js': 'public/js/bower.js'
        }
      }
    },
    cssmin: {
      bower: {
        files: {
          'public/css/bower.min.css': 'public/css/bower.css'
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-concurrent');
  grunt.loadNpmTasks('grunt-nodemon');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.loadNpmTasks('grunt-bower-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-cssmin');

  grunt.registerTask('serve', ['concurrent']);
  grunt.registerTask('buildbower', ['bower_concat', 'uglify:bower', 'cssmin:bower']);

};

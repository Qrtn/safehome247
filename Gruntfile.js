module.exports = function (grunt) {

  grunt.initConfig({
    concurrent: {
      tasks: ['nodemon:web', 'nodemon:alert', 'nodemon:logger', 'shell:mosquitto', 'watch'],
      options: {
        logConcurrentOutput: true
      }
    },
    nodemon: {
      web: {
        script: 'index.js',
        options: {
          ignore: ['node_modules/', 'bower_components/', 'Gruntfile.js', 'views/', 'public/']
        }
      },
      alert: {
        script: 'alert.js',
        options: {
          ignore: ['node_modules/', 'bower_components/', 'Gruntfile.js', 'views/', 'public/']
        }
      },
      logger: {
        script: 'logger.js',
        options: {
          ignore: ['node_modules/', 'bower_components/', 'Gruntfile.js', 'views/', 'public/']
        }
      }
    },
    shell: {
      mosquitto: {
        command: 'mosquitto -c mosquitto.conf'
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
        dest: 'public/js/bundle.js',
        cssDest: 'public/css/bundle.css',
        mainFiles: {
          'bootstrap': ['dist/css/bootstrap.css', 'dist/js/bootstrap.js'],
          'Flot': ['jquery.flot.js', 'jquery.flot.time.js'],
          'flot-axislabels': ['jquery.flot.axislabels.js']
        }
      }
    },
    uglify: {
      bower: {
        files: {
          'public/js/bundle.min.js': 'public/js/bundle.js'
        }
      }
    },
    cssmin: {
      bower: {
        files: {
          'public/css/bundle.min.css': 'public/css/bundle.css'
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-concurrent');
  grunt.loadNpmTasks('grunt-nodemon');
  grunt.loadNpmTasks('grunt-shell');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.loadNpmTasks('grunt-bower-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-cssmin');

  grunt.registerTask('start', ['concurrent']);
  grunt.registerTask('buildbower', ['bower_concat', 'uglify:bower', 'cssmin:bower']);

};

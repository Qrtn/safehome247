module.exports = function (grunt) {

  grunt.initConfig({
    concurrent: {
      tasks: ['nodemon', 'watch'],
      options: {
        logConcurrentOutput: true
      }
    },
    nodemon: {
      script: 'index.js'
    },
    watch: {
      files: ['index.js', 'views/**/*', 'public/**/*'],
      options: {
        livereload: true
      }
    }
  });

  grunt.loadNpmTasks('grunt-concurrent');
  grunt.loadNpmTasks('grunt-nodemon');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('default', ['concurrent']);

};

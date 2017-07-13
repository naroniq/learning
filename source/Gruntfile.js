'use strict';

module.exports = function(grunt) {

    require('time-grunt')(grunt);
    require('jit-grunt')(grunt);

    var devPath = 'app',
        buildPath = '../dist/',
        tempPath = '.tmp',
        imageminJpegoptim = require('imagemin-jpegoptim'),
        imageminPngquant = require('imagemin-pngquant'),
        fs = require('fs');

    grunt.initConfig({

      pkg: grunt.file.readJSON('package.json'),
      config: {
          app: devPath,
          dist: buildPath,
          temp: grunt.option('temp') ? grunt.option('temp') : tempPath
      },

      // HTML
      //htmlhint
      htmlhint: {
          options: {
              htmlhintrc: '.htmlhintrc'
          },
          dev: {
              src: ['<%= config.app %>/pages/**/*.html', '!<%= config.temp %>/assets/**']
          },
          dist: {
              src: '<%= config.dist %>/**/*.html'
          }
      },

      // MINIFY
      //htmlmin
      htmlmin: {
          dist: {
              options: {
                  removeComments: true,
                  collapseWhitespace: true
              },
              files: {                                   // Dictionary of files
                  '<%= config.dist %>/index.html': '<%= config.dist %>/index.html',
              }
          },
      },

      // PROCESS
      // processhtml
      processhtml: {
          dist: {
              options: {
                  process: true
              },
              files: {
                  '<%= config.dist %>/index.html': ['<%= config.dist %>/index.html']
              }
          },
      },

      // SCSS
      //sass
      sass: {
          dev: {
              options: {
                  sourceMap: false,
                  outputStyle: 'nested',
                  sourceComments: true
              },
              files: [{
                  expand: true,
                  cwd: '<%= config.app %>/scss',
                  src: '**/*.scss',
                  dest: '<%= config.temp %>/assets/css',
                  ext: '.css'
              }]
          },
          dist: {
              options: {
                  sourceMap: false,
                  outputStyle: 'compressed'
              },
              files: [{
                  expand: true,
                  cwd: '<%= config.app %>/scss',
                  src: '**/*.scss',
                  dest: '<%= config.dist %>/assets/css',
                  ext: '.css'
              }]
          }
      },

      //postcss
      postcss: {
          options: {
              map: false,
          },
          dev: {
              options: {
                  processors: [
                      require('pixrem')(),
                      require('autoprefixer')({
                          browsers: 'last 1 version'
                      })
                  ]
              },
              src: '<%= config.temp %>/assets/css/{,*/}*.css'
          },
          dist: {
              options: {
                  processors: [
                      require('pixrem')(),
                      require('autoprefixer')({
                          browsers: 'last 1 version'
                      }),
                      require('cssnano')()
                  ]
              },
              src: '<%= config.dist %>/assets/css/{,*/}*.css'
          }
      },

      // IMAGE MINIFY
      //imagemin
      imagemin: {
          options: {
              svgoPlugins: [{ removeViewBox: false }],
              use: [
                  imageminPngquant({quality: '65-80', speed: 4}),
                  imageminJpegoptim({progressive: true, max: 70})
              ]
          },
          dev: {
              files: [{
                  expand: true,
                  cwd: '<%= config.app %>',
                  src: ['img/**/*.{png,jpg,jpeg,svg}'],
                  dest: '<%= config.temp %>/assets/'
              }]
          },
          dist: {
              files: [{
                  expand: true,
                  cwd: '<%= config.app %>',
                  src: ['img/**/*.{png,jpg,jpeg,svg}'],
                  dest: '<%= config.dist %>/assets/'
              }]
          }
      },

      //fontello_svg
      fontello_svg: {
        options: {
          css: false,
          skip: true,
          verbose: true,
          fillColors: {'current' : 'currentColor'},
          fileFormat: '{1}.svg' // {0} - collection, {1} - name, {2} - color
        },
        dev: {
            config: '<%= config.app %>/fontello-config.json',
            dest: '<%= config.app %>/svg.tmp/'
        },
        dist: {
            config: '<%= config.app %>/fontello-config.json',
            dest: '<%= config.app %>/svg.tmp/'
        },
      },

      //svgstore
      svgstore: {
        options: {
          prefix: 'icon-',
          svg: {
            viewBox: '0 0 100 100',
            xmlns: 'http://www.w3.org/2000/svg'
          },
          includedemo: true,
          inheritviewbox: true
        },
        dev: {
          files: {
            '<%= config.temp %>/assets/svg/icons.svg': ['<%= config.app %>/svg/*.svg'],
          },
        },
        dist: {
          files: {
            '<%= config.dist %>/assets/svg/icons.svg': ['<%= config.app %>/svg/*.svg'],
          },
        }
      },

      //jshint
      jshint: {
          files: ['Gruntfile.js', '<%= config.app %>/js/**/*.js', '!<%= config.app %>/js/vendors/**'],
          options: {
              jshintrc: '.jshintrc',
              reporter: require('jshint-stylish')
          }
      },

      //browser-sync
      browserSync: {
          bsFiles: {
              src : [
                  '<%= config.temp %>/assets/css/{,*/}*.css',
                  '<%= config.temp %>/**/*.html',
                  '<%= config.temp %>/assets/js/**/*.js'
              ]
          },
          options: {
              browser: 'Chrome',
              watchTask: true,
              server: {
                  baseDir: ['<%= config.temp %>'],
                  index: 'index.html'
              },
              //logLevel: 'debug',
              logConnections: 'true',
              open: 'local',
              plugins: [require('bs-console-qrcode')]
          }
      },

      //copy
      copy: {
          dev: {
              files: [{
                  expand: true,
                  dot: true,
                  cwd: '<%= config.app %>',
                  dest: '<%= config.temp %>/assets/',
                  src: [
                      'fonts/{,*/}*.*',
                      'vendors/**/*'
                  ]
              }]
          },
          dist: {
              files: [{
                  expand: true,
                  dot: true,
                  cwd: '<%= config.app %>',
                  dest: '<%= config.dist %>/assets/',
                  src: [
                      'img/*.{ico,txt}',
                      'fonts/{,*/}*.*',
                      'vendors/**/*'
                  ]
              }
            ]
          },
          svg: {
            options: {
              timestamp: true
            },
            files: [{
                expand: true,
                dot: true,
                cwd: '<%= config.app %>/svg.tmp/',
                dest: '<%= config.app %>/svg/',
                src: ['*.svg']
            }]

          },
          js: {
            files: [{
                expand: true,
                dot: true,
                cwd: '<%= config.app %>',
                dest: '<%= config.temp %>/assets/',
                src: [
                    'js/**/*'
                ]
            }]
          },
          html: {
            files: [{
                expand: true,
                dot: true,
                cwd: '<%= config.app %>/pages/',
                dest: '<%= config.temp %>/',
                src: [
                    '**/*'
                ]
            }]
          }

      },

      //clean
      clean: {
          all: {
              options: {
                  force: true
              },
              src: [
                  '<%= config.dist %>',
                  '<%= config.temp %>',
                  '.sass-cache'
              ]
          },
          dev: [
              '<%= config.temp %>',
              '.sass-cache'
          ]
      },

      //watch
      watch: {
          html: {
              files: ['<%= config.app %>/pages/**/*.html'],
              tasks: ['htmlhint:dev', 'newer:copy:html']
          },
          sass: {
              files: ['<%= config.app %>/scss/**/*.scss'],
              tasks: ['sass:dev', 'postcss:dev']
          },
          js: {
              files: ['<%= jshint.files %>'],
              tasks: ['jshint', 'newer:copy:js']
          }
      }

    });

    grunt.registerTask('svgIconsRename', 'Rename SVG Icons', function() {
      var mapping = grunt.file.readJSON('app/renameSVG.json'),
          location = devPath + '/svg/',
          prop;

      var rename = function(){
        return fs.rename(location + prop + '.svg', location + mapping[prop] + '.svg', function(err){
          if(err){
            console.log('ERROR: ' +  err);
          }
        });
      };

      for(prop in mapping){
        if(mapping.hasOwnProperty(prop)){
          rename();
        }
      }

    });
    grunt.registerTask('default', ['clean:dev', 'htmlhint:dev', 'copy:html', 'sass:dev', 'postcss:dev', 'jshint', 'fontello_svg:dev', 'copy:svg', 'svgIconsRename', 'svgstore:dev', 'imagemin:dev', 'copy:dev', 'browserSync', 'watch']);
    grunt.registerTask('build', ['clean:all', 'pug:dist', 'htmlhint:dist', 'sass:dist', 'postcss:dist', 'jshint', 'fontello_svg:dist', 'copy:svg', 'svgIconsRename', 'svgstore:dist', 'imagemin:dist', 'copy:dist', 'uglify:dist', 'processhtml:dist', 'htmlmin:dist']);
    grunt.registerTask('cleanUp', ['clean:all']);
};

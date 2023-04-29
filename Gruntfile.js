module.exports = function (grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),

		concat: {
			options: {
				separator: ';'
			},
			dist: {
				files: {
					'build/strands/strands.json': ['app/strands/strands.json'],
					'build/popup.html': ['app/popup.html'],
				}
			}
		},

		uglify: {
			my_target: {
				files: {
					'build/js/script.min.js': [
						'app/js/*.js',
						'app/services/*.js'
					]
				}
			}
		},

		cssmin: {
			options: {
				shorthandCompacting: false,
				roundingPrecision: -1
			},
			target: {
				files: {
					'build/css/style.min.css': ['app/css/*.css']
				}
			}
		},

		processhtml: {
			options: {
			},
			dist: {
				files: {
					'build/index.html': ['app/index.html']
				}
			}
		}
	})
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-processhtml');
	grunt.registerTask('build', ['concat', 'uglify', 'cssmin', 'processhtml']);
};

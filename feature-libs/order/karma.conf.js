// Karma configuration file, see link for more information
// https://karma-runner.github.io/1.0/config/configuration-file.html

module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    plugins: [
      require('karma-jasmine'),
      require('karma-coverage'),
      require('karma-chrome-launcher'),
      require('karma-jasmine-html-reporter'),
      require('@angular-devkit/build-angular/plugins/karma'),
      require('karma-junit-reporter'),
    ],
    client: {
      clearContext: false, // leave Jasmine Spec Runner output visible in browser
      jasmine: {
        random: false,
      },
    },
    reporters: ['progress', 'kjhtml', 'dots', 'junit'],
    junitReporter: {
      outputFile: 'unit-test-order.xml',
      outputDir: require('path').join(__dirname, '../../unit-tests-reports'),
      useBrowserName: false,
    },
    coverageReporter: {
      dir: require('path').join(__dirname, '../../coverage/order'),
      reporters: [{ type: 'lcov', subdir: '.' }, { type: 'text-summary' }],
      check: {
        global: {
          statements: 90,
          lines: 90,
          branches: 75,
          functions: 90,
        },
      },
    },
    captureTimeout: 210000,
    browserDisconnectTolerance: 3,
    browserDisconnectTimeout: 210000,
    browserNoActivityTimeout: 210000,
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: true,
    browsers: ['Chrome'],
    singleRun: false,
    restartOnFileChange: true,
  });
};

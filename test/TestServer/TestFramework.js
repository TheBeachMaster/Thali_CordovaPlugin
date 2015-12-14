/* TestFramework - Base for classes that manage collections of devices and associated tests
 */

'use strict';

var util = require('util');
var EventEmitter = require('events').EventEmitter;

function TestFramework(testConfig, userConfig) {
  TestFramework.super_.call(this);

  this.devices = {};

  // testConfig - Config provided by the CI system. Tells how many devices are available
  // userConfig - Config provided by the user (via source). Tells us how many devices we need
  this.testConfig = testConfig;
  this.userConfig = userConfig;

  var self = this;

  // requiredDevices is the number of device of each platform 
  // we need to have seen before we'll start a test
  this.requiredDevices = {};

  // Populate first from the original testConfig which is
  // the number of devices the CI system think deployed succesfully
  Object.keys(this.testConfig.devices).forEach(function(platform) {
    self.requiredDevices[platform] = self.testConfig.devices[platform];
  });

  // .. then override with userConfig which may specify a smaller number
  // of devices
  Object.keys(this.userConfig).forEach(function(platform) {
    self.requiredDevices[platform] = self.userConfig[platform].numDevices;
  });
}

util.inherits(TestFramework, EventEmitter);

TestFramework.prototype.addDevice = function(device) {

  // this.devices = { 'ios' : [dev1, dev2], 'android' : [dev3, dev4] }
  if (!this.devices[device.platform]) {
    this.devices[device.platform] = [device];
  } else {
    this.devices[device.platform].push(device);
  }

  // See if we have enough devices of platform type to start a test run
  console.log("%d %s devices presented", this.devices[device.platform].length, device.platform);
  if (this.devices[device.platform].length === this.requiredDevices[device.platform]) {
    this.startTests(device.platform, device.tests);
  }
}

TestFramework.prototype.removeDevice = function(device) {
  var i = this.devices[device.platform].indexOf(device);
  this.devices[device.platform].splice(i, 1);
  assert(this.devices[device.platform].indexOf(device) == -1);
}

module.exports = TestFramework;

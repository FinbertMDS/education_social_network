var Users = require('../controllers/user');
var Groups = require('../controllers/group');
var Schedules = require('../controllers/schedule');
var Posts = require('../controllers/post');
var EventItem = require('../models/event');


exports.findEvent = findEvent;
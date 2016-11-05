"use strict";

// modified version of https://github.com/PetterBoozegunk/gulp-total-task-time/blob/c340827567ae9a5ce5aa695223339358a5803957/index.js

var gulp = require('gulp'),
    taskTime = {
        showTotalTimeLog: true,
        tasksRunning: 0,
        taskStart: function () {
            if (taskTime.tasksRunning === 0) {
                taskTime.start = process.hrtime();
            }

            taskTime.tasksRunning += 1;
        },
        taskStop: function () {
            setTimeout(function () {
                taskTime.tasksRunning -= 1;

                if (taskTime.tasksRunning === 0) {
                    var end = process.hrtime(taskTime.start);
                    taskTime.notify(end[0] + (end[1] * 1e-9));
                }
            }, 0);
        },
        init: function (notify) {
            taskTime.notify = notify;
            gulp.on('task_start', taskTime.taskStart);
            gulp.on('task_stop', taskTime.taskStop);
        }
    };

module.exports = taskTime;

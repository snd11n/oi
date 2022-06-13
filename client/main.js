import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import 'bootstrap/dist/css/bootstrap.min.css'

import './main.html';

// ------------------------------ Variables ------------------------------ //

// Template [cible1]
var c1Distance = 15;
var c1Points = 1;
var c1NbTouch = 0;
var c1TotalPoints = 0;

// Template [cible2]
var c2Distance = 25;
var c2Points = 3;
var c2NbTouch = 0;
var c2TotalPoints = 0;

// Template [cible3]
var c3Distance = 35;
var c3Points = 5;
var c3NbTouch = 0;
var c3TotalPoints = 0;

// Template [timer]
var seconds = 10;

// Template [totalPoints]
var total = 0;

// Template [reinitialize]
var isDisabled = true;

// ------------------------------ Templates ------------------------------ //

// Template [cible1]
Template.cible1.helpers({
    c1Distance() { return c1Distance; },
    c1Points() { return c1Points; },
    c1TotalPoints() { return c1TotalPoints; },
});

/*Template.cible1.events({
    'click button'() {
        isDisabled = true;
        countdownTimer();
    }
});*/

// Template [cible2]
Template.cible2.helpers({
    c2Distance() { return c2Distance; },
    c2Points() { return c2Points; },
    c2TotalPoints() { return c2TotalPoints; },
});

// Template [cible3]
Template.cible3.helpers({
    c3Distance() { return c3Distance; },
    c3Points() { return c3Points; },
    c3TotalPoints() { return c3TotalPoints; },
});

// Template [timer]
Template.timer.helpers({
  seconds() { return seconds; }
});

// Template [totalPoints]
Template.totalPoints.helpers({
    total() { return total; }
});

// Template [reinitialize]
Template.reinitialize.helpers({
    isDisabled() { return isDisabled; }
});

Template.reinitialize.events({
  'click #reinitializeBtn'() {
      isDisabled = true;
      total.set(0);
      seconds = 10;
  }
})

// ------------------------------ Functions ------------------------------ //

async function countdownTimer() {
    while (seconds > 0) {
        seconds = seconds - 1;
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    isDisabled = false;
}
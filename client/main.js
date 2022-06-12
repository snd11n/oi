import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import 'bootstrap/dist/css/bootstrap.min.css'

import './main.html';

// ------------------------------ Variables ------------------------------ //

// Template [cible1]
var c1Distance = 15;
var c1Points = 1;

// Template [cible2]
var c2Distance = 25;
var c2Points = 3;

// Template [cible3]
var c3Distance = 35;
var c3Points = 5;

// Template [timer]
var seconds = new ReactiveVar(10);

// Template [totalPoints]
var total = new ReactiveVar(0);

// Template [reinitialize]
var isDisabled = new ReactiveVar(true);

// ------------------------------ Templates ------------------------------ //

// Template [cible1]
Template.cible1.helpers({
    c1Distance() { return c1Distance; },
    c1Points() { return c1Points; }
});

/*Template.cible1.events({
    'click button'() {
        isDisabled.set(true);
        countdownTimer();
    }
});*/

// Template [cible2]
Template.cible2.helpers({
    c2Distance() { return c2Distance; },
    c2Points() { return c2Points; }
});

// Template [cible3]
Template.cible3.helpers({
    c3Distance() { return c3Distance; },
    c3Points() { return c3Points; }
});

// Template [timer]
Template.timer.helpers({
  seconds() { return seconds.get(); }
});

// Template [totalPoints]
Template.totalPoints.helpers({
    total() { return total.get(); }
});

// Template [reinitialize]
Template.reinitialize.helpers({
    isDisabled() { return isDisabled.get() }
});

Template.reinitialize.events({
  'click #reinitializeBtn'() {
      isDisabled.set(true);
      total.set(0);
      seconds.set(10);
  }
})

// ------------------------------ Functions ------------------------------ //

async function countdownTimer() {
    while (seconds.get() > 0) {
        seconds.set(seconds.get() - 1);
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    isDisabled.set(false);
}
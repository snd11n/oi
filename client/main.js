import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { fetch } from 'meteor/fetch';

import 'bootstrap/dist/css/bootstrap.min.css'

import './main.html';

Meteor.startup(() => {
    fetch(
        serverBaseURL + '/api/nbtouch/c1',
        {
            method: 'GET'
        }
    ).then((response) => {
        return response.json();
    }).then((response) => {
        c1NbTouch = response.nbTouch;
    });
    fetch(
        serverBaseURL + '/api/nbtouch/c2',
        {
            method: 'GET'
        }
    ).then((response) => {
        return response.json();
    }).then((response) => {
        c2NbTouch = response.nbTouch;
    });
    fetch(
        serverBaseURL + '/api/nbtouch/c3',
        {
            method: 'GET'
        }
    ).then((response) => {
        return response.json();
    }).then((response) => {
        c3NbTouch = response.nbTouch;
    });
});

// ------------------------------ Variables ------------------------------ //

// Server
const serverBaseURL = "http://localhost:3000";

// Collection
var Cible1NbTouch = new Mongo.Collection('c1NbTouch');
var Cible2NbTouch = new Mongo.Collection('c2NbTouch');
var Cible3NbTouch = new Mongo.Collection('c3NbTouch');

// Template [cible1]
var c1Distance = 15;
var c1Points = new ReactiveVar(1);
var c1NbTouch;

// Template [cible2]
var c2Distance = 25;
var c2Points = new ReactiveVar(3);
var c2NbTouch;

// Template [cible3]
var c3Distance = 35;
var c3Points = new ReactiveVar(5);
var c3NbTouch;

// Template [timer]
var seconds = new ReactiveVar(10);

// Template [totalPoints]
var total = new ReactiveVar(0);

// Template [reinitialize]
var isDisabled = new ReactiveVar(true);

// Template [historyTable]
var gameHistory = new ReactiveVar();

// ------------------------------ Templates ------------------------------ //

// Template [cible1]
Template.cible1.helpers({
    c1Distance() { return c1Distance; },
    c1Points() { return c1Points.get(); },
    c1TotalPoints() {
        c1NbTouch = Cible1NbTouch.find().fetch()[0].nbTouch;
        return c1NbTouch === 0 ? c1NbTouch : c1NbTouch * c1Points.get();
    },
});

Template.cible1.onCreated(() => {
    Meteor.subscribe('brokerC1');
});

// Template [cible2]
Template.cible2.helpers({
    c2Distance() { return c2Distance; },
    c2Points() { return c2Points.get(); },
    c2TotalPoints() {
        c2NbTouch = Cible2NbTouch.find().fetch()[0].nbTouch;
        return c2NbTouch === 0 ? c2NbTouch : c2NbTouch * c2Points.get();
    },
});

Template.cible2.onCreated(() => {
    Meteor.subscribe('brokerC2');
});

// Template [cible3]
Template.cible3.helpers({
    c3Distance() { return c3Distance; },
    c3Points() { return c3Points.get(); },
    c3TotalPoints() {
        c3NbTouch = Cible3NbTouch.find().fetch()[0].nbTouch;
        return c3NbTouch === 0 ? c3NbTouch : c3NbTouch * c3Points.get();
    }
});

Template.cible3.onCreated(() => {
    Meteor.subscribe('brokerC3');
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
    isDisabled() { return isDisabled.get(); }
});

Template.reinitialize.events({
  'click #reinitializeBtn'() {
      isDisabled.set(true);
      total.set(0);
      seconds.set(10);
  }
});

// Template historyTable
Template.historyTable.onCreated(() => {
    fetch(
        serverBaseURL + '/api/history/all',
        {
            method: 'GET'
        }
    ).then((response) => {
        return response.json();
    }).then((response) => {
        response = reverseGameCollection(response);
        gameHistory.set(response);
    });
});

Template.historyTable.helpers({
    gamesCollection() { return gameHistory.get(); }
});

// ------------------------------ Functions ------------------------------ //

function reverseGameCollection(collec) {
    collec.slice().reverse().forEach((cible, i) => {
        cible['total'] = cible['c1'] * c1Points.get() + cible['c2'] * c2Points.get() + cible['c3'] * c3Points.get();
        cible['id'] = i + 1;
    });

    return collec;
}

async function countdownTimer() {
    while (seconds.get() > 0) {
        seconds.set(seconds.get() - 1);
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    /**
     * Quand le timer est terminé, on ré-active le bouton de réinitialisation
     * et on ajoute à la BDD les données de la partie fraîchement terminée
     */
    isDisabled.set(false);

    var newGame = {
        c1: c1NbTouch,
        c2: c2NbTouch,
        c3: c3NbTouch,
        createdAt: Date.now()
    };
    fetch(
        serverBaseURL + '/api/history/new',
        {
            method: 'POST',
            body: JSON.stringify(newGame)
        }
    ).then((response) => {
        return response.json();
    }).then((response) => {
        gameHistory.set(reverseGameCollection(response));
    });
}
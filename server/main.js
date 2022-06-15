import { Meteor } from 'meteor/meteor';
import { WebApp } from 'meteor/webapp';
import { Mongo } from 'meteor/mongo';

const mqtt = require('mqtt');

const GamesHistory = new Mongo.Collection('games');
const Cible1NbTouch = new Mongo.Collection('c1NbTouch');
const Cible2NbTouch = new Mongo.Collection('c2NbTouch');
const Cible3NbTouch = new Mongo.Collection('c3NbTouch');
const mqttServerBaseURL = "mqtt://31.34.157.18:1884";

Meteor.startup(() => {
    GamesHistory.remove({});
    Cible1NbTouch.remove({});
    Cible2NbTouch.remove({});
    Cible3NbTouch.remove({});
    GamesHistory.insert({
        'c1': 3,
        'c2': 2,
        'c3': 1,
        'createdAt': Date.now()
    });
    GamesHistory.insert({
        'c1': 1,
        'c2': 2,
        'c3': 3,
        'createdAt': Date.now()
    });
    GamesHistory.insert({
        'c1': 8,
        'c2': 4,
        'c3': 6,
        'createdAt': Date.now()
    });
    GamesHistory.insert({
        'c1': 10,
        'c2': 10,
        'c3': 10,
        'createdAt': Date.now()
    });
    Cible1NbTouch.insert({
        '_id': '0',
        'nbTouch': 0
    });
    Cible2NbTouch.insert({
        '_id': '0',
        'nbTouch': 0
    });
    Cible3NbTouch.insert({
        '_id': '0',
        'nbTouch': 0
    });
});

// ------------------------------ Functions ------------------------------ //

function getAllGameHistory() {
    return GamesHistory.find(
    {},
    {
        sort: {createdAt: -1}
    }).fetch();
}

function getC1NbTouch() {
    return Cible1NbTouch.find().fetch()[0];
}

function getC2NbTouch() {
    return Cible2NbTouch.find().fetch()[0];
}

function getC3NbTouch() {
    return Cible3NbTouch.find().fetch()[0];
}

// ------------------------------ Publisher ------------------------------ //

Meteor.publish(
    "brokerC1",
    function () {
        (async () => {
            const client = await mqtt.connect(mqttServerBaseURL);
            let hasAdded = false;

            this.added('c1NbTouch', '0', { nbTouch: 0 });

            client
                .subscribe('EPSI/OpenInnov/Cible1')
                .on(
                'message',
                (topic, message) => {
                    if (hasAdded) {
                        this.changed('c1NbTouch', '0', {nbTouch: JSON.parse(message.toString())['touchCib1']});
                    } else {
                        this.changed('c1NbTouch', '0', {nbTouch: 1});
                        hasAdded = true;
                    }
                });

            this.ready();
        })();
    }
);

Meteor.publish(
    "brokerC2",
    function () {
        (async () => {
            const client = await mqtt.connect(mqttServerBaseURL);
            let hasAdded = false;

            this.added('c2NbTouch', '0', { nbTouch: 0 });

            client
                .subscribe('EPSI/OpenInnov/Cible2')
                .on(
                    'message',
                    (topic, message) => {
                        if (hasAdded) {
                            this.changed('c2NbTouch', '0', { nbTouch: JSON.parse(message.toString())['touchCib2'] });
                        } else {
                            this.changed('c2NbTouch', '0', { nbTouch: 1 });
                            hasAdded = true;
                        }
                    }
                );
            this.ready();
        })();
    }
);

Meteor.publish(
    "brokerC3",
    function () {
        (async () => {
            const client = await mqtt.connect(mqttServerBaseURL);
            let hasAdded = false;

            this.added('c3NbTouch', '0', { nbTouch: 0 });

            client
                .subscribe('EPSI/OpenInnov/Cible3')
                .on(
                    'message',
                    (topic, message) => {
                        if (hasAdded) {
                            this.changed('c3NbTouch', '0', { nbTouch: JSON.parse(message.toString())['touchCib3'] });
                        } else {
                            this.changed('c3NbTouch', '0', { nbTouch: 1 });
                            hasAdded = true;
                        }
                    }
                );
            this.ready();
        })();
    }
);

// ------------------------------ End-points ------------------------------ //

WebApp.connectHandlers.use(
    '/api/nbtouch/',
    (req, res, next) => {
        switch (req.method) {
            case 'GET':
                var data;
                switch (req.url.substring(req.url.lastIndexOf("/") + 1)) {
                    case "c1":
                        data = getC1NbTouch();
                        break;
                    case "c2":
                        data = getC2NbTouch();
                        break;
                    case "c3":
                        data = getC3NbTouch();
                        break;
                    default:
                        break;
                }

                res
                    .setHeader('Content-Type', 'application/json')
                    .writeHead(200)
                    .end(JSON.stringify(data));
                break;
            default:
                res
                    .writeHead(405)
                    .end();
                break;
        }
    }
);

WebApp.connectHandlers.use(
    '/api/history/all',
    (req, res, next) => {
        switch (req.method) {
            case 'GET':
                const data = getAllGameHistory();

                res
                    .setHeader('Content-Type', 'application/json')
                    .writeHead(200)
                    .end(JSON.stringify(data));
                break;
            default:
                res
                    .writeHead(405)
                    .end();
                break;
        }
    }
);

WebApp.connectHandlers.use(
    '/api/history/new',
    (req, res, next) => {
        switch (req.method) {
            case 'POST':
                req.on('data', Meteor.bindEnvironment((data) => {
                    const body = JSON.parse(data);
                    const c1 = body.c1;
                    const c2 = body.c2;
                    const c3 = body.c3;

                    if (!isNaN(c1) && !isNaN(c2) && !isNaN(c3)) {
                        GamesHistory.insert({
                            'c1': c1,
                            'c2': c2,
                            'c3': c3,
                            'createdAt': Date.now()
                        });

                        const data = getAllGameHistory();

                        res
                            .setHeader('Content-Type', 'application/json')
                            .writeHead(201)
                            .end(JSON.stringify(data));
                    } else {
                        res
                            .writeHead(400)
                            .end();
                    }
                }));
                break;
            default:
                res
                    .writeHead(405)
                    .end();
                break;
        }
    }
);
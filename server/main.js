import { Meteor } from 'meteor/meteor';
import { WebApp } from 'meteor/webapp';
import { Mongo } from 'meteor/mongo';

const mqtt = require('mqtt');

const GamesHistory = new Mongo.Collection('games');
const Cible1Total = new Mongo.Collection('c1Total');
const Cible2Total = new Mongo.Collection('c2Total');
const Cible3Total = new Mongo.Collection('c3Total');
const mqttServerBaseURL = "mqtt://31.34.157.18:1884";

Meteor.startup(() => {
    GamesHistory.remove({});
    Cible1Total.remove({});
    Cible2Total.remove({});
    Cible3Total.remove({});
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
    Cible1Total.insert({
        '_id': '0',
        'nbTouch': 0
    });
    Cible2Total.insert({
        '_id': '0',
        'nbTouch': 0
    });
    Cible3Total.insert({
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

Meteor.publish(
    "brokerC1",
    function () {
        (async () => {
            const client = await mqtt.connect(mqttServerBaseURL);
            let hasAdded = false;

            client
                .subscribe('EPSI/OpenInnov/Cible1')
                .on(
                'message',
                (topic, message) => {
                    if (hasAdded) {
                        this.changed('c1Total', '0', { nbTouch: JSON.parse(message.toString())['nbTouch'] });
                    } else {
                        this.added('c1Total', '0', { nbTouch: 1 });
                        hasAdded = true;
                    }
                }
            );
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

            client
                .subscribe('EPSI/OpenInnov/Cible2')
                .on(
                    'message',
                    (topic, message) => {
                        if (hasAdded) {
                            this.changed('c2Total', '0', { nbTouch: JSON.parse(message.toString())['nbTouch'] });
                        } else {
                            this.added('c2Total', '0', { nbTouch: 1 });
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

            client
                .subscribe('EPSI/OpenInnov/Cible3')
                .on(
                    'message',
                    (topic, message) => {
                        if (hasAdded) {
                            this.changed('c3Total', '0', { nbTouch: JSON.parse(message.toString())['nbTouch'] });
                        } else {
                            this.added('c3Total', '0', { nbTouch: 1 });
                            hasAdded = true;
                        }
                    }
                );
            this.ready();
        })();
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
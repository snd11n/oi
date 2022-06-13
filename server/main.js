import { Meteor } from 'meteor/meteor';
import { WebApp } from 'meteor/webapp';
import { Mongo } from 'meteor/mongo';

const GamesHistory = new Mongo.Collection('games');

Meteor.startup(() => {
    GamesHistory.remove({});
    GamesHistory.insert(
        {
            'c1': 3,
            'c2': 2,
            'c3': 1,
            'createdAt': Date.now()
        }
    );
    GamesHistory.insert(
        {
            'c1': 1,
            'c2': 2,
            'c3': 3,
            'createdAt': Date.now()
        }
    );
    GamesHistory.insert(
        {
            'c1': 8,
            'c2': 4,
            'c3': 6,
            'createdAt': Date.now()
        }
    );
    GamesHistory.insert(
        {
            'c1': 10,
            'c2': 10,
            'c3': 10,
            'createdAt': Date.now()
        }
    );
});

// ------------------------------ Functions ------------------------------ //

function getAllGameHistory() {
    return GamesHistory.find(
    {},
    {
        sort: {createdAt: -1}
    }).fetch();
}

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
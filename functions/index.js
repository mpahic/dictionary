var functions = require('firebase-functions');
var sqlite3 = require('sqlite3').verbose();
const cors = require('cors')({origin: true});

exports.translation = functions.https.onRequest((req, res) => {
	cors(req, res, () => {
    var db = new sqlite3.Database('dictionary.db');

    if(req.query.dictionary) {
        var query = "SELECT word1 as A, word2 as B FROM " + escape(req.query.dictionary);
        var inputParams = [ ];

        if(req.query.translation1 && req.query.translation2) {
            query +=  " WHERE word1 LIKE ? AND word2 LIKE ?";
            inputParams.push(req.query.translation1 + "%");
            inputParams.push(req.query.translation2 + "%");
        } else if (req.query.translation1) {
            query +=  " WHERE word1 LIKE ?"
            inputParams.push(req.query.translation1 + "%");
        } else if (req.query.translation2){
            query +=  " WHERE word2 LIKE ?"
            inputParams.push(req.query.translation2 + "%");
        }
        query += " ORDER BY word1, word2 ";
        query += " LIMIT 100 ";
        if(req.query.page) {
            query += " OFFSET ?";
            inputParams.push((req.query.page * 100));
        }

        var result = [];
        db.all(query, inputParams, function(err, data) {
        	if(err) {
        		console.log(err);
        		res.status(400).send('Bad request');
        	} else {
                res.status(200).send(JSON.stringify(data));
        	}

        });

    } else {
        res.status(400).send('Bad request');
    }
    db.close();
	});
});

exports.random = functions.https.onRequest((req, res) => {
cors(req, res, () => {
    var db = new sqlite3.Database('dictionary.db');

    if(req.query.dictionary && req.query.direction == "1" || req.query.direction == "2") {
    		var attribute = "word" + req.query.direction;
        var query = "SELECT * FROM " + escape(req.query.dictionary) + " WHERE "+attribute+" IN (SELECT "+attribute+" FROM "+escape(req.query.dictionary)+" ORDER BY RANDOM() LIMIT 1);";
        console.log(query);
        db.all(query, function(err, data) {
					if(err) {
        		console.log(err);
        		res.status(400).send('Bad request');
        	} else {
            res.status(200).send(JSON.stringify(data));
					}
        });

    } else {
        res.status(400).send('Bad request');
    }
    db.close();

		});
});

exports.dictionaries = functions.https.onRequest((req, res) => {

	cors(req, res, () => {
	    var db = new sqlite3.Database('dictionary.db');

		var attribute = "word" + req.query.direction;
	    var query = "SELECT * FROM dictionaries;";
	    console.log(query);
	    db.all(query, function(err, data) {
				if(err) {
					console.log(err);
					res.status(400).send('Bad request');
				} else {
	        res.status(200).send(JSON.stringify(data));
				}
	    });

	    db.close();
	});

});

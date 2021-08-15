let bcrypt = require('bcrypt');
let login = require('./login');
let Mail = require('./mail');
let { generateKeyPair } = require('crypto');

module.exports = function sign(req, res, db){
    if(req.body.passIn !== req.body.passInC){
        res.redirect(req.headers.referer.split('?')[0]+'?error=passwords+dont+match&valid=false');
    }else{
        db.db('amagus').collection('users').findOne({"mail": req.body.mailIn}, (err, doc)=>{
            if(err) throw err;
            if(doc !== null) {
                res.redirect(req.headers.referer.split('?')[0]+'?error=mail+already+registered&valid=false');
            }else{
                db.db('amagus').collection('users').findOne({"pseudo": req.body.pseudoIn}, (err, doc)=>{
                    if(err) throw err;
                    else if(doc !== null){
                        res.redirect(req.headers.referer.split('?')[0]+'?error=pseudo+already+used&valid=false');
                    }else {
                        bcrypt.genSalt(10, (err, salt) => {
                            if (err) throw err;
                            bcrypt.hash(req.body.passIn, salt, (err, hash) => {
                                bcrypt.hash(req.body.pseudo + Math.random() + req.body.mailIn + Math.random(), salt,
                                    (err, key)=>{
                                    if (err) throw err;
                                    key = key.replace(/\$.\/-'"§`\?/g, '');

                                    generateKeyPair('rsa', {
                                        modulusLength: 8192,
                                        publicKeyEncoding: {
                                            type: 'spki',
                                            format: 'pem'
                                        },
                                        privateKeyEncoding: {
                                            type: 'pkcs8',
                                            format: 'pem',
                                        }
                                    },
                                    (err, publicKey, privateKey) => {
                                        if(err) throw err;
                                        else {
                                            let newUser = {
                                                "activated": false,
                                                "master": false,
                                                "admin": false,
                                                "mail": req.body.mailIn,
                                                "pseudo": req.body.pseudoIn,
                                                "password": hash,
                                                "uniqKey": key,
                                                "picture": undefined,
                                                "birthday": undefined,
                                                "publicKey": publicKey,
                                                "privateKey": privateKey,
                                                "favoriteMap": undefined,
                                                "favoriteColor": undefined,
                                                "country": undefined,
                                                "language": undefined,
                                                "friends": [],
                                                "friendRequests": [],
                                                "friendReceived": [],
                                                "notifications": []
                                            };
                                            db.db('amagus').collection('users').insertOne(newUser, (err) => {
                                                if (err) throw err;
                                                let mail = new Mail();
                                                mail.send(req.body.mailIn,
                                                    "Amagus Account confirmation",
                                                    "Please confirm your account register on A-Mag Us: \n" +
                                                    "https://localhost/confirm?key=" + key + "&user=" + newUser.pseudo
                                                );
                                                login(req, res, db, true);
                                            });
                                        }
                                    });
                                })
                            })
                        });
                    }
                });
            }
        });
    }
};
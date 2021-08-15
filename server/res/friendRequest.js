let userPage = require('./userPage.js');

function update(req, res, db){
    if(!req.session.pseudo) res.redirect('back');
    else{
        db.db('amagus').collection('users').findOne({pseudo: req.session.pseudo}, (err, doc)=>{
                if(err) throw err;
                else{
                    req.session.notifications = doc.notifications;
                    req.session.friendReceived = doc.friendReceived;
                    req.session.friendRequests = doc.friendRequests;
                    req.session.friends = doc.friends;
                    res.status(200).send(doc);
                }
            })
    }
}

module.exports = friends = {
    requested: (req, res, db)=>{
        let dbo = db.db('amagus').collection('users');
        dbo.findOne({pseudo: req.session.pseudo}, (err, requesterData)=>{
            if(err) throw err;
            dbo.findOne({pseudo: req.query.user}, (err, receiverData)=>{
                if(err) throw err;
                 let receiver = {
                    "pseudo": requesterData.pseudo,
                    "publicKey": requesterData.publicKey
                };
                let requester = {
                    "pseudo": receiverData.pseudo,
                    "publicKey": receiverData.publicKey
                };

                let notif = {
                    "type": "friendRequest",
                    "pseudo": requesterData.pseudo,
                    "picture": requesterData.picture,
                    "date": new Date().toISOString()
                };

                dbo.updateOne({pseudo: receiverData.pseudo}, {$addToSet:{friendReceived: receiver, notifications: notif}}, (err)=>{
                    if(err) throw err;
                    dbo.updateOne({pseudo: requesterData.pseudo}, {$addToSet:{friendRequests: requester}}, (err)=>{
                        if(err) throw err;
                        res.url ='/';
                        dbo.findOne({pseudo: req.session.pseudo}, (err, doc)=> {
                            if (err) throw err;
                            req.session.friendRequests = doc.friendRequests;
                            userPage(req, res, db, false, notif, receiverData.pseudo);
                        });
                    });
                });
            });
        });
    },
    accept: (req, res, db)=>{
        let dbo = db.db('amagus').collection('users');
        dbo.findOne({pseudo: req.query.user}, (err, requesterData)=>{
            if(err) throw err;
            dbo.findOne({pseudo: req.session.pseudo}, (err, receiverData)=>{
                if(err) throw err;
                let requesterFriend = {
                    "pseudo": receiverData.pseudo,
                    "publicKey": receiverData.publicKey
                };
                let receiverFriend = {
                    "pseudo": requesterData.pseudo,
                    "publicKey": requesterData.publicKey
                };
                let notif = {
                    "type": "friendAcceptation",
                    "pseudo": receiverData.pseudo,
                    "picture": receiverData.picture,
                    "publicKey": receiverData.publicKey,
                    "date": new Date().toISOString()
                };
                let acceptTrace = {
                    "type": "acceptTrace",
                    "pseudo": requesterData.pseudo,
                    "picture": requesterData.picture,
                    "date": new Date().toISOString()
                };
                dbo.updateOne({pseudo: requesterData.pseudo}, {$pull:{friendRequests: {pseudo: receiverData.pseudo}},
                        $addToSet: {friends: requesterFriend, notifications: notif}}, (err)=>{
                    if(err) throw err;
                    dbo.updateOne({pseudo: receiverData.pseudo}, {$pull:{friendReceived: {pseudo: requesterData.pseudo},
                    notifications: { pseudo: requesterData.pseudo}}, $addToSet:{friends: receiverFriend}}, (err)=>{
                        if(err) throw err;
                        dbo.updateOne({pseudo: receiverData.pseudo}, {$addToSet:{notifications: acceptTrace}}, (err)=>{
                            if(err) throw err;
                            dbo.findOne({pseudo: req.session.pseudo}, (err, doc)=> {
                                if (err) throw err;
                                req.session.friendReceived = doc.friendReceived;
                                req.session.friends = doc.friends;
                                req.session.notifications = doc.notifications;
                                userPage(req, res, db, false, notif, requesterData.pseudo);
                            });
                        });
                    })
                });
            });
        });
    },
    refuse: (req, res, db)=>{
        let dbo = db.db('amagus').collection('users');
        let requester = req.query.user.toString();
        let receiver = req.session.pseudo.toString();
        dbo.updateOne({pseudo: requester}, {$pull:{friendRequests: {pseudo: receiver}}}, (err)=>{
            if(err) throw err;
            dbo.updateOne({pseudo: receiver}, {$pull:{friendReceived: {pseudo: requester},
                    notifications:{pseudo: requester}}}, (err)=>{
                    if(err) throw err;
                dbo.findOne({pseudo: req.session.pseudo}, (err, doc)=> {
                    if (err) throw err;
                    req.session.friendReceived = doc.friendReceived;
                    req.session.notifications = doc.notifications;
                    res.redirect('back');
                });
            });
        });
    },
    update: update
};
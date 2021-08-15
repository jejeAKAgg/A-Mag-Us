//npm modules
let express = require('express');
let parser = require('body-parser');
let session = require('express-session');
let MongoClient = require('mongodb').MongoClient;
let multer = require('multer');
let upload = multer({});
let http = require('http');
let https = require('https');
let path = require('path');
let fs= require('fs');
const {getCountries} = require("country-state-picker/lib/index");
let languages = require('langs');

//DIM modules
let login = require('./res/login.js');
let sign = require('./res/sign.js');
let confirm = require('./res/confirm.js');
let userPage = require('./res/userPage.js');
let editUser = require('./res/editUser');
let loadForum = require('./res/loadForum.js');
let forumPage = require('./res/forumPage.js');
let forumPost = require('./res/forumPost.js');
let answerPost = require('./res/answerPost.js');
let friends = require('./res/friendRequest.js');
let news = require('./res/news.js');

// Global variables
let app = express();
let dbUrl = 'mongodb://localhost:27017';


// App configs
let middleWare = session({
    secret : "not_s3cr3t_s3nt3nc3",
    resave : false,
    saveUninitialized : true,
    cookie : {
        path: '/',
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 7 , //One week cookie lifetime
        secure: true
    }
});

app.use(express.static('static'));
app.engine('ejs', require('ejs').renderFile);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../server/views'));
app.use(parser.urlencoded({extended: true}));
app.use(middleWare);

// server and router (http to https) declaration and configuration
let server = https.createServer({
    key: fs.readFileSync('./server/cert.key'),
    cert: fs.readFileSync('./server/cert.crt')
}, app).listen(443);

http.createServer((req, res)=>{
    res.writeHead(301, {"Location": "https://" + req.headers['host'] + req.url});
    res.end();
}).listen(80);

// declaration of socket module
let io = require('socket.io')(server);
io.use((socket, next)=>{
    middleWare(socket.request, socket.request.res || {}, next);
});

// noinspection JSIgnoredPromiseFromCall
MongoClient.connect(dbUrl, {useUnifiedTopology: true}, (err, db)=>{
    if(err) throw err;
    else{
        console.log("------- CONNECTED ------");

        io.on('connection', (socket)=>{
            let ioSession = socket.request.session;
            if(ioSession.pseudo !== undefined){
                socket.join(ioSession.pseudo);
                ioSession.friends.map((friend)=>{
                    let notif = {
                        'type': "onlineFriend",
                        'pseudo': ioSession.pseudo,
                        "publicKey": ioSession.publicKey,
                        'date': new Date().toISOString()
                    };
                    io.to(friend.pseudo).emit('notif', notif);
                });

                socket.on('disconnect', ()=>{
                    ioSession.friends.map((friend)=>{
                        let notif = {
                            'type': "disconnection",
                            'pseudo': ioSession.pseudo,
                            'date': new Date().toISOString()
                        };
                        io.to(friend.pseudo).emit('notif', notif);
                    });
                });

                socket.on('message', (message, to)=>{
                    let data = {
                        'pseudo': ioSession.pseudo,
                        'picture': ioSession.picture,
                        'date' : new Date().toISOString(),
                        'publicKey': ioSession.publicKey,
                        'message': message
                    };
                    io.to(to).emit('message', data);
                });

                socket.on('notif', (notif, to)=>{
                    ioSession = socket.request.session;
                    if (notif.type === "friendRequest" ||
                        notif.type === "friendAcceptation" ||
                        notif.type === "onlineResponse" ||
                        notif.type === "rankChanged") {
                        io.to(to).emit('notif', notif);
                    }else console.log('notif error');
                });
           }
        });

        app.get('/', (req, res)=>{
            db.db('amagus').collection('news').find({}).toArray((err, news)=>{
                if (err) throw err;
                if(req.query.error || !req.session.pseudo) {
                    res.render('index.ejs', {
                        user: req.session.pseudo?req.session:undefined,
                        cookie: req.session.cookieShowed,
                        news: news,
                        errorResponse: req.query.error?req.query.error:undefined,
                        valid: req.query.valid === 'true'
                    });
                }else{
                    res.render('index.ejs', {user: req.session, cookie: req.session.cookieShowed, news: news});
                }
            });
        });

        app.post('/login', (req, res)=>{
            login(req, res, db);
        });

        app.post('/signup', (req, res)=>{
            sign(req, res, db);
        });

        app.get('/user-page', (req, res)=>{
            userPage(req, res, db, req.session.pseudo===req.query.user);
        });

        app.get('/edit-user', (req, res)=>{
            let colors = ["yellow", "white", "lime", "green", "purple", "black", "brown", "blue", "cyan","pink", "red", "orange"];
            let maps = ["the skeld", "polus", "mira hq"];
            let countries = getCountries();

            if(!req.session.pseudo) res.redirect('back');
            else {
                db.db('amagus').collection('users').findOne({pseudo: req.session.pseudo}, (err, doc) => {
                    if (err) throw err;
                    else {
                        if(req.query.error) res.render('editUser.ejs', {user: req.session, doc: doc, colors: colors,
                            maps: maps, countries: countries, languages: languages, errorResponse: req.query.error});
                        else res.render('editUser.ejs', {user: req.session, doc: doc, colors: colors, maps: maps, countries: countries, languages: languages});
                    }
                });
            }
        });

        app.post('/edit-user', (req, res) => {
            editUser(req, res, db);
        });

        app.get('/forum', (req, res)=>{
            loadForum(req, res, db);
        });

        app.get('/forum-page', (req, res)=>{
            if(req.query.subject && req.query.post) forumPage(req, res, db);
            else res.redirect('/err404');
        });

        app.post('/answer-post', (req, res)=>{
            if(!req.session.pseudo) res.redirect('back');
            else if(!req.session.activated) res.redirect('/forum?error=active+your+account+please');
            else if(!(req.query.subject && req.query.title && req.query.author && req.query.date)) res.redirect('/err404');
            else answerPost(req, res, db);
        });

        app.get('/forum-post', (req, res)=>{
            if(!req.session.pseudo) res.redirect('/forum?error=login+or+signup+please');
            else if(!req.session.activated) res.redirect('/forum?error=active+your+account+please');
            else {
                db.db('amagus').collection('forum').find({}).toArray((err, doc)=> {
                    if(err) throw err;
                    res.render('forumPost.ejs', {user: req.session.pseudo?req.session:undefined, subjects: doc})
                });
            }
        });

        app.post('/forum-post', (req, res)=>{
            if(!req.session.pseudo) res.redirect('/forum?error=login+or+signup+please');
            else if(!req.session.activated) res.redirect('/forum?error=active+your+account+please');
            else forumPost(req, res, db);
        });

        app.post('/search-forum', (req, res) => {
            let search = req.body.search.replace(/[&\/\\#,+()$~%'":*?<>{}\[\]]/g, ' ').trim();
            db.db('amagus').collection('forum').find(
                {$or:
                        [
                            {subject: {$regex: search, $options: '$i'}},
                            {'conversations.title': {$regex: search, $options: '$i'}},
                            {'conversations.content': {$regex: search, $options: '$i'}},
                            {'conversations.author': {$regex: search, $options: '$i'}},
                            {'conversations.date': {$regex: search, $options: '$i'}},
                            {'conversations.answers.author': {$regex: search, $options: '$i'}}
                        ]
                }
            ).toArray((err, doc) => {
                if (err) throw err;
                res.render('forum.ejs', {user: req.session.pseudo?req.session:undefined, subjects: doc});
            });
        });

        app.get('/about-us', (req, res)=>{
            res.render('aboutUs.ejs', {user: req.session.pseudo?req.session:undefined, cookie: req.session.cookieShowed});
        });

        app.get('/disconnect', (req, res)=>{
            delete req.session._id;
            delete req.session.master;
            delete req.session.admin;
            delete req.session.mail;
            delete req.session.pseudo;
            delete req.session.cookieShowed;
            delete req.session.notification;
            delete req.session.friends;
            delete req.session.friendRequests;
            delete req.session.friendReceived;
            res.redirect('/');
        });

        app.get('/confirm', (req, res)=>{
           if(req.query.user === undefined || req.query.key === undefined) res.redirect('/');
           else confirm(req, res, db);
        });

        app.get('/friendReq', (req, res)=>{
            if(!req.session) res.redirect('/');
            else if(!req.session.pseudo) res.redirect('/?error=login+or+signup+please');
            else if(!req.session.activated) res.redirect('/?error=active+your+account+please');
            else if(req.query===undefined || req.query.user===undefined) res.redirect('back');
            else friends.requested(req, res, db);
        });

        app.get('/refuseFriend', (req, res)=>{
            if(!req.session) res.redirect('back');
            else if(!req.session.pseudo) res.redirect('/?error=login+or+signup+please');
            else if(req.query===undefined || req.query.user===undefined) res.redirect('back');
            else friends.refuse(req, res, db);
        });

        app.get('/acceptFriend', (req, res)=>{
            if(!req.session) res.redirect('back');
            else if(!req.session.pseudo) res.redirect('/?error=login+or+signup+please');
            else if(!req.session.activated) res.redirect('/?error=active+your+account+please');
            else if(req.query===undefined || req.query.user===undefined) res.redirect('back');
            else friends.accept(req, res, db);
        });

        app.post('/cookieDump', (req, res)=>{
            if(!req.session.cookieShowed){
                req.session.cookieShowed = true;
                res.status(200).send(true);
            }else res.status(300).send(false);
        });

        app.post('/update-friends', (req,res)=>{
            if(!req.session.pseudo) res.redirect('back');
            else friends.update(req, res, db);
        });

        app.post('/update-chat-bar', (req, res)=>{
            if(!req.session.pseudo) res.redirect('back');
            else req.session.chatBar = req.body.data; res.status(200).send();
        });

        app.post('/search-user', (req, res)=>{
            if(!req.session.pseudo) res.status(300).send(); //send failed status
            let search = req.body.user.replace(/[&\/\\#,+()$~%'":*?<>{}\[\]]/g, ' ').trim();
            db.db('amagus').collection('users').find(
                {pseudo: {$regex: search, $options: '$i'}}
                ).toArray((err, doc)=>{
                if(err) res.redirect('/error404');
                res.status(200).send(doc); //send success status
            });
        });

        app.get('/news', (req, res)=>{
            if(req.session.master || req.session.admin) res.render('news.ejs', {user: req.session});
            else res.redirect('/');
        });

        app.post('/add-news', upload.single('image'), (req, res)=>{
            if(!req.session.pseudo) res.redirect('/');
            else if(!(req.session.master || res.session.admin)) res.redirect('/err404');
            else news.addNews(req, res, db);
        });

        app.get('/remove-news', (req, res)=>{
            if(!req.session.pseudo) res.redirect('/');
            else if (!(req.session.admin || req.session.master)) res.redirect('/err404');
            else news.removeNews(req, res, db);
        });

        app.get('/rank', (req, res)=>{
            if(!(req.session.pseudo && req.session.admin && req.query.up && req.query.user)) res.redirect('back');
            else if(!req.session.master && req.query.up === 'false') res.redirect('back');
            else{
                let notif = {
                    "type": "rankChanged",
                    "up": (req.query.up === 'true'),
                    "date": new Date().toISOString()
                };

                db.db('amagus').collection('users').updateOne(
                    {pseudo: req.query.user}, {$set: {admin: (req.query.up === 'true')},
                        $addToSet:{notifications: notif}}, (err)=>{
                        if(err) res.redirect('/error404');
                        userPage(req, res, db, false, notif, req.query.user);
                    });
            }

        });

        app.post('/rank', (req, res)=>{
            db.db('amagus').collection('users').findOne({pseudo: req.session.pseudo}, (err, doc)=>{
                if (err) res.redirect('/error404');
                req.session.admin = doc.admin;
                req.session.notifications = doc.notifications;
                res.status(200).send();
            });
        });

        app.get('/*', (req, res)=>{
            res.render('error404.ejs', {user: req.session.pseudo?req.session:undefined});
        });
    }
});


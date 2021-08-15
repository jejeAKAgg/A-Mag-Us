module.exports = function userPage(req, res, db, owner=false, notif=undefined, to=undefined){
    let user = owner?req.session.pseudo:req.query.user;
    db.db('amagus').collection('users').findOne({pseudo: user}, (err, doc)=>{
      if(err || doc === null)  res.redirect('/error404');
      else if(owner) {
          res.render('userPage.ejs', {user: req.session, doc: doc, notif: notif, to: to});
      } else{
          // user is the user which one we see the page
          let isRequested = [];
          let isReceived = [];
          let isFriend = [];
          if(req.session.pseudo) {
              isRequested = req.session.friendRequests.map((item) => {
                  return item.pseudo === user;
              }).includes(true);

              isReceived = req.session.friendReceived.map((item) => {
                  return item.pseudo === user;
              }).includes(true);

              isFriend = req.session.friends.map((item) => {
                  return item.pseudo === user;
              }).includes(true);
          }
          res.render('userPage.ejs',
              {
                  user: req.session.pseudo?req.session:undefined,
                  doc: doc,
                  notif: notif,
                  to: to,
                  isFriend: isFriend,
                  isRequested: isRequested,
                  isReceived: isReceived,
                  error: req.query.error?req.query.error:undefined,
                  valid: req.query.valid === 'true'
            }
          );
      }
    });
};
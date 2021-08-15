module.exports = function confirm(req, res, db){
    db.db('amagus').collection('users').findOne({pseudo: req.query.user}, (err, doc)=>{
        if(err) throw err;
        if(doc === null || doc.activated) res.redirect('/');
        else if(! (doc.uniqKey === req.query.key)) {
            res.redirect('/err404');
        }
        else{
            db.db('amagus').collection('users').updateOne({_id: doc._id},
                {$set:{activated: true}}, (err)=>{
                    if(err) throw err;
                    req.session.activated = true;
                    res.redirect('/?error='+req.query.user+'+account+is+now+activated&valid=true');
                }
            );
        }
    });
};
module.exports = (req, res, db)=>{
    db.db('amagus').collection('forum').find({}).toArray((err,doc)=>{
        if(err) throw err;
        res.render('forum.ejs', {user: req.session.pseudo?req.session:undefined, subjects: doc,
            errorResponse: req.query.error?req.query.error:undefined, valid: req.query.valid==='true'});
    });
};
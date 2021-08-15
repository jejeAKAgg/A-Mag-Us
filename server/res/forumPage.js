module.exports = (req, res, db)=>{
    let conv = req.query.post.split(' ');
    let title = conv[0].replace(/</g, '\'').replace(/_/g, ' ');
    let author = conv[1].replace(/</g, '\'').replace(/_/g, ' ');
    let date = conv[2].replace(/</g, '\'').replace(/_/g, ' ');
    let subject = req.query.subject.replace(/</g, '\'').replace(/_/g, ' ');
    db.db('amagus').collection('forum').findOne({subject: subject}, (err, doc)=>{
        if(err) throw err;
        let conv = doc.conversations;
        let result = conv.map((item)=>{
            if(item.title === title && item.author === author && item.date === date){
                res.render('forumPage.ejs', {
                    user: req.session.pseudo?req.session:undefined,
                    doc: item,
                    subject: subject,
                })
            }
        });
        if(!result) res.redirect('/forum');
    });
};
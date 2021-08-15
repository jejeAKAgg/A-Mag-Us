const months = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];

module.exports =(req, res, db)=>{
    let subject = req.query.subject;
    let postAuthor = req.query.author;
    let postTitle = req.query.title;
    let postDate = req.query.date;
    let today = new Date();
    let date = today.getDate() + " " + months[today.getMonth()] + " " + today.getFullYear();
    let answer = {
        "author": req.session.pseudo,
        "content": req.body.answer,
        "date": date
    };
    db.db('amagus').collection('forum').updateOne({subject: subject},
        {$addToSet: {'conversations.$[item].answers': answer}},
        {arrayFilters: [{'item.title': postTitle, 'item.author': postAuthor, 'item.date': postDate}]}, (err)=>{
            if(err) res.redirect('/error404');
            res.redirect('back');
        });
};
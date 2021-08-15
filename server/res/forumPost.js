const months = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];

module.exports = (req, res, db)=>{
    if(!req.session.pseudo) res.redirect('/forum');
    else{
        if(req.body.subject && req.body.title && req.body.content){
            let today = new Date();
            let date = today.getDate() + " " + months[today.getMonth()] + " " + today.getFullYear();
            let newPost={
                "title" : req.body.title,
                "content": req.body.content,
                "author": req.session.pseudo,
                "date": date,
                "up": 0,
                "down": 0,
                "answers": []
            };
            db.db('amagus').collection('forum').updateOne({subject: req.body.subject},
                {$addToSet:{conversations: newPost}}, (err)=>{
                if(err) throw err;
                res.redirect('/forum');
            })
        }else res.redirect('/error404');
    }
};
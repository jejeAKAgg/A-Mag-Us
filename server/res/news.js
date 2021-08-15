let ObjectId = require('mongodb').ObjectId;

const months = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"];

module.exports = {
    addNews: (req, res, db)=>{
        let img;
        if(!req.file) img = 'images/no_pict.png';
        else img = "data:image/jpeg;base64," + req.file.buffer.toString('base64');
        let today = new Date();
        let date = today.getDate() + " " + months[today.getMonth()] + " " + today.getFullYear();
        let news = {
            "author": req.session.pseudo,
            "title": req.body.title,
            "resume": req.body.resume,
            "content": req.body.content,
            "date": date,
            "picture": img,
        };
        db.db('amagus').collection('news').insertOne(news, (err)=>{
            if (err) throw err;
            res.redirect("/?error=news+correctly+added&valid=true");
        });
    },

    removeNews: (req, res, db)=>{
        let id = req.query.data;
        db.db('amagus').collection('news').deleteOne({_id: ObjectId(id)}, (err)=>{
            if(err) throw err;
            res.redirect('/');
        })
    }
};
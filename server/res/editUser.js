let bcrypt = require('bcrypt');

module.exports = function editUser(req, res, db){
    db.db('amagus').collection('users').findOne({pseudo: req.session.pseudo}, (err, doc) => {
        if (err) throw err;
        else {
            // check if same password
            if (req.body.rpassword === "") {
                bcrypt.compare(req.body.password, doc.password, (err, check) => {
                    if (err) throw err;
                    else if (!check) {
                        res.redirect("/edit-user?&error=bad+password");
                    } else {
                        db.db('amagus').collection('users').updateOne({pseudo: req.session.pseudo},
                            {$set: {favoriteMap: req.body.maps, favoriteColor: req.body.colors, country: req.body.country, language: req.body.language}});
                        res.redirect('/user-page?user=' + req.session.pseudo);
                    }
                });
            } else {
                if (req.body.password !== req.body.rpassword) {
                    res.redirect("/edit-user?error=password+must+be+same");
                } else {
                    bcrypt.genSalt(10, (err, salt) => {
                        if (err) throw err;
                        bcrypt.hash(req.body.password, salt, (err, hash) => {
                            if (err) throw err;
                                db.db('amagus').collection('users').updateOne({pseudo: req.session.pseudo},
                                    {$set: {password: hash, favoriteMap: req.body.maps, favoriteColor: req.body.colors, country: req.body.country, language: req.body.language}});
                                res.redirect('/user-page?user=' + req.session.pseudo + '&error=change+saved&valid=true');
                        });
                    });
                }
            }
        }
    });
};
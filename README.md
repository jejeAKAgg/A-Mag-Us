# APPSINF LINFO1212 Groupe Q Projet Final
#### Rapport de rattrapage
Vous trouverez ci-joint le rapport de rattrapage où les extensions ajoutées sur ce site web sont également ajoutées dans le rapport avec une mention "NEW".

## A-Mag-Us
#### Table des matières
<ol>
    <li>Résumé</li>
    <li>Préparation de la machine host</li>
    <li>Initialisation du dossier et lancement de la base de donnée</li>
    <li>Installation des modules</li>
    <li>Préset de la base de données [optionnel]
    <ul><li>Préset</li><li>Utilisateurs</li><li>News</li><li>Forum</li></ul>
    </li>
    <li>Lancement du serveur</li>
    <li>Pages du sites</li>
    <li>Fonctionnalitées</li>
</ol>

#### Résumé
Ce projet a été initié dans le cadre du cours LINFO1212 de l'UCLouvain. \
Il a pour but de prouver les connaissances d'un groupe de 3 élèves sur les
 technologies de base du web tel que la triade html css et JavaScript et 
 leur module propre tels que nodeJs Bootstrap et MongoDB. \
 Nous avons donc décidé d'implémenter un site dédié à la communauté d'un jeu vidéo 
 du moment: <a href="https://www.innersloth.com/gameAmongUs.php">AmongUs</a>
 
 #### Préparation de la machine host
 Pour ce projet veillez donc a bien avoir installer <a href="https://nodejs.org/en/download/">NodeJs</a> et 
 <a href="https://www.mongodb.com/try/download/community">MongoDB</a> sur votre machine.
 Si vous ne pouvez pas executer les commande <a href="https://www.npmjs.com/get-npm">npm</a> 
 veillez à ce que celui-ci soit correctement installer sur votre machine aussi
 
 Nous utilisons beaucoup de modules NodeJs, veillez donc a 
 les avoirs correctement installé avant de lancer le serveur.
 Ces modules sont:
 <ol>
    <li>express</li>
    <li>express-session</li>
    <li>body-parser</li>
    <li>mongodb</li>
    <li>ejs</li>
    <li>multer</li>
    <li>http</li>
    <li>https</li>
    <li>path</li>
    <li>fs</li>
    <li>bcrypt</li>
    <li>crypto</li>
    <li>nodemailer</li>
    <li>socket.io</li>
    <li>langs</li>
    <li>country-state-picker</li>
 </ol>
 
#### Initialisation du dossier et lancement de la base de donnée
Une fois nodeJs et mongoDB installer sur votre machine vous pourrez passez à cette partie:\
Si une des commandes cité ne fonctionne pas veuillez vérifier votre installation nodeJS et mongoDB.\
<br>
Une fois ce dossier téléchargé accéder à un terminal / shell / powerShell / bash
afin d'accéder à ce dossier en tapant la commande 

    cd path/to/this/dir/appsinf_groupeQ_final/
    
puis taper la commande

    npm init
    
celle-ci a initialisé votre dossier pour accueillir et lancer les différents 
modules utilisé par nodeJS.\
vous aller ensuite créer un dossier afin de faire tourner mongodb 
(ce dossier contiendra après commande beaucoup de fichiers veuillez 
donc à ne pas lancer cette commande dans n'importe quel dossier).

    touch mongodir && cd mongodir //création du dossier
    mongod --dbpath . //lancement de la db
    

Ceci fait garder ce terminal ouvert et ouvrez en un autre pour le 
restant du setup car dans celui-ci tourne maintenant les 'listener'
de mongodb dont nous aurons besoin afin de communqiuer avec la base de donnée.\

#### Installation des modules
Les modules peuvent être installer par une simple commande npm\

    npm install <module-name>
    
par exemple :
    
    npm install express-session
    
Veuillez installer tous les modules requis avant d'essayer de lancer le serveur,
celui-ci pourrait ne pas correctement tourné, voir ne pas se lancer du tout, si tous
les modules ne lui sont pas fournis!


#### Présets de la base de données [optionnel]
Les présets ne sont pas obligatoire mais sachez que sans un utilisateur administrateur
vous ne pourrez pas accéder à la plupart des fonctionnalités du sites web comme 
ajouter un sujet dans le forum, et comme les post sont lier à un sujet s'il n'y a pas de sujet disponible 
les utilisateurs lambda ne pourront rien poster.

Ensuite seul les administrateurs sont autorisé à ajouter des 'news' sur la page d'accueil depuis 
une page similaire à celle du post sur le forum, donc s'il n'y a pas d'aministrateurs aucune news 
(hors présets) ne pourra être ajouter.\
Vous pouvez aussi après avoir inscrit un utilisateurs modifier manuellement les valeurs suivantes 
afin que celui-ci accède à toutes les fonctionnalités du site web.

Un utilisateurs à peine inscrit, qui n'a pas confirmer son inscription via le lien reçu par email ressemble à 
ceci dans la base de données:\
```json
   {
      "activated" : false,
      "master" : false,
      "admin" : false,
      "mail" : "YOUR MAIL @ SFTP . EXT",
      "pseudo" : "YOUR PSEUDO",
      "password" : "YOUR PASSWORD HASH",
      "uniqKey" : "YOUR UNIQ KEY HASH",
      "picture" : null,
      "birthday" : null,
      "publicKey" : "YOUR PUBLIC SSH KEY",
      "privateKey" : "YOUR PRIVATE SSH KEY",
      "favoriteMap" : null,
      "favoriteColor" : null,
      "country" : null,
      "language" : null,
      "friends" : [],
      "friendRequests": [],
      "friendReceived": [],
      "notifications": []
    }
```

Vous devrez setup les trois premiers attributs sur true comme dans l'exemple suivant:

```json
   {
      "activated" : true,
      "master" : true,
      "admin" : true,
      "mail" : "YOUR MAIL @ SFTP . EXT",
      "pseudo" : "YOUR PSEUDO",
      "password" : "YOUR PASSWORD HASH",
      "uniqKey" : "YOUR UNIQ KEY HASH",
      "picture" : null,
      "birthday" : null,
      "publicKey" : "YOUR PUBLIC SSH KEY",
      "privateKey" : "YOUR PRIVATE SSH KEY",
      "favoriteMap" : null,
      "favoriteColor" : null,
      "country" : null,
      "language" : null,
      "friends" : [],
      "friendRequests": [],
      "friendReceived": [],
      "notifications": []
    }
```
Vous pouvez le faire en lançant un terminal mongo depuis n'importe quel terminal de votre machine\
Une fois ce terminal standart ouvert tapé:
    ``mongo``
et le shell mongo s'ouvrira vous permettant de communquer avec la database.
Vous pourrez alors taper:
    ```
    use amagus
    ```
afin d'utiliser la base de données liée à notre site internet.
ensuite taper la commande suivante en remplaçant \<pseudo\> par le pseudo de votre compte.
```shell
    db.forum.updateOne({pseudo: <pseudo>}, {$set:{activated: true, admin: true, master: true}})
```

###### 1° Présets
Les présets ont pour but de remplir le site (partie news et forum) et d'obtenir des utilisateurs presets au plus haut
d'administration (master) le seul moyen d'obtenir ce grade est en passant par la base de données manuellement. \
Nous ne pouvons donc pas vous assurez de l'accès à toutes les fonctionnalitées si vous n'utilisez pas de compte préset.\
En réalité une seule fonctionnalitée est indisponible au administrateur par rapport au master : la possibilité de 
derank un admin au simple rôle d'utilisateur.

###### 2° Utilisateurs
Quatre utilisateurs sont disponible :


| Pseudo | mot de passe | rôle |
:-------:|:------------:|:----:|
RainMaker| rootpass | master
GGisOnline| rootpass | master
Czacio | rootpass | admin
RainMaker17 | rootpass | activated

Commande d'import : 
    
    mongoimport -d amagus -c users path/to/appsinf_groupeQ_final/server/database/users.json --legacy

###### 3° News
Quelques news afin d'illustrer le fonctionnement et la disposition de celles-ci sont disponible dans le fichier ``news.json``.\
Commande d'import :

    mongoimport -d amagus -c news path/to/appsinf_groupeQ_final/server/database/news.json --legacy

###### 4° Forum

Quelques sujets de base pour le forum et uqelques post afin de remplir\
Commande d'import : 

     mongoimport -d amagus -c forum path/to/appsinf_groupeQ_final/server/database/forum.json --legacy


#### Lancement du serveur

Si vous avez correctement suivit les étapes jusqu'ici il vous suffira d'aller à la racine du projet:

    cd path/to/dir/appsinf_groupeQ_final/
    
et de lancer cette commande afin de lancer le server

    node server/server.js

Si tout se lance correctement la console affichera 

    ------CONNECTED------

#### Pages du sites

Home + News + lien jeu
Forum + page de post + page pour lire un post en particulier.\
Page utilisateur personelle (sert aux autres users: distinction selon la requete) + edition d'information.\
Page about-us donnant le contexte et les noms des membres de l'équipe + lien gitHub + widget discord.


#### Fonctionnalitées
###### Possibilités pour user non connecté ou user non activé:
<ul>
    <li>Lire les news</li>
    <li>Lire le forum</li>
</ul>

###### Possibilités des users connectés et activés:
<ul>
    <li>Lire les news</li>
    <li>Lire le forum</li>
    <li>Poster sur le forum</li>
    <li>Répondre à un post sur le forum</li>
    <li>Ajouter un ami</li>
    <li>Envoyer un message à un ami</li>
</ul>


###### Possibilitées des administrateurs : 
<ul>
    <li>Possibilités des user connectés et activés + </li>
    <li><ul>
        <li>Ajout de news sur la page principle</li>
        <li>Ajout de sujet dans le forum</li>
        <li>Promouvoir un administrateur TODO</li>
    </ul></li>
</ul>

###### Possibilités des master:
<ul>
    <li>Possibilités des administrateurs +</li>
    <li><ul>
        <li>Démote un administrateur TODO </li>
    </ul></li>



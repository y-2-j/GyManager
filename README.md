# GyManager

A Gym Management System to track Customers and Trainers of a Multi-Branched Gym using MySQL Database.

Hosted Live at: [https://gym-manager-node.herokuapp.com](https://gym-manager-node.herokuapp.com)


## Installation

```
git clone https://github.com/anuj-aggarwal/GyManager.git
cd GyManager
npm install
```

For Development, To run watch SASS Files, run:
```
npm run sass:watch
```

## Setup

Create a MySQL user <DB_User> and Database <DB_Name>.

Create a secret.json file in this format:
```json
{
    "SERVER": {
        "HOST": "localhost",
        "PORT": "<PORT_NUMBER>"
    },
    "DB": {
        "USER": "<DB_USER>",
        "PASSWORD": "<DB_PASSWORD>",
        "HOST": "localhost",
        "DATABASE": "<DB_NAME>"
    },
    "SESSION_SECRET": "<SESSION_SECRET>",
    "COOKIE_SECRET": "<COOKIE_SECRET>"
}
```

## Running

```
npm start
```

## Built With

* [Express](https://expressjs.com/) - The Node.js Framework for HTTPS Server
* [Sequelize](http://docs.sequelizejs.com/) - Node.js ORM for MySQL Database
* [Passport](http://www.passportjs.org/) - Used for Authentication
* [SASS](https://www.sass-lang.com/) - CSS Preprocessor

## Authors

* [**Anuj Aggarwal**](https://github.com/anuj-aggarwal/)
* [**Kartik Narula**](https://github.com/y-2-j/)
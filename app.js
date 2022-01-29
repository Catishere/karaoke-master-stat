
const express    = require('express');        
const app        = express();                 
const bodyParser = require('body-parser');
const port = process.env.PORT || 3000;
const router = express.Router();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const knex = require('knex')({
    client: 'pg',
    connection: {
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false }
    }
})

knex.schema.hasTable('users').then((exists) => {
    if (!exists) {
        return knex.schema.createTable('users', (t) => {
            t.string('machine_id', 50).primary();
            t.integer('launch_count');
        });
    }
});

router.get('/add/:machine_id', function(req, res) {
    knex('users')
    .upsert({
        machine_id: req.params.machine_id,
        launch_count: 1
    })
    .onConflict(['machine_id'])
    .merge({
        launch_count: User.knex().raw('launch_count + 1')
    });
    res.send('Added');
});

app.use('/api', router);

app.listen(port);
console.log(`Listening on ${port}`);
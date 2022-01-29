
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

router.get('/add/:machine_id', async (req, res) => {
    let user = await knex.table('users').where('machine_id', req.params.machine_id).first();
    if (user) {
        await knex('users').where('machine_id', req.params.machine_id).increment('launch_count');
    } else {
        user = await knex('users').insert({
            machine_id: req.params.machine_id,
            launch_count: 1
        });
    }

    if (user) {
        res.send(`Added user ${user.machine_id} with ${user.launch_count} launch(s)`);
    }
});

app.use('/api', router);

app.listen(port);
console.log(`Listening on ${port}`);
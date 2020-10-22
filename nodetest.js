
const { Client } = require('pg');
const client = new Client({
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: '123456',
    database: 'okullarim'
});

//veritabanına bağlandık
client.connect(err => {
    if (err) {
        console.error('connection error', err.stack)
    } else {
        console.log('connected')
    }
});

var express = require('express');
var app = express();

var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', function (req, res) {
    client
        .query("select gid, ST_AsGeoJSON(ST_Transform(geom,4326))::json As geometry, okul_adi from nokta")
        .then(result => console.log(res.send(result.rows)))
        .catch(e => console.log(e.stack))
    //  .then(() => client.end())
})

app.post('/', function (req, res) {
    const okul_adi = req.body.okul_adi;
    let geom = req.body.geom;
    const gid = 7;
    console.log('req.body:', req.body);


    client
        .query('insert into nokta values ($1,ST_SetSRID(st_point($2,$3),4326), $4) RETURNING *', [gid, geom[0], geom[1], okul_adi])
        .then(result => {
            res.status(200).json({
                success: true,
                okul_adi: okul_adi,
                geom: geom
            });
        })
        .catch(e => console.log('error', e))
    //   .then(() => client.end())

})

app.listen(3000, function () {
    console.log('Server started');
});
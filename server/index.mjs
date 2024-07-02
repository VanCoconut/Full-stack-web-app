import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import {body, param, validationResult} from 'express-validator';
import MemeDao from "./MemesDao.mjs";
import {Insight} from "./Meme.mjs";
import {getUser} from "./dao-users.mjs";
import passport from 'passport';
import LocalStrategy from 'passport-local';
import session from 'express-session';

const memeDao = new MemeDao();
/*** init express and set up the middlewares ***/
const app = express();
// middleware
app.use(express.json());
app.use(morgan('dev'));
app.use(express.static('img'));
// set up and enable CORS
const corsOptions = {
    origin: 'http://localhost:5173',
    optionsSuccessStatus: 200,
    credentials: true
};
app.use(cors(corsOptions));

passport.use(new LocalStrategy(async function verify(username, password, cb) {
    const user = await getUser(username, password);
    if (!user) return cb(null, false, 'Incorrect username or password.');
    return cb(null, user);
}));

passport.serializeUser(function (user, cb) {
    cb(null, user);
});

passport.deserializeUser(function (user, cb) { // this user is id + email + name
    return cb(null, user);
});

const isLoggedIn = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    return res.status(401).json({err: 'Not authorized'});
}

app.use(session({
    secret: "stringa casuale non so cosa",
    resave: false,
    saveUninitialized: false,
}));
app.use(passport.authenticate('session'));


// POST /api/sessions
app.post('/api/sessions', function (req, res, next) {
    passport.authenticate('local', (err, user, info) => {
        if (err)
            return next(err);
        if (!user) {
            return res.status(401).send({err:"Password o username errati"});
        }
        req.login(user, (err) => {
            if (err) return next(err);
            return res.status(201).json(req.user);
        });
    })(req, res, next);
});

// GET /api/sessions/current
app.get('/api/sessions/current', (req, res) => {
    if (req.isAuthenticated()) {
        res.status(200).json(req.user);
    } else
        res.status(401).json({err:'Not authenticated'});
});

// DELETE /api/session/current
app.delete('/api/sessions/current', (req, res) => {
    req.logout(() => {
        res.status(200).end();
    });
});

app.post('/api/users/memes/set-seen',
    [
        // Validation checks
        body('userId').isInt().withMessage('userId deve essere un numero intero.'),
        body('memeId').isInt().withMessage('memeId deve essere un numero intero.')
    ],
    isLoggedIn,
    async (req, res) => {
        const invalidFields = validationResult(req);
        if (!invalidFields.isEmpty()) {
            return res.status(422).json({err: "Errore nei dati inseriti", details: invalidFields.array()});
        }
        try {
            const item = req.body
            const data = {userId: item.userId, memeId: item.memeId,}
            await memeDao.saveTempMeme(data)
            res.status(201).json(data);
        } catch (err) {
            res.status(500).json(err.err);
        }
    });

app.delete('/api/users/:userId/memes/delete-seen', param('userId').isInt().withMessage('ID must be an integer'),isLoggedIn,
    async (req, res) => {
        const invalidFields = validationResult(req);
        if (!invalidFields.isEmpty()) {
            return res.status(422).json({err: "Errore nei dati inseriti", details: invalidFields.array()});
        }
        try {
            const userId = req.params.userId
            await memeDao.deleteTempMemPerUser(userId)
            res.status(200).json({message: "Temp Meme eliminati con successo"});
        } catch (err) {
            res.status(500).json(err.err);
        }
    });

app.get('/api/users/:userId/memes/random', param('userId').isInt().withMessage('ID must be an integer'),
    async (req, res) => {
        try {
            const maxMeme = await memeDao.getMemeCount()
            const userId = req.params.userId
            let randomNumber = Math.floor(Math.random() * maxMeme) + 1;
            let seenId = []
            if (userId > 0) {
                do {
                    const seenMeme = await memeDao.getTempMemPerUser(userId)
                    seenId = seenMeme.map(i => i.id);
                    randomNumber = Math.floor(Math.random() * 10) + 1;
                } while (seenId.includes(randomNumber));
            }
            const result = await memeDao.getMemeById(randomNumber);
            if (result.err) {
                res.status(404).json(result);
            } else {
                res.json({
                    id: result.id,
                    image: result.image
                });
            }
        } catch (err) {
            res.status(500).json(err.err);
        }
    });

app.delete('/api/delete-seen-memes/:id/', param('id').isInt().withMessage('ID must be an integer'),
    async (req, res) => {
        // Validazione dei parametri
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({errors: errors.array()});
        }
        try {
            const result = await memeDao.deleteTempMemPerUser(req.params.id);
            if (result.err)
                res.status(404).json(result);
            else
                res.json(result);
        } catch (err) {
            res.status(500).json(err.err);
        }
    })

app.get('/api/memes/:id', param('id').isInt().withMessage('ID must be an integer'),
    async (req, res) => {
        // Validazione dei parametri
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({errors: errors.array()});
        }
        try {
            const result = await memeDao.getMemeById(req.params.id);
            if (result.err)
                res.status(404).json(result);
            else
                res.json(result);
        } catch (err) {
            res.status(500).json(err.err);
        }
    })

app.post('/api/responses/check',
    [
        body('memeId').isInt().withMessage('Meme ID must be an integer'),
        body('descriptionText').isString().withMessage('Description must be a string')
    ],
    async (req, res) => {
        // Validazione dei parametri
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({errors: errors.array()});
        }
        const memeId = req.body.memeId;
        const description = req.body.descriptionText;

        try {
            const result = await memeDao.checkResponse(memeId, description);
            if (result.err)
                res.status(500).json(result);
            else if (result) {
                res.status(200).json(true);
            } else res.status(200).json(false)
        } catch (err) {
            res.status(500).json(err.err);
        }
    }
);
//v3
app.post('/api/memes/:id/descriptions/right',
    [
        param('id').isInt().withMessage('ID must be an integer'),
        body().isArray().withMessage('Il corpo della richiesta deve essere un array.'),
        body().custom(array => array.length === 7).withMessage('L\'array deve contenere esattamente 7 elementi.'),
        body('*.text').notEmpty(),
        body('*.id').isInt().withMessage('ID must be an integer'),
    ],
    async (req, res) => {
        // Validazione dei parametri
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({errors: errors.array()});
        }

        const descriptions = req.body;
        const memeId = req.params.id;

        try {
            const trueDescriptions = [];
            for (const description of descriptions) {
                const result = await memeDao.checkResponse(memeId, description.text);
                if (result.err) {
                    return res.status(500).json(result);
                } else if (result) {
                    trueDescriptions.push(description);
                }
            }
            res.status(200).json(trueDescriptions);
        } catch (err) {
            console.log(err)
            res.status(500).json({err: err.message});
        }
    }
);


//  Retrieve the meme descr.
// GET /api/meme/:id/description
app.get('/api/memes/:id/descriptions',
    param('id').isInt().withMessage('ID must be an integer'),
    async (req, res) => {
        // Validazione dei parametri
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({errors: errors.array()});
        }
        try {
            const resultRight = await memeDao.getMemeRightDescription(req.params.id);
            const shuffled = resultRight.sort(() => 0.5 - Math.random()).slice(0, 2);
            const resultFalse = await memeDao.getFalseDescription(req.params.id, resultRight[0], resultRight[1]);

            if (resultRight.err) res.status(404).json(resultRight);

            else if (resultFalse.err) res.status(404).json(resultFalse);

            else res.status(200).json(shuffled.concat(resultFalse).sort(() => 0.5 - Math.random()));
        } catch (err) {
            res.status(500).json(err.err);
        }
    })

//  Retrieve all the responses per user.
// GET /api/insight/:userId
app.get('/api/users/:userId/insights', param('userId').isInt().withMessage('ID must be an integer'), isLoggedIn,
    async (req, res) => {
        try {
            // Validazione dei parametri
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(422).json({errors: errors.array()});
            }
            const result1 = await memeDao.getUserInsights(req.params.userId);
            const result = await Promise.all(result1.map(async (r) => {
                const meme = await memeDao.getMemeById(r.memeId);
                return {id: r.id, image: meme.image, response: r.response, points: r.points};
            }));
            if (result.err) {
                res.status(404).json(result.err);
            } else {
                res.json(result);
            }
        } catch (err) {
            res.status(500).json(err.err);
        }
    });


app.post('/api/responses/add',
    [
        body().isArray().withMessage('Il corpo della richiesta deve essere un array.'),
        body().custom(array => array.length === 3).withMessage('L\'array deve contenere esattamente 2 elementi.'),
        body('*.userId').isInt().withMessage('userId deve essere un numero intero.'),
        body('*.memeId').isInt().withMessage('memeId deve essere un numero intero.'),
        body('*.points').custom(value => {
            if (value !== 0 && value !== 5) {
                throw new Error('Il valore di points deve essere 0 o 5.');
            }
            return true;
        }),
    ],
    isLoggedIn,
    async (req, res) => {
        const invalidFields = validationResult(req);
        if (!invalidFields.isEmpty()) {
            return res.status(422).json({err: "Errore nei dati inseriti", details: invalidFields.array()});
        }
        try {
            const responses = req.body;
            for (const res of responses) {
                const response = new Insight(undefined, res.userId, res.memeId, res.points, res.response);
                await memeDao.addResponse(response);
            }
            res.status(201).send('Responses added successfully');
        } catch (err) {
            res.status(500).json(err.err);
        }
    }
);

// Activating the server
const PORT = 3001;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}/`));

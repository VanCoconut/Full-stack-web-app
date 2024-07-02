import db from "./db.mjs";
import {Description, Insight, Meme} from "./Meme.mjs";


export default function MemeDao() {


    // This function retrieves a meme given its id.
    this.getMemeById = (id) => {
        return new Promise((resolve, reject) => {
            const query = "SELECT * FROM memes WHERE id = ?"
            db.get(query, [id], (err, row) => {
                if (err) {
                    console.log(err)
                    reject({err:err.message});
                } else if (!row) {
                    console.log("no rowe")
                    reject({err: 'Meme not found.'});
                } else {
                    // console.log(row)
                    resolve(new Meme(row.id, row.title, row.image))
                }
            });
        });
    }

    this.getMemeCount = () => {
        return new Promise((resolve, reject) => {
            const query = "SELECT COUNT(*) AS count FROM memes";
            db.get(query, [], (err, row) => {
                if (err) {
                    console.log(err);
                    reject({err: err.message});
                } else {
                    resolve(row.count);
                }
            });
        });
    };
    // This function retrieves a meme given its id.
    this.saveTempMeme = (data) => {
        return new Promise((resolve, reject) => {
            const query = 'INSERT INTO tempSeenMemes (userId, memeId) VALUES(?, ?)';
            db.run(query, [data.userId,data.memeId], function (err) {
                if (err) {
                    console.log(err)
                    reject({err:err.message});
                }
                if (this.changes<0) {
                    console.log("Nothing changed")
                    reject({err: 'Nothing changed'})
                }
                resolve(true);
            });
        });
    }
    this.getTempMemPerUser = (userId) => {
        return new Promise((resolve, reject) => {
            const query = "SELECT * FROM tempSeenMemes WHERE userId = ?"
            db.all(query, [userId], (err, rows) => {
                if (err) {
                    console.log(err)
                    reject({err:err.message});
                }
                if (!rows) {
                    console.log("Nothing rows")
                    reject({err: 'Nothing found'})
                }
                const memes=rows.map(i=>new Meme(i.memeId,null,null));
                resolve(memes);
            });
        });
    }

    this.deleteTempMemPerUser = (userId) => {
        return new Promise((resolve, reject) => {
            const query = "DELETE FROM tempSeenMemes WHERE userId = ?"
            db.run(query, [userId], function (err){
                if (err) {
                    console.log(err)
                    reject({err:err.message});
                }
                if (this.changes<0) {
                    console.log("Nothing changed")
                    reject({err: 'Nothing changed'})
                }
                resolve("Meme eliminati");
            });
        });
    }

    this.checkResponse = (memeId, description) => {
        return new Promise((resolve, reject) => {
            const query = "SELECT * FROM memes m,descriptions d WHERE m.id = d.memeId AND d.memeId = ? AND d.text = ?";
            db.all(query, [memeId, description], (err, rows) => {
                if (err) {
                    console.log(err);
                    reject({err:err.message});
                } else if (!rows || rows.length === 0) {
                    resolve(false);
                } else {
                    resolve(true);
                }
            });
        });
    };

    // This function retrieves a description given the meme id.
    this.getMemeRightDescription = (memeId) => {
        return new Promise((resolve, reject) => {
            const query = "SELECT d.id,d.text FROM memes m,descriptions d WHERE m.id = d.memeId AND memeId = ?"
            db.all(query, [memeId], (err, rows) => {
                if (err) {
                    console.log(err.message)
                    reject({err:err.message});
                } else if (!rows) {
                    console.log("no rowe")
                    reject({err: 'Meme descr not found.'});
                } else {
                    // console.log(rows)
                    const a= rows.map(r => new Description(r.id, r.text))
                    resolve(a)
                }
            });
        });
    };

    // This function retrieves all description.
    this.getFalseDescription = (id,r1,r2) => {
        return new Promise((resolve, reject) => {
            // console.log("true")
            // console.log(r1,r2);
            const query = "SELECT  d.id,d.text FROM descriptions d WHERE d.text NOT IN (SELECT d2.text FROM descriptions d2, memes m  WHERE m.id = d2.memeId AND m.id = ?)";
            db.all(query, [id], (err, rows) => {
                if (err) {
                    console.log(err)
                    reject({err:err.message});
                } else if (!rows) {
                    console.log("no rowe")
                    reject({err: 'Meme descr not found.'});
                } else {
                    const a= rows.map(r => new Description(r.id, r.text))
                    let b = a.filter(e => e.text !==r1?.text);
                     b = b.filter(e => e.text !==r2?.text);
                    const shuffled = b.sort(() => 0.5 - Math.random());
                    resolve(  [...shuffled].slice(0, 5))
                }
            });
        });
    };

    this.addResponse = (response) => {
        return new Promise((resolve, reject) => {
            const query = 'INSERT INTO insight (userId, memeId, points,response) VALUES(?, ?, ?,?)';
            db.run(query, [response.userId,response.memeId,response.points,response.response], function (err) {
                if (err) {
                    reject({err:err.message});
                }
                if (this.changes<0) reject({err: 'Nothing changed'})
                resolve(response);
            });
        });
    };

    this.getUserInsights = (userId) => {
        return new Promise((resolve, reject) => {
          const query="SELECT r.id,r.userId, r.memeId,r.points, r.response FROM insight r WHERE  userId=?";
           db.all(query, [userId], (err, rows) => {
                if (err)  reject({err:err.message});
                resolve(
                    rows.map(row => new Insight(row.id, row.userId, row.memeId,row.points,row.response))
                    );
            });
        });
    };


}

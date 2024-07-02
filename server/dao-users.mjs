import db from "./db.mjs";
import crypto from "crypto";


export const getUser = (email, password) => {
    // console.log(`get user chiamato ${email} ${password}`);
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM users WHERE email = ?';
        db.get(sql, [email], (err, row) => {
            if (err) {
                reject(err);
            }
            else if (row === undefined) {
                console.log("User not found.");
                resolve(false);
            }
            else {
                const user = {id: row.id, username: row.email,name: row.name};
                // console.log(user)
                crypto.scrypt(password, row.salt, 32, function(err, hashedPassword) {
                    // console.log(`dentro il crypto psw ${password}, salt ${row.salt}`);
                    if (err) reject(err);
                    if(!crypto.timingSafeEqual(Buffer.from(row.password, 'hex'), hashedPassword))
                        resolve(false);
                    else{
                        resolve(user);
                    }

                });
            }
        });
    });
};




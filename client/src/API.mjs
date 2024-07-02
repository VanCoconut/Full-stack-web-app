import {Description, Insight, Meme} from "./models/Meme.mjs";

const SERVER_URL = 'http://localhost:3001/api';

const logIn = async (credentials) => {
    try {
        const response = await fetch(SERVER_URL + '/sessions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(credentials),
        });
        if (response.ok) {
            const user = await response.json();
            return user;
        } else {
            const errMessage = await response.json();
            throw errMessage;
        }
    } catch (err) {
        console.error(`Errore durante il log in`);
        throw typeof err.err === 'string'  ? err.err : err.message;
    }
};

const logOut = async () => {
    try {
        const response = await fetch(SERVER_URL + '/sessions/current', {
            method: 'DELETE',
            credentials: 'include'
        });
        if (response.ok)
            return null;
        else {
            throw new Error();
        }
    } catch (err) {
        console.error(`Errore durante il log out`);
        throw `Errore durante il log out`
    }
}

const getUserInfo = async () => {
    try {
        const response = await fetch(SERVER_URL + '/sessions/current', {
            credentials: 'include',
        });
        if (!response.ok) {
            const errMessage = await response.json();
            throw errMessage.error;
        }
        const user = await response.json();
        return user;
    }catch (err){
        console.log(err.err)
        throw `Errore durante il log out`
    }
};

async function setSeenMemes(seenMemeIds) {
    try {
        const response = await fetch(SERVER_URL + `/users/memes/set-seen`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            credentials: 'include',
            body: JSON.stringify(seenMemeIds),
        });
        if (!response.ok) {
            const errMessage = await response.json();
            throw errMessage;
        }
        return await response.json();
    } catch (err) {
        console.error('Errore durante l\'invio degli ID dei meme:', err);
        throw typeof err === 'string' ? err : err.message
    }
}

async function deleteSeenMemes(userId) {
    try {
        const response = await fetch(SERVER_URL + `/users/${userId}/memes/delete-seen`, {
            method: 'DELETE',
            headers: {'Content-Type': 'application/json'},
            credentials: 'include',
        });
        if (!response.ok) {
            const errMessage = await response.json();
            throw errMessage;
        }
        return await response.json();
    } catch (err) {
        console.error('Errore durante l\'eliminazione dei meme:', err);
        throw typeof err === 'string' ? err : err.message
    }
}


async function getRandomMeme(userId) {
    try {
        const response = await fetch(SERVER_URL + `/users/${userId}/memes/random`, {
            method: 'GET',
            headers: {'Content-Type': 'application/json'},
        });
        if (!response.ok) {
            const errMessage = await response.json();
            throw errMessage;
        }
        const data = await response.json();
        const imageUrl = `http://localhost:3001/${data.image}`;
        return new Meme(data.id, undefined, imageUrl);
    } catch (err) {
        console.error('Errore durante il recupero del meme:', err);
        throw typeof err === 'string' ? err : err.message
    }
}

async function getMemeById(id) {
    try {
        const response = await fetch(SERVER_URL + `/memes/${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        if (!response.ok) {
            const errMessage = await response.json();
            throw errMessage;
        }
        const data = await response.json();
        const imageUrl = `http://localhost:3001/${data.image}`;
        return new Meme(data.id, data.title, imageUrl);
    } catch (err) {
        console.error('Errore durante il recupero del meme:', err.message);
        throw typeof err === 'string' ? err : err.message
    }
}

async function getDescriptions(id) {
    try {
        const response = await fetch(SERVER_URL + `/memes/${id}/descriptions`, {
            method: 'GET',
            headers: {'Content-Type': 'application/json',},
        });
        if (!response.ok) {
            const errMessage = await response.json();
            throw errMessage;
        }
        const array = await response.json()
        return array.map(d => new Description(d.id, d.text, d.memeId, d.right));
    } catch (err) {
        console.error(err.message);
        throw typeof err === 'string' ? err : err.message
    }
}

async function getInsights(id) {
    try {
        const response = await fetch(SERVER_URL + `/users/${id}/insights`, {
            method: 'GET',
            headers: {'Content-Type': 'application/json',},
            credentials: 'include'
        });
        if (!response.ok) {
            const errMessage = await response.json();
            throw errMessage;
        }
        const array = await response.json()
        return array.map(d => new Insight(d.id, null, `http://localhost:3001/${d.image}`, d.points, d.response));
    } catch (err) {
        throw typeof err === 'string' ? err : err.message
    }
}

async function getCheckedResponse(memeId, descriptionText) {
    try {
        const url = new URL(SERVER_URL + '/responses/check');
        const data = {memeId, descriptionText};
        const response = await fetch(url, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            const errMessage = await response.json();
            throw errMessage;
        }
        return await response.json();
    } catch (err) {
        console.error('Errore durante il recupero del meme:', err);
        throw typeof err === 'string' ? err : err.message
    }
}

//v3
async function getRightDescriptions(memeId, descriptions) {
    try {
        const url = new URL(SERVER_URL + `/memes/${memeId}/descriptions/right`);
        const response = await fetch(url, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(descriptions),
        });

        if (!response.ok) {
            const errMessage = await response.json();
            throw errMessage;
        }
        return await response.json();
    } catch (err) {
        console.error('Errore durante il recupero del meme:', err);
        throw typeof err === 'string' ? err : err.message
    }
}

const addResponses = async (responses) => {
    try {
        const response = await fetch(`${SERVER_URL}/responses/add`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            credentials: 'include',
            body: JSON.stringify(responses)
        });
        if (!response.ok) {
            const errMessage = await response.json();
            throw errMessage;
        }
        return true;
    } catch (err) {
        throw typeof err === 'string' ? err : err.message
    }
};


const API = {
    getInsights,
    addResponses,
    getDescriptions,
    getMemeById,
    deleteSeenMemes,
    getRightDescriptions,
    getRandomMeme,
    getCheckedResponse,
    setSeenMemes,
    logIn,
    logOut,
    getUserInfo
};
export default API;
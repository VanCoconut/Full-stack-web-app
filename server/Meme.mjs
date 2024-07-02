
export function Meme(id, title, image) {
    this.id = id;
    this.title = title;
    this.image = image
}

export function Description(id, text, memeId,right) {
    this.id = id;
    this.text = text;
    this.memeId = memeId;
    this.right=right
}
export function Insight(id, userId, memeId,points,response) {
    this.id = id;
    this.userId = userId;
    this.memeId = memeId;
    this.points = points;
    this.response = response;
}


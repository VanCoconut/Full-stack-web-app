
export default function User(id, email, password) {
    this.id = id;
    this.email = email;
    this.password = password;

    this.toString = () => {

        return `Id: ${this.id}, ` +
            `EMAIL: ${this.email}, PSW: ${this.password}, ` +
            `User: ${this.userId}`;
    }
}

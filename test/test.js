// let user = new Object();
// let user = {};

function makeUser(name, age) {

    return {
        name: name,
        age: age
    }
}

let user = makeUser("Suraj", 30);
console.log(user);

const add = {
    for : 1,
    let : 2,
    return : 3
}

console.log(add.for + add.let + add.return);
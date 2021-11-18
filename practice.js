a = [1,2,4,5];
//for (i = 0; i < 10; i++)
console.log(a);

//this.played.push(action.card);
//this.hand.splice(this.hand.indexOf(action.card),1);

class C {
    constructor(v) {
        this.number = v
    }

    is(o) {
        if (typeof o === "number") return this.number === o;
        return this.number === o.number;
    }
}

console.log(a.splice(a.indexOf(2), 1));
console.log(a);

function params(a, b) {
    console.log(a);
    console.log(b);
}

params(1);
params(1, 345)

z = new C(3);
u = new C(3);
console.log(typeof 2 === "number");
console.log(z.is(u));
console.log(z.is(3));

//=======================================================

function isEqual(a, b) { //simple equal for objects
    let bool = true;
    aKeys = Object.keys(a);
    bKeys = Object.keys(b);

    if (aKeys.length !== bKeys.length) {
        bool = false;
        return bool;
    }

    aKeys.forEach(key => {
        if (a[key].toString() !== b[key].toString()) {
            bool = false;
        }
    });
    return bool;
}

Object.prototype.transLog = function () { //用于环境对象的简式打印
    let thisCopy = new Object();
    let keys = Object.keys(this);
    keys.forEach(key => {
        if (this[key].hasOwnProperty("to_s")) {
            thisCopy[key] = this[key].to_s();
        } else {
            thisCopy[key] = this[key];
        }
    });

    return thisCopy;
}

//====================================================

class 数字 {

    constructor(value) {
        this.reducible = false;
        this.value = parseInt(value);
        this.to_s = () => this.value; //toString(), 下同
    }

    evaluate(environment) {
        return this;
    }

}

class 加 {

    constructor(left, right) {
        this.reducible = true;
        this.left = left;
        this.right = right;
        this.to_s = () => `(${this.left.to_s()} + ${this.right.to_s()})`; //to_s用于打印日志时显式打印运算表达式
    }

    evaluate(environment) {
        return new 数字(this.left.evaluate(environment).value + this.right.evaluate(environment).value)
    }

}

class 乘 {

    constructor(left, right) {
        this.reducible = true;
        this.left = left;
        this.right = right;
        this.to_s = () => `(${this.left.to_s()} × ${this.right.to_s()})`; //to_s用于打印日志时显式打印运算表达式
    }

    evaluate(environment) {
        return new 数字(this.left.evaluate(environment).value * this.right.evaluate(environment).value)
    }

}

class 布尔值 { //输入true或者false
    constructor(value) {
        this.value = value;
        this.reducible = false;
        this.to_s = () => this.value;
    }

    evaluate(environment) {
        return this;
    }
}

class 小于 {
    constructor(left, right) {
        this.left = left;
        this.right = right;
        this.reducible = true;
        this.to_s = () => `${this.left.to_s()} < ${this.right.to_s()}`;
    }

    evaluate(environment) {
        return new 布尔值(this.left.evaluate(environment).value < this.right.evaluate(environment).value)
    }
}


class 变量 {
    constructor(strName) {
        this.name = strName.toString();
        this.reducible = true;
        this.to_s = () => this.name;
    }

    evaluate(environment) {
        return environment[this.name];
    }
}

class 结束语句 {
    constructor() {
        this.reducible = false;
        this.to_s = () => "语句结束";
    }

    evaluate(environment) {
        return environment;
    }
}

class 赋值 {
    constructor(name, expression) {
        this.name = name; //name为“变量（class）”实例
        this.expression = expression;
        this.reducible = true;
        this.to_s = () => `${this.name} = ${this.expression.to_s()}`; //to_s用于打印日志时显式打印运算表达式
    }

    evaluate(environment) {
        // console.log(this.name)
        environment[this.name.to_s()] = this.expression.evaluate(environment);
        return environment;
    }
}

class 如果 {
    constructor(condition, consequence, alternative) {
        this.condition = condition;
        this.consequence = consequence;
        this.alternative = alternative;
        this.reducible = true;
        this.to_s = () => `if ( ${this.condition.to_s()} ) { ${this.consequence.to_s()} } else { ${this.alternative.to_s()} }`
    }

    reduce(environment) {
        if (this.condition.reducible) {
            return [
                new 如果(this.condition.reduce(environment), this.consequence, this.alternative),
                environment
            ];
        } else {

            if (isEqual(this.condition, new 布尔值(true))) {
                return [
                    this.consequence,
                    environment
                ]
            } else if (isEqual(this.condition, new 布尔值(false))) {
                return [
                    this.alternative,
                    environment
                ]
            } else {
                console.log(`error: ${this.condition}`)
            }
        }
    }
}

class 语句序列 {
    constructor(first, second) { //first、second指语句，为statement
        this.first = first;
        this.second = second;
        this.reducible = true;
        this.to_s = () => `${this.first.to_s()}; ${this.second.to_s()}`;
    }

    evaluate(environment) {
        return this.second.evaluate(this.first.evaluate(environment));
    }
}

class 当循环 {
    constructor(condition, body) {
        this.condition = condition;
        this.body = body;
        this.reducible = true;
        this.to_s = () => `while (${this.condition.to_s()}) { ${this.body.to_s()} }`;
    }

    reduce(environment) {
        return [new 如果(this.condition, new 语句序列(this.body, this), new 结束语句()), environment];
    }
}
















// class 计算机 {

//     constructor(statement, environment) {
//         this.statement = statement;
//         this.environment = environment;
//     }

//     //执行每一句语句分析
//     step() {
//         [this.statement, this.environment] = this.statement.reduce(this.environment);
//     }

//     运行() {
//         while (this.statement.reducible == true) { //statement可以是语句，也可是表达式等可规约的对象
//             console.log(this.statement.to_s(), this.environment.transLog())
//             // console.log(666, this.environment);
//             this.step();
//         }
//         console.log(this.statement.to_s(), this.environment.transLog());
//     }

// }


let 语句s = new 语句序列(
    new 赋值(new 变量("x"), new 加(new 数字(1), new 数字(1))),
    new 赋值(new 变量("y"), new 加(new 变量("x"), new 数字(3))),
)

let 环境 = {
    x: new 数字(1)
}

console.log(语句s.evaluate({}).transLog())
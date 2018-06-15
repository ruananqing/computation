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

    // keys.forEach(key => {
    //     if (thisCopy[key].hasOwnProperty("to_s")) {
    //         thisCopy[key] = thisCopy[key].to_s();
    //     }
    // });

    return thisCopy;
}

//====================================================

class 数字 {

    constructor(value) {
        this.reducible = false;
        this.value = parseInt(value);
        this.to_s = () => this.value; //toString(), 下同
    }

}

class 加 {

    constructor(left, right) {
        this.reducible = true;
        this.left = left;
        this.right = right;
        this.to_s = () => `(${this.left.to_s()} + ${this.right.to_s()})`; //to_s用于打印日志时显式打印运算表达式
    }

    reduce(environment) { //规约
        if (this.left.reducible) {
            return new 加(this.left.reduce(environment), this.right);
        } else if (this.right.reducible) {
            return new 加(this.left, this.right.reduce(environment))
        } else {
            return new 数字(this.left.value + this.right.value);
        }
    }

}

class 乘 {

    constructor(left, right) {
        this.reducible = true;
        this.left = left;
        this.right = right;
        this.to_s = () => `(${this.left.to_s()} × ${this.right.to_s()})`; //to_s用于打印日志时显式打印运算表达式
    }

    reduce(environment) { //规约
        if (this.left.reducible) {
            return new 乘(this.left.reduce(environment), this.right);
        } else if (this.right.reducible) {
            return new 乘(this.left, this.right.reduce(environment))
        } else {
            return new 数字(this.left.value * this.right.value);
        }
    }

}

class 布尔值 { //输入true或者false
    constructor(value) {
        this.value = value;
        this.reducible = false;
        this.to_s = () => this.value;
    }

}

class 小于 {
    constructor(left, right) {
        this.left = left;
        this.right = right;
        this.reducible = true;
        this.to_s = () => `${this.left.to_s()} < ${this.right.to_s()}`;
    }

    reduce(environment) {
        if (this.left.reducible) {
            return new 小于(this.left.reduce(environment), this.right);
        } else if (this.right.reducible) {
            return new 小于(this.left, this.right.reduce(environment));
        } else {
            return new 布尔值(this.left.to_s() < this.right.to_s());
        }
    }
}


class 变量 {
    constructor(strName) {
        this.name = strName.toString();
        this.reducible = true;
        this.to_s = () => this.name;
    }

    reduce(environment) {
        return environment[this.name];
    }
}

class 结束语句 {
    constructor() {
        this.reducible = false;
        this.to_s = () => "语句结束";
    }

}

class 赋值 {
    constructor(name, expression) {
        this.name = name;
        this.expression = expression;
        this.reducible = true;
        this.to_s = () => `${this.name} = ${this.expression.to_s()}`; //to_s用于打印日志时显式打印运算表达式
    }

    reduce(environment) { //最终的规约赋值语句将更新环境
        if (this.expression.reducible) {
            return [
                new 赋值(this.name, this.expression.reduce(environment)),
                environment
            ];
        } else {
            // environment[this.name.to_s()] = this.expression
            // return [ new 结束语句(), environment ]
            // 或者用下面的方法更新environment

            return [
                new 结束语句(),
                Object.assign(
                    environment, {
                        [this.name]: this.expression
                    }
                )
            ]
        }
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

    reduce(environment) {
        switch (isEqual(this.first, new 结束语句())) {
            case true:
                return [this.second, environment];
            default:
                let [reduced_first, reduced_environment] = this.first.reduce(environment);
                return [new 语句序列(reduced_first, this.second), reduced_environment]
        }
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

class 计算机 {

    constructor(statement, environment) {
        this.statement = statement;
        this.environment = environment;
    }

    //执行每一句语句分析
    step() {
        [this.statement, this.environment] = this.statement.reduce(this.environment);
    }

    运行() {
        while (this.statement.reducible == true) {  //statement可以是语句，也可是表达式等可规约的对象
            console.log(this.statement.to_s(), this.environment.transLog())
            // console.log(666, this.environment);
            this.step();
        }
        console.log(this.statement.to_s(), this.environment.transLog());
    }

}




let 语句s = new 当循环(
    new 小于(new 变量("x"), new 数字(5)),
    new 赋值("x", new 乘(new 变量("x"), new 数字(3)))
)

let 环境 = { x: new 数字(1)}

new 计算机(语句s, 环境).运行()
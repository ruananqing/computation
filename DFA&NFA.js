// some useful method-----------------start

Array.prototype.flat = function () {
    let new_arr = [];

    function recursion(element) {
        if (element instanceof Array) {
            element.forEach(ele => {
                recursion(ele);
            });
        } else {
            new_arr.push(element);
        }
    }

    this.forEach(ele => {
        recursion(ele);
    });

    return new_arr;
}

Array.prototype.any = function () {
    if (this.length == 0) {
        return false;
    } else {
        return true;
    }
}

// let a = [1, 2, [3, 4], [[[[[5], 666], 6], 7], [8, 9]], 10];
// console.log(a);
// console.log(a.flat())


// some useful method-----------------end



class FARule {
    constructor(state, character, next_state) {
        this.state = state;
        this.character = character;
        this.next_state = next_state;
        this.to_s = () => `#<FRule ${this.state} --${this.character}--> ${this.next_state}>`
    }

    // be used for mapping the rule(instance) by inputting a state and a character
    applies_to(state, character) {
        return this.state == state && this.character == character;
    }

    follow() {
        return this.next_state;
    }

}

class DFARulebook {
    constructor(rules) {
        this.rules = rules;
    }

    next_state(state, character) {
        return this.rule_for(state, character).follow();
    }

    // to map(or find) the rule by the inputed state and character
    rule_for(state, character) {
        return this.rules.find(rule => rule.applies_to(state, character));
    }
}

// let rulebook = new DFARulebook([
//     new FARule(1, 'a', 2), new FARule(1, 'b', 1),
//     new FARule(2, 'a', 2), new FARule(2, 'b', 3),
//     new FARule(3, 'a', 3), new FARule(3, 'b', 3)
// ])

// console.log(rulebook.next_state(3, 'b'));

class DFA {
    constructor(current_state, accept_states, rulebook) {
        this.current_state = current_state;
        this.accept_states = accept_states;
        this.rulebook = rulebook;
    }

    accepting() {
        return this.accept_states.includes(this.current_state);
    }

    read_character(character) {
        this.current_state = rulebook.next_state(this.current_state, character)
    }

    read_string(string) {
        string.split("").forEach(char => this.read_character(char));
        // return this;
    }
}

class DFADesign {
    constructor(start_state, accept_states, rulebook) {
        this.start_state = start_state;
        this.accpet_states = accept_states;
        this.rulebook = rulebook;
    }

    to_dfa() {
        return new DFA(this.start_state, this.accpet_states, this.rulebook);
    }

    accepts(string) {
        let dfa = this.to_dfa();
        dfa.read_string(string);
        return dfa.accepting();

        // return this.to_dfa().read_string(string).accepting();
    }
}

// let dfa_design = new DFADesign(1, [3], rulebook);
// dfa_design.accepts('aab');
// console.log(dfa_design.accepts('aab'));

class NFARulebook {
    constructor(rules) {
        this.rules = rules;
    }

    next_states(states, character) {
        let n_states = states.map(state => this.follow_rules_for(state, character));
        return Array.from(new Set(n_states.flat()));
    }

    follow_rules_for(state, character) {
        return this.rules_for(state, character).map(element => element.follow());
    }

    rules_for(state, character) {
        return this.rules.filter(rule => rule.applies_to(state, character));
    }
}

let rulebook = new NFARulebook([
    new FARule(1, 'a', 1), new FARule(1, 'b', 1), new FARule(1, 'b', 2),
    new FARule(2, 'a', 3), new FARule(2, 'b', 3),
    new FARule(3, 'a', 4), new FARule(3, 'b', 4)
]);

// console.log(rulebook.next_states([1], 'b'))

class NFA {
    constructor(current_states, accept_states, rulebook) {
        this.current_states = current_states;
        this.accept_states = accept_states;
        this.rulebook = rulebook;
    }

    accepting() {
        // console.log(this.accept_states)
        let intersection = this.current_states.filter(ele => this.accept_states.includes(ele));
        return intersection.any();
    }

    read_character(character) {
        this.current_states = this.rulebook.next_states(this.current_states, character);
    }

    read_string(string) {
        string.split("").forEach(char => this.read_character(char));
    }
}

// let nfa = new NFA([1], [4], rulebook);
// nfa.read_string('bbb')
// console.log(nfa.accepting());

class NFADesign {
    constructor(start_state, accept_states, rulebook) {
        this.start_state = start_state;
        this.accept_states = accept_states;
        this.rulebook = rulebook;
    }

    accepts(string) {
        let nfa = this.to_nfa();
        nfa.read_string(string);
        return nfa.accepting();
    }

    to_nfa() {
        // return new NFA(Array.from(new Set(this.start_state)), this.accept_states, this.rulebook);
        return new NFA(Array.from(this.start_state), this.accept_states, this.rulebook);
    }
}

let nfa_design = new NFADesign([1], [4], rulebook);
console.log(nfa_design.accepts('bbabb'));
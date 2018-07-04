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

Array.prototype.isSubSetOf = function (arr) {
    let bool = true;
    this.forEach(ele => {
        if (!arr.includes(ele)) {
            bool = false;
        }
    });

    return bool;
}

// some useful method-----------------end



export class FARule {
    constructor(state, character, next_state) {
        this.state = state;
        this.character = character;
        this.next_state = next_state;
        this.to_s = () => `#<FRule ${this.state} --${this.character}--> ${this.next_state}>`
    }

    // be used for matching the rule(instance) by inputting a state and a character
    applies_to(state, character) {
        return this.state == state && this.character == character;
    }

    follow() {
        return this.next_state;
    }

}

export class DFARulebook {
    constructor(rules) {
        this.rules = rules;
    }

    next_state(state, character) {
        return this.rule_for(state, character).follow();
    }

    // to match(or find) the rule by the inputed state and character
    rule_for(state, character) {
        return this.rules.find(rule => rule.applies_to(state, character));
    }
}

export class DFA {
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

export class DFADesign {
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

export class NFARulebook {
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

    follow_free_moves(states) {
        let more_states = this.next_states(states, null);

        if (more_states.isSubSetOf(states)) {
            return states;
        } else {
            return this.follow_free_moves([...states, ...more_states]);
        }
    }
}

export class NFA {
    //accept_states should be an array
    constructor(current_states, accept_states, rulebook) {
        this.current_states = Array.from(new Set(rulebook.follow_free_moves(current_states)));
        this.accept_states = accept_states;
        this.rulebook = rulebook;
    }

    accepting() {
        //accept_states should be an array
        let intersection = this.current_states.filter(ele => this.accept_states.includes(ele));
        return intersection.any();
    }

    read_character(character) {
        this.current_states = this.rulebook.next_states(this.current_states, character);
        // to ensure that the nfa's current_state should makes once follow_free_moves after reading a character
        this.current_states = Array.from(new Set(this.rulebook.follow_free_moves(this.current_states)));
    }

    read_string(string) {
        string.split("").forEach(char => this.read_character(char));
    }
}

export class NFADesign {
    //accept_states should be an array
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
        return new NFA([this.start_state], this.accept_states, this.rulebook);
    }
}
import {
    FARule,
    NFARulebook,
    NFADesign
} from './DFA&NFA.mjs'

class Pattern {
    bracket(outer_precedence) {
        if (this.precedence < outer_precedence) {
            return `(${this.to_s()})`;
        } else {
            return this.to_s();
        }
    }

    matches(string) {
        // to_nfa_design() should be a recursion method for each RE pattern class
        return this.to_nfa_design().accepts(string);
    }
}

class Empty extends Pattern {
    constructor() {
        super();
        this.to_s = () => '';
        this.precedence = 3;
    }

    to_nfa_design() {
        let start_state = new Object;
        let accept_states = [start_state];
        let rulebook = new NFARulebook([]);

        return new NFADesign(start_state, accept_states, rulebook);
    }
}

class Literal extends Pattern {
    constructor(character) {
        super();
        this.character = character;
        this.to_s = () => this.character;
        this.precedence = 1;
    }

    to_nfa_design() {
        // let start_state = Math.random(); // from a rough point of view, any two random numbers are unequal to each others
        let start_state = new Object(); // but any two new Object()s are absolutely unequal to each others

        // accept_state should be an array
        // let accept_state = [ Math.random() ];
        let accept_state = [new Object()];
        let rule = new FARule(start_state, this.character, accept_state);
        let rulebook = new NFARulebook([rule]);
        return new NFADesign(start_state, accept_state, rulebook);
    }
}

class Concatenate extends Pattern {
    constructor(first, second) {
        super();
        this.first = first;
        this.second = second;
        this.to_s = () => {
            let arr = [this.first, this.second].map(ele => ele.bracket(this.precedence));
            return arr.join('');
        };
        this.precedence = 1;
    }

    to_nfa_design() {
        let first_nfa_design = this.first.to_nfa_design();
        let second_nfa_design = this.second.to_nfa_design();

        let start_state = first_nfa_design.start_state;
        let accept_states = second_nfa_design.accept_states;

        let rules = [...first_nfa_design.rulebook.rules, ...second_nfa_design.rulebook.rules]
        let extra_rules = first_nfa_design.accept_states.map(state => {
            return new FARule(state, null, second_nfa_design.start_state);
        });
        let rulebook = new NFARulebook([...rules, ...extra_rules]);

        return new NFADesign(start_state, accept_states, rulebook);
    }
}

class Choose extends Pattern {
    constructor(first, second) {
        super();
        this.first = first;
        this.second = second;
        this.to_s = () => {
            let arr = [this.first, this.second].map(ele => ele.bracket(this.precedence));
            return arr.join('|');
        }
        this.precedence = 0;
    }

    to_nfa_design() {
        let first_nfa_design = this.first.to_nfa_design();
        let second_nfa_design = this.second.to_nfa_design();

        let start_state = new Object();
        // accept_state should be an array
        // let accept_states = [ new Object() ];
        let accept_states = [...first_nfa_design.accept_states, ...second_nfa_design.accept_states];

        let rules = [...first_nfa_design.rulebook.rules, ...second_nfa_design.rulebook.rules]
        let extra_rules1 = [first_nfa_design, second_nfa_design].map(nfa_design => {
            return new FARule(start_state, null, nfa_design.start_state);
        });

        // let extra_rules2 = [...first_nfa_design.accept_states, ...second_nfa_design.accept_states].map(state => {
        //     return new FARule(state, null , accept_state[0]);
        // });

        let rulebook = new NFARulebook([...rules, ...extra_rules1]);
        return new NFADesign(start_state, accept_states, rulebook);
    }
}

class Repeat extends Pattern {
    constructor(pattern) {
        super();
        this.pattern = pattern;
        this.to_s = () => this.pattern.bracket(this.precedence) + '*';
        this.precedence = 2;
    }

    to_nfa_design() {
        let pattern_nfa_design = this.pattern.to_nfa_design();
        let start_state = new Object();
        let accept_states = [...pattern_nfa_design.accept_states, ...[start_state]];

        let rules = pattern_nfa_design.rulebook.rules;
        let extra_rules1 = pattern_nfa_design.accept_states.map(accept_state => {
            return new FARule(accept_state, null, start_state);
        });
        let extra_rules2 = [new FARule(start_state, null, pattern_nfa_design.start_state)];

        let rulebook = new NFARulebook([...rules, ...extra_rules1, ...extra_rules2]);
        return new NFADesign(start_state, accept_states, rulebook);
    }
}

let pattern = new Repeat(
    new Concatenate(
        new Literal('a'),
        new Choose(new Empty(), new Literal('b'))
    )
);
console.log(pattern.to_s());
console.log(pattern.matches('abaaaaaaab'));
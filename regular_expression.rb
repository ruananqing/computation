$LOAD_PATH << '.'
require 'DFA&NFA.rb'

module Pattern
    def bracket(outer_precedence)
        if self.precedence < outer_precedence
            '(' + self.to_s + ')'
        else
            self.to_s
        end
    end

    def inspect
        "/#{self}/"
    end

    def matches?(string)
        self.to_nfa_design.accepts?(string)
    end
end

class Empty
    include Pattern

    def to_s
        ''
    end

    def precedence
        3
    end

    def to_nfa_design
        start_state = Object.new
        accept_states = [start_state]
        rulebook = NFARulebook.new([])

        NFADesign.new(start_state, accept_states, rulebook)
    end
end

class Literal < Struct.new(:character)
    include Pattern

    def to_s
        self.character
    end

    def precedence
        3
    end

    def to_nfa_design
        start_state = Object.new
        accept_state = Object.new
        rule = FARule.new(start_state, character, accept_state)
        rulebook = NFARulebook.new([rule])

        NFADesign.new(start_state, [accept_state], rulebook)
    end
end

class Concatenate < Struct.new(:first, :second)
    include Pattern

    def to_s
        [self.first, self.second].map { |pattern| pattern.bracket(self.precedence) }.join
    end

    def precedence
        1
    end

    def to_nfa_design
        first_nfa_design = self.first.to_nfa_design
        second_nfa_design = self.second.to_nfa_design

        start_state = first_nfa_design.start_state
        accept_states = second_nfa_design.accept_states

        rules = first_nfa_design.rulebook.rules + second_nfa_design.rulebook.rules
        extra_rules = first_nfa_design.accept_states.map { |state|
            FARule.new(state, nil, second_nfa_design.start_state)
        }

        rulebook = NFARulebook.new(rules + extra_rules)
        
        NFADesign.new(start_state, accept_states, rulebook)
    end
end

class Choose < Struct.new(:first, :second)
    include Pattern

    def to_s
        [self.first, self.second].map { |pattern| pattern.bracket(self.precedence) }.join('|')
    end

    def precedence
        0
    end

    def to_nfa_design
        first_nfa_design = self.first.to_nfa_design
        second_nfa_design = self.second.to_nfa_design

        start_state = Object.new
        accept_states = first_nfa_design.accept_states + second_nfa_design.accept_states

        rules = first_nfa_design.rulebook.rules + second_nfa_design.rulebook.rules
        extra_rules = [first_nfa_design, second_nfa_design].map { |nfa_design| 
            FARule.new(start_state, nil, nfa_design.start_state)
        }

        rulebook = NFARulebook.new(rules + extra_rules)

        NFADesign.new(start_state, accept_states, rulebook)
    end
end

class Repeat < Struct.new(:pattern)
    include Pattern

    def to_s
        self.pattern.bracket(self.precedence) + '*'
    end

    def precedence
        2
    end

    def to_nfa_design
        pattern_nfa_design = pattern.to_nfa_design

        start_state = Object.new
        accept_states = pattern_nfa_design.accept_states + [start_state]
        rules = pattern_nfa_design.rulebook.rules
        extra_rules = pattern_nfa_design.accept_states.map { |accept_state| 
            FARule.new(accept_state, nil, pattern_nfa_design.start_state)
        } + [FARule.new(start_state, nil, pattern_nfa_design.start_state)]
        rulebook = NFARulebook.new(rules + extra_rules)

        NFADesign.new(start_state, accept_states, rulebook)
    end
end

pattern = Repeat.new(
    Concatenate.new(
        Literal.new('a'),
        Choose.new(Empty.new, Literal.new('b'))
    )
)

puts pattern.matches?('ababaaa')
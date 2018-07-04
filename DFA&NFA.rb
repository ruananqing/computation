class FARule < Struct.new(:state, :character, :next_state)
    #be used for mapping the rule(instance) by inputting a state and a character
    def applies_to?(state, character) 
        self.state == state && self.character == character
    end

    def follow
        self.next_state
    end

    def inspect
        "#<FARule #{self.state.inspect} --#{self.character}--> #{self.next_state.inspect}>"
    end
end

class DFARulebook < Struct.new(:rules)
    def next_state(state, character)
        rule_for(state, character).follow
    end
    
    #to match(or find) the rule by the inputed state and character
    def rule_for(state, character)
        self.rules.detect{ |rule| rule.applies_to?(state, character) } #detect == find
    end
end

rulebook = DFARulebook.new([
    FARule.new(1, 'a', 2), FARule.new(1, 'b', 1),
    FARule.new(2, 'a', 2), FARule.new(2, 'b', 3),
    FARule.new(3, 'a', 3), FARule.new(3, 'b', 3)
])


class DFA < Struct.new(:current_state, :accept_states, :rulebook)
    def accepting?
        self.accept_states.include?(self.current_state)
    end

    def read_character(character)
        self.current_state = rulebook.next_state(self.current_state, character)
    end

    def read_string(string)
        string.chars.each do |character|
            read_character(character)
        end
    end
end

class DFADesign < Struct.new(:start_state, :accept_states, :rulebook)
    def to_dfa
        DFA.new(self.start_state, self.accept_states, self.rulebook)
    end

    def accepts?(string)
        self.to_dfa.tap { |dfa| dfa.read_string(string) }.accepting?
    end
end

require 'set'
class NFARulebook < Struct.new(:rules)
    def next_states(states, character)
        states.flat_map { |state| follow_rules_for(state, character) }.to_set
    end

    def follow_rules_for(state, character)
        rules_for(state, character).map(&:follow)
    end

    def rules_for(state, character)
        rules.select { |rule| rule.applies_to?(state, character) } 
    end

    def follow_free_moves(states)
        more_states = self.next_states(states, nil)

        if more_states.subset?(states)
            states
        else
            self.follow_free_moves(states + more_states)
        end
    end
end

class NFA < Struct.new(:current_states, :accept_states, :rulebook)
    # free moves to net for the currents(start) state
    def current_states
        self.rulebook.follow_free_moves(super)
    end

    def accepting?
        (self.current_states & self.accept_states).any?
    end

    def read_character(character)
        self.current_states = self.rulebook.next_states(self.current_states, character)
    end
    
    def read_string(string)
        string.chars.each do |character|
            read_character(character)
        end
    end
end

class NFADesign < Struct.new(:start_state, :accept_states, :rulebook)
    def accepts?(string)
        to_nfa.tap { |nfa| nfa.read_string(string) }.accepting?
    end

    def to_nfa
        NFA.new(Set[self.start_state], self.accept_states, rulebook)
    end
end

# rulebook = NFARulebook.new([
#     FARule.new(1, nil, 2), FARule.new(1, nil, 4),
#     FARule.new(2, 'a', 3),
#     FARule.new(3, 'a', 2),
#     FARule.new(4, 'a', 5),
#     FARule.new(5, 'a', 6),
#     FARule.new(6, 'a', 4)
# ])

# puts rulebook.follow_free_moves(Set[1]).to_a

class Number < Struct.new(:value)

	#getter: for string	
	def to_s
		value.to_s
	end
	
	def inspect
		"<<#{self}>>"
	end

	def evaluate(environment)
		self
	end

end

class Add < Struct.new(:left, :right)

	#getter: for string
	def to_s
		"#{left} + #{right}"
	end

	def inspect
		"<<#{self}>>"
	end

	def evaluate(environment)
		Number.new(self.left.evaluate(environment).value + self.right.evaluate(environment).value)
	end

end

class Multiply < Struct.new(:left, :right)

	#getter: for string
	def to_s
		"#{left} * #{right}"
	end

	def inspect
		"<<#{self}>>"
	end

	def evaluate(environment)
		Number.new(self.left.evaluate(environment).value * self.right.evaluate(environment).value)
	end
end

class Boolean < Struct.new(:value)    #输入true或者false
	def to_s
		value.to_s
	end

	def inspect
		"<<#{self}>>"
	end

	def evaluate(environment)
		self
	end
end

class LessThan < Struct.new(:left, :right)

	def to_s
		"#{left} < #{right}"
	end
	
	def inspect
		"<<#{self}>>"
	end

	def evaluate(environment)
		Boolean.new(self.left.evaluate(environment).value < self.right.evaluate(environment).value)
	end
end

class Variable < Struct.new(:name)
	def to_s
		name.to_s
	end

	def inspect
		"<<#{self}>>"
	end

	def evaluate(environment)
		environment[self.name]
	end
end

class DoNothing		#赋值表达式的等号右边不能规约时，返回donothing表示规约完毕

	def reducible?
		false
	end

	def to_s
		"do-nothing"
	end

	def inspect
		"<<#{self}>>"
	end

	def evaluate(environment)
		environment
	end

end


class Assign < Struct.new(:name, :expression)

	def to_s
		"#{self.name} = #{self.expression}"
	end

	def inspect
		"<<#{self}>>"
	end

	def evaluate(environment)
		environment.merge( {self.name => self.expression.evaluate(environment) })
	end

end

class If < Struct.new(:condition, :consequence, :alternative)
	def reducible?
		true
	end

	def to_s
		"if (#{self.condition}) { #{self.consequence} } else { #{self.alternative} }"
	end

	def evaluate(environment)
		case self.condition.evaluate(environment)
		when Boolean.new(true)
			self.consequence.evaluate(environment)
		when Boolean.new(false)
			self.alternative.evaluate(environment)
		end
	end
end

class Sequence < Struct.new(:first, :second)	#first、second指语句，为statement

	def to_s
		"#{self.first}; #{self.second}"
	end

	def reducible?
		true
	end

	def inspect
		"<<#{self}>>"
	end

	def evaluate(environment)
		self.second.evaluate(self.first.evaluate(environment))
	end

end

class While < Struct.new(:condition, :body)

	def to_s
		"while (#{self.condition}) { #{self.body} }"
	end

	def inspect
		"<<#{self}>>"
	end

	def reducible?
		true
	end

	def evaluate(environment)
		case self.condition.evaluate(environment)
		when Boolean.new(true)
			self.evaluate(self.body.evaluate(environment))
		when Boolean.new(false)
			environment
		end
	end

end



statement = Sequence.new(
	Assign.new(:x, Add.new(Number.new(1), Number.new(1))),
	Assign.new(:y, Add.new(Variable.new(:x), Number.new(3)))
)


environment = {
	x: Number.new(6),
	y: Number.new(5)
}

statement2 = Add.new(Add.new(Number.new(5), Number.new(8)), Number.new(8))
puts statement.evaluate({})




class Number < Struct.new(:value)
	def reducible?
		false
	end

	#getter: for string	
	def to_s
		value.to_s
	end
	
	def inspect
		"<<#{self}>>"
	end

end

class Add < Struct.new(:left, :right)
	def reducible?
		true
	end

	#getter: for string
	def to_s
		"#{left} + #{right}"
	end

	def inspect
		"<<#{self}>>"
	end

	def reduce(environment)
		if left.reducible?
			Add.new(left.reduce(environment), right)
		elsif right.reducible?
			Add.new(left, right.reduce(environment))
		else
			Number.new(left.value + right.value)
		end
	end

end

class Multiply < Struct.new(:left, :right)
	def reducible?
		true
	end

	#getter: for string
	def to_s
		"#{left} * #{right}"
	end

	def inspect
		"<<#{self}>>"
	end

	def reduce(environment)
		if left.reducible?
			Multiply.new(left.reduce(environment), right)
		elsif right.reducible?
			Multiply.new(left, right.reduce(environment))
		else
			Number.new(left.value * right.value)
		end
	end
end

class Boolean < Struct.new(:value)    #输入true或者false
	def to_s
		value.to_s
	end

	def inspect
		"<<#{self}>>"
	end

	def reducible?
		false;
	end
end

class LessThan < Struct.new(:left, :right)
	def reducible?
		true
	end

	def to_s
		"#{left} < #{right}"
	end
	
	def inspect
		"<<#{self}>>"
	end

	def reduce(environment)
		if left.reducible?
			LessThan.new(self.left.reduce(environment), self.right)
		elsif right.reducible?
			LessThan.new(self.left, self.right.reduce(environment))
		else
			Boolean.new(self.left.value < self.right.value)
		end
	end
end

class Variable < Struct.new(:name)
	def to_s
		name.to_s
	end

	def inspect
		"<<#{self}>>"
	end

	def reducible?
		true
	end

	def reduce(environment)
		environment[name]
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

	def ==(other_statement)
		other_statement.instance_of?(DoNothing)
	end

end


class Assign < Struct.new(:name, :expression)
	def reducible?
		true
	end

	def to_s
		"#{self.name} = #{self.expression}"
	end

	def inspect
		"<<#{self}>>"
	end

	def reduce(environment)    #最终的规约赋值语句将更新环境
		if self.expression.reducible?
			[Assign.new(self.name, self.expression.reduce(environment)), environment]
		else
			[DoNothing.new, environment.merge({self.name => self.expression})]
		end
	end
end

class If < Struct.new(:condition, :consequence, :alternative)
	def reducible?
		true
	end

	def to_s
		"if (#{self.condition}) { #{self.consequence} } else { #{self.alternative} }"
	end

	def reduce(environment)
		if self.condition.reducible?
			[
				If.new(self.condition.reduce(environment), self.consequence, self.alternative),
				environment
			]
		else
			case self.condition
			when Boolean.new(true)
				[
					self.consequence,
					environment
				]
			when Boolean.new(false)
				[
					self.alternative,
					environment
				]
			end
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

	def reduce(environment)
		case self.first
		when DoNothing.new
			[self.second, environment]
		else
			reduced_first, reduced_environment = self.first.reduce(environment)
			[Sequence.new(reduced_first, self.second), reduced_environment]
		end
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

	def reduce(environment)
		[If.new(self.condition, Sequence.new(self.body, self), DoNothing.new), environment]
	end

end

class Machine < Struct.new(:statement, :environment)
	def step
		self.statement, self.environment = self.statement.reduce(self.environment)
	end

	def run
		while self.statement.reducible?
			puts "#{self.statement}, #{self.environment}"
			step
		end

		puts "#{self.statement}, #{self.environment}"		
	end
end


statement = While.new(
	LessThan.new(Variable.new(:x), Number.new(5)),
	Assign.new(:x, Multiply.new(Variable.new(:x), Number.new(3)))
)

environment = {x: Number.new(1)}

Machine.new(statement, environment).run






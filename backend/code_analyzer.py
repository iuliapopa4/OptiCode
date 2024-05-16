import ast
import sys
import time
import astor # type: ignore

class CodeAnalyzer(ast.NodeVisitor):
    def __init__(self):
        self.feedback_set = set()  
        self.feedback_list = []  

    def add_feedback(self, message):
        if message and message not in self.feedback_set:
            self.feedback_set.add(message)
            self.feedback_list.append(message)

    def visit_FunctionDef(self, node):
        self.add_feedback(self.check_function_name(node))
        self.add_feedback(self.check_return_statement(node))
        self.add_feedback(self.check_function_length(node))
        self.add_feedback(self.check_nested_blocks(node))
        self.generic_visit(node)

    def visit_Name(self, node):
        self.add_feedback(self.check_variable_name(node))
        self.generic_visit(node)

    def visit_Call(self, node):
        self.add_feedback(self.check_recursion(node))
        self.generic_visit(node)

    def visit_For(self, node):
        self.add_feedback(self.check_iteration(node))
        self.generic_visit(node)

    def check_function_name(self, node):
        if len(node.name) == 1:
            return f"Function name '{node.name}' is too short. Consider using descriptive names."
        elif len(node.name) < 5 and node.name != "main":
            return f"Function name '{node.name}' is quite short. Consider making it more descriptive."
        return None

    def check_return_statement(self, node):
        has_return = any(isinstance(stmt, ast.Return) for stmt in ast.walk(node))
        if not has_return and node.name != "main":
            return f"Function '{node.name}' does not contain a return statement."
        return None

    def check_variable_name(self, node):
        if isinstance(node.ctx, ast.Store):
            if len(node.id) == 1:
                return f"Variable name '{node.id}' is too short. Consider using descriptive names."
            elif len(node.id) < 3:
                return f"Variable name '{node.id}' is quite short. Consider making it more descriptive."
        return None

    def check_recursion(self, node):
        if isinstance(node.func, ast.Name):
            parent = node.parent
            while parent:
                if isinstance(parent, ast.FunctionDef):
                    if node.func.id == parent.name:
                        return f"Recursion detected in function '{node.func.id}'. Consider using an iterative approach if possible."
                parent = getattr(parent, 'parent', None)
        return None


    def check_iteration(self, node):
        if not isinstance(node.iter, ast.Call):
            return f"Consider using a generator for iteration in: {astor.to_source(node.iter).strip()}"
        return None

    def check_function_length(self, node):
        num_lines = len(node.body)
        if num_lines > 20:  # Arbitrary threshold
            return f"Function '{node.name}' is too long ({num_lines} lines). Consider breaking it into smaller functions."
        return None

    def check_nested_blocks(self, node):
        for n in ast.walk(node):
            if isinstance(n, (ast.If, ast.For, ast.While)) and any(isinstance(c, (ast.If, ast.For, ast.While)) for c in n.body):
                return f"Deeply nested block detected in function '{node.name}'. Consider refactoring for readability."
        return None

    def check_unused_variables(self, node):
        assigned_vars = {n.id for n in ast.walk(node) if isinstance(n, ast.Name) and isinstance(n.ctx, ast.Store)}
        used_vars = {n.id for n in ast.walk(node) if isinstance(n, ast.Name) and isinstance(n.ctx, ast.Load)}
        unused_vars = assigned_vars - used_vars
        for var in unused_vars:
            self.add_feedback(f"Variable '{var}' is assigned a value but never used.")
        return None

    def analyze_performance(self, code):
        try:
            global_scope = {}
            exec(code, global_scope)
            main_func = global_scope.get('main')
            if main_func:
                start_time = time.time()
                main_func()
                execution_time = time.time() - start_time
                if execution_time > 1:  # arbitrary threshold for demonstration
                    self.add_feedback("Code execution is slow. Consider optimizing your loops or using more efficient algorithms.")
            else:
                self.add_feedback("No main function found for performance analysis.")
        except Exception as e:
            self.add_feedback(f"Error during performance analysis: {e}")
        return None

    def analyze_algorithm(self, node):
        if isinstance(node, ast.FunctionDef):
            if node.name == "bubble_sort":
                return "Consider using a more efficient sorting algorithm like quicksort or mergesort."
        return None

    def analyze_code_structure(self, code):
        if 'try' not in code and 'except' not in code:
            self.add_feedback("Consider adding exception handling using try-except blocks.")
        if code.count('for') > 3:
            self.add_feedback("Consider reducing the number of nested loops for better readability and performance.")
        return None

    def analyze_complexity(self, node):
        complexity = sum(1 for _ in ast.walk(node) if isinstance(_, (ast.If, ast.For, ast.While, ast.Try)))
        if complexity > 10:  # Arbitrary threshold
            self.add_feedback(f"Function '{node.name}' is too complex with a complexity of {complexity}. Consider refactoring.")
        return None

    def analyze(self, code):
        try:
            tree = ast.parse(code)
        except SyntaxError as e:
            self.add_feedback(f"Syntax error: {e}")
            return self.feedback_list

        for node in ast.walk(tree):
            for child in ast.iter_child_nodes(node):
                child.parent = node
            self.add_feedback(self.analyze_algorithm(node))
            if isinstance(node, ast.FunctionDef):
                self.analyze_complexity(node)
                self.check_unused_variables(node)

        self.visit(tree)
        self.analyze_code_structure(code)
        return "\n".join(self.feedback_list)

if __name__ == "__main__":
    code_file = sys.argv[1]
    with open(code_file, 'r') as file:
        code = file.read()
    analyzer = CodeAnalyzer()
    feedback = analyzer.analyze(code)
    print(feedback)

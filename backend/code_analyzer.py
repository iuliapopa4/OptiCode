import ast
import sys
import astor  # type: ignore
from typing import List, Optional, Set

class CodeAnalyzer(ast.NodeVisitor):
    def __init__(self):
        self.feedback_set: Set[str] = set()
        self.feedback_list: List[str] = []
        self.assigned_vars: Set[str] = set()
        self.used_vars: Set[str] = set()

    def add_feedback(self, message: Optional[str]) -> None:
        if message and message not in self.feedback_set:
            self.feedback_set.add(message)
            self.feedback_list.append(message)

    def visit_FunctionDef(self, node: ast.FunctionDef) -> None:
        self.add_feedback(self.check_function_name(node))
        self.add_feedback(self.check_return_statement(node))
        self.add_feedback(self.check_function_length(node))
        self.add_feedback(self.check_nested_blocks(node))
        self.check_code_smells(node)
        self.generic_visit(node)

    def visit_Name(self, node: ast.Name) -> None:
        if isinstance(node.ctx, ast.Store):
            self.assigned_vars.add(node.id)
        elif isinstance(node.ctx, ast.Load):
            self.used_vars.add(node.id)
        self.add_feedback(self.check_variable_name(node))
        self.generic_visit(node)

    def visit_Call(self, node: ast.Call) -> None:
        self.add_feedback(self.check_recursion(node))
        self.add_feedback(self.check_security_issues(node))
        self.generic_visit(node)

    def visit_For(self, node: ast.For) -> None:
        self.generic_visit(node)

    def visit_Assign(self, node: ast.Assign) -> None:
        self.generic_visit(node)

    def visit_ListComp(self, node: ast.ListComp) -> None:
        for generator in node.generators:
            if isinstance(generator.target, ast.Name):
                self.used_vars.add(generator.target.id)
        self.generic_visit(node)

    def check_function_name(self, node: ast.FunctionDef) -> Optional[str]:
        if len(node.name) == 1:
            return f"Function name '{node.name}' is too short. Consider using descriptive names."
        elif len(node.name) < 5 and node.name != "main":
            return f"Function name '{node.name}' is quite short. Consider making it more descriptive."
        return None

    def check_return_statement(self, node: ast.FunctionDef) -> Optional[str]:
        has_return = any(isinstance(stmt, ast.Return) for stmt in ast.walk(node))
        if not has_return and node.name != "main":
            return f"Function '{node.name}' does not contain a return statement."
        return None

    def check_variable_name(self, node: ast.Name) -> Optional[str]:
        if isinstance(node.ctx, ast.Store):
            if len(node.id) == 1 and node.id not in {"i", "j", "k","pi"}:
                return f"Variable name '{node.id}' is too short. Consider using descriptive names."
            elif len(node.id) < 3 and node.id not in {"i", "j", "k","pi"}:
                return f"Variable name '{node.id}' is quite short. Consider making it more descriptive."
        return None

    def check_recursion(self, node: ast.Call) -> Optional[str]:
        if isinstance(node.func, ast.Name):
            parent = node.parent
            while parent:
                if isinstance(parent, ast.FunctionDef) and node.func.id == parent.name:
                    return f"Recursion detected in function '{node.func.id}'. Consider using an iterative approach if possible."
                parent = getattr(parent, 'parent', None)
        return None
    
    def check_function_length(self, node: ast.FunctionDef) -> Optional[str]:
        num_lines = len(node.body)
        if num_lines > 30:  
            return f"Function '{node.name}' is too long ({num_lines} lines). Consider breaking it into smaller functions."
        return None

    def check_nested_blocks(self, node: ast.FunctionDef) -> Optional[str]:
        nested_depth = self.get_nested_depth(node)
        if nested_depth > 3:  
            return f"Deeply nested block detected in function '{node.name}'. Consider refactoring for readability."
        return None

    def get_nested_depth(self, node: ast.AST, depth: int = 0) -> int:
        if not hasattr(node, 'body'):
            return depth
        if isinstance(node.body, list):
            return max((self.get_nested_depth(n, depth + 1) for n in node.body if isinstance(n, (ast.If, ast.For, ast.While, ast.Try))), default=depth)
        return depth

    def check_unused_variables(self, node: ast.Assign) -> None:
        assigned_vars = {n.id for n in node.targets if isinstance(n, ast.Name)}
        unused_vars = assigned_vars - self.used_vars
        for var in unused_vars:
            self.add_feedback(f"Variable '{var}' is assigned a value but never used.")

    def check_bin_op(self, node: ast.BinOp) -> Optional[str]:
        if isinstance(node.op, ast.Add):
            return f"Binary operation {astor.to_source(node).strip()} detected. Ensure operands are properly validated."
        return None

    def check_security_issues(self, node: ast.Call) -> Optional[str]:
        if isinstance(node.func, ast.Attribute):
            if node.func.attr in {'execute', 'executemany'}:
                return "Potential SQL injection risk. Ensure proper use of parameterized queries."
        if isinstance(node.func, ast.Name):
            if node.func.id in {'eval', 'exec'}:
                return "Use of 'eval' or 'exec' detected. These functions can be dangerous and should be avoided."
        return None

    def analyze_code_structure(self, code: str) -> None:
        if code.count('for') > 3:
            self.add_feedback("Consider reducing the number of nested loops for better readability and performance.")

    def analyze_complexity(self, node: ast.FunctionDef) -> None:
        complexity = sum(1 for _ in ast.walk(node) if isinstance(_, (ast.If, ast.For, ast.While, ast.Try)))
        if complexity > 10:  # Arbitrary threshold
            self.add_feedback(f"Function '{node.name}' is too complex with a complexity of {complexity}. Consider refactoring.")

    def check_code_smells(self, node: ast.FunctionDef) -> None:
        if len(node.args.args) > 5:  # Arbitrary threshold
            self.add_feedback(f"Function '{node.name}' has too many parameters. Consider using a data class or passing a single object.")

    def check_unused_variables_for_whole_code(self):
        unused_vars = self.assigned_vars - self.used_vars
        for var in unused_vars:
            self.add_feedback(f"Variable '{var}' is assigned a value but never used.")

    def analyze(self, code: str) -> str:
        try:
            tree = ast.parse(code)
        except SyntaxError as e:
            self.add_feedback(f"Syntax error: {e}")
            return "\n".join(self.feedback_list)

        # Print the AST
        # ast_dump = ast.dump(tree, indent=4)
        # print(ast_dump)

        for node in ast.walk(tree):
            for child in ast.iter_child_nodes(node):
                child.parent = node
            if isinstance(node, ast.FunctionDef):
                self.analyze_complexity(node)

        self.visit(tree)
        self.analyze_code_structure(code)
        self.check_unused_variables_for_whole_code()

        if not self.feedback_list:
            self.add_feedback("No suggestions. Your code looks good!")

        return "\n".join(self.feedback_list)

if __name__ == "__main__":
    code_file = sys.argv[1]
    with open(code_file, 'r') as file:
        code = file.read()
    analyzer = CodeAnalyzer()
    feedback = analyzer.analyze(code)
    print(feedback)
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
        self.check_code_smells(node)
        self.check_algorithm_efficiency(node)
        self.check_readability(node)
        self.generic_visit(node)
        self.check_unused_variables()  # Check for unused variables after visiting all nodes

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
        self.check_functionality(node)
        self.generic_visit(node)

    def visit_For(self, node: ast.For) -> None:
        self.generic_visit(node)

    def visit_Assign(self, node: ast.Assign) -> None:
        self.generic_visit(node)

    def visit_ListComp(self, node: ast.ListComp) -> None:
        for generator in node.generators:
            if isinstance(generator.target, ast.Name):
                self.assigned_vars.add(generator.target.id)
        self.generic_visit(node)

    def visit_GeneratorExp(self, node: ast.GeneratorExp) -> None:
        for generator in node.generators:
            if isinstance(generator.target, ast.Name):
                self.assigned_vars.add(generator.target.id)
        self.generic_visit(node)

    def visit_SetComp(self, node: ast.SetComp) -> None:
        for generator in node.generators:
            if isinstance(generator.target, ast.Name):
                self.assigned_vars.add(generator.target.id)
        self.generic_visit(node)

    def visit_DictComp(self, node: ast.DictComp) -> None:
        for generator in node.generators:
            if isinstance(generator.target, ast.Name):
                self.assigned_vars.add(generator.target.id)
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
            if len(node.id) == 1 and node.id not in {"i", "j", "k", "pi"}:
                return f"Variable name '{node.id}' is too short. Consider using descriptive names."
            elif len(node.id) < 3 and node.id not in {"i", "j", "k", "pi"}:
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

    def get_nested_depth(self, node: ast.AST, depth: int = 0) -> int:
        if not hasattr(node, 'body'):
            return depth
        if isinstance(node.body, list):
            return max((self.get_nested_depth(n, depth + 1) for n in node.body if isinstance(n, (ast.If, ast.For, ast.While, ast.Try))), default=depth)
        return depth

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

    def check_algorithm_efficiency(self, node: ast.FunctionDef) -> None:
        # Check for nested loops that might indicate O(n^2) complexity
        loop_nesting_level = 0
        for inner_node in ast.walk(node):
            if isinstance(inner_node, ast.For):
                loop_nesting_level += 1
            if loop_nesting_level > 2:
                self.add_feedback(f"Function '{node.name}' contains nested loops. Consider optimizing to reduce time complexity.")
                break  # Report only the first occurrence

        # Check for inefficient membership checks (e.g., using lists instead of sets)
        for inner_node in ast.walk(node):
            if isinstance(inner_node, ast.Call):
                if isinstance(inner_node.func, ast.Attribute):
                    if inner_node.func.attr in ['append', 'extend'] and isinstance(inner_node.func.value, ast.Name):
                        collection_name = inner_node.func.value.id
                        if any(isinstance(e, ast.Name) and e.id == collection_name for e in self.assigned_vars):
                            self.add_feedback(f"Consider using a set for '{collection_name}' for faster membership checks.")

    def check_functionality(self, node: ast.Call) -> None:
        # Detect common tasks and suggest more efficient methods
        if isinstance(node.func, ast.Name) and node.func.id == 'sort':
            self.add_feedback("Consider using the built-in sorted() function for better performance.")
        if isinstance(node.func, ast.Attribute) and node.func.attr in {'append', 'extend'}:
            collection_name = node.func.value.id
            if collection_name in self.assigned_vars:
                self.add_feedback(f"Consider using list comprehensions for '{collection_name}' for better readability and performance.")

    def check_readability(self, node: ast.FunctionDef) -> None:
        # Suggest breaking down long functions
        if len(node.body) > 20:
            self.add_feedback(f"Function '{node.name}' is quite long. Consider breaking it down into smaller, more manageable functions.")
        # Suggest adding comments or documentation
        if not any(isinstance(stmt, ast.Expr) and isinstance(stmt.value, ast.Str) for stmt in node.body):
            self.add_feedback(f"Function '{node.name}' lacks documentation. Consider adding comments or docstrings for better readability.")

    def analyze_complexity(self, node: ast.FunctionDef) -> None:
        complexity = sum(1 for _ in ast.walk(node) if isinstance(_, (ast.If, ast.For, ast.While, ast.Try)))
        if complexity > 10:  # Arbitrary threshold
            self.add_feedback(f"Function '{node.name}' is too complex with a complexity of {complexity}. Consider refactoring.")

    def check_code_smells(self, node: ast.FunctionDef) -> None:
        if len(node.args.args) > 5:  # Arbitrary threshold
            self.add_feedback(f"Function '{node.name}' has too many parameters. Consider using a data class or passing a single object.")

    def check_unused_variables(self):
        unused_vars = self.assigned_vars - self.used_vars
        for var in unused_vars:
            self.add_feedback(f"Variable '{var}' is assigned a value but never used.")

    def analyze(self, code: str) -> str:
        try:
            tree = ast.parse(code)
        except SyntaxError as e:
            self.add_feedback(f"Syntax error: {e}")
            return "\n".join(self.feedback_list)

        for node in ast.walk(tree):
            for child in ast.iter_child_nodes(node):
                child.parent = node
            if isinstance(node, ast.FunctionDef):
                self.analyze_complexity(node)

        self.visit(tree)
        self.check_unused_variables()  # Check for unused variables after visiting all nodes

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

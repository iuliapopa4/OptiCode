import ast
import sys
from typing import List, Optional, Set

class SecurityAnalyzer(ast.NodeVisitor):
    def __init__(self):
        self.feedback_set: Set[str] = set()
        self.feedback_list: List[str] = []

    def add_feedback(self, message: Optional[str]) -> None:
        if message and message not in self.feedback_set:
            self.feedback_set.add(message)
            self.feedback_list.append(message)

    def visit_Call(self, node: ast.Call) -> None:
        self.add_feedback(self.check_security_issues(node))
        self.generic_visit(node)

    def check_security_issues(self, node: ast.Call) -> Optional[str]:
        # Check for use of eval and exec
        if isinstance(node.func, ast.Name):
            if node.func.id in {'eval', 'exec'}:
                return f"Use of '{node.func.id}' detected. These functions can be dangerous and should be avoided."

        # Check for potential NoSQL injection risks
        if isinstance(node.func, ast.Attribute):
            if node.func.attr in {'find', 'find_one', 'update', 'delete', 'insert'}:
                # Placeholder check for potential NoSQL injection risks
                # In a real-world scenario, you would perform more detailed analysis
                return f"Ensure proper sanitization and validation when using '{node.func.attr}' to prevent NoSQL injection."

        # Check for use of subprocess with shell=True
        if isinstance(node.func, ast.Name) and node.func.id == 'subprocess' and any(isinstance(arg, ast.keyword) and arg.arg == 'shell' and isinstance(arg.value, ast.Constant) and arg.value.value == True for arg in node.keywords):
            return "Use of 'subprocess' with shell=True detected. This can be dangerous and should be avoided."

        # Check for potential command injection in os.system
        if isinstance(node.func, ast.Name) and node.func.id == 'system':
            return "Use of 'os.system' detected. This can lead to command injection vulnerabilities."

        # Check for potential file handling issues
        if isinstance(node.func, ast.Name) and node.func.id in {'open', 'os.remove', 'os.rename'}:
            return f"Ensure safe file handling practices when using '{node.func.id}' to avoid security risks."

        return None

    def analyze(self, code: str) -> str:
        try:
            tree = ast.parse(code)
        except SyntaxError as e:
            self.add_feedback(f"Syntax error: {e}")
            return "\n".join(self.feedback_list)

        self.visit(tree)

        if not self.feedback_list:
            self.add_feedback("No security issues detected.")

        return "\n".join(self.feedback_list)

if __name__ == "__main__":
    code_file = sys.argv[1]
    with open(code_file, 'r') as file:
        code = file.read()
    analyzer = SecurityAnalyzer()
    feedback = analyzer.analyze(code)
    print(feedback)

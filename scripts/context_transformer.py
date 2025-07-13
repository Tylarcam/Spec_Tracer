#!/usr/bin/env python3
"""
Context Engineering Transformer
Transforms raw user requests into optimized, context-rich prompts
"""

import re
from typing import Dict, List, Tuple
from dataclasses import dataclass

@dataclass
class TransformationRule:
    keywords: List[str]
    context: str
    questions: List[str]
    preferences: List[str]

class ContextTransformer:
    def __init__(self):
        self.complexity_keywords = {
            'simple': 'Keep it simple - prefer existing solutions over external dependencies',
            'basic': 'Keep it basic - avoid unnecessary complexity',
            'straightforward': 'Keep it straightforward - use direct approaches',
            'quick': 'Keep it quick - use existing patterns where possible',
            'easy': 'Keep it easy - build on what already works'
        }
        
        self.domain_rules = {
            'drag_move': TransformationRule(
                keywords=['drag', 'move', 'position', 'moveable', 'draggable'],
                context='We likely have existing positioning and mouse tracking systems in place',
                questions=[
                    'Should I explore your existing positioning/drag functionality before implementing?',
                    'Do you have existing mouse event systems I should build on?',
                    'What\'s your preference: simple CSS positioning or external drag libraries?'
                ],
                preferences=[
                    'Build incrementally on existing mouse/positioning systems',
                    'Avoid external drag libraries unless absolutely necessary',
                    'Test simple solutions before considering complex ones'
                ]
            ),
            'auth': TransformationRule(
                keywords=['auth', 'login', 'user', 'authentication', 'session'],
                context='We likely have existing user management and session patterns',
                questions=[
                    'Do you have existing user management or auth patterns I should build on?',
                    'What\'s your preference: simple session-based auth or external OAuth libraries?',
                    'Should I explore your current backend structure before implementing?'
                ],
                preferences=[
                    'Build incrementally on existing user/session systems',
                    'Avoid external auth libraries unless absolutely necessary',
                    'Test simple authentication before adding complexity'
                ]
            ),
            'ui_component': TransformationRule(
                keywords=['component', 'ui', 'interface', 'modal', 'panel', 'button'],
                context='We likely have existing component patterns and design systems',
                questions=[
                    'Do you have existing component patterns I should follow?',
                    'Should I check your current UI component library before creating new ones?',
                    'What\'s your preference: extend existing components or create new ones?'
                ],
                preferences=[
                    'Build on existing component patterns and design system',
                    'Avoid creating duplicate components',
                    'Test component integration with existing UI first'
                ]
            ),
            'api_backend': TransformationRule(
                keywords=['api', 'endpoint', 'backend', 'server', 'route'],
                context='We likely have existing API patterns and backend architecture',
                questions=[
                    'Do you have existing API patterns I should follow?',
                    'Should I explore your current backend structure before implementing?',
                    'What\'s your preference: extend existing endpoints or create new architecture?'
                ],
                preferences=[
                    'Build on existing API patterns and middleware',
                    'Avoid introducing conflicting backend patterns',
                    'Test API integration with existing services first'
                ]
            ),
            'database': TransformationRule(
                keywords=['database', 'db', 'schema', 'table', 'migration', 'sql'],
                context='We likely have existing database patterns and schema structure',
                questions=[
                    'Do you have existing database patterns I should follow?',
                    'Should I explore your current schema before making changes?',
                    'What\'s your preference: extend existing tables or create new schema?'
                ],
                preferences=[
                    'Build on existing database patterns and schema',
                    'Avoid breaking existing relationships',
                    'Test database changes incrementally'
                ]
            )
        }

    def transform(self, user_request: str) -> str:
        """Transform raw user request into enhanced context-rich prompt"""
        
        # Detect complexity preference
        complexity_pref = self._detect_complexity_preference(user_request)
        
        # Detect domain and get relevant rules
        domain_rule = self._detect_domain(user_request)
        
        # Build enhanced prompt
        enhanced_prompt = self._build_enhanced_prompt(
            user_request, complexity_pref, domain_rule
        )
        
        return enhanced_prompt

    def _detect_complexity_preference(self, text: str) -> str:
        """Detect complexity preference from user text"""
        text_lower = text.lower()
        
        for keyword, preference in self.complexity_keywords.items():
            if keyword in text_lower:
                return preference
        
        # Default to simplicity
        return "Keep it simple - prefer existing solutions over external dependencies"

    def _detect_domain(self, text: str) -> TransformationRule:
        """Detect domain and return relevant transformation rules"""
        text_lower = text.lower()
        
        for domain_name, rule in self.domain_rules.items():
            for keyword in rule.keywords:
                if keyword in text_lower:
                    return rule
        
        # Default generic rule
        return TransformationRule(
            keywords=[],
            context='Explore current codebase patterns first before adding anything new',
            questions=[
                'Should I explore your existing patterns before implementing?',
                'Do you have existing functionality I should build on?',
                'What\'s your preference: simple solution or external libraries?'
            ],
            preferences=[
                'Build incrementally on what\'s already working',
                'Avoid external dependencies unless absolutely necessary',
                'Test simple solutions before considering complex ones'
            ]
        )

    def _build_enhanced_prompt(self, original_request: str, complexity_pref: str, domain_rule: TransformationRule) -> str:
        """Build the final enhanced prompt"""
        
        # Clean up and enhance the request statement
        enhanced_request = original_request.strip()
        if not enhanced_request.endswith('.'):
            enhanced_request += '.'
        
        prompt = f"""{enhanced_request}

IMPORTANT CONTEXT:
- {complexity_pref}
- {domain_rule.context}
- I prefer building on existing functionality rather than introducing complexity

QUESTIONS FOR YOU TO ASK FIRST:
{chr(10).join(f'{i+1}. "{q}"' for i, q in enumerate(domain_rule.questions))}

IMPLEMENTATION PREFERENCE:
{chr(10).join(f'- {p}' for p in domain_rule.preferences)}"""

        return prompt

# Test cases
def run_tests():
    """Run test cases to validate the transformer"""
    transformer = ContextTransformer()
    
    test_cases = [
        "Make the inspector panel draggable",
        "Add authentication to my app", 
        "Create a new modal component",
        "Build an API endpoint for user data",
        "Add a database table for orders",
        "I want a simple way to upload files",
        "Need to position the tooltip correctly"
    ]
    
    print("🧪 CONTEXT ENGINEERING TRANSFORMER TESTS\n")
    print("=" * 60)
    
    for i, test_case in enumerate(test_cases, 1):
        print(f"\n🔍 TEST {i}: {test_case}")
        print("-" * 40)
        transformed = transformer.transform(test_case)
        print(transformed)
        print("\n" + "=" * 60)

if __name__ == "__main__":
    run_tests() 
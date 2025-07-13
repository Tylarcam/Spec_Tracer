# Context Engineering GPT Transformer

## Overview

A GPT transformer system that takes raw user requests and transforms them into optimized, context-rich prompts that yield better outcomes from AI coding agents.

## System Architecture

### Input: Raw User Request
```
User: "I want to make the inspector panel draggable"
```

### Output: Enhanced Context-Engineered Prompt
```
I want to make the inspector panel draggable for better user experience.

IMPORTANT CONTEXT:
- Keep it simple - prefer existing solutions over external dependencies
- Explore current codebase patterns first before adding anything new
- I prefer building on existing functionality rather than introducing complexity

QUESTIONS FOR YOU TO ASK FIRST:
1. "Should I explore existing positioning/drag functionality before implementing?"
2. "Do you have existing mouse event systems I should build on?"
3. "What's your preference: simple CSS positioning or external drag libraries?"

IMPLEMENTATION PREFERENCE:
- Build incrementally on what's already working
- Avoid external dependencies unless absolutely necessary
- Test simple solutions before considering complex ones
```

## GPT Transformer Prompt Template

### System Prompt for the Transformer GPT

```markdown
You are a Context Engineering Transformer. Your job is to take raw user requests for coding tasks and transform them into optimized, context-rich prompts that prevent over-engineering and promote good practices.

TRANSFORMATION RULES:

1. COMPLEXITY PREFERENCE DETECTION
   - If user mentions: "simple", "basic", "straightforward" → Add "Keep it simple" context
   - If user mentions: "existing", "current", "already have" → Add "Build on existing" context
   - If user mentions: "drag", "move", "position" → Add questions about existing positioning systems
   - Default to simplicity preference unless explicitly stated otherwise

2. CONTEXT ENRICHMENT PATTERNS
   - Add "IMPORTANT CONTEXT" section with relevant preferences
   - Add "QUESTIONS FOR YOU TO ASK FIRST" section with probing questions
   - Add "IMPLEMENTATION PREFERENCE" section with guidelines
   - Include anti-patterns to avoid based on the request type

3. STANDARDIZED STRUCTURE
   Always output in this format:
   ```
   [ENHANCED REQUEST STATEMENT]

   IMPORTANT CONTEXT:
   - [Complexity preference]
   - [Existing system hints]
   - [Implementation philosophy]

   QUESTIONS FOR YOU TO ASK FIRST:
   1. [Exploration question]
   2. [Context question]
   3. [Preference question]

   IMPLEMENTATION PREFERENCE:
   - [Build incrementally guideline]
   - [Dependency guideline]
   - [Testing guideline]
   ```

4. DOMAIN-SPECIFIC ENHANCEMENTS
   Based on keywords, add relevant context:
   
   **UI/Frontend**: 
   - Ask about existing component patterns
   - Prefer CSS solutions over libraries
   - Check for existing state management
   
   **Drag/Move/Position**:
   - Ask about existing positioning systems
   - Prefer simple mouse events over libraries
   - Check for existing mouse tracking
   
   **API/Backend**:
   - Ask about existing patterns
   - Prefer extending current architecture
   - Check for existing utilities
   
   **Database/Storage**:
   - Ask about existing schema patterns
   - Prefer building on current structure
   - Check for existing migrations

EXAMPLE TRANSFORMATIONS:

Input: "Add authentication to my app"
Output:
```
I want to add authentication to my application.

IMPORTANT CONTEXT:
- Keep it simple - prefer existing solutions over external dependencies
- Explore current authentication patterns first before adding anything new
- I prefer building on existing functionality rather than introducing complexity

QUESTIONS FOR YOU TO ASK FIRST:
1. "Do you have existing user management or auth patterns I should build on?"
2. "What's your preference: simple session-based auth or external OAuth libraries?"
3. "Should I explore your current backend structure before implementing?"

IMPLEMENTATION PREFERENCE:
- Build incrementally on existing user/session systems
- Avoid external auth libraries unless absolutely necessary
- Test simple solutions before considering complex ones
```

ANTI-PATTERNS TO PREVENT:
- Over-engineering with external dependencies
- Assuming complexity is needed
- Not exploring existing solutions first
- Adding conflicting systems
- Skipping incremental testing

Your goal is to create prompts that lead to simple, effective solutions that build on existing code patterns.
```

## Implementation Options

### Option 1: Custom GPT (OpenAI)
Create a custom GPT with the transformer prompt as system instructions:

1. **Name**: "Context Engineering Transformer"
2. **Description**: "Transforms coding requests into context-rich prompts that prevent over-engineering"
3. **Instructions**: [Use the system prompt above]
4. **Capabilities**: No web browsing, no image generation, just text transformation

### Option 2: Claude Project with Artifacts
Create a Claude project that:
1. Takes user requests as input
2. Applies transformation rules
3. Outputs optimized prompts
4. Stores successful patterns for future use

### Option 3: Local Script/Tool
```python
# context_transformer.py
import re
from typing import Dict, List

class ContextTransformer:
    def __init__(self):
        self.complexity_keywords = {
            'simple': 'Keep it simple - prefer existing solutions',
            'basic': 'Keep it basic - avoid unnecessary complexity',
            'straightforward': 'Keep it straightforward - use direct approaches'
        }
        
        self.domain_patterns = {
            'drag|move|position': {
                'context': 'We likely have existing positioning/mouse systems',
                'questions': [
                    'Should I explore existing positioning functionality?',
                    'Do you have existing mouse event systems?',
                    'Simple CSS positioning or external libraries?'
                ]
            },
            'auth|login|user': {
                'context': 'We likely have existing user/session patterns',
                'questions': [
                    'Do you have existing user management patterns?',
                    'Simple session-based or external OAuth?',
                    'Should I check current backend structure?'
                ]
            }
        }
    
    def transform(self, user_request: str) -> str:
        # Apply transformation logic
        enhanced_prompt = self._build_enhanced_prompt(user_request)
        return enhanced_prompt
    
    def _detect_complexity_preference(self, text: str) -> str:
        for keyword, preference in self.complexity_keywords.items():
            if keyword in text.lower():
                return preference
        return "Keep it simple - prefer existing solutions over external dependencies"
    
    def _detect_domain(self, text: str) -> Dict:
        for pattern, config in self.domain_patterns.items():
            if re.search(pattern, text.lower()):
                return config
        return self._get_default_domain_config()
```

## Usage Workflow

### Step 1: User Input
```
"Make the inspector panel draggable"
```

### Step 2: Transform
Feed to GPT transformer or run through script

### Step 3: Enhanced Output
```
I want to make the inspector panel draggable for better user experience.

IMPORTANT CONTEXT:
- Keep it simple - prefer existing solutions over external dependencies
- We likely have existing positioning and mouse tracking systems in place
- I prefer building on existing functionality rather than introducing complexity

QUESTIONS FOR YOU TO ASK FIRST:
1. "Should I explore your existing positioning/drag functionality before implementing?"
2. "Do you have existing mouse event systems I should build on?"
3. "What's your preference: simple CSS positioning or external drag libraries?"

IMPLEMENTATION PREFERENCE:
- Build incrementally on what's already working
- Avoid external dependencies unless absolutely necessary
- Test simple solutions before considering complex ones
```

### Step 4: Feed to Coding Agent
Use the enhanced prompt with your coding agent (Claude, ChatGPT, etc.)

## Benefits

1. **Prevents Over-Engineering**: Agents get clear guidance about complexity preferences
2. **Promotes Exploration**: Forces agents to check existing solutions first
3. **Standardizes Communication**: Consistent prompt structure across all requests
4. **Reduces Iterations**: Gets to optimal solution faster by providing better context upfront
5. **Knowledge Transfer**: Captures and applies learned patterns automatically

## Continuous Improvement

### Feedback Loop
1. Track which enhanced prompts lead to successful outcomes
2. Analyze failed attempts to identify missing context patterns
3. Update transformer rules based on new learnings
4. Build domain-specific enhancement libraries

### Pattern Library
Create a growing library of successful transformations:
- UI/UX transformations
- Backend/API transformations  
- Database/Storage transformations
- Performance optimization transformations

This transformer system turns our context engineering lessons into a replicable, automated process for better AI collaboration! 
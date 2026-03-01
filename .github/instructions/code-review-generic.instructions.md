# Generic Code Review Instructions

This file guides the GitHub Copilot generated code review process. Your task is to analyze the provided code against these instructions and provide constructive, detailed feedback. 

## High-Level Rules

- **Do not act as a linter.** The team will rely on automated tooling for style inconsistencies. Do not nitpick stylistic nits unless they detract from readability.
- **Focus on the logic.** Identify real bugs, incorrect implementation or logic, and missing edge cases. 
- **Identify code smells.** Ensure the author isn't making life harder for future maintainers. 
- **Determine if code matches project conventions.** Ensure the code follows the patterns, layouts, and structures laid out by the surrounding codebase. 
- **Determine testability.** If the code is not testable, identify why and suggest a refactor to make it testable. 
- **Adopt a constructive tone.** Provide actionable feedback. Suggest specific code changes. Explain *why* a change is necessary. Never be condescending. The goal is to help the author write better code, not point out their flaws.


## Step-by-Step Code Review Process

Follow these steps for every code review. 

### Step 1: Initial Assessment
- Briefly summarize what you believe the code is doing.
- Identify the core purpose or problem the code solves.
- Mentally try to break the code. Think from the perspective of an attacker or an end user.

### Step 2: In-depth Code Analysis (The Meat of the Review)
Use the following categories as a checklist during your review. 

#### 1. Correctness and Functionality
- **Does it work as intended?** Trace the logic. Are there logical flaws or incorrect assumptions?
- **Are edge cases handled?** What happens with nulls, empties, negative numbers, extremely large inputs, or unexpected data types?
- **Is error handling robust?** Are exceptions caught and handled gracefully? Are error messages informative? Do they leak sensitive information?
- **Are there potential race conditions or concurrency issues?** (If applicable).
- **Does it introduce regressions?** Could this change break existing functionality?

#### 2. Architecture and Design
- **Single Responsibility Principle:** Does a function/class do too many things? Should it be broken down?
- **Coupling and Cohesion:** Is the code too tightly coupled to other modules? Could it be more modular?
- **Design Patterns:** Are appropriate design patterns used? Are anti-patterns present?
- **Reusability:** Could this code be generalized and reused elsewhere?
- **Extensibility:** Is it easy to add new features without modifying existing code?

#### 3. Security
- **Input Validation:** Is all input validated and sanitized before use?
- **Authentication/Authorization:** Extrapolate any potential bypassing of auth checks. Are they being enforced correctly?
- **Data Protection:** Are sensitive data (passwords, API keys, PII) handled securely? Avoid hardcoding credentials.
- **Vulnerabilities:** Are there common vulnerabilities like XSS, CSRF, SQL Injection, etc.?
- **Dependency Security:** Are there known vulnerabilities in any new dependencies introduced?

#### 4. Performance and Efficiency
- **Algorithm Complexity:** Extrapolate the time and space complexity (Big O). Are there more efficient algorithms? If there are nested loops, should they be there?
- **Resource Usage:** Is there excessive memory allocation, unnecessary network calls, or inefficient database queries?
- **Caching:** Could caching be used to improve performance?
- **Asynchronous Operations:** Are async operations handled correctly (e.g., avoiding blocking the main thread)?

#### 5. Readability and Maintainability
- **Naming Conventions:** Are variables, functions, and classes named descriptively and consistently?
- **Code Clarity:** Is the logic easy to follow? Keep it simple. Avoid "clever" code that is hard to understand.
- **Comments and Documentation:** Are complex logic or non-obvious design decisions explained with comments? Is public API documentation provided or updated? *Note: Code should ideally be self-documenting; comments should explain 'why', not 'what'.*
- **Formatting:** Does it follow the project's style guide? (e.g., indentation, spacing, line length). *Note: As mentioned above, avoid nitpicking stylistic nits, but do point out glaring deviances.*

#### 6. Testability
- **Unit Tests:** Are new or modified features covered by unit tests?
- **Test Quality:** Are the tests comprehensive? Do they cover positive, negative, and edge cases? Are assertions meaningful?
- **Mocking/Stubbing:** Are external dependencies mocked appropriately in tests?
- **Integration Tests:** (If applicable) Are integration points tested?


### Step 3: Constructing the Feedback
Formulate your feedback clearly and concisely.

*   **Structure:**
    *   **The Good:** Start by acknowledging what was done well. Positive reinforcement is important.
    *   **High Priority Ideas:** Address the critical bugs, logic flaws, architectural problems, or security issues first. Group these together in a "Critical Priorities" section.
    *   **Low Priority Thoughts:** Address the nice-to-haves and relatively simple code smells next. Try to format these as thought-provokers: "Did you consider using XYZ pattern here rather than ABC?" "Could you use a Hash Set here instead of an Array for faster lookup?".
    *   **The (Rare) Nitpicks:** Try, if at all possible, to avoid placing grammatical or stylistic nits, but if one sticks out like a sore thumb, do so respectfully.
    *   **Conclusion:** Briefly summarize your findings.

*   **Actionable Suggestions:** Provide specific examples of how to fix the identified issues. For example, instead of saying "Improve naming", say "Consider renaming variable `x` to `userIndex` to better reflect its purpose." Provide code snippets where appropriate.

## Example Output Structure

```markdown
### Summary
[Briefly summarize your understanding of the code]

### The Good
- [Point out what was done well]
- [Appreciate clean logic, good test coverage, etc.]

### High Priority
- **[Issue Type (e.g., Security, Logic Error)]:** [Describe the issue]
  - *Recommendation:* [Provide specific recommendation or code snippet]
- [Another Critical Issue...]

### Low Priority Thoughts
- **[Issue Type (e.g., Readability, Small Refactoring)]:** [Describe the thought]
  - *Recommendation:* [Provide suggestion]

### Conclusion
[Final remarks or summary of the review]
```

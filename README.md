![Numida](../logo.numida.png)

# What are we looking for in a QA Engineer?

We are looking for a **Senior Quality Assurance Engineer** who thinks automation-first, cares deeply about quality, and can design **maintainable, scalable testing solutions** for real-world systems.

At Numida, QA is not an afterthought — it is a **foundational engineering discipline** that enables teams to move fast with confidence.

Before we begin, let’s apply the universal algorithm of success:

```js
while (noSuccess) {
  tryAgain();
  if (Dead) {
    break;
  }
}
```

## What are we testing for in this assessment?

This assessment is designed to evaluate how you approach quality in practice, not just in theory.

Specifically, we are looking at:

- Automation-first mindset
- Clean, maintainable test design
- Familiarity with modern testing tools and frameworks
- Ability to test both UI and APIs
- Test planning and documentation discipline
- Identification of edge cases, bugs, and gaps
- Clarity of thought and communication
- *(Bonus)* CI/CD integration experience

## Expectations

- We don’t expect perfection — **just do you**.
- We don’t expect everything to be completed — **prioritise what matters most**.
- We care more about **how you think and structure your work** than how much you complete.

> The assignment should take about a maximum of **3 hours** to complete.

# Use of AI Tools

We encourage the thoughtful use of AI tools (such as ChatGPT, Copilot, or similar) as part of this assessment.

That said, AI should be used as a collaborator, not as the owner of the work. AI tools can be helpful for brainstorming, refining ideas, or exploring alternatives, but they are not a substitute for your own reasoning and judgment.

AI tools can and do make mistakes. We expect candidates to review, validate, and take responsibility for anything produced with AI assistance.

During the follow-up discussion, you may be asked to explain your design decisions, trade-offs, and implementation choices — including where AI tools were used and how they informed your work.

# Assessment

## Overview

You will be working with a **small, functional sample application** that mirrors a simplified version of Numida’s domain (e.g. a first-time loan application flow).

The application:
- Runs locally
- Works out of the box
- Contains intentional gaps, edge cases, and subtle bugs
- Has requirements that are mostly implemented — but not perfectly

## Objective

Your task is **not** to fix the application, but to **design and implement a thoughtful QA approach around it**.

## Setting Up

Please refer to the [QUICK_START](./QUICK_START.md) guide in the root directory of the project to set up the local server.

## Requirements

### 1. Automated UI Testing
Create a small automated UI test suite using **any modern tool of your choice**, such as:
- Playwright
- Cypress
- (or similar)

We are interested in:
- Test structure and readability
- Selector strategy
- Reliability and maintainability
- How you choose what to test

> Tooling choice is yours — explain your reasoning.

### 2. API Testing
Add API-level tests using one of the following approaches:
- Postman collections
- `pytest` + `requests`
- Any equivalent API testing approach

Focus on:
- Core flows
- Validation
- Error cases
- Edge conditions

### 3. Test Plan
Create a **clear, structured test plan** that explains:
- What you chose to test
- What you chose *not* to test (and why)
- Risks and assumptions
- Manual vs automated coverage
- Gaps you would address with more time

### 4. Architecture & Design Decisions
In your documentation, explain:
- Your overall test architecture
- How your test suites are structured
- Why you made certain design decisions
- Trade-offs you considered

### 5. Defects, Bugs & Gaps
Identify and document:
- Bugs you found
- Edge cases not currently handled
- Gaps between requirements and implementation

You do **not** need to fix these — just document them clearly.

### 6. Bonus (Optional)
If you have time, you may also:
- Add CI integration (e.g. GitHub Actions)
- Run tests automatically on pull request or push
- Include basic reporting
- Add notes on how you would evolve this test suite long-term

This is entirely optional and will be considered a bonus.

## Deliverables

Please provide:

- A **GitHub repository** containing:
  - Automated UI tests
  - API tests
- A **README** that includes:
  - Setup instructions
  - How to run tests
  - Design rationale
- A **test plan document**
- A list of **identified bugs / gaps**

## Submission Instructions

1. Use the provided project.
2. Complete the assessment in your own repository or file.
3. Ensure your work is:
   - Clear
   - Well-structured
   - Easy to run
4. Share the repository link or file with us.

## Follow-Up Discussion

During the follow-up interview, you should be prepared to:
- Walk us through your test design
- Explain your prioritisation decisions
- Discuss trade-offs you made
- Talk through bugs or risks you identified
- Suggest improvements or next steps

## Evaluation Criteria

We will evaluate your submission based on:

- Quality and structure of automation
- Test clarity and maintainability
- Thoughtfulness of the test plan
- Identification of risks and edge cases
- Documentation quality
- Clarity of reasoning during discussion
- Bonus points for CI/CD integration

## Hints

- Keep it simple.
- Focus on clarity over quantity.
- Document your thinking.
- There is no single “correct” solution.
- Have fun with it 🙂

Good luck! We’re excited to see how you approach quality engineering 🚀

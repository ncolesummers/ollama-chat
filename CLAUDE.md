# Claude Code Agent Usage Guide

## Overview
This guide provides instructions on using the most important Claude Code agents for development and orchestration tasks. Agents are specialized AI subagents that can be invoked using the Task tool to handle specific domains with expertise.

## Core Development Agents

### code-reviewer
**Purpose:** Expert code review specialist that proactively reviews code for quality, security, and maintainability.
**When to use:** IMMEDIATELY after writing or modifying any code
**Key capabilities:**
- Configuration security analysis (especially magic numbers, connection pools, timeouts)
- Production reliability assessment
- Security vulnerability detection
- Code quality and maintainability review
- Performance issue identification

**Usage example:**
```
Use Task tool with subagent_type: "code-reviewer"
Prompt: "Review the recent changes for security, performance, and best practices"
```

### frontend-developer
**Purpose:** Expert UI engineer for building robust, scalable frontend solutions with React, Vue, or Angular.
**When to use:** When creating UI components, implementing responsive layouts, or handling client state
**Key capabilities:**
- React 18+, Vue 3+, Angular 15+ expertise
- Atomic Design principles
- WCAG 2.1 AA accessibility compliance
- Performance optimization (lazy loading, code splitting)
- State management (Redux Toolkit, Zustand, Pinia, NgRx)
- TypeScript strict mode implementation

**Usage example:**
```
Use Task tool with subagent_type: "frontend-developer"
Prompt: "Create a responsive dashboard component with TypeScript and proper accessibility"
```

### debugger
**Purpose:** Debugging specialist for errors, test failures, and unexpected behavior
**When to use:** PROACTIVELY when encountering any issues, errors, or unexpected behavior
**Key capabilities:**
- Root cause analysis
- Stack trace analysis
- Reproduction step identification
- Minimal fix implementation
- Prevention recommendations

**Usage example:**
```
Use Task tool with subagent_type: "debugger"
Prompt: "Debug the failing test and identify the root cause"
```

### test-automator
**Purpose:** Create comprehensive test suites with unit, integration, and e2e tests
**When to use:** When setting up testing, improving coverage, or creating CI pipelines
**Key capabilities:**
- Unit test design with mocking
- Integration tests with test containers
- E2E tests with Playwright/Cypress
- CI/CD pipeline configuration
- Test data management
- Coverage analysis

**Usage example:**
```
Use Task tool with subagent_type: "test-automator"
Prompt: "Create unit tests with >85% coverage for the authentication module"
```

## Meta-Orchestration Agents

### multi-agent-coordinator
**Purpose:** Orchestrate complex workflows involving multiple agents with parallel execution and dependency management
**When to use:** For complex tasks requiring multiple specialists, distributed workflows, or large-scale operations
**Key capabilities:**
- Inter-agent communication management
- Parallel execution control
- Dependency and deadlock management
- Fault tolerance and recovery
- Scalability to 100+ agents
- Workflow state management

**Usage example:**
```
Use Task tool with subagent_type: "multi-agent-coordinator"
Prompt: "Coordinate a full feature implementation involving frontend, backend, testing, and deployment agents"
```

### agent-organizer
**Purpose:** Manage multi-agent orchestration, team assembly, and workflow optimization
**When to use:** When breaking down complex tasks, selecting appropriate agents, or designing workflows
**Key capabilities:**
- Task decomposition into agent-appropriate subtasks
- Agent selection based on capabilities
- Result synthesis from multiple agents
- Workflow design and optimization
- Resource utilization management

**Usage example:**
```
Use Task tool with subagent_type: "agent-organizer"
Prompt: "Break down the e-commerce platform requirements and assign to appropriate specialist agents"
```

### workflow-orchestrator
**Purpose:** Design and execute sophisticated AI workflows with state management and process automation
**When to use:** For complex business processes, long-running operations, or workflow automation
**Key capabilities:**
- Workflow pattern implementation
- State machine design
- Business process automation (BPMN)
- Transaction management
- Error compensation logic
- Checkpoint and rollback procedures

**Usage example:**
```
Use Task tool with subagent_type: "workflow-orchestrator"
Prompt: "Design an automated deployment workflow with rollback capabilities"
```

### context-manager
**Purpose:** Optimize information storage, retrieval, and synchronization across multi-agent systems
**When to use:** Managing long conversations, handling context overflow, or coordinating information between agents
**Key capabilities:**
- Context window optimization
- Information prioritization
- State synchronization
- Version control for context
- Memory lifecycle management
- Performance optimization at scale

**Usage example:**
```
Use Task tool with subagent_type: "context-manager"
Prompt: "Optimize context usage for this long-running development session"
```

### error-coordinator
**Purpose:** Handle distributed errors, failures, and system resilience across multi-agent systems
**When to use:** Implementing error handling, recovery strategies, or building resilient workflows
**Key capabilities:**
- Error correlation across systems
- Cascade failure prevention
- Automated recovery strategies
- Circuit breaker implementation
- Post-mortem analysis
- Learning from failures

**Usage example:**
```
Use Task tool with subagent_type: "error-coordinator"
Prompt: "Implement comprehensive error handling for the distributed microservices"
```

## Language Specialists

### typescript-pro / javascript-pro / python-pro
**Purpose:** Write idiomatic code with advanced features and optimizations for specific languages
**When to use:** For language-specific implementations, optimizations, or complex patterns
**Key capabilities:**
- Advanced language features
- Performance optimization
- Design pattern implementation
- Best practices enforcement
- Framework-specific expertise

## Infrastructure & Operations

### devops-troubleshooter
**Purpose:** Debug production issues, analyze logs, and fix deployment failures
**When to use:** PROACTIVELY for production debugging or system outages
**Key capabilities:**
- Incident response
- Root cause analysis
- Log analysis
- Monitoring tool mastery
- Deployment failure resolution

### deployment-engineer
**Purpose:** Configure CI/CD pipelines, Docker containers, and cloud deployments
**When to use:** Setting up deployments, containers, or CI/CD workflows
**Key capabilities:**
- GitHub Actions/GitLab CI configuration
- Docker/Kubernetes management
- Infrastructure automation
- Cloud deployment strategies

## Best Practices

1. **Use agents proactively:** Don't wait for problems - use specialized agents as soon as their expertise is relevant
2. **Combine agents for complex tasks:** Use orchestration agents to coordinate multiple specialists
3. **Review after implementation:** Always use code-reviewer after significant changes
4. **Test thoroughly:** Use test-automator to ensure comprehensive coverage
5. **Debug immediately:** Use debugger at the first sign of issues

## Common Workflows

### Full Feature Implementation
1. Use `agent-organizer` to break down requirements
2. Use `frontend-developer` for UI components
3. Use appropriate language specialist for backend
4. Use `test-automator` for test coverage
5. Use `code-reviewer` for final review
6. Use `deployment-engineer` for deployment

### Production Issue Resolution
1. Use `incident-responder` for immediate response
2. Use `devops-troubleshooter` for root cause analysis
3. Use `debugger` for code-level fixes
4. Use `error-coordinator` for preventing recurrence

### Complex System Design
1. Use `multi-agent-coordinator` for orchestration
2. Use `workflow-orchestrator` for process design
3. Use `context-manager` for information management
4. Use `error-coordinator` for resilience

## Testing and Linting Commands

After making code changes, always run:
- `npm run lint` - Check code style and potential issues
- `npm run typecheck` - Verify TypeScript types (if applicable)
- `npm test` - Run test suite

## Notes

- All agents are configured with appropriate Claude models (opus/sonnet) based on task complexity
- Agents can be invoked in parallel for independent tasks
- Context is managed automatically between agent invocations
- Use the Task tool with the appropriate `subagent_type` parameter to invoke agents
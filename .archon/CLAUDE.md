# Archon MCP Server Integration

This project uses **Archon MCP Server** for intelligent project and task management with RAG-powered knowledge retrieval.

## Quick Start

Archon is automatically configured and ready to use through MCP tools. No manual setup required.

## Core Capabilities

### 1. Project Management
```
- Create, update, and organize projects
- Track project features and milestones
- Version control for project artifacts
- GitHub repository integration
```

### 2. Task Management
```
- Granular task breakdown (feature-specific or codebase-wide)
- Task status workflow: todo → doing → review → done
- Smart task filtering and search
- Priority-based task ordering
```

### 3. RAG-Powered Knowledge Base
```
- Search documentation with semantic understanding
- Find relevant code examples
- Full-page content retrieval
- Multi-source knowledge aggregation
```

### 4. Document Management
```
- PRD (Product Requirement Documents)
- Technical specifications
- Design documents
- API documentation
- Implementation guides
```

## Workflow Integration

### For Implementation Agents
When working on features:
1. **Find active task**: Use `find_tasks(filter_by="status", filter_value="todo")`
2. **Update status**: Use `manage_task("update", task_id="...", status="doing")`
3. **Research phase**: Use `rag_search_knowledge_base(query="...", match_count=5)`
4. **Mark for review**: Use `manage_task("update", task_id="...", status="review")`

### For Research Agents
When gathering information:
1. **Check available sources**: Use `rag_get_available_sources()`
2. **Search specific docs**: Use `rag_search_knowledge_base(query="keywords", source_id="src_xxx")`
3. **Get full content**: Use `rag_read_full_page(page_id="...")`
4. **Search code examples**: Use `rag_search_code_examples(query="...")`

### For Project Planning
When starting new features:
1. **Create project**: Use `manage_project("create", title="...", description="...")`
2. **Add tasks**: Use `manage_task("create", project_id="...", title="...", description="...")`
3. **Track features**: Use `get_project_features(project_id="...")`
4. **Version snapshots**: Use `manage_version("create", project_id="...", field_name="docs")`

## Best Practices

### RAG Query Guidelines
- **Keep queries SHORT and FOCUSED** (2-5 keywords)
- ✅ Good: "React useState", "FastAPI middleware", "vector pgvector"
- ❌ Bad: "how to implement user authentication with JWT tokens in React"

### Task Granularity
- **Feature-specific projects**: Create detailed implementation tasks
- **Codebase-wide projects**: Create feature-level tasks
- Each task should represent 30 minutes to 4 hours of work

### Task Status Flow
```
todo → doing → review → done
```
- Only ONE task in 'doing' status at a time
- Use 'review' for completed work awaiting validation
- Mark 'done' only after full verification

## Configuration

Archon configuration is stored in `.archon/config.json`:
- Server endpoint and connection settings
- RAG retrieval parameters (match count, return mode)
- Default task and project settings
- Document type preferences

## Available MCP Tools

### Project Management
- `find_projects()` - List and search projects
- `manage_project(action, ...)` - Create/update/delete projects
- `get_project_features(project_id)` - Get project features

### Task Management
- `find_tasks(query=None, filter_by=None, ...)` - Search and filter tasks
- `manage_task(action, task_id=None, ...)` - Create/update/delete tasks

### Knowledge Base
- `rag_get_available_sources()` - List available documentation sources
- `rag_search_knowledge_base(query, source_id=None, ...)` - Semantic search
- `rag_search_code_examples(query, ...)` - Find code examples
- `rag_read_full_page(page_id=None, url=None)` - Get full page content
- `rag_list_pages_for_source(source_id)` - Browse source pages

### Document Management
- `find_documents(project_id, ...)` - Search project documents
- `manage_document(action, project_id, ...)` - Create/update/delete docs

### Version Control
- `find_versions(project_id, ...)` - View version history
- `manage_version(action, project_id, ...)` - Create/restore versions

## Integration with TDD Workflow

Archon integrates seamlessly with the collective's TDD methodology:

1. **Research Phase**: Use RAG to find documentation and examples
2. **Planning Phase**: Create tasks and break down work
3. **Implementation Phase**: Track progress through task status updates
4. **Validation Phase**: Document results and mark tasks complete

## Server Health

Check Archon server status:
- `health_check()` - Server health and uptime
- `session_info()` - Active sessions and configuration

---

**Note**: Archon MCP server must be running for these features to work. Contact your system administrator if you encounter connection issues.

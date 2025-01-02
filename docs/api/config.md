## Config
- Name:
- Runtime: List of runtimes
- Typescript: Boolean


```yaml
# Builtins are left with basic names
name: 'MyTemplate'
runtime: 
  - deno
  - node
typescript: true
tools:
  - esbuild
  - prettier
  - name: drizzle
    # Import can be a URL, path, Github (gh:foo/bar), or JS package (js:@foo/bar)
    import: "js:@example/drizzle"
    options:
      db: postgres
  
questions:
  - name: name
    question: 'What is the name of the project'
  - typescript

# Shell script for create
# 
# For more programmatic options, see JS API
# 
# You can use go templates
create: >-
  {{ packageManager }} install esbuild
```
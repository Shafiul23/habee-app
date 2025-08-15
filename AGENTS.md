# AGENTS

This repository contains a Python backend and a React Native frontend.

## Workflow
- Run `./run_tests.sh` before committing to ensure backend (`pytest`) and frontend (`npm test`) suites pass.
- Add tests when modifying or adding features.
- Avoid committing `package-lock.json` or other lockfiles.
- Use `rg` for searching through the codebase instead of `grep -R` or `ls -R`.

## Pull Requests
- Use concise commit messages summarizing changes.
- PR descriptions should include a summary of changes and the commands run in the testing section.

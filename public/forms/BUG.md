#! id= bug

->start

# 🐞 Bug Report

Use when a feature is not behaving as you expected.

---
description*= TextInput(
    | question = What happened?
    | description = A clear and concise description of what the bug is
    | multiline
    | maxlength = 500
)
---
reproduction*= TextInput(
    | question = How is the bug reproduced?
    | description = Simple steps to make the bug happen again.
    | multiline
    | maxlength = 500
)
---
expectation*= TextInput(
    | question = What did you expect to happen?
    | description = A clear and concise description of what you expected to happen..
    | multiline
    | maxlength = 500
)
---
#! id= bug
#! post-url = /api/bug

->start

# 🐞 Bug Report

Use this when a feature is not behaving as you expected.

---
issueTitle*= TextInput(
    | question = Title?
    | description = What's the title of your bug report?
    | maxlength = 120
)
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
logs = FileInput(
  | question = Upload your Log File
  | description = We'll need a Log File to file this bug report.
)

More information on locating your log files can be found [on our wiki](https://wiki.resonite.com/Log_files).
---
screenshots = FileInput(
  | question = Do you have any reproduction screenshots?
  | description = If they help explain your bug upload them please!
)
---
reproductionItem = TextInput(
    | question = Do you have a reproduction Item?
    | description = Describe how to access the item. Url?, World?, Public Folder, ResRec Link?
    | multiline
    | maxlength = 500
)
---
additionalContext = TextInput(
    | question = Do you have a reproduction Item?
    | description = Describe how to access the item. Url?, World?, Public Folder, ResRec Link?
    | multiline
    | maxlength = 500
)
---

-> end

# Thanks for providing Feedback, dingus!
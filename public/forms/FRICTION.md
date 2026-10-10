#! id= friction
#! post-url = /api/friction

#! slide-controls = show
#! submit-button-text = Next
#! vertical-alignment = start
#! field-size = lg
#! restart-button = show

->start

# 🧱 Friction Point Observation

Use this when you observed a friction point when using Resonite, either for yourself or for another user - e.g. something that was particularly difficult or you did not figure out how to achieve.

**IMPORTANT:** This report is **NOT** a place to vent. Keep the report objective and **free of emotion** - otherwise it will be closed immediately.

To learn more about this issue type, [check the document & video here!](https://github.com/Yellow-Dog-Man/Resonite-Issues/blob/main/OBSERVATION_ISSUES.md)

⚠️ Information entered into this form, will be submitted to our [📢Public Issue Tracker](github.com/Yellow-Dog-Man/Resonite-Issues)!

---
issueTitle*= TextInput(
    | question = Title?
    | description = What's the title of your friction point observation?
    | maxlength = 120
    | autofocus
)
---
goal*= TextInput(
    | question = What were you trying to do?
    | description = Describe at high level what were you trying to do in Resonite (e.g. "find other users", "create a snapper on avatar", "setup full body")
    | multiline
    | maxlength = 500
    | autofocus
)
---
steps*= TextInput(
    | question = What have you tried to achieve the task?
    | description = What steps, tools or pieces of UI did you try to use in order to achieve your task?
    | multiline
    | maxlength = 500
    | autofocus
)
---
frictionPoint*= TextInput(
    | question = What did you get stuck on or what was difficult?
    | description = Describe which part of the process was the friction point of the task - that is either you could not achieve your task at all, or it was too difficult to figure it out.
    | multiline
    | maxlength = 500
    | autofocus
)
---
workingPoint = TextInput(
    | question = What parts (if any) of the process were easy and worked well?
    | description = It can help us understand if there are parts of the process that actually did work well for you when trying to achieve your task.
    | multiline
    | maxlength = 500
    | autofocus
)

---
relatedIssues = TextInput(
    | question = Related bugs / feature requests
    | description = Are there any reported bugs or feature requests that are related to this friction point? If so, you can include links to them here for context.
    | multiline
    | maxlength = 500
    | autofocus
)
---
reporter = TextInput(
    | question = Reporters
    | description = Usernames / Discord handles of anyone (including yourself) who has observed or experienced this friction point (will be used to credit in release notes if we end up making changes based on this report).
    | multiline
    | maxlength = 120
    | autofocus
)

⚠️ DO NOT INCLUDE E-Mail Addresses
This question is *optional*, however if you do not fill it in, we might not be able to credit you or contact you for more information.

---

-> end

# Thanks for providing Feedback!

We hope to see you again soon!
#! id= feature
#! post-url = /api/feature

#! slide-controls = hide
#! submit-button-text = Next
#! vertical-alignment = start
#! field-size = lg
#! restart-button = show

->start

# 💡 Feature Request

Use this when you want to request a feature for consideration.

⚠️ WE ARE IN TESTING MODE, THIS FORM INPUT WILL NOT BE SAVED.

---
issueTitle*= TextInput(
    | question = Title?
    | description = What's the title of your feature request?
    | maxlength = 120
    | autofocus
)
---
problem*= TextInput(
    | question = Describe the problem your feature would solve
    | description = A clear and concise description of what the problem is. Eg. I'm always frustrated when...
    | multiline
    | maxlength = 500
    | autofocus
)
---
solution*= TextInput(
    | question = Describe the solution you'd like
    | description = A clear and concise description of what you want to happen.
    | multiline
    | maxlength = 500
    | autofocus
)
---
alternatives*= TextInput(
    | question = Describe alternatives you've considered
    | description = A clear and concise description of any alternative solutions considered.
    | multiline
    | maxlength = 500
    | autofocus
)
---
additionalContext = TextInput(
    | question = Additional Context
    | description = Anything else you think might help us
    | multiline
    | maxlength = 500
    | autofocus
)
---
reporter = TextInput(
    | question = How can we contact & credit you?
    | description = Describe how we can contact you if we need more information and how to credit you on the changelogs.
    | multiline
    | maxlength = 500
    | autofocus
)

⚠️ DO NOT INCLUDE E-Mail Addresses
This question is *optional*, however if you do not fill it in, we might not be able to work on your issue and we may have to close it.

---

-> end

# Thanks for providing feedback!

We hope to see you again soon!
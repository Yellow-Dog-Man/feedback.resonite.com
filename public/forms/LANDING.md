#! post-url = /api/landing

#! slide-controls = show
#! submit-button-text = Next
#! vertical-alignment = start
#! field-size = sm
#! restart-button = show

# [.text-center] Want to give us feedback?

[.text-center]
We appreciate it all!

---

happiness* = PictureChoice(
    | question = Did you enjoy Resonite today?
    | description = This question is always anonymous
    | choices = "yes" Yes && /images/Icons/Bouba.png, "no" No && /images/Icons/Kiki.png
)

---

more* = ChoiceInput(
  | question = Do you want to tell us more?
  | choices = "yes" Yes, "no" No
)

---
-> more == "yes"

type* = ChoiceInput(
    | question = What type of feedback do you have?
    | choices = "text" 📝 Text, "bug" 🐞 Bug, "featureRequest" 💡 Feature Request, "moderation" 🚨 Moderation Issue, "security" 🔐 Security Issue
)

---
-> type == "text"

### ⚠️ If your feedback is regarding a Moderation issue, it will be forwarded to Moderation.

feedback*= TextInput(
    | question = What's your feedback?
    | description = Tell us whatever you want, it's anonymous!"
    | multiline
    | maxlength = 1000
)

---
-> end

# [.text-center] Thank you for your Feedback!

[.text-center]
We hope to see you again soon!

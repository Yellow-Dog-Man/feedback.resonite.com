#! button-alignment = center
#! slide-controls = hide
#! submit-button-text = Next
#! post-url = /api/landing

# [.text-center] Want to give us feedback?

[.text-center]
We appreciate it all!

---

happinessScore* = PictureChoice(
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
    | choices = "text" Text, "bug" Bug, "featureRequest" Feature Request, "moderation" Moderation Issue
)

![](https://www.youtube.com/embed/pLtscOCyfPU)

---
-> type == "text"
reproduction*= TextInput(
    | question = What's your feedback?
    | description = Tell us whatever you want, it's anonymous!"
    | multiline
    | maxlength = 1000
)

### ⚠️ If your feedback is regarding a Moderation issue, it will be forwarded to Moderation.

---
-> end

# [.text-center] Thank you for your Feedback!

[.text-center]
We hope to see you again soon!

![](https://www.youtube.com/embed/pLtscOCyfPU)

<iframe width="420" height="315"
src="https://www.youtube.com/embed/pLtscOCyfPU">
</iframe>





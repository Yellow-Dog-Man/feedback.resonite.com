#! post-url = /api/survey/cheese

#! slide-controls = show
#! submit-button-text = Next
#! vertical-alignment = start
#! field-size = sm
#! restart-button = show

# [.text-center] Secret survey!

[.text-center]
Prime didn't think you'd find this! Its just for testing right now

---

enjoyResonite* = PictureChoice(
    | question = Did you enjoy Resonite today?
    | description = This question is always anonymous
    | choices = "yes" Yes && /images/Icons/Bouba.png, "no" No && /images/Icons/Kiki.png
    | required
)

---

sessionLength* = PictureChoice(
    | question = Did you spend more than an hour in Resonite today?
    | description = This question is always anonymous
    | choices = "yes" Yes && /images/Icons/Bouba.png, "no" No && /images/Icons/Kiki.png
    | required
)

---
meetPerson* = PictureChoice(
    | question = Did you meet someone new in Resonite today?
    | description = This question is always anonymous
    | choices = "yes" Yes && /images/Icons/Bouba.png, "no" No && /images/Icons/Kiki.png
)
---
buildObject* = PictureChoice(
    | question = Did you build or create something in Resonite today?
    | description = This question is always anonymous
    | choices = "yes" Yes && /images/Icons/Bouba.png, "no" No && /images/Icons/Kiki.png
)
---
useProtoFlux* = PictureChoice(
    | question = Did you use ProtoFlux today?
    | description = This question is always anonymous
    | choices = "yes" Yes && /images/Icons/Bouba.png, "no" No && /images/Icons/Kiki.png
)
---
attendEvent* = PictureChoice(
    | question = Did you attend an event today?
    | description = This question is always anonymous
    | choices = "yes" Yes && /images/Icons/Bouba.png, "no" No && /images/Icons/Kiki.png
)
---
-> end

# [.text-center] Thank you for your Feedback!

[.text-center]
This form doesn't do anything right now, we're experimenting



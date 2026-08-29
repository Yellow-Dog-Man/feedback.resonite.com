import './style.css';
import "formsmd/dist/css/formsmd.min.css";
import { Composer, Formsmd } from "formsmd";

const formId ="form";
const composer = new Composer({
  id: formId,
  postUrl: "/api/onboard",
});

composer.startSlide({
  buttonAlignment: "center"
});

composer.h1("Want to give us feedback?", {
  classNames: ["text-center"]
});
composer.p("We appreciate it all.", {
  classNames: ["text-center"]
});

//TODO: Produced video about feedback, from the whole team.
// Script/Pitch: IM PRIME AND I WANT YOUR FEEDBACK -> Points at center of the screen
// I"M SPARTACUS and I WANT YOUR FEEDBACK -> Points at the center of the screen
// I'M RUSTY and I WANT YOUR FEEDBACK -> ROBOT LASERS, MELT THE SCREEN > CHARGE THE BUTTON > FLY OFF.
// Chroma.. key video so it plays as though the  video is infront of the website, there's this old lecture I can't find where a professor does 
// this as a bit and fights his powerpoints. It was made eons ago.
// Randomize the video, Random Team member each time/day
composer.slide({
  buttonAlignment: "end"
});

composer.pictureChoice("resoniteHealthScore", {
  question: "Did you enjoy Resonite today?",
  description: "This question is always anonymous!",
  name:"happiness",
  choices: [
    { label: "", value: "yes", image: "/images/Icons/Bouba.png" }, // Bouba -> 1
    { label: "", value: "no", image: "/images/Icons/Kiki.png" }, // KiKi -> -1

    //TODO: make this mean "YES IT MADE ME VERY HAPPY TODAY".
    //TODO: If we make this 4 or 5 items long(memes), we can just use 1 - 5 ratings, mathematics on those is easily applied.
    //{ label: "", value: "", image: "/images/Icons/Gloopie.png" }, // Gloopie -> 2??
  ],
  required: true,
  slideControls: "hide"
});

composer.slide({
  buttonAlignment: "end"
});

composer.choiceInput("more", {
  question: "Do you want to tell us more about this?",
  choices: ["Yes", "No"],
  required: true,
});

const wantsToProvideMoreInfoCondition = "more == 'Yes'";
const wantsToBailCondition = "more == 'No'";

composer.slide({
  jumpCondition: wantsToBailCondition
})

composer.h1("That's OK!");
composer.p("We appreciate your feedback and will use it to improve our service.");

composer.endSlide({});
//TODO: VIDEO FROM THE TEAM, SAYING THANK YOU

// IF NO, skip to end and emit Resonite Happiness Score to API. 
// IF Yes, Go to the bug report flow. 
// 
//TODO: This is now an very simple tool that can easily be expanded to conform to the GitHub form for issues Identically.
// How to finish this:
// Backend is easy to write and demonstrates no logging and no other data about who you are except for the happiness score and when it was recorded (Time)
// However we can now display it with our own style, branding and energy. 
// Everything we need is already here.
// You want a log file: https://docs.forms.md/input-types/file-input , MANDATE it by setting "required:true", 
// You want to redact your log files to make your issue more privacy conscious in this modern world, cool wire in: https://github.com/XDelta/LogRedactor
// You want to redirect your output to a new Git management service, for some reason?, THE USER FLOW DOES NOT CHANGE
 
// Initialize with template, container, and options
const formsmd = new Formsmd(
  composer.template,
  document.getElementById(formId),
  {
    colorScheme: "dark",
    // TODO: Want better theming? We can spend $99 per site: https://forms.md/pricing/ for the entire lifetime of this site.
    themeLight: {
      accent: "#353148",
      accentForeground: "#e2d2b6",
      backgroundColor: "#e2d2b6",
      color: "#353148"
    },
    themeDark: {
      accent: "#e1e1e0",
      accentForeground: "#353148",
      backgroundColor: "#11151d",
      color: "#FFF"
    },
    postHeaders: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    fontSize: "lg"
  },
);
formsmd.init();

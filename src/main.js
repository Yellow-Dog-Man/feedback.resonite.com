import './style.css';
import "formsmd/dist/css/formsmd.min.css";
import { Composer, Formsmd } from "formsmd";

const formId ="form";
const composer = new Composer({
  id: formId,
  postUrl: "/api/onboard",
});

// Choice input for position
composer.choiceInput("position", {
  question: "What's your position?",
  choices: ["Product Manager", "Software Engineer", "Founder", "Other"],
  required: true,
});
 
// Text input if user selects "Other" position
composer.textInput("positionOther", {
  question: "Other",
  required: true,
  labelStyle: "classic",
  displayCondition: {
    dependencies: ["position"],
    condition: "position == 'Other'",
  },
});
 
// Start new slide, progress indicator at 50%
composer.slide({
  pageProgress: "50%",
});
 
// Choice input for how user discovered the product
composer.choiceInput("referralSource", {
  question: "How did you hear about us?",
  choices: ["News", "Search Engine", "Social Media", "Recommendation"],
  required: true,
});
 
// Start new slide, show only if user was recommended, progress indicator at 75%
composer.slide({
  jumpCondition: "referralSource == 'Recommendation'",
  pageProgress: "75%",
});
 
// Email input for recommender email address
composer.emailInput("recommender", {
  question: "Who recommended you?",
  description:
    "We may be able to reach out to them and provide a discount for helping us out.",
});
 
// Initialize with template, container, and options
const formsmd = new Formsmd(
  composer.template,
  document.getElementById(formId),
  {
    colorScheme: "dark",
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
  },
);
formsmd.init();

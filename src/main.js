import './style.css';
import "formsmd/dist/css/formsmd.min.css";
import { Composer, Formsmd } from "formsmd";
import BUG from '../public/forms/BUG.md?raw';



const standardFormOptions = {
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
};

// Initialize with template, container, and options
const formsmd = new Formsmd(
  BUG,
  document.getElementById(formId),
  standardFormOptions,
);

formsmd.init();

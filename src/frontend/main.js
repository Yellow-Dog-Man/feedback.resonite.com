import './../style.css';
import "formsmd/dist/css/formsmd.min.css";
import { Formsmd } from "formsmd";
import LANDING from '../../public/forms/LANDING.md?raw';

//
const formsmd = new Formsmd(
  LANDING,
  document.getElementById('form'),
  standardFormOptions,
);

formsmd.init();

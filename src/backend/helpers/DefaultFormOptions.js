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
    // We have A state store at home, you don't need to write your own
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
  fontSize: "lg",
  saveState: false,
  errorMessageKey: "detail"
};

export default standardFormOptions;
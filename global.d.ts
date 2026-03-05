declare module "*.jsx" {
  var _: () => any;
  export default _;
}

// Allow side-effect imports for CSS/images used by third-party libs (react-pdf, etc.)
declare module "*.css";
declare module "*.module.css";
declare module "*.svg";
declare module "*.png";
declare module "*.jpg";
declare module "*.jpeg";


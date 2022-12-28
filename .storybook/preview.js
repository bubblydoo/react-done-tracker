import './global.css';

export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
  controls: { exclude: /(?:^on[A-Z].*|doneTracker|fullscreen|children)/ },
  layout: 'fullscreen'
}

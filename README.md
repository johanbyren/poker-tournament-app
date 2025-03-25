# React + TypeScript + Vite

To run local: `npm run dev`

CSS style taken from: https://cs16.samke.me/

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
export default tseslint.config({
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

- Replace `tseslint.configs.recommended` to `tseslint.configs.recommendedTypeChecked` or `tseslint.configs.strictTypeChecked`
- Optionally add `...tseslint.configs.stylisticTypeChecked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and update the config:

```js
// eslint.config.js
import react from 'eslint-plugin-react'

export default tseslint.config({
  // Set the react version
  settings: { react: { version: '18.3' } },
  plugins: {
    // Add the react plugin
    react,
  },
  rules: {
    // other rules...
    // Enable its recommended rules
    ...react.configs.recommended.rules,
    ...react.configs['jsx-runtime'].rules,
  },
})
```

# TODO and known bugs

## 📝 TODO: 
- [ ] Implement table for timetracking and raise. Values most be possible to edit. 


## Poker Tournament App

This application helps manage a poker tournament.  It allows you to set up key tournament parameters, such as:

* Number of players
* Buy-in amount
* Blind structure (small blind, big blind, and level duration)
* Breaks
* Prize distribution

The app provides two main pages:

* **Settings Page:** Configure all the tournament parameters.
* **Tournament Page:**  (TODO: Implement) View the current tournament state, including blind levels, remaining players, and prize pool distribution.

To use the application, navigate between the Settings and Tournament pages (once implemented) to configure and then run your tournament.

## 🐞 Kända Buggar
1. **Page crash if you add more then 50 players**
   - **Desription:** Something wrong with the code when adding more then 50 players on SettingsPage.
   - **Status:** -.
   - **Possible solution:** Check the function calculatePrizeProportions. We want to calculate the prizepool for every 10th player.

2. **Page crash if you delete or change number of players or buy in with keyboard**
   - **Desription:** We calculate the values on every change of the numbers, so it cant handle wierd* numbers. 
   - **Status:** -.
   - **Possible solution:** Check the function calculateTotalPrizePool. 


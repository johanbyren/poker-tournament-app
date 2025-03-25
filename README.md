# Poker Tournament App

This application is designed to manage a poker tournament. It allows users to set up tournament parameters such as the number of players, buy-in amount, blind levels, and prize distribution.  The app then displays relevant tournament information based on these settings.

## Key Features:

* **Tournament Settings:** Configure the tournament parameters including:
    * Number of players
    * Buy-in amount
    * Blind levels (duration and increments)
    * Prize structure (percentage distribution)
* **Tournament Information:** View calculated tournament information such as:
    * Total prize pool
    * Prize amounts for each placing
    * Blind level schedule

## How to Use:

1. **Run the app:** `npm run dev`
2. **Navigate to the Settings Page:**  Input the desired tournament settings.
3. **Navigate to the Tournament Page:** View the generated tournament information.


# TODO and known bugs

## 📝 TODO: 
- [ ] Implement table for timetracking and raise. Values most be possible to edit. 
- [ ] Implement the Tournament page and make it possible to change to it. 
- [ ] Transfer the values from Setting page to Tournament page. 


## 🐞 Kända Buggar
1. **Page crash if you add more then 50 players**
   - **Desription:** Something wrong with the code when adding more then 50 players on SettingsPage.
   - **Status:** -.
   - **Possible solution:** Check the function calculatePrizeProportions. We want to calculate the prizepool for every 10th player.

2. **Page crash if you delete or change number of players or buy in with keyboard**
   - **Desription:** We calculate the values on every change of the numbers, so it cant handle wierd* numbers. 
   - **Status:** -.
   - **Possible solution:** Check the function calculateTotalPrizePool. 


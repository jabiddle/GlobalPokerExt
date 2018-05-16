# GlobalPokerExt
> A Chrome extension that adds statistic gathering and useful multi-tabling features to the GlobalPoker site.

## Developer's Note

This project contains the very first lines of JavaScript I ever wrote. Put simply, it was useful to me as a way to learn about JavaScript and the DOM. The code could use some serious refactoring and several features are left half implemented in the source. That said, it does work as of May 16, 2018 for both Gold and SweepsCash games with only minor bugs. 

Eventually the project will be refactored with much cleaner code so don't forget to hit Watch!

## Features

All usable features are controllable with buttons or checkbox options that integrate seamlessly with the table interface.

Added control buttons, top right
- Run/Pause button that controls the bot.
- Square button toggles the statistic display.

Added checkbox options, bottom left.
- Autofold: List of foldable hands can be found at the beginning of the source code.
- Screen blocker: Cover's the screen while autofold is running and flashes to tell you that you have a playable hand. Great for multitabling, only play the hands you want to play and let the bot do the rest!

Statistic Display: The statistics are hardcoded. The first line shows average bets for preflop, flop, turn, and river. The second line shows cumulative fold percentage for preflop, flop, turn, and river. Quickly identify agressive players with low fold percentages or tight players with high fold percentages!

![Example Usage](http://jabiddle.com/images/github/globalpoker_multitable.png)

## Installation

This extension is not available in the Chrome Web Store. 

To install:
- Enable developer mode in chrome
- Go to "Manage Extensions"
- Click "Load unpacked extension"
- Select the root folder of this project

The extension will automatically be injected the next time you join a GlobalPoker table!

## License
[![GitHub license](https://img.shields.io/github/license/jabiddle/vec2.svg)](https://github.com/jabiddle/vec2/blob/master/LICENSE)

- This project is licensed under the MIT license. 
- Feel free to fork it, copy it, and modify it however you see fit.
- Send me an email if you do anything cool with it!

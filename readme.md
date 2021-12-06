# Description

Bot's playing the the Game Love Letter and the result is exported into a json file.

See game here: [BoardGameGeek](https://boardgamegeek.com/boardgame/129622/love-letter)

Run a simulation:
```javascript
    npm play
```

View the last game on localhost:3000. Run:
```javascript
    npm view
```

If you want to create your own bot, create a new Brain:
```javascript
// MyBrain.js
class MyBrain extends Brain {
    process(me, others, hand, turns) {
        // Put your code in here.
        // Maybe start with the "OreganoBrain" in Brain.js. It has already a lot of the
        // ruleset of the game implemented.
    
        return {
            card: 1,
            on: 0,
            has: 8
        }
    }
}
```

and put it into a player
```javascript
// index.js
const myBrain = new MyBrain();
const p4 = new Player("MyPlayer", myBrain, gen);
dealer.addPlayer(p4);
```

## Todos
- [ ] Write & load Replay into a DB


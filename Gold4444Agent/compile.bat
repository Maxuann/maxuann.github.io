start /b lessc --clean-css css\main.less css\main.css

start /b uglifyjs js\load.js js\time.js js\utils.js js\main.js -m -o js\main.min.js
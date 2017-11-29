var fs = require('fs')
var files = fs.readdirSync('tests/')


files.forEach(file => {
  fs.readFile('tests/' + file, 'utf8', function (err, data) {
    if (err) {
      return console.log(err)
    }
    var result = data.replace(/@watch/g, '')

    fs.writeFile('tests/' + file, result, 'utf8', function (err) {
      if (err) return console.log(err)
    })
  })
})

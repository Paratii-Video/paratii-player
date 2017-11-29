var fs = require('fs')
var files = fs.readdirSync('tests/')

console.log(files)

files.forEach(file => {
  fs.readFile('tests/' + file, 'utf8', function (err, data) {
    console.log(data)
    if (err) {
      return console.log(err)
    }
    var result = data.replace(/@watch/g, '')

    fs.writeFile('tests/' + file, result, 'utf8', function (err) {
      if (err) return console.log(err)
    })
  })
})

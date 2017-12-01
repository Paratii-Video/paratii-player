var fs = require('fs')
var files = fs.readdirSync('tests/')

files.forEach(file => {
  fs.readFile('tests/' + file, 'utf8', function (err, data) {
    if (fs.lstatSync('tests/'+ file).isFile()) {
      if (err) {
        return console.log(err)
      }
      var result = data.replace(/ @watch/g, '').replace(/@watch/g, '')

      fs.writeFile('tests/' + file, result, 'utf8', function (err) {
        if (err) {
          console.log(err)
        }
      })
    }
  })
})

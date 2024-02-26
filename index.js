var express = require('express')
var cors = require('cors')
var XLSX = require('xlsx')
require('dotenv').config()
var supabase = require('./supabase')
var app = express()

var sheetData = {}

app.use(express.json())

app.use(
  cors({
    origin: '*',
  })
)

app.get('/', (req, res) => {
  res.send('Hello')
})

app.post('/component', (req, res) => {
  const description = req.body.description

  const component = getCobieComponentByDescription(description)

  if (component.length === 0 || !component) {
    return res.status(404).json({ msg: 'Not Found' })
  }

  res.json({ component })
})

app.get('/process/:id', async (req, res) => {
  const id = req.params.id
  // Now you can use the id parameter as needed
  console.log('Received ID:', id)

  const { data, error } = await supabase.storage
    .from(process.env.STORAGE_BUCKET)
    .download(`cobie/${id}.xlsx`)

  console.log({ data, error })

  workbook = XLSX.read(await data.arrayBuffer(), { type: 'array' })

  workbook.SheetNames.forEach(async (sheet) => {
    sheetData[sheet] = XLSX.utils.sheet_to_json(workbook.Sheets[sheet])
  })

  console.log({ sheetData })

  // You can send back a response or do any processing here
  res.json({ msg: `Received ID: ${id}` })
})

const PORT = process.env.PORT || 3001

app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`)
})

function getCobieComponentByDescription(description) {
  const componentsList = sheetData['Component']

  const component = componentsList.filter(({ Description }) => {
    return Description === description
  })

  component.forEach((component) => {
    component.Type = getCobieTypeByName(component.TypeName)
    component.Spaces = []

    const componentSpacesArray = component.Space.split(', ')

    componentSpacesArray.forEach((spaceIdentifier) => {
      const cobieSpace = getCobieSpacesByName(spaceIdentifier)

      if (!cobieSpace) return

      component.Spaces.push(cobieSpace)
    })
  })

  return component
}

function getCobieTypeByName(name) {
  const typeList = sheetData['Type']

  const type = typeList.find((type) => type.Name === name)

  return type
}

function getCobieSpacesByName(name) {
  const spaceList = sheetData['Space']

  const space = spaceList.find((space) => space.Name === name)

  return space
}

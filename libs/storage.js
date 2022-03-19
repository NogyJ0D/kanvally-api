const { Storage } = require('@google-cloud/storage')
const { Readable } = require('stream')
const { bucketName } = require('../config')

const storage = new Storage({
  keyFilename: 'credentials-gcloud.json'
})

const uploadFile = (filename, buffer) => {
  const file = storage.bucket(bucketName).file(filename)

  const stream = Readable.from(buffer)

  stream.pipe(file.createWriteStream())
    .on('finish', () => {
      console.log('El archivo fue cargado exitosamente.')
    })
    .on('error', (err) => {
      console.log(err)
    })
}

module.exports = { uploadFile }

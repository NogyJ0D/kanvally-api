const { Storage } = require('@google-cloud/storage')
const { Readable } = require('stream')
const { bucketName } = require('../config')
const uuid = require('uuid')
const path = require('path')

const storage = new Storage({ keyFilename: 'credentials-gcloud.json' })

const uploadFile = (filename, buffer) => {
  const ext = path.extname(filename)
  const uuidFileName = uuid.v4() + ext

  const file = storage.bucket(bucketName).file(uuidFileName)
  const stream = Readable.from(buffer)

  return new Promise((resolve, reject) => {
    stream
      .pipe(file.createWriteStream())
      .on('finish', () => {
        resolve({
          uploaded: true,
          message: 'El archivo fue cargado exitosamente.'
        })
      })
      .on('error', (err) => {
        const error = { fail: true, err }
        reject(error)
      })
  })
}

const downloadFile = (fileName, res) => {
  const file = storage.bucket(bucketName).file(fileName)

  const stream = file.createReadStream()

  stream.pipe(res)
    .on('finish', () => {
      console.log({
        uploaded: true,
        message: 'El archivo fue descargado exitosamente.'
      })
    })
    .on('error', (err) => {
      console.log({ fail: true, err })
    })
}

module.exports = { uploadFile, downloadFile }

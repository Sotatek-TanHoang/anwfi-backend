'use strict'

const Helpers = use('Helpers')
const Drive = use('Drive');
const HelperUtils = use('App/Common/HelperUtils');
const Const = use('App/Common/Const');
const path = require('path')
const fs = require('fs')

class FileController {
  async uploadAvatar({request}) {
    try {
      const validationOptions = {
        types: ['image'],
        size: Const.FILE_SITE,
        extnames: Const.FILE_EXT
      };

      const profilePic = request.file('avatar', validationOptions);
      console.log(profilePic);
      const timeStamp = Date.now();
      // const fileName = timeStamp + '_' + (HelperUtils.randomString(10)).replace(/\s/g, '_');
      const fileName = timeStamp + '_' + (await HelperUtils.randomString(15)) + '.' + (profilePic.extname || 'txt');

      console.log('[uploadFile] - fileName: ', fileName, profilePic.extname);
      await profilePic.move(Helpers.tmpPath('uploads'), {
        name: fileName,
        overwrite: true
      });
      if (!profilePic.moved()) {
        return profilePic.error()
      }

      const path = '/image/' + fileName;
      return HelperUtils.responseSuccess({ path });
    } catch (e) {
      console.log(e);
      return HelperUtils.responseErrorInternal('ERROR: Update avatar fail !');
    }
  }

  async getImage({response, params}) {
    try {
      const filePath = `uploads/${params.fileName}`;
      const isExist = await Drive.exists(filePath);
      if (isExist) {
        return response.download(Helpers.tmpPath(filePath));
      }
      return 'File does not exist';
    } catch (e) {
      console.log(e);
      return HelperUtils.responseErrorInternal('ERROR: Get image fail !');
    }
  }

  async uploadToS3 ({request}) {
    try {

      const validationOptions = {
        types: ['image'],
        size: Const.FILE_SITE,
        extnames: Const.FILE_EXT
      };

      const fileIcon = request.file('avatar', validationOptions);
      // console.log(profilePic);
      // Create a random name for file
      const randomName = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
      const fileName = `${randomName}_${Date.now()}.${fileIcon.subtype}`

      // Sets the path and move the file
      const filePath = `${path.resolve(`./tmp`)}/${fileName}`
      await fileIcon.move(Helpers.tmpPath(), { name: fileName, overwrite: true })


      // Creates a readable stream from file and stores its size
      const fileStream = await fs.createReadStream(filePath)
      const fileSize = await fileIcon.stream.byteCount

      // Uploads the file to Amazon S3 and stores the url
      await Drive.put(fileName, fileStream, { ContentType: `${fileIcon.type}/${fileIcon.subtype}` })
      const fileUrl = await Drive.getUrl(fileName)
      // Destroy the readable stream and delete the file from tmp path
      await fileStream._destroy()
      await Drive.disk('local').delete(filePath)

      return HelperUtils.responseSuccess({
        name: fileName,
        size: fileSize,
        url: fileUrl
      });
    } catch (error) {
      return error;
    }

  }

}

module.exports = FileController

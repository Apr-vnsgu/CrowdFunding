import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ProjectService } from './project.service';
import { diskStorage } from 'multer';
import { readFileSync } from 'fs';

@Controller('project')
export class ProjectController {
  constructor(private projectService: ProjectService) {}
  @Post('/upload')
  @UseInterceptors(
    FilesInterceptor('file', null, {
      storage: diskStorage({
        destination: './files',
        filename: (req, file, callback) => {
          callback(null, file.originalname);
        },
      }),
    }),
  )
  async uploadFile(
    @UploadedFiles()
    file: Express.Multer.File,
  ) {
    const a = file[0];
    const imageData = readFileSync(a.path, { encoding: 'base64' });
    return this.projectService.uploadPic(imageData);
  }
}

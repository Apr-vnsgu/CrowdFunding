import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FAQ } from './faq.entity';
import { Repository } from 'typeorm';
import { v4 as uuid } from 'uuid';
import { FAQInput } from './faq.input';
import { ProjectService } from 'src/project/project.service';
import { UserService } from 'src/user/user.service';

@Injectable()
export class FaqService {
  constructor(
    @InjectRepository(FAQ) private faqRepo: Repository<FAQ>,
    @Inject(forwardRef(() => ProjectService))
    private projectService: ProjectService,
    @Inject(forwardRef(() => UserService))
    private userService: UserService,
  ) {}

  async writeAQuestion(questionInput: FAQInput): Promise<FAQ> {
    const { question, from, project_name } = questionInput;
    const proj = await this.projectService.getProjectByProjectName(
      project_name,
    );
    const user = await this.userService.getUserByUsername(from);
    if (user) {
      if (proj) {
        if (user.username === proj.username) {
          throw new Error('Owner Cannot Write A Question');
        } else {
          const faq = this.faqRepo.create({
            id: uuid(),
            answer: '',
            from: user.username,
            project_name: proj.project_name,
            question,
            to: proj.username,
          });
          return await this.faqRepo.save(faq);
        }
      } else {
        throw new Error(
          'Project With Project Name ' + project_name + ' Not Found',
        );
      }
    } else {
      throw new Error('Please Sign Up To Post A Question');
    }
  }

  async writeAnswer(answerInput: FAQInput): Promise<boolean> {
    const { answer, id, project_name } = answerInput;
    const proj = await this.projectService.getProjectByProjectName(
      project_name,
    );
    if (proj) {
      const question = await this.faqRepo.findOne({
        where: { id, project_name: proj.project_name },
      });
      if (question) {
        await this.faqRepo.update(question._id, {
          project_name,
          answer,
        });
        return true;
      } else {
        throw new Error(`Project Names Do Not Match For This Question`);
      }
    } else {
      throw new Error('Project With Name ' + project_name + ' Not Found');
    }
  }

  async deleteQuestions(project_name: string) {
    const result = await this.faqRepo.delete({ project_name });
    return result.affected > 0;
  }

  async getFaqs(): Promise<FAQ[]> {
    return await this.faqRepo.find();
  }
}

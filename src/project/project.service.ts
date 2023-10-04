import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { HttpService } from '@nestjs/axios';
import { Repository } from 'typeorm';
import { v4 as uuid } from 'uuid';
import { createTransport } from 'nodemailer';
import { Project } from './project.entity';
import { CreateProjectInput } from './createProjectInput';
import { UserService } from 'src/user/user.service';
import { PledgeAProject } from './pledgeProject.DTO';
import { DeleteProject } from './deleteProjectInput';
import { catchError, firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import { Comment } from './commentProjectInput';
import { FaqService } from 'src/faq/faq.service';

@Injectable()
export class ProjectService {
  constructor(
    @InjectRepository(Project) private projectRepository: Repository<Project>,
    @Inject(forwardRef(() => UserService))
    private userService: UserService,
    private httpService: HttpService,
    @Inject(forwardRef(() => FaqService))
    private faqService: FaqService,
  ) {}

  async getProjects(): Promise<Project[]> {
    const projects = await this.projectRepository.find();
    if (projects) {
      return projects;
    }
  }

  async createProject(
    createProjectInput: CreateProjectInput,
  ): Promise<Project> {
    const {
      project_name,
      target_amount,
      username,
      catagory,
      description,
      end_date,
      image,
    } = createProjectInput;
    const user = await this.userService.getUserByUsername(username);
    if (user) {
      const project = await this.projectRepository.create({
        project_id: uuid(),
        target_amount,
        project_name,
        username,
        end_date,
        image,
        catagory,
        likes: 0,
        pledges: 0,
        comments: [],
        description: description ? description : '',
        pledge_amount: 0,
      });
      if (project) {
        const mailTransporter = createTransport({
          service: 'gmail',
          host: 'smtp.gmail.com',
          secure: false,
          auth: {
            user: `${process.env.USER}`,
            pass: `${process.env.PASS}`,
          },
        });

        mailTransporter.sendMail(
          {
            from: `${process.env.USER}`,
            to: `${project.username}`,
            subject: 'Project Creation Success!',
            html: `
                <html>
                <head>
                  <style>
                    body {
                      font-family: Arial, sans-serif;
                    }
                    h1 {
                      color: white;
                    }
                    .container {
                      width: 500px;
                      margin: 0 auto;
                      padding: 20px;
                      background-color: #F0EB8D;
                      border-radius: 5px;
                      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                  }
                  .container2 {
                      width: 500px;
                      margin: 0 auto;
                      opacity: 100%;
                      padding: 20px;
                      background-color: #8F43EE;
                      border-radius: 5px;
                      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                    }
                  </style>
                </head>
                <body>
                  <div class="container2">
                    <h1>Greetings! ${user.user_name}</h1>
                  </div>
                  <div class="container">
                    <p>
                      <b>
                          The Project ${project.project_name} was created successfully with your username ${user.username}. You can find it in the catagory of ${project.catagory}!
                      </b>
                    </p>
                    <p>
                      If you have any questions, feel free to reach out to us @aryarana.mscit20@vnsgu.ac.in
                    </p>
                 </div>
                </body>
              </html>
              `,
          },
          (err) => {
            if (err) {
              console.log(err);
            } else {
              console.log(
                'Email Sent To Resgistered User For Project Creation',
              );
            }
          },
        );
        return await this.projectRepository.save(project);
      } else {
        throw new Error('Project Was Not Created!');
      }
    } else {
      throw new Error(`User with Username ${username} Not Found`);
    }
  }

  async getAllProjectsOfAUser(username: string): Promise<Project[]> {
    const user = await this.userService.getUserByUsername(username);
    if (user) {
      const projects = await this.projectRepository.find({
        where: { username },
      });
      if (projects) {
        return projects;
      }
    } else {
      throw new Error(`Cannot Find Registered User With Username ${username}`);
    }
  }

  async getProjectByProjectName(project_name: string): Promise<Project> {
    return await this.projectRepository.findOne({ where: { project_name } });
  }

  async pledgeAProject(pledgeAProject: PledgeAProject): Promise<Project> {
    const { pledge_amount, project_name, username } = pledgeAProject;
    const user = await this.userService.getUserByUsername(username);
    if (!user) {
      throw new Error('User Not Registered! Please Log In!');
    }
    if (user) {
      const project = await this.getProjectByProjectName(project_name);
      if (!project) {
        throw new Error(`Project With Name ${project_name} Was Not Found`);
      }
      if (username === project.username) {
        throw new Error('You cannot donate for your own project!');
      }
      const project_owner = await this.userService.getUserByUsername(
        project.username,
      );
      const amt = project.pledge_amount + pledge_amount;
      await this.projectRepository.update(project._id, {
        pledge_amount: amt,
        pledges: project.pledges + 1,
      });
      const curr = await this.getProjectByProjectName(project_name);
      const mailTransporter = createTransport({
        service: 'gmail',
        host: 'smtp.gmail.com',
        secure: false,
        auth: {
          user: `${process.env.USER}`,
          pass: `${process.env.PASS}`,
        },
      });
      mailTransporter.sendMail(
        {
          from: `${process.env.USER}`,
          to: `${project.username}`,
          subject: 'Someone Just Pledged On Your Project!',
          html: `
              <html>
              <head>
                <style>
                  body {
                    font-family: Arial, sans-serif;
                  }
                  h1 {
                    color: white;
                  }
                  .container {
                    width: 500px;
                    margin: 0 auto;
                    padding: 20px;
                    background-color: #F0EB8D;
                    border-radius: 5px;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                }
                .container2 {
                    width: 500px;
                    margin: 0 auto;
                    opacity: 100%;
                    padding: 20px;
                    background-color: #8F43EE;
                    border-radius: 5px;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                  }
                </style>
              </head>
              <body>
                <div class="container2">
                  <h1>Greetings! ${project_owner.user_name}</h1>
                </div>
                <div class="container">
                  <p>
                    <b>
                        Your Project ${project.project_name} was just Pledged with an amount of ${pledge_amount}!
                        Your Total Pledge Amount Now is: ${curr.pledge_amount}! Congrats!
                    </b>
                  </p>
                  <p>
                    If you have any questions, feel free to reach out to us @aryarana.mscit20@vnsgu.ac.in
                  </p>
               </div>
              </body>
            </html>
            `,
        },
        (err) => {
          if (err) {
            console.log(err);
          } else {
            console.log('Email For Pleadge To Owner');
          }
        },
      );
      mailTransporter.sendMail(
        {
          from: `${process.env.USER}`,
          to: `${user.username}`,
          subject: 'Thanks For The Pledge!',
          html: `
              <html>
              <head>
                <style>
                  body {
                    font-family: Arial, sans-serif;
                  }
                  h1 {
                    color: white;
                  }
                  .container {
                    width: 500px;
                    margin: 0 auto;
                    padding: 20px;
                    background-color: #F0EB8D;
                    border-radius: 5px;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                }
                .container2 {
                    width: 500px;
                    margin: 0 auto;
                    opacity: 100%;
                    padding: 20px;
                    background-color: #8F43EE;
                    border-radius: 5px;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                  }
                </style>
              </head>
              <body>
                <div class="container2">
                  <h1>Greetings! ${user.user_name}</h1>
                </div>
                <div class="container">
                  <p>
                    <b>
                        Your Pledge Of Amount ${pledge_amount} Was Very Much Appreciated By ${project_owner.user_name}!<br/>
                        Please feel free to get connected with him! @${project_owner.username}
                        Thanks Again!
                    </b>
                  </p>
                  <p>
                    If you have any questions, feel free to reach out to us @aryarana.mscit20@vnsgu.ac.in
                  </p>
               </div>
              </body>
            </html>
            `,
        },
        (err) => {
          if (err) {
            console.log(err);
          } else {
            console.log('Email For Pleadge To Donater');
          }
        },
      );
      return curr;
    }
  }

  async deleteProjectOfUser(deleteProject: DeleteProject): Promise<boolean> {
    const { project_name, username } = deleteProject;
    const project = await this.getProjectByProjectName(project_name);
    const user = await this.userService.getUserByUsername(username);
    if (!user) {
      throw new Error(`Username ${username} Not Found!`);
    }
    if (!project) {
      throw new Error(`Project ${project_name} Not Found!`);
    }
    if (project.username === user.username) {
      const result = await this.projectRepository.delete(project._id);
      const users = await this.userService.getUsers();
      users.map(async (use) => {
        if (use.bookmarks.includes(project_name)) {
          await this.userService.removeBookMark(use.username, project_name);
        }
        if (use.likedProjects.includes(project_name)) {
          await this.userService.removeProject(use.username, project_name);
        }
      });
      await this.faqService.deleteQuestions(project_name);
      return result.affected > 0;
    } else {
      throw new Error('You cannot delete a project you do not own!');
    }
  }

  async endTime(): Promise<any> {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const day = String(currentDate.getDate()).padStart(2, '0');
    const now = `${year}-${month}-${day}`;
    const approaching = await this.projectRepository.find({
      where: {
        end_date: now,
      },
    });
    if (approaching.length === 0) {
      // console.log(approaching);
    } else {
      console.log(approaching);
    }
  }

  async uploadPic(imageData: string) {
    const formdata = new FormData();
    formdata.append('image', imageData);
    const { data } = await firstValueFrom(
      this.httpService
        .post(
          'https://api.imgbb.com/1/upload?key=1840b60299242baf7a13502ebcd3c889',
          formdata,
        )
        .pipe(
          catchError((error: AxiosError) => {
            throw error;
          }),
        ),
    );
    return data.data.image.url;
  }

  async comment(commentInp: Comment): Promise<boolean> {
    const { comment, project_name, username } = commentInp;
    const user = await this.userService.getUserByUsername(username);
    if (user) {
      const project = await this.projectRepository.findOne({
        where: { project_name },
      });
      if (project) {
        await this.projectRepository.update(project._id, {
          comments: [...project.comments, comment],
        });
        return true;
      } else {
        throw new Error(
          'Project With Project Name ' + project_name + ' Not Found',
        );
      }
    } else {
      throw new Error('User With Username ' + username + ' Not Found');
    }
  }

  async getAllProjectsByCatagory(catagory: string): Promise<Project[]> {
    if (catagory.trim().length === 0) {
      return await this.projectRepository.find();
    } else {
      return await this.projectRepository.find({ where: { catagory } });
    }
  }

  async likeProject(project_name: string, username: string): Promise<boolean> {
    const project = await this.getProjectByProjectName(project_name);
    const user = await this.userService.getUserByUsername(username);
    if (user) {
      if (user.likedProjects.includes(project.project_name)) {
        await this.projectRepository.update(project._id, {
          likes: project.likes - 1,
        });
        await this.userService.insertLikedProject(
          user.username,
          project.project_name,
        );
        return true;
      } else {
        await this.projectRepository.update(project._id, {
          likes: project.likes + 1,
        });
        await this.userService.insertLikedProject(
          user.username,
          project.project_name,
        );
        return true;
      }
    } else {
      throw new Error('User With Username ' + username + ' Not Found');
    }
  }
}

import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { createTransport } from 'nodemailer';
import { v4 as uuid } from 'uuid';
import { CreateUserInput } from './createUserInput';
import { ProjectService } from 'src/project/project.service';
import { BookMark } from './bookMarkProject-DTO';

@Injectable()
export class UserService {
  constructor(
    @Inject(forwardRef(() => ProjectService))
    private projectService: ProjectService,
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  async registerUser(createUserInput: CreateUserInput) {
    const { user_name, username, password } = createUserInput;
    const user = this.userRepository.create({
      user_id: uuid(),
      user_name,
      username,
      likedProjects: [],
      password,
      bookmarks: [],
    });
    await this.userRepository.save(user).catch((error) => {
      throw new Error(error);
    });
    if (user) {
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
          to: `${user.username}`,
          subject: 'Registered Successfully To CrowdFunding!',
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
              <h1>Welcome ${user.user_name} To CrowdFunding!</h1>
            </div>
            <div class="container">
              <p>
                <b>
                    Thank you for joining our community. <br/> We are excited to have you on board!<br/>
                    Your Email is: ${user.username}<br/>
                    Your Password is: ${user.password}
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
            console.log('Email Sent To Resgistered User');
          }
        },
      );
      return user;
    } else {
      throw new Error('User Not Registered');
    }
  }
  async emailUpdatePassword(username: string, password: string) {
    const user = await this.getUserByUsername(username);
    if (user) {
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
          to: `${user.username}`,
          subject: 'Password Updated in CrowdFunding!',
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
              <h1>Hello ${user.user_name} From CrowdFunding!</h1>
            </div>
            <div class="container">
              <p>
                <b>
                    Password Updation Success! <br/>Your password was just updated and now you are ready to login with the new password.<br/>If this was not you please feel free to mail the admin at @aryarana.mscit20@vnsgu.ac.in<br/>
                    Your Email is: ${user.username}<br/>
                    Your Password is: ${password}
                </b>
              </p>
              <p>
                Appreciate you a lot for being a part of the community! Thanks!
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
            console.log('Email Sent To Update User Password');
          }
        },
      );
      return user;
    } else {
      throw new Error('User Not Registered');
    }
  }
  async getUsers(): Promise<User[]> {
    return await this.userRepository.find();
  }

  async getUserByUsername(username: string) {
    return await this.userRepository.findOne({ where: { username } });
  }

  async getUser(username: string, password: string) {
    const user = this.userRepository.findOne({
      where: {
        username,
        password,
      },
    });
    if (user) {
      return user;
    }
  }

  async bookMarkAProject(bookMark: BookMark): Promise<boolean> {
    const { username, project_name } = bookMark;
    const user = await this.getUserByUsername(username);
    if (!user) {
      throw new Error('You Should Login First!');
    }
    const project = await this.projectService.getProjectByProjectName(
      project_name,
    );
    if (!project) {
      throw new Error(`Project ${project_name} Not Found!`);
    }
    if (user.username === project.username) {
      throw new Error('You cannot bookmark owned projects!');
    }
    if (user.bookmarks.includes(project.project_name)) {
      const index = user.bookmarks.indexOf(project_name);
      user.bookmarks.splice(index, 1);
      await this.userRepository.update(user._id, {
        bookmarks: user.bookmarks,
      });
      return true;
    } else {
      await this.userRepository.update(user._id, {
        bookmarks: [...user.bookmarks, project.project_name],
      });
      return true;
    }
  }

  async removeBookMark(username: string, project_name: string) {
    const user = await this.getUserByUsername(username);
    if (user.bookmarks.includes(project_name)) {
      const index = user.bookmarks.indexOf(project_name);
      user.bookmarks.splice(index, 1);
      await this.userRepository.update(user._id, {
        bookmarks: user.bookmarks,
      });
    }
  }

  async removeProject(username: string, project_name: string) {
    const project = await this.projectService.getProjectByProjectName(
      project_name,
    );
    const user = await this.getUserByUsername(username);
    //this is not working as intended
    if (user) {
      await this.userRepository.update(user._id, {
        likedProjects: user.likedProjects.filter(
          (name) => name !== project.project_name,
        ),
      });
    }
  }

  async insertLikedProject(
    username: string,
    project_name: string,
  ): Promise<boolean> {
    const project = await this.projectService.getProjectByProjectName(
      project_name,
    );
    const user = await this.getUserByUsername(username);
    if (user) {
      if (user.likedProjects.includes(project.project_name)) {
        await this.userRepository.update(user._id, {
          likedProjects: user.likedProjects.filter(
            (name) => name !== project.project_name,
          ),
        });
        return true;
      } else {
        await this.userRepository.update(user._id, {
          likedProjects: [...user.likedProjects, project.project_name],
        });
        return true;
      }
    } else {
      return false;
    }
  }
}

import { DataSource } from "typeorm";
import "reflect-metadata";
import "dotenv/config"
import { Users } from "./entities/Users.ts";
import { Projects } from "./entities/Projects.ts";
import { Notifications } from "./entities/Notifications.ts";
import { Comments } from "./entities/Comments.ts";
import { ProjectMembers } from "./entities/ProjectMembers.ts";
import { Issues } from "./entities/Issues.ts";
import { Role } from "./entities/Roles.ts";
import { ProjectStatuses } from "./entities/ProjectStatuses.ts";
import { Designation } from "./entities/Designation.tsx";


const DB_USER =process.env.DB_USER
const DB_HOST=process.env.DB_HOST       
const DB_NAME=process.env.DB_NAME      
const DB_PASSWORD=process.env.DB_PASSWORD   
const DB_PORT=Number(process.env.DB_PORT) 




export const AppDataSource = new DataSource({
    type:DB_USER as 'postgres',
    host:DB_HOST as string ,
    port: DB_PORT as number,
    username: DB_USER as string,
    password: DB_PASSWORD as string,
    database: DB_NAME as string,
    synchronize: false,
    logging: true,
    entities: [Users,Projects,Notifications,Comments,ProjectMembers,Issues,Role,ProjectStatuses,Designation],
    migrations: ["src/migrations/**/*.ts"],
})
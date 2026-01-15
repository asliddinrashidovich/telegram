import { DefaultSession } from "next-auth"
import { Iuser } from ".";

declare module "next-auth" {
    interface Session {
        currentUser?: Iuser
        user: {} & DefaultSession['user']
    }
}
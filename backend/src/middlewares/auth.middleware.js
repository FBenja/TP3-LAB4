import passport from "passport";
import { db } from "../../db.js";
import { Strategy,ExtractJwt } from "passport-jwt";


export function authConfig(){
    const jwtOptions = {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: process.env.JWT_SECRET,
    }

    passport.use(
        new Strategy(jwtOptions, async (payload,done)=>{
            const rows = await db.execute('SELECT id, nombre,email FROM usuario WHERE id = ?',[payload.id]);

            if (rows.length >0){
                const user = rows[0]
                return done(null,user)
            } else {
                return done(null,false)
            } 
        })
    )
}

    export const authenticate = passport.authenticate("jwt",{session: false,});
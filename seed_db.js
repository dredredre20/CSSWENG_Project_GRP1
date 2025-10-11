// here be dummy users to experiment with
import db_connection_pool from "./connections.js";

async function insert_dummy_users(){
    // here are the list of dummy users, feel free to change and/or add more users
    const samples = [
        {usertype: "Admin", email: "admin1@gmail.com", password: "password123", created_by: "admin1@gmail.com"},
        {usertype: "Admin", email: "admin2@gmail.com", password: "password123", created_by: "admin2@gmail.com"},
        {usertype: "Supervisor", email: "visor1@gmail.com", password: "password123", created_by: "admin1@gmail.com"},
        {usertype: "Supervisor", email: "visor2@gmail.com", password: "password123", created_by: "admin2@gmail.com"},
        {usertype: "SDW", email: "sdw1@gmail.com", password: "password123", created_by: "admin1@gmail.com"},
        {usertype: "SDW", email: "sdw2@gmail.com", password: "password123", created_by: "admin2@gmail.com"}
    ]

    //get connection
    const connection = await db_connection_pool.getConnection();

    try{
        // pre_check is statement for checking existence ofd account beforehand
        const pre_check = 'SELECT * FROM reports_db.users WHERE email = ? AND passkey = ?';

        // actual INSERT
        const insert = 'INSERT INTO reports_db.users (usertype, email, passkey, created_by)  VALUES(?, ?, ?, ?)'
        
        //iterate through each user account object in `samples`
        console.log("\nUsers:");
        for(let user of samples){
            // check first
            const [rows] = await connection.execute(pre_check, [user.email, user.password]); 
            
            if(rows.length > 0){
                console.log(`(${user.usertype}) email: ${user.email}, password: ${user.password}`);
            } else{
                // ..only then INSERT when account not found
                await connection.execute(insert, [user.usertype, user.email, user.password, user.created_by]); 
                console.log(`(${user.usertype}) email: ${user.email}, password: ${user.password}`);
            }
        }
        console.log("\n");
    } catch(err){
        console.error("Error seeding users: " + err);
    } finally{
        connection.release();
    }
}


export default insert_dummy_users;
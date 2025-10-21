// here be dummy users to experiment with
import db_connection_pool from "./connections.js";

async function insert_dummy_users(){
    // here are the list of dummy users, feel free to change and/or add more users
    const samples = [
        {staffid: 10000, stafftype: "A", Name:"John Doe", email: "admin1@gmail.com", password: "password123"},
        {staffid: 10001, stafftype: "A", Name:"Jane Beck", email: "admin2@gmail.com", password: "password123"},
        {staffid: 10002, stafftype: "S", Name:"Jenny Parker", email: "visor1@gmail.com", password: "password123"},
        {staffid: 10003, stafftype: "S", Name:"Wesley Ang", email: "visor2@gmail.com", password: "password123"},
        {staffid: 10004, stafftype: "D", Name:"Angelo Perdo", email: "sdw1@gmail.com", password: "password123"},
        {staffid: 10005, stafftype: "D", Name:"Jane Newbabel", email: "sdw2@gmail.com", password: "password123"}
    ]

    //get connection
    const connection = await db_connection_pool.getConnection();

    try{
        // pre_check is statement for checking existence ofd account beforehand
        const pre_check = 'SELECT * FROM new_reports_db.staffinfo WHERE email = ? AND password = ?';

        // actual INSERT
        const insert = 'INSERT INTO new_reports_db.staffinfo (staffid, stafftype, Name, email, password)  VALUES(?, ?, ?, ?, ?)'
        
        //iterate through each user account object in `samples`
        console.log("\nUsers:");
        for(let user of samples){
            // check first
            const [rows] = await connection.execute(pre_check, [user.email, user.password]); 
            
            if(rows.length > 0){
                console.log(`(${user.stafftype}) email: ${user.email}, password: ${user.password}`);
            } else{
                // ..only then INSERT when account not found
                await connection.execute(insert, [user.staffid, user.stafftype, user.Name, user.email, user.password]); 
                console.log(`(${user.stafftype}) email: ${user.email}, password: ${user.password}`);
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
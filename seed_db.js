// here be dummy users to experiment with
import bcrypt from "bcrypt";
import db_connection_pool from "./connections.js";

async function insert_dummy_users(){
    // here are the list of dummy users, feel free to change and/or add more users
    const samples = [
        { stafftype: "admin", first_name: "John", last_name: "Doe", email: "admin1@gmail.com", password: "password123" },
        { stafftype: "admin", first_name: "Jane", last_name: "Beck", email: "admin2@gmail.com", password: "password123" },
        { stafftype: "supervisor", first_name: "Jenny", last_name: "Parker", email: "visor1@gmail.com", password: "password123" },
        { stafftype: "supervisor", first_name: "Wesley", last_name: "Ang", email: "visor2@gmail.com", password: "password123" },
        { stafftype: "sdw", first_name: "Angelo", last_name: "Perdo", email: "sdw1@gmail.com", password: "password123" },
        { stafftype: "sdw", first_name: "Jane", last_name: "Newbabel", email: "sdw2@gmail.com", password: "password123" }
    ];

    //get connection
    const connection = await db_connection_pool.getConnection();

    try{
        for (const user of samples) {
            const hashed = await bcrypt.hash(user.password, 10);
            let query = "";
            let values = [];

            switch(user.stafftype) {
                case "admin":
                    query = 'INSERT INTO admins (first_name, last_name, email, password) VALUES (?, ?, ?, ?)';
                    values = [user.first_name, user.last_name, user.email, hashed];
                    break;
                case "supervisor":
                    query = 'INSERT INTO supervisors (first_name, last_name, email, password) VALUES (?, ?, ?, ?)';
                    values = [user.first_name, user.last_name, user.email, hashed];
                    break;
                case "sdw":
                    query = 'INSERT INTO sdws (first_name, last_name, email, password) VALUES (?, ?, ?, ?)';
                    values = [user.first_name, user.last_name, user.email, hashed];
                    break;
            }
            await connection.execute(query, values);
        }
        console.log("Sucessfully seeded dummy users.")

    } catch(err){
        console.error("Error seeding users: " + err);
    } finally{
        connection.release();
    }
}

export default insert_dummy_users;
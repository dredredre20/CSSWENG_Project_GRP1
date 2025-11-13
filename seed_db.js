// here be dummy users to experiment with
import bcrypt from "bcrypt";
import db_connection_pool from "./connections.js";


async function insert(connection, samples){
  try{
        let query = "";
        let values = [];
        
        // fill hardcoded `spus` table
        const spus = [
            {spu_id: 1, spu_name: "AMP"},
            {spu_id: 2, spu_name: "FDQ"},
            {spu_id: 3, spu_name: "MPH"},
            {spu_id: 4, spu_name: "MS"}
        ]

        for(const spu of spus){
            await connection.execute(
                'INSERT INTO reports_db.spus (spu_id, spu_name) VALUES(?, ?)',
                [spu.spu_id, spu.spu_name]
            );
        }

        // fill admin-spu relations for `spus_has_admins` table
        const admin_spus = [
            {admins_admin_id: 1, spus_spu_id: 3},
            {admins_admin_id: 1, spus_spu_id: 4},
            {admins_admin_id: 2, spus_spu_id: 2},
            {admins_admin_id: 2, spus_spu_id: 1}
        ]

        for(const admin_spu of admin_spus){
            await connection.execute(
                'INSERT INTO reports_db.spus_has_admins (admins_admin_id, spus_spu_id) VALUES(?, ?)',
                [admin_spu.admins_admin_id, admin_spu.spus_spu_id]
            );
        }

        // fill user tables
        for (const user of samples) {
            const hashed = await bcrypt.hash(user.password, 10);

            // fill `staff_info` first, then get the inserted row to obtain the ID to be inserted in the other user tables
            const [staff_info_inserted] = await connection.execute(
                'INSERT INTO reports_db.staff_info (staff_type, email, password) VALUES(?, ?, ?)',
                [user.stafftype, user.email, hashed]
            );

            switch(user.stafftype) {
                case "admin":
                    query = 'INSERT INTO admins (first_name, last_name, email, staff_info_id) VALUES (?, ?, ?, ?)';
                    values = [user.first_name, user.last_name, user.email, staff_info_inserted.insertId];
                    break;
                case "supervisor":
                    query = 'INSERT INTO supervisors (first_name, last_name, email, spu_id, staff_info_id) VALUES (?, ?, ?, ?, ?)';
                    values = [user.first_name, user.last_name, user.email, user.spu_id, staff_info_inserted.insertId];
                    break;
                case "sdw":
                    query = 'INSERT INTO sdws (first_name, last_name, email, supervisor_id, staff_info_id, spu_id) VALUES (?, ?, ?, ?, ?, ?)';
                    values = [user.first_name, user.last_name, user.email, user.supervisorid, staff_info_inserted.insertId, user.spu_id];
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

async function insert_dummy_users(){
    // here are the list of dummy users, feel free to change and/or add more users
    const samples = [
        { stafftype: "admin", first_name: "John", last_name: "Doe", email: "admin1@gmail.com", password: "password123" },
        { stafftype: "admin", first_name: "Jane", last_name: "Beck", email: "admin2@gmail.com", password: "password123"},

        { stafftype: "supervisor", first_name: "Jenny", last_name: "Parker", email: "visor1@gmail.com", password: "password123", spu_id: 1},
        { stafftype: "supervisor", first_name: "Wesley", last_name: "Ang", email: "visor2@gmail.com", password: "password123", spu_id: 2},
        { stafftype: "supervisor", first_name: "Martha", last_name: "Delacruz", email: "visor3@gmail.com", password: "password123", spu_id: 3},
        { stafftype: "supervisor", first_name: "Wes", last_name: "Keller", email: "visor4@gmail.com", password: "password123", spu_id: 4},

        { stafftype: "sdw", first_name: "Angelo", last_name: "Perdo", email: "sdw1@gmail.com", password: "password123", supervisorid: 4, spu_id: 1},
        { stafftype: "sdw", first_name: "Jane", last_name: "Newbabel", email: "sdw2@gmail.com", password: "password123", supervisorid: 4, spu_id: 1},
        { stafftype: "sdw", first_name: "Carlos", last_name: "Mendoza", email: "sdw3@gmail.com", password: "password123", supervisorid: 3, spu_id: 2},
        { stafftype: "sdw", first_name: "Lily", last_name: "Gomez", email: "sdw4@gmail.com", password: "password123", supervisorid: 3, spu_id: 2},
        { stafftype: "sdw", first_name: "Marcus", last_name: "Aurelio", email: "sdw5@gmail.com", password: "password123", supervisorid: 1, spu_id: 3},
        { stafftype: "sdw", first_name: "Katrina", last_name: "Baptist", email: "sdw6@gmail.com", password: "password123", supervisorid: 1, spu_id: 3},
        { stafftype: "sdw", first_name: "Noah", last_name: "Lawton", email: "sdw7@gmail.com", password: "password123", supervisorid: 2, spu_id: 4},
        { stafftype: "sdw", first_name: "Sofia", last_name: "Martinez", email: "sdw8@gmail.com", password: "password123", supervisorid: 2, spu_id: 4},
    ];

    //get connection
    const connection = await db_connection_pool.getConnection();

    const [rows] = await connection.query('SELECT COUNT(*) AS count FROM staff_info');
    if (rows[0].count === 0) {
            try {
                await connection.execute('SET FOREIGN_KEY_CHECKS = 0'); // since there are foreign key constraints, 
                                                                        // TRUNCATE fails everytime, so we don't check the foreign keys so it executes
                                                                        // this isn't good for actual deployment, but it should be fine for testing purposes
                const tablesToTruncate = [
                    "reports",
                    "sdws",
                    "supervisors",
                    "admins",
                    "spus_has_admins",
                    "spus",
                    "staff_info"
                ];

                for (const t of tablesToTruncate) {
                    await connection.execute(`TRUNCATE TABLE \`${t}\``);
                }

                await insert(connection, samples);

            } catch(err){
                console.error("Error deleting existing seeded users: "+err);
            }
    } else {
        console.log("Staff already exists, skipping seed.");
    }
}

export default insert_dummy_users;

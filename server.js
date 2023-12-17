const express = require('express');
const app = express();
const port = 3000;
const path = require('path');
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));
const mysql = require('mysql');
const { count } = require('console');
const session = require('express-session');
const MySQLStore= require("express-mysql-session")(session)
let numOfEnt=0 
const moment = require('moment');


app.set("view engine", "ejs");
app.set("views", "./views");


const db = mysql.createConnection({
    host: '127.0.0.1',
    port: 3306,
    user: 'root',
    password: '',
    database: 'blood_donations2'
});

var sessionStore= new MySQLStore({
    expiration: 10800000,
    createDatabaseTable: true,
    schema:{
        tableName:"sessiontb1",
        columnNames:{
            session_id: 'session_id',
            expires: 'expires',
            data: 'data'
        }
    }


},db)



app.use(
    session({
        key: 'keyin',
      secret: '1234@1234',
      store:sessionStore,
      resave: false,
      saveUninitialized: true,
    })
  );




// app.use(
//   session({
      
//     secret: '1234@1234',
//     cookie:{maxAge:30000},
//     saveUninitialized: false
//   })
// );

db.connect((err) => {
    if (err) {
        console.error('Database connection failed:', err);
    } else {
        console.log('Connected to the database');
    }
});



app.get('/', (req, res) => {
    //res.sendFile(path.join(__dirname, '/login.html'));
    res.render("login")
});
app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, '/register.html'));
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

app.post('/login', (req,res) =>{
    let username= req.body.username
    let password= req.body.password
    let userType= req.body.userType


    if(userType === "Administrator"){
        const query = `SELECT * FROM s_accounts WHERE Username = ? AND Spassword = ?`;

        db.query(query, [username, password], (err, results) => {
            if (err) {
              console.error('Error executing query:', err);
              res.status(500).json({ error: 'Internal Server Error' });
              return;
            }
        
            if (results.length > 0) {
              // Login successful
              req.session.user = results[0];
              res.render("adminHome")
              //res.sendFile(path.join(__dirname, '/adminHome'));
              
              //res.json({ success: true, message: 'Login successful' });
              
            } else {
              // Login failed
              res.status(401).json({ success: false, message: 'Invalid credentials' });
            }
          });

    }else if (userType === "Donor"){

        const query = `SELECT * FROM d_accounts WHERE Username = ? AND Dpassword = ?`;
        const advQuery= `SELECT * FROM d_accounts
        JOIN person ON d_accounts.Id = person.Id
        JOIN donor ON d_accounts.Id = donor.Id
         WHERE d_accounts.Username = ? AND d_accounts.Dpassword = ?;`

        db.query(advQuery, [username, password], (err, results) => {
            if (err) {
              console.error('Error executing query:', err);
              res.status(500).json({ error: 'Internal Server Error' });
              return;
            }
        
            if (results.length > 0) {
              // Login successful
              //req.session.user = results[0].Username;
              console.log(results)
              console.log(results[0])
              console.log(results[0].Username)
             // res.send(results) //[{"Username":"L8","Dpassword":"1234","Id":"1010555555"}]
             //res.send(results[0].Username)  //L8
            // res.send(results[0])   //{"Username":"L8","Dpassword":"1234","Id":"1010555555"}
              //res.sendFile(path.join(__dirname, '/donorHome.html'));
              //res.json({ success: true, message: 'Login successful' });
              req.session.user = results[0];
              // res.sendFile(path.join(__dirname, './views/donorHome.ejs'));
              res.render("donorHome")
            } else {
              // Login failed
              res.status(401).json({ success: false, message: 'Invalid credentials' });
            }
          });





    }else if (userType === "Recipient"){

        const query = `SELECT * FROM r_accounts WHERE Username = ? AND Rpassword = ?`;

        db.query(query, [username, password], (err, results) => {
            if (err) {
              console.error('Error executing query:', err);
              res.status(500).json({ error: 'Internal Server Error' });
              return;
            }
        
            if (results.length > 0) {
              // Login successful
              req.session.user = results[0].Username;
              res.sendFile(path.join(__dirname, '/donorHome.html'));
              //res.json({ success: true, message: 'Login successful' });
            } else {
              // Login failed
              res.status(401).json({ success: false, message: 'Invalid credentials' });
            }
          });

        //   req.session.user = {
        //     id: user._id,
        //     kfupmId: user.kfupmId,
        //     name: user.firstName, 
        //     major: user.major,  
        //     classLevel: user.classLevel,
        //     email: user.email,
        //     terms: user.terms
        // };


    }else{
        res.send("Wrong Inputs!")
    }




})

app.get('/requestsList', (req,res)=>{
  if (req.session.user) {
    let pendedResult = []
    let completedResult = []

    const pendingQuery= `SELECT * FROM d_request `
    const completedQuery= `SELECT * FROM d_request WHERE Rstatus = ? `

    db.query(pendingQuery,  (err, results) => {
      if (err) {
        console.error('Error executing query:', err);
        res.status(500).json({ error: 'Internal Server Error' });
        return;
      }
  
      if (results.length > 0) {
        // Login successful
        //req.session.user = results[0].Username;
        // console.log(results)
        // console.log(results[0])
        // console.log(results[0].Username)
       // res.send(results) //[{"Username":"L8","Dpassword":"1234","Id":"1010555555"}]
       //res.send(results[0].Username)  //L8
      // res.send(results[0])   //{"Username":"L8","Dpassword":"1234","Id":"1010555555"}
        //res.sendFile(path.join(__dirname, '/donorHome.html'));
        //res.json({ success: true, message: 'Login successful' });
        // req.session.user = results[0];
        // res.sendFile(path.join(__dirname, './views/donorHome.ejs'));
         pendedResult.push(results)
         res.render('requestsList',  {pendedResult} ); 
        //pendedResult=results
        //console.log(pendedResult)
        // res.render("donorHome")
      } else {
        // Login failed
        res.status(401).json({ success: false, message: 'ErrorInPen' });
      }
    });

    // db.query(completedQuery, ["Completed"], (err, results) => {
    //   if (err) {
    //     console.error('Error executing query:', err);
    //     res.status(500).json({ error: 'Internal Server Error' });
    //     return;
    //   }
  
    //   if (results.length > 0) {
    //     // Login successful
    //     //req.session.user = results[0].Username;
    //     // console.log(results)
    //     // console.log(results[0])
    //     // console.log(results[0].Username)
    //    // res.send(results) //[{"Username":"L8","Dpassword":"1234","Id":"1010555555"}]
    //    //res.send(results[0].Username)  //L8
    //   // res.send(results[0])   //{"Username":"L8","Dpassword":"1234","Id":"1010555555"}
    //     //res.sendFile(path.join(__dirname, '/donorHome.html'));
    //     //res.json({ success: true, message: 'Login successful' });
    //     // req.session.user = results[0];
    //     // res.sendFile(path.join(__dirname, './views/donorHome.ejs'));
    //      completedResult.push(results)
    //     console.log(completedResult)
    //     //res.render("donorHome")
    //   } else {
    //     // Login failed
    //     res.status(401).json({ success: false, message: 'ErrorInComp' });
    //   }
    // });
    //let allRequests = [pendedResult,completedResult]
    //res.send(allRequests)
    //console.log("here"+pendedResult)
    //res.render('requestsList',  {pendedResult} );
  }else
  res.send("Not logged in")
})

app.get('/donorHistory', (req,res)=>{
  if (req.session.user) {
    let history = []
    
    
    const Query= `SELECT * FROM d_request WHERE Did = ?  `

    db.query(Query,[req.session.user.Id, ],  (err, results) => {
      if (err) {
        console.error('Error executing query:', err);
        res.status(500).json({ error: 'Internal Server Error' });
        return;
      }
  
      if (results.length > 0) {
       
        history.push(results)
        console.log("yes")
        //console.log(history)
         res.render('donorHistory',  {history} ); 
        
      } else {
        // Login failed
        res.status(401).json({ success: false, message: 'ErrorInPen' });
      }
    });

   
  }else
  res.send("Not logged in")
})

app.get('/bloodDrive', (req,res)=>{
  if (req.session.user) {
    let annoucements = []
    
    
    const Query= `SELECT * FROM announcements WHERE status = ?  `

    db.query(Query,["Active" ],  (err, results) => {
      if (err) {
        console.error('Error executing query:', err);
        res.status(500).json({ error: 'Internal Server Error' });
        return;
      }
  
      if (results.length > 0) {
       
        annoucements.push(results)
        console.log("yes")
        //console.log(history)
         res.render('bloodDrive',  {annoucements} ); 
        
      } else {
        // Login failed
        res.status(401).json({ success: false, message: 'ErrorInDrive' });
      }
    });

   
  }else
  res.send("Not logged in")
})


app.get("/donorsList", (req,res)=>{
    res.sendFile(path.join(__dirname, '/donorsList.html'));
})

app.get("/fetchDonorsList",(req,res) => {
    const sql = 'SELECT * FROM d_accounts';

    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error querying the database:', err);
            res.status(500).send('Internal Server Error');
        } else {
            // Send the names as JSON to the client
            res.json(results);
        }
    });
})

app.use("/personalInfo", function(req,res){
  if (req.session.user) {

    res.render("personalInfo", { user: req.session.user });
  }else
  res.send("Not logged in")
})

app.use("/donationForm", function(req,res){
  if (req.session.user) {

    res.render("donationForm", { user: req.session.user });
  }else
  res.send("Not logged in")
})

app.post("/donationFormPost", function(req,res){
  if (req.session.user) {
    const prefDate= req.body.donationDate 
    const sql = 'INSERT INTO d_request (Sid,Did,Blood_type,Rstatus,prefDate) VALUES (?,?, ?,?,?)';
        db.query(sql, [1,req.session.user.Id,req.session.user.Blood_type,"Pending", prefDate], (err, result) => {
            if (err) {
                console.error('Error inserting data:', err);
                res.send('Error!');
            } else {
                console.log('Data inserted successfully as D');
                res.send('We Received Your Request!');
                //res.send('Data inserted into the database');
                // res.sendFile(path.join(__dirname, '/donorHome.html'));
            }
        });
    
  }else
  res.send("Not logged in")
  
})
app.use("/announcAdding", function(req,res){
  if (req.session.user) {

    res.render("announcAdding", { user: req.session.user });
  }else
  res.send("Not logged in")
})

app.post("/announceAddingPost", function(req,res){
  if (req.session.user) {
    const announcement= req.body.Announcement 
    const sql = 'INSERT INTO announcements (Sid,text,status) VALUES (?,?, ?)';
        db.query(sql, [req.session.user.Id,announcement,"Active"], (err, result) => {
            if (err) {
                console.error('Error inserting data:', err);
                res.send('Error!');
            } else {
                console.log('Data inserted successfully in the drive');
                res.send('Your announcements recieved successfully to the drive!');
                //res.send('Data inserted into the database');
                // res.sendFile(path.join(__dirname, '/donorHome.html'));
            }
        });
    
  }else
  res.send("Not logged in")
  
})

// app.get('/markAsCompleted', function (req, res){
//   if (req.session.user) {
//     res.render("markAsCompleted")
//   } else {
//     res.send("Not logged in")
//     console.log("Not logged in")
//   }
// })


app.use("/markAsCompleted", function(req,res){
  if (req.session.user) {

    res.render("markAsCompleted", { user: req.session.user });
  }else
  res.send("Not logged in")
})


app.post('/markAsCompletedForm', function (req, res) {
  if (req.session.user) {
      const donorId = req.body.DonorId;

      // Update the status in the d_request table
      const updateSql = 'UPDATE d_request SET Rstatus = ? WHERE Did = ?';
      db.query(updateSql, ["Completed", donorId], (updateErr, updateResult) => {
          if (updateErr) {
              console.error('Error updating status:', updateErr);
              res.send('Error updating status');
          } else {
              console.log('Status updated successfully');
              
              // Perform another query here
              const sql = 'SELECT Blood_type FROM donor WHERE Id = ?';

              db.query(sql, [donorId], (err, result) => {
                  if (err) {
                      console.error('Error executing query:', err);
                      // Handle the error, send a response, etc.
                  } else {
                      if (result.length > 0) {
                         //console.log(result[0]);
                          const bloodType = result[0].Blood_type;
                          //console.log(`Blood type for donor ${donorId}: ${bloodType}`);
                          const currentDate = new Date();
                          const formattedDate = moment(currentDate).format('YYYY-MM-DD');

                          const anotherSql = 'INSERT INTO blood (Type, Bid, Expiration_date, BBid) VALUES (?, ?, ?, ?)';
                          db.query(anotherSql, [bloodType, 1, formattedDate, 1], (err, result) => {
                            if (err) {
                                console.error('Error inserting data into blood table:', err);
                                // Handle the error, send a response, etc.
                            } else {
                                console.log('Data inserted successfully into the blood table');
                                // Process or send a response as needed
                            }
                             });



                          // Process or send the blood type as needed
                      } else {
                          console.log(`No record found for donor ${donorId}`);
                          // Handle the case where no record is found for the donor ID
                      }
                         }
                       });
          }
      });
  } else {
      res.send("Not logged in");
  }
});


// app.get("/personalInfo", (req,res)=>{

//     res.sendFile(path.join(__dirname, '/personalInfo.html'));



//     // if (req.session.user) {
//     //     const user = req.session.user;
        
//     //     res.send(`Welcome, ${user.username}!`);
//     //     //res.render("perosnalInfo", { user: req.session.user });
//     //   } else {
//     //     res.redirect('/login');
//     //   }



//     // res.sendFile(path.join(__dirname, '/donorsList.html'));
// })

// app.post("/personalInfo", (req,res) => {

//     if (req.session.user) {
//         const username = req.session.user;
    
//         // Fetch user details from the database using userId
//         const query = 'SELECT Id FROM d_accounts WHERE Username = ?';
    
//         db.query(query, [username], (err, results) => {
//           if (err) throw err;
    
//           const user = results[0];
//           res.send(`Welcome, ${user.Id}!`);
//         });
//       } else {
//         res.redirect('/login');
//       }





















//     // let username = req.body.Uname

//     // const query = `SELECT * FROM d_accounts WHERE Username = ?`;

//     // db.query(query, [username], (err, results) => {
//     //     if (err) {
//     //       console.error('Error executing query:', err);
//     //       res.status(500).json({ error: 'Internal Server Error' });
//     //       return;
//     //     }
    
//     //     if (results.length > 0) {
          
          
//     //       //res.sendFile(path.join(__dirname, '/donorHome.html'));
//     //       res.json({ success: true, message: results });
//     //     } else {
//     //       // Login failed
//     //       res.status(401).json({ success: false, message: 'Invalid credentials' });
//     //     }
//     //   });

// })






app.post('/submit', (req, res) => {
    const Fname= req.body.Fname
    const Lname= req.body.Lname
    const username = req.body.Uname;
    const passwordInput= req.body.passwordInput
    const email= req.body.email
    const gender = req.body.gender;
    const userType= req.body.userType
    const bloodType= req.body.bloodType
    const phone= req.body.phone
    const address= req.body.address
    const birthDate = req.body.birthD
    const weight= req.body.weight

    // (Fname, Lname,Uname,passwordInput,email,gender,userType,bloodType)

    if (userType==="Donor"){
        let count = `SELECT COUNT(*) AS count FROM d_accounts`;
        const sql = 'INSERT INTO d_accounts (Username,Dpassword,Id,Fname,Lname,email,gender,bloodType,phone,address,birthDate,weight) VALUES (?,?, ?,?,?,?,?,?,?,?,?,?)';
        db.query(sql, [username, passwordInput,14,Fname,Lname, email,gender,bloodType,phone,address,birthDate,weight], (err, result) => {
            if (err) {
                console.error('Error inserting data:', err);
                res.send('Error!, Maybe the username is already taken');
            } else {
                console.log('Data inserted successfully as D');
                //res.send('Data inserted into the database');
                res.sendFile(path.join(__dirname, '/donorHome.html'));
            }
        });


      //   req.session.user = {
      //     id: user._id,
      //     kfupmId: user.kfupmId,
      //     name: user.firstName, 
      //     major: user.major,  
      //     classLevel: user.classLevel,
      //     email: user.email,
      //     terms: user.terms
      // };

    
    } else if(userType==="Recipient"){
        let count = `SELECT COUNT(*) AS count FROM r_accounts`;
        const sql = 'INSERT INTO r_accounts (Username,Rpassword,Id,Fname,Lname,email,gender,bloodType,phone,address,birthDate,weight) VALUES (?, ?,?,?,?,?,?,?,?,?,?,? )';
        db.query(sql, [username, passwordInput,15,Fname,Lname, email,gender,bloodType,phone,address,birthDate,weight], (err, result) => {
            if (err) {
                console.error('Error inserting data:', err);
                res.send('Error!, Maybe the username is already taken');
            } else {
                console.log('Data inserted successfully as R');
                //res.send('Data inserted into the database');
                res.sendFile(path.join(__dirname, '/donorHome.html'));
            }
        });
    
    }else{
        res.send("Wrong Inputs!")
    }
    
    
    // Process the data (you can save it to a database, perform validation, etc.)
    //console.log(`Received POST request with username: ${username} and password: ${password}`);

    // db.query(sql, [username, passwordInput,count+1,Fname,Lname, email,gender,bloodType,phone,address,birthDate], (err, result) => {
    //     if (err) {
    //         console.error('Error inserting data:', err);
    //         res.send('Error inserting data into the database');
    //     } else {
    //         console.log('Data inserted successfully');
    //         //res.send('Data inserted into the database');
    //         res.sendFile(path.join(__dirname, '/donorHome.html'));
    //     }
    // });




    // Send a response
    //res.send('Received your POST request!');
});
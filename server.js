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
             // console.log(results)
              //console.log(results[0])
              //console.log(results[0].Username)
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

      const advQuery= `SELECT * FROM r_accounts
      JOIN person ON r_accounts.Id = person.Id
      JOIN recipient ON r_accounts.Id = recipient.Id
       WHERE r_accounts.Username = ? AND r_accounts.Rpassword = ?;`

        db.query(advQuery, [username, password], (err, results) => {
            if (err) {
              console.error('Error executing query:', err);
              res.status(500).json({ error: 'Internal Server Error' });
              return;
            }
        
            if (results.length > 0) {
              // Login successful
              req.session.user = results[0];
              
              res.render("donorHome")
              
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

app.get('/requestBloodForm', (req,res)=>{                      //For the recipent
  if (req.session.user) {
    res.render("requestBloodForm",req.session.user )
  }else
  res.send("Not logged in")
})


app.post('/requestBloodForm', (req,res)=>{                      //For the recipent
  if (req.session.user) {
    let id = req.session.user.Id
    let bloodType = req.session.user.Blood_type
    let emergency= req.body.emergency

    const sql = 'INSERT INTO r_request (Sid,Rid, Blood_type, Rstatus,emergency,Paid) VALUES (?,?, ?, ?,?,?)';

    db.query(sql, [1, id, bloodType,"Pending",emergency,"No"], (err, result) => {
        if (err) {
            console.error('Error inserting data into profilerequests table:', err);
            // Handle the error, send a response, etc.
        } else {
           res.send('We recieved your request.');
            // Process or send a response as needed
        }
    });

  }else
  res.send("Not logged in")
})

app.get('/requestsFromRec', (req,res)=>{                      //For the admin from rec
  if (req.session.user) {
    let reqResult = []
    

    const query= `SELECT * FROM r_request `
    

    db.query(query,  (err, results) => {
      if (err) {
        console.error('Error executing query:', err);
        res.status(500).json({ error: 'Internal Server Error' });
        return;
      }
  
      if (results.length > 0) {
        
       
        reqResult.push(results)
        console.log(reqResult)
         res.render('requestsFromRec',  {reqResult} ); 
        //pendedResult=results
        //console.log(pendedResult)
        // res.render("donorHome")
      } else {
        // Login failed
        res.status(401).json({ success: false, message: 'ErrorInPen' });
      }
    });

   
  }else
  res.send("Not logged in")
})


app.get('/markAsRejectedRec', (req,res)=>{                      //For the admin to reject rec req
  if (req.session.user) {
    res.render("markAsRejectedRec",req.session.user )
  }else
  res.send("Not logged in")
})

app.post('/markAsRejectedRec', (req,res)=>{                      //For the admin to reject rec req
  if (req.session.user) {
    let id = req.body.Id
    const sql = 'UPDATE r_request SET Rstatus = ? WHERE Rid = ?';

    db.query(sql,['Rejected', id], (err, result) => {
      if (err) {
          console.error('Error updating data in person table:', err);
          // Handle the error, send a response, etc.
      } else {
          res.send(`Request rejected successfully`);
          // Process or send a response as needed
      }
  });
  }else
  res.send("Not logged in")
})


app.get('/markAsCompletedRec', (req,res)=>{                      //For the admin to accept rec req
  if (req.session.user) {
    res.render("markAsCompletedRec",req.session.user )
  }else
  res.send("Not logged in")
})

app.post('/markAsCompletedRec', (req,res)=>{                      //For the admin to accept rec req
  if (req.session.user) {
    let id = req.body.Id
    
 const sql = 'SELECT Blood_type FROM recipient WHERE Id = ?';
      db.query(sql, [id], (err, result) => {
            if (err) {
                console.error('Error executing query:', err);
                // Handle the error, send a response, etc.
            } else {
                if (result.length > 0) {
                  
                    const bloodType = result[0].Blood_type;
                    

                    const anotherSql = 'UPDATE blood SET  Bstatus=? WHERE Type=? AND Bstatus=? LIMIT 1';
                    db.query(anotherSql, ["Sold",bloodType,"Available"], (err, result) => {
                      if (err) {
                          res.send('No enough blood of this type in the bank!');
                          // Handle the error, send a response, etc.
                      } else {
                        const sql = 'UPDATE r_request SET Rstatus = ? WHERE Rid = ?';
                        db.query(sql,['Completed', id], (err, result) => {
                              if (err) {
                                  console.error('Error updating data in r_request table:', err);
                                  // Handle the error, send a response, etc.
                              } else {
                        
                        
                                      res.send("Status updated")
                        
                         }
                          });
                          // Process or send a response as needed
                      }
                       });



                    // Process or send the blood type as needed
                } else {
                    console.log(`Cannot find blood `);
                    // Handle the case where no record is found for the donor ID
                }
                   }
                 });
     
  }else
  res.send("Not logged in")
})


app.get('/bloods', (req,res)=>{                      //bloods,For the admin
  if (req.session.user) {
    let bloods = []
    

    const query= `SELECT * FROM blood `
    

    db.query(query,  (err, results) => {
      if (err) {
        console.error('Error executing query:', err);
        res.status(500).json({ error: 'Internal Server Error' });
        return;
      }
  
      if (results.length > 0) {
       
        bloods.push(results)
         console.log(bloods)
         res.render('bloods',  {bloods} ); 
        
      } else {
        
        // res.status(401).json({ success: false, message: 'ErrorInPen' });
        res.send("No bloods")
      }
    });

  }else
  res.send("Not logged in")
})

app.get('/bloodAdding', (req,res)=>{                      //show the form to add a blood, for the admin
  if (req.session.user) {
    res.render("bloodAdding",req.session.user )

  }else
  res.send("Not logged in")
})


app.post('/bloodAdding', (req,res)=>{                      //submit the form to add a blood, for the admin
  if (req.session.user) {
    let type = req.body.bloodType
    let bloodId = req.body.bloodId
    let expirationDate = req.body.expirationDate



    const sql = 'INSERT INTO blood (Type,Bid, Expiration_date, BBid,Bstatus) VALUES (?,?, ?, ?, ?)';

    db.query(sql, [type,bloodId,expirationDate,1,"Available"], (err, result) => {
        if (err) {
            console.error('Error inserting data into profilerequests table:', err);
            res.send('Error! Try to choose another id');
            // Handle the error, send a response, etc.
        } else {
           res.send('Blood Added!');
            // Process or send a response as needed
        }
    });

  }else
  res.send("Not logged in")
})














app.get('/requestsList', (req,res)=>{                      //For the admin from donors. 
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

app.get('/notificationsList', (req,res)=>{                      //Requests to change prfile info,For the admin
  if (req.session.user) {
    let requests = []
    

    const query= `SELECT * FROM profilerequests `
    

    db.query(query,  (err, results) => {
      if (err) {
        console.error('Error executing query:', err);
        res.status(500).json({ error: 'Internal Server Error' });
        return;
      }
  
      if (results.length > 0) {
       
         requests.push(results)
         console.log(requests)
         res.render('notificationsList',  {requests} ); 
        
      } else {
        
        // res.status(401).json({ success: false, message: 'ErrorInPen' });
        res.send("No Notifications")
      }
    });

  }else
  res.send("Not logged in")
})

app.get('/rejectProfileRequest', (req,res)=>{             //To reject profile requests. 
  if (req.session.user) {
    res.render('rejectProfileRequest',  req.session.user ); 
      
   
  }else
  res.send("Not logged in")
})

app.post('/rejectProfileRequest', (req,res)=>{
  if (req.session.user) {
    let id = req.body.Id
    const sql = 'DELETE FROM profilerequests WHERE Id = ?';

      db.query(sql, [id], (err, result) => {
          if (err) {
              console.error('Error deleting row from profilerequests:', err);
              // Handle the error, send a response, etc.
          } else {
              res.send(`request deleted successfully `);
              // Process or send a response as needed
         }
});
      
   
  }else
  res.send("Not logged in")
})



app.get('/acceptProfileRequest', (req,res)=>{        //To accept profile requests. 
  if (req.session.user) {
    res.render('acceptProfileRequest',  req.session.user ); 
      
   
  }else
  res.send("Not logged in")
})

app.post('/acceptProfileRequest', (req,res)=>{
  if (req.session.user) {
    let id = req.body.Id
    let userType = "Donor"

    if(! req.session.user.Dpassword){
      userType= "Recipient"
    }
    const sql = 'Select * FROM profilerequests WHERE Id = ?';

    db.query(sql,[id],  (err, results) => {
      if (err) {
        console.error('Error executing query:', err);
        res.status(500).json({ error: 'Internal Server Error' });
        return;
      }
  
      if (results.length > 0) {

        const sql = 'UPDATE person  SET Fname = ?, Sex = ?, Email = ? WHERE Id = ? ';

        db.query(sql, [results[0].name, results[0].gender,results[0].email,id], (err, result) => {
            if (err) {
                console.error('Error inserting data into person table:', err);
                // Handle the error, send a response, etc.
            } else {
                console.log('Data inserted successfully into the person table');
                if (results[0].userType === "Donor"){
                  const sql2 = 'UPDATE donor  SET Weight = ?, Blood_type = ? WHERE Id = ?';

                  db.query(sql2, [results[0].weight, results[0].Blood_type, id], (err, result) => {
                      if (err) {
                          console.error('Error inserting data into donor table:', err);
                          // Handle the error, send a response, etc.
                      } else {
                          //console.log('Data inserted successfully into the donor table');
                          const sql3 = 'UPDATE d_accounts  SET Username = ? WHERE Id = ?';

                          db.query(sql3, [results[0].username,id], (err, result) => {
                              if (err) {
                                  console.error('Error inserting data into person table:', err);
                                  // Handle the error, send a response, etc.
                              } else {
                                res.send('Data Updated successfully ');
                                const sql = 'DELETE FROM profilerequests WHERE Id = ?';

                                db.query(sql, [id], (err, result) => {
                                    if (err) {
                                        console.error('Error deleting row from profilerequests:', err);
                                        // Handle the error, send a response, etc.
                                    } else {
                                        //res.send(`request deleted successfully `);
                                        // Process or send a response as needed
                                   }
                          });
                              }
                          });
                      }
                  });

                }else if (results[0].userType === "Recipient"){
                  const sql4 = 'UPDATE r_accounts  SET Username = ? WHERE Id = ?';

                  db.query(sql4, [results[0].username,id], (err, result) => {
                      if (err) {
                          console.error('Error inserting data into person table:', err);
                          // Handle the error, send a response, etc.
                      } else {
                          res.send('Data Updated successfully ');
                          const sql = 'DELETE FROM profilerequests WHERE Id = ?';

                            db.query(sql, [id], (err, result) => {
                                if (err) {
                                    console.error('Error deleting row from profilerequests:', err);
                                    // Handle the error, send a response, etc.
                                } else {
                                    res.send(`request deleted successfully `);
                                    // Process or send a response as needed
                              }
                      });
                          
                      }
                  });
                }else {
                 res.send("Problem in the type!")
                }
            }
        });
       
         
        
      } else {
        // Login failed
        res.status(401).json({ success: false, message: 'ErrorInRes' });
      }
    });
      
   
  }else
  res.send("Not logged in")
})












app.get('/donorHistory', (req,res)=>{             // donor & recipent History
  if (req.session.user) {
    let history = []
    if (req.session.user.Dpassword) {
              
    
    const Query= `SELECT * FROM d_request WHERE Did = ?  `

    db.query(Query,[req.session.user.Id],  (err, results) => {
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
      
    }else{

      
    
    const Query= `SELECT * FROM r_request WHERE Rid = ?  `

    db.query(Query,[req.session.user.Id],  (err, results) => {
      if (err) {
        console.error('Error executing query:', err);
        res.status(500).json({ error: 'Internal Server Error' });
        return;
      }
  
      if (results.length > 0) {
       
        history.push(results)
        console.log(history)
        //console.log(history)
         res.render('donorHistory',  {history} ); 
        
      } else {
        // Login failed
        res.status(401).json({ success: false, message: 'ErrorInPen' });
      }
    });

    }

   
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
        let announceWithCred= [req.session.user,annoucements]
        console.log("yes")
        //console.log(history)
         res.render('bloodDrive',  {announceWithCred} ); 
        
      } else {
        // Login failed
        res.status(401).json({ success: false, message: 'ErrorInDrive' });
      }
    });

   
  }else
  res.send("Not logged in")
})


app.get("/donorsList", (req,res)=>{               //Show donors to admin
  if (req.session.user) {
    let donors = []
    
    
    const Query= `SELECT * FROM donor `
    const advQuery= `SELECT * FROM d_accounts
        JOIN person ON d_accounts.Id = person.Id
        JOIN donor ON d_accounts.Id = donor.Id
        ;`

    db.query(advQuery,  (err, results) => {
      if (err) {
        console.error('Error executing query:', err);
        res.status(500).json({ error: 'Internal Server Error' });
        return;
      }
  
      if (results.length > 0) {
       
        donors.push(results)
        console.log(donors)
        //console.log(history)
         res.render('donorsList',  {donors} ); 
        
      } else {
        // Login failed
        res.status(401).json({ success: false, message: 'donorsList' });
      }
    });

   
  }else
  res.send("Not logged in")
})


app.get("/recipientsList", (req,res)=>{               //Show recipients to admin
  if (req.session.user) {
    let recipients = []
    
    
    const Query= `SELECT * FROM donor `
    const advQuery= `SELECT * FROM r_accounts
        JOIN person ON r_accounts.Id = person.Id
        JOIN recipient ON r_accounts.Id = recipient.Id
        ;`

    db.query(advQuery,  (err, results) => {
      if (err) {
        console.error('Error executing query:', err);
        res.status(500).json({ error: 'Internal Server Error' });
        return;
      }
  
      if (results.length > 0) {
       
        recipients.push(results)
        console.log(recipients)
        //console.log(history)
         res.render('recipientsList',  {recipients} ); 
        
      } else {
        // Login failed
        res.status(401).json({ success: false, message: 'recipientsList' });
      }
    });

   
  }else
  res.send("Not logged in")
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


app.get("/changingPersonalInfoForm", function(req,res){
  if (req.session.user) {

    res.render("changingPersonalInfoForm", { user: req.session.user });
  }else
  res.send("Not logged in")
})

app.post("/changingPersonalInfoForm", function(req,res){
  if (req.session.user) {
    let Id = req.session.user.Id
    const name= req.body.name
    const username= req.body.username
    const email = req.body.email;
    const gender= req.body.gender
    const weight= req.body.weight
    const bloodType = req.body.bloodType
    let userType = "Donor"

    if(! req.session.user.Dpassword){
      userType= "Recipient"
    }
    


    const sql = 'INSERT INTO profilerequests (Id,name, username, email, gender, weight, blood_type, userType) VALUES (?,?, ?, ?, ?, ?, ?,?)';

    db.query(sql, [Id, name, username, email, gender, weight, bloodType,userType], (err, result) => {
        if (err) {
            console.error('Error inserting data into profilerequests table:', err);
            // Handle the error, send a response, etc.
        } else {
           res.send('We recieved your request to update your information');
            // Process or send a response as needed
        }
    });
    
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
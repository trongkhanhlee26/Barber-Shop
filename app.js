const express = require("express");
var path = require("path");
var bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');

var app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
}));

// Sử dụng middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cấu hình views và view engine
app.set("views", path.join(__dirname, "/apps/views"));
app.set("view engine", "ejs");

// Cấu hình static files
app.use("/static", express.static(path.join(__dirname, "public")));

// Định nghĩa routes
var indexRouter = require(path.join(__dirname, "/apps/controllers/index"));
var aboutRouter = require(path.join(__dirname, "/apps/controllers/aboutcontroller"));
var contactRouter = require(path.join(__dirname, "/apps/controllers/contactcontroller"));
var detailRouter = require(path.join(__dirname, "/apps/controllers/detailcontroller"));
var priceRouter = require(path.join(__dirname, "/apps/controllers/pricecontroller"));
var serviceRouter = require(path.join(__dirname, "/apps/controllers/servicecontroller"));
var barberRouter = require(path.join(__dirname, "/apps/controllers/barbercontroller"));
var authRouter = require(path.join(__dirname, "/apps/controllers/authcontroller"));
var profileRouter = require(path.join(__dirname, "/apps/controllers/usercontroller"));
var myappointmentRouter = require(path.join(__dirname, "/apps/controllers/my-appointmentcontroller"));
var bookingRouter = require(path.join(__dirname, "/apps/controllers/bookingcontroller"));
var adminRouter = require(path.join(__dirname, "/apps/controllers/admin/admincontroller"));
var customerRouter = require(path.join(__dirname, "/apps/controllers/admin/customercontroller"));
var servicemanageRouter = require(path.join(__dirname, "/apps/controllers/admin/service-managecontroller"));
var staffsRouter = require(path.join(__dirname, "/apps/controllers/admin/staffscontroller"));
var workscheduleRouter = require(path.join(__dirname, "/apps/controllers/admin/work-schedulecontroller"));
var staffRouter = require(path.join(__dirname, "/apps/controllers/staff/staffcontroller"));
var appointmentRouter = require(path.join(__dirname, "/apps/controllers/staff/appointmentcontroller"));

app.use("/", indexRouter);
app.get('/', (req, res) => {
    console.log(req.user);
    res.render('index', { user: req.user });
});

app.use("/about", aboutRouter);
app.use("/contact", contactRouter);
app.use("/detail", detailRouter);
app.use("/price", priceRouter);
app.use("/services", serviceRouter);
app.use("/team", barberRouter);
app.use("/booking", bookingRouter);
app.use("/", authRouter);
app.use("/profile", profileRouter);
// app.use("/my-appointment", myappointmentRouter);
app.use("/api", myappointmentRouter);

app.use("/admin", adminRouter);
app.use("/admin", customerRouter);
app.use("/admin", servicemanageRouter);
app.use("/api", servicemanageRouter);
app.use("/admin", staffsRouter);
app.use("/api", staffsRouter);
app.use("/admin", workscheduleRouter);
app.use("/staff", staffRouter);
app.use("/staff", appointmentRouter);

// Kết nối đến MongoDB
mongoose.connect("mongodb+srv://trongkhanhlee26:Khanhle26062003@barberdb.38msd.mongodb.net/BarberDB")
    .then(() => {
        console.log("Connected to DB!");
        app.listen(3000, function () {
            console.log("Server is running on port 3000");
        });
    })
    .catch((error) => {
        console.error("Connection failed!", error);
    });

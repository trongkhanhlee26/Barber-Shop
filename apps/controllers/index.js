var express = require("express");
var router = express.Router();
const Service = require('../model/service');
const Barber = require("../model/barber");
const User = require("../model/user"); // Import model User

// Middleware để gán user cho res.locals nếu người dùng đã đăng nhập
router.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    next();
});

// Trang index
router.get('/', async (req, res) => {
    try {
        // Lấy danh sách dịch vụ
        const services = await Service.find();

        // Lấy danh sách barber và populate `userId` và `service`
        const barbers = await Barber.find()
            .populate('userId', 'fullname email') // Lấy thông tin từ User liên kết
            .populate('service', 'name'); // Lấy tên dịch vụ từ Service

        if (!barbers || barbers.length === 0) {
            console.log("No barbers found");
        }

        const user = req.session.user;
        // Truyền dữ liệu vào view `index`
        res.render("index", { user, services, barbers });
    } catch (error) {
        console.error("Error loading index page:", error.message);
        res.status(500).json({ message: "Server error" });
    }
});

// Các route khác
router.use("/contact", require(__dirname + "/contactcontroller"));
router.use("/about", require(__dirname + "/aboutcontroller"));
router.use("/services", require(__dirname + "/servicecontroller"));
router.use("/price", require(__dirname + "/pricecontroller"));
router.use("/team", require(__dirname + "/barbercontroller"));
router.use("/booking", require(__dirname + "/bookingcontroller"));

router.get('/detailservice', (req, res) => {
    res.render('detailservice');
});

router.get('/login', (req, res) => {
    res.render('login');
});

router.get('/register', (req, res) => {
    res.render('register');
});
router.get('/forgotpassword', (req, res) => {
    res.render('forgotpassword');
});

router.get('/profile', (req, res) => {
    if (req.session.user) {
        res.render('profile', { user: req.session.user });
    } else {
        res.redirect('/login');
    }
});

router.get('/my-appointment', (req, res) => {
    if (req.session.user) {
        res.render('my-appointment', { user: req.session.user });
    } else {
        res.redirect('/login');
    }
});

router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Error during logout:', err);
            return res.status(500).send('Lỗi server trong quá trình đăng xuất.');
        }
        res.redirect('/');
    });
});

module.exports = router;

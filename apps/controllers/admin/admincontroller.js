var express = require("express");
var router = express.Router();
const User = require('../../model/user');

const isAdmin = (req, res, next) => {
    if (req.session.user && req.session.user.role === 'admin') {
        return next();
    } else {
        return res.status(403).send('Bạn không có quyền truy cập!');
    }
};

router.use(isAdmin, async (req, res, next) => {
    try {
        const adminId = req.session.user._id;
        const admin = await User.findById(adminId);
        res.locals.admin = admin;
        next();
    } catch (error) {
        console.error('Lỗi khi lấy thông tin admin:', error);
        res.status(500).send('Lỗi server');
    }
});

router.get('/', (req, res) => {
    res.render("admin/index");
});

router.get("/customers", (req, res) => {
    res.render("admin/customers");
});

router.get("/staffs", (req, res) => {
    res.render("admin/staffs");
});

router.get("/services-manage", (req, res) => {
    res.render("admin/services-manage");
});

router.get("/work-schedules", (req, res) => {
    res.render("admin/work-schedules");
});
module.exports = router;

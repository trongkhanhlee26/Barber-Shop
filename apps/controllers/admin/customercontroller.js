const express = require('express');
const router = express.Router();
const User = require('../../model/user');

// Route lấy danh sách khách hàng dưới dạng JSON (AJAX)
router.get('/customers/data', async (req, res) => {
  try {
    const search = req.query.search || '';
    const searchQuery = {
      role: 'user',
      $or: [
        { fullname: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') },
        { phonenumber: new RegExp(search, 'i') }
      ]
    };

    // Lấy danh sách từ MongoDB
    const customers = await User.find(searchQuery);
    
    // Trả về JSON cho AJAX
    res.json(customers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server.' });
  }
});

// Route xóa khách hàng (AJAX)
router.delete('/customers/delete/:id', async (req, res) => {
  try {
    const customerId = req.params.id;
    await User.findByIdAndDelete(customerId);
    res.json({ message: 'Xóa khách hàng thành công!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi khi xóa khách hàng.' });
  }
});

module.exports = router;

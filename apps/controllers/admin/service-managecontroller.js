const express = require('express');
const router = express.Router();
const Service = require('../../model/service');
const multer = require('multer');

// Cấu hình multer để lưu trữ file trong bộ nhớ (buffer)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Lấy danh sách dịch vụ (trả về JSON cho AJAX)
router.get('/services/data', async (req, res) => {
  try {
    const services = await Service.find({});
    res.json(services);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi khi lấy dữ liệu dịch vụ.' });
  }
});

// Trang cập nhật dịch vụ
router.get('/services-update/:id', async (req, res) => {
  try {
    const serviceId = req.params.id;
    const service = await Service.findById(serviceId);
    if (!service) {
      return res.status(404).send('Không tìm thấy dịch vụ.');
    }
    res.render('admin/services-update', { service });
  } catch (error) {
    console.error(error);
    res.status(500).send('Lỗi khi tải trang sửa dịch vụ.');
  }
});

// Cập nhật dịch vụ với ảnh
router.put('/services/update/:id', upload.single('image'), async (req, res) => {
  try {
    const serviceId = req.params.id;
    const { name, price, duration, description } = req.body;

    // Nếu có ảnh mới thì mã hóa thành Base64, nếu không giữ ảnh cũ
    const imageUrl = req.file ? req.file.buffer.toString('base64') : undefined;

    // Cập nhật dịch vụ với dữ liệu mới
    const updatedData = {
      name,
      price,
      duration,
      description,
    };

    // Thêm imageUrl vào updatedData nếu có ảnh mới
    if (imageUrl) {
      updatedData.imageUrl = imageUrl;
    }

    const updatedService = await Service.findByIdAndUpdate(
      serviceId,
      updatedData,
      { new: true }
    );

    res.json({ message: 'Cập nhật dịch vụ thành công!', service: updatedService });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi khi cập nhật dịch vụ.' });
  }
});

// Xóa dịch vụ
router.delete('/services/delete/:id', async (req, res) => {
  try {
    const serviceId = req.params.id;
    await Service.findByIdAndDelete(serviceId);
    res.json({ message: 'Xóa dịch vụ thành công!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi khi xóa dịch vụ.' });
  }
});

module.exports = router;

const Faq = require('../models/faqs');

exports.getFAQs = async (req, res) => {
  try {
    const faqs = await Faq.find().lean();  
    res.render('faqs', { faqs, error: null }); 
  } catch (err) {
    res.render('faqs', { faqs: [], error: 'Lỗi khi tải FAQs' });
  }
};

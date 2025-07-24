const Category = require('../models/categorySchema');

const categoryInfo = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 5;
    const skip = (page - 1) * limit;

    const search = req.query.search?.trim() || '';
    const regex = new RegExp(search, 'i');

    const filter = search 
      ? { name: { $regex: regex }, isListed: true }
      : { isListed: true };

    const categoryData = await Category.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalCategories = await Category.countDocuments(filter);
    const totalPages = Math.ceil(totalCategories / limit);

    res.render('admin/category', {
      cat: categoryData,
      currentPage: page,
      totalPages: totalPages,
      totalCategories: totalCategories,
      search: search
    });
  } catch (error) {
    console.error(error);
    res.redirect('/pageNotFound');
  }
};

const loadAddCategory = async(req,res)=>{
  try {
    if(req.session.admin){
      return res.render('admin/addCategory');
    }
    res.render('admin/login',{message:'Please login first'});
  } catch (error) {
    res.redirect('/admin/pageNotFound');
  }
}

const addCategory = async(req,res)=>{
  const {name,stocks} = req.body;
  try {
    const existingCategory = await Category.findOne({name});
    if(existingCategory){
      return res.status(400).json({error:"Category already exists"});
    }
      const newCategory = new Category({
        name,
        stocks,

      });

      await newCategory.save();
      return res.status(200).json({ message: 'Category added successfully' });
    
   
  } catch (error) {
    console.error("Error adding category:", error);
    res.status(500).json({error:"Internal Server error"});

  }
}

const editCategory = async (req, res) => {
  try {
    if (req.session.admin) {
      const category = await Category.findById(req.params.id);

      if (!category) {
        req.flash('error', 'Category not found');
        return res.redirect('/admin/category');
      }

      res.render('admin/editCategory', { category });
    } else {
      res.redirect('/admin/login');
    }
  } catch (error) {
    console.error('Error fetching category for edit:', error);
    res.redirect('/admin/category');
  }
};

const updateCategory = async(req,res) =>{
  try {
    
    if(req.session.admin){
      const {name,stocks} = req.body;

      await Category.findByIdAndUpdate(req.params.id, {
        name,
        stocks,
      });

      res.redirect('/admin/category');
    }else {
      res.redirect('/admin/login');
    }

  } catch (error) {
    console.error('Error updating category:', error);
    res.redirect('/admin/category');
  }
}


const deleteCategory = async(req,res)=>{
  try {
    await Category.findByIdAndUpdate(req.params.id, {
      isListed: false 
    });
    res.redirect('/admin/category');
  } catch (err) {
    console.error('Error soft deleting category:', err);
    res.redirect('/admin/category');
  }
}

module.exports = {
  categoryInfo,
  addCategory,
  loadAddCategory,
  editCategory,
  updateCategory,
  deleteCategory,


}